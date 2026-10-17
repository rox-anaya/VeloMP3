-- =====================================================================
-- 002_security.sql — helper functions and Row Level Security (RLS).
-- Run SECOND (after 001). RLS rules:
--   * anyone (visitors included) can READ the public content tables
--   * only signed-in staff whose position may edit a section can WRITE it
--   * the Access page (positions and permissions) needs "manage access"
-- Safe to re-run.
-- =====================================================================

-- Who is logged in? Returns their position (role_title), or null.
-- "security definer" lets it read staff_members even though callers are restricted.
create or replace function my_position() returns text
language sql stable security definer set search_path = public as $$
  select role_title from staff_members where user_id = auth.uid() limit 1
$$;

-- May the logged-in person edit this section?
create or replace function can_edit(sec text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from position_sections ps
    where ps.position = my_position() and ps.section = sec and ps.can_edit
  )
$$;

-- May the logged-in person manage positions and access?
create or replace function can_manage_access() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from positions p
    where p.name = my_position() and p.can_manage_access
  )
$$;

-- May the logged-in person upload photos? (Any editable section allows uploads.)
create or replace function can_upload() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from position_sections ps
    where ps.position = my_position() and ps.can_edit
  )
$$;

-- ---------- Content tables: public read, section-based write ----------
do $$
declare
  t record;
  p record;
begin
  for t in select * from (values
    ('events',        'events'),
    ('fleet',         'fleet'),
    ('roster',        'roster'),
    ('codeshares',    'codeshares'),
    ('changelog',     'changelog'),
    ('staff_members', 'staff'),
    ('home_config',   'home'),
    ('showcase',      'home'),
    ('statistics',    'stats'),
    ('site_settings', 'settings')
  ) as x(tbl, sec)
  loop
    execute format('alter table %I enable row level security', t.tbl);

    -- Remove any old policies on this table first.
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t.tbl loop
      execute format('drop policy %I on %I', p.policyname, t.tbl);
    end loop;

    -- Everyone (visitors and staff) can read.
    execute format('create policy "public read" on %I for select to anon, authenticated using (true)', t.tbl);

    -- Only staff whose position may edit this section can insert, change or delete.
    execute format(
      'create policy "section write" on %I for all to authenticated using (can_edit(%L)) with check (can_edit(%L))',
      t.tbl, t.sec, t.sec);
  end loop;
end $$;

-- ---------- Permission tables: staff only ----------
alter table positions enable row level security;
alter table position_sections enable row level security;

drop policy if exists "read positions" on positions;
drop policy if exists "manage positions" on positions;
create policy "read positions" on positions for select to authenticated using (true);
create policy "manage positions" on positions for all to authenticated
  using (can_manage_access()) with check (can_manage_access());

drop policy if exists "read grants" on position_sections;
drop policy if exists "manage grants" on position_sections;
create policy "read grants" on position_sections for select to authenticated using (true);
create policy "manage grants" on position_sections for all to authenticated
  using (can_manage_access()) with check (can_manage_access());

-- ---------- Defence in depth ----------
-- Visitors (anon role) may only read. RLS already blocks their writes; this stops
-- writes even if a policy were ever added by mistake.
revoke insert, update, delete, truncate on all tables in schema public from anon;
