-- =====================================================================
-- 003_storage_and_seed.sql — photo bucket, its security rules, and starting data.
-- Run THIRD (after 001 and 002). Safe to re-run: seeds use "on conflict do nothing".
-- =====================================================================

-- ---------- Photo storage ----------
-- A public bucket called "images": anyone with a link can view a photo.
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "images public read" on storage.objects;
drop policy if exists "images staff upload" on storage.objects;
drop policy if exists "images staff update" on storage.objects;
drop policy if exists "images staff delete" on storage.objects;

create policy "images public read" on storage.objects for select
  using (bucket_id = 'images');
create policy "images staff upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'images' and can_upload());
create policy "images staff update" on storage.objects for update to authenticated
  using (bucket_id = 'images' and can_upload())
  with check (bucket_id = 'images' and can_upload());
create policy "images staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'images' and can_upload());

-- ---------- Default roles ----------
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

-- ---------- Starting content rows ----------
-- The admin Home and Statistics pages edit row id 1. Create it so they have something to load.
insert into home_config (id, va_name, va_tagline, notam_active, notam_color)
values (1, 'All Nippon Virtual Group', 'Virtual airline', false, '#007fc1')
on conflict (id) do nothing;

insert into statistics (id) values (1)
on conflict (id) do nothing;

-- ---------- Site settings ----------
insert into site_settings (key, value) values
  ('theme_default', 'ana'),
  ('effect_default', 'off'),
  ('effect_intensity', 'medium'),
  ('welcome_home', 'Welcome to All Nippon Virtual Group.'),
  ('voice_welcome_index', 'Welcome to All Nippon Virtual Group.'),
  ('voice_welcome_fleet', 'Fleet. Aircraft across our four airlines.'),
  ('voice_welcome_events', 'Events and flight operations.'),
  ('voice_welcome_roster', 'Pilot roster and flight hours.'),
  ('voice_welcome_codeshares', 'Codeshare partners.'),
  ('voice_welcome_changelog', 'Changelog and updates.'),
  ('voice_welcome_staff', 'Meet our staff.')
on conflict (key) do nothing;
