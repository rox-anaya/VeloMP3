-- =====================================================================
-- supabase/01_setup.sql
-- Run this ONCE in Supabase: Dashboard > SQL Editor > New query > paste > Run.
-- It uses your EXISTING project and data. Nothing is deleted from your tables.
-- Safe to run again if something stops halfway.
--
-- BEFORE RUNNING: Dashboard > Database > Backups (or export each table in the
-- Table Editor) so you have a copy of your data.
-- =====================================================================


-- ---------------------------------------------------------------------
-- STEP 1: New tables
-- ---------------------------------------------------------------------

-- positions = the roles people can hold. The name must match staff_members.role_title.
-- can_manage_access = true lets that position open the Access page and change permissions.
create table if not exists positions (
  name text primary key,
  can_manage_access boolean not null default false,
  sort_order int not null default 0
);

-- position_sections = which section each position may EDIT. This is the permission table.
-- You change it from the admin Access page, not by hand.
create table if not exists position_sections (
  position text not null references positions(name) on update cascade on delete cascade,
  section text not null,
  can_edit boolean not null default false,
  primary key (position, section)
);

-- site_settings = small key/value settings (welcome lines, visitor defaults).
create table if not exists site_settings (
  key text primary key,
  value text
);

-- Link a login account to a staff row. A staff member logs in, and their
-- position (role_title) decides what they can edit.
alter table staff_members
  add column if not exists user_id uuid unique references auth.users(id) on delete set null;


-- ---------------------------------------------------------------------
-- STEP 2: Helper functions used by the security rules
-- "security definer" lets these look up the permission tables even though
-- the caller is normally blocked from reading them.
-- ---------------------------------------------------------------------

-- Returns the position (role_title) of whoever is logged in, or null.
create or replace function my_position() returns text
language sql stable security definer set search_path = public as $$
  select role_title from staff_members where user_id = auth.uid() limit 1;
$$;

-- True if the logged-in person's position may edit this section.
create or replace function can_edit(sec text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from position_sections ps
    where ps.position = my_position() and ps.section = sec and ps.can_edit
  );
$$;

-- True if the logged-in person's position may manage positions and access.
create or replace function can_manage_access() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from positions p
    where p.name = my_position() and p.can_manage_access
  );
$$;


-- ---------------------------------------------------------------------
-- STEP 3: Row Level Security (RLS) rules for your existing tables
-- Rule: EVERYONE can read (so the public site works).
--       Only logged-in staff whose position may edit the section can write.
-- The block below also REMOVES the old policies on these tables, because
-- old open write policies would still allow changes around the new rules.
-- ---------------------------------------------------------------------
do $$
declare
  pair record;
  pol record;
begin
  for pair in
    select * from (values
      ('events', 'events'),
      ('fleet', 'fleet'),
      ('roster', 'roster'),
      ('codeshares', 'codeshares'),
      ('changelog', 'changelog'),
      ('staff_members', 'staff'),
      ('statistics', 'stats'),
      ('home_config', 'home')
    ) as t(tbl, sec)
  loop
    -- Skip any table that does not exist in your project.
    continue when to_regclass('public.' || pair.tbl) is null;

    execute format('alter table %I enable row level security', pair.tbl);

    -- Remove every existing policy on this table.
    for pol in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = pair.tbl
    loop
      execute format('drop policy %I on %I', pol.policyname, pair.tbl);
    end loop;

    -- Everyone can read.
    execute format('create policy "read all" on %I for select using (true)', pair.tbl);

    -- Only staff whose position may edit this section can insert/update/delete.
    execute format(
      'create policy "section write" on %I for all to authenticated using (can_edit(%L)) with check (can_edit(%L))',
      pair.tbl, pair.sec, pair.sec);
  end loop;
end $$;

-- Rules for the three new tables.
alter table positions enable row level security;
alter table position_sections enable row level security;
alter table site_settings enable row level security;

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

drop policy if exists "read settings" on site_settings;
drop policy if exists "write settings" on site_settings;
create policy "read settings" on site_settings for select using (true);
create policy "write settings" on site_settings for all to authenticated
  using (can_edit('settings')) with check (can_edit('settings'));


-- ---------------------------------------------------------------------
-- STEP 4: Starting values. "do nothing" means re-running never overwrites
-- changes you made later in the admin page.
-- ---------------------------------------------------------------------
insert into positions (name, can_manage_access, sort_order) values
  ('CEO', true, 1),
  ('COO', true, 2),
  ('Event Manager', false, 3),
  ('Route Manager', false, 4),
  ('Crew Center Manager', false, 5)
on conflict (name) do nothing;

-- CEO and COO may edit every section.
insert into position_sections (position, section, can_edit)
select p, s, true
from (values ('CEO'), ('COO')) as a(p)
cross join (values ('home'), ('stats'), ('events'), ('fleet'), ('roster'),
                   ('codeshares'), ('staff'), ('changelog'), ('settings')) as b(s)
on conflict (position, section) do nothing;

-- Sub-staff: one section each, as agreed. Change these later in the Access page.
insert into position_sections (position, section, can_edit) values
  ('Event Manager', 'events', true),
  ('Route Manager', 'fleet', true),
  ('Crew Center Manager', 'roster', true)
on conflict (position, section) do nothing;

insert into site_settings (key, value) values
  ('effect_default', 'off'),
  ('effect_intensity', 'medium'),
  ('welcome_home', 'Welcome to All Nippon Virtual Group.'),
  ('voice_welcome_index', 'Welcome to All Nippon Virtual Group.')
on conflict (key) do nothing;


-- ---------------------------------------------------------------------
-- STEP 5: BOOTSTRAP (you run these by hand, once)
-- Lines start with -- so nothing runs yet.
--
-- a) Dashboard > Authentication > Users > Add user > Create new user.
--    Enter your email and a strong password, tick "Auto Confirm User".
--    Copy the User UID shown in the list.
--
-- b) Find your staff row id in the Staff section (or Table Editor > staff_members).
--
-- c) Run this, replacing the two placeholders:
--
--    update staff_members
--    set user_id = 'PASTE-USER-UID-HERE', role_title = 'CEO'
--    where id = PASTE-YOUR-STAFF-ID;
--
-- Lockout recovery: if you ever lose access, run step c) again here in the
-- SQL Editor. The SQL Editor runs as the owner and skips RLS.
-- ---------------------------------------------------------------------
