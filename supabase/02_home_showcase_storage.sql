-- =====================================================================
-- supabase/02_home_showcase_storage.sql
-- Run AFTER 01_setup.sql. Adds: home showcase photos, photo uploads, and
-- default site settings. Safe to run again.
-- Your home_config (id int8) and statistics (id int4) tables are already
-- covered by 01_setup.sql (section "home" and "stats").
-- =====================================================================

-- 1) Home showcase photos (the carousel on the home page).
create table if not exists showcase (
  id bigint generated always as identity primary key,
  image_url text not null,
  caption text,
  sort_order int not null default 0
);

alter table showcase enable row level security;
drop policy if exists "read all" on showcase;
drop policy if exists "section write" on showcase;
create policy "read all" on showcase for select using (true);
create policy "section write" on showcase for all to authenticated
  using (can_edit('home')) with check (can_edit('home'));

-- 2) Anyone with ANY editable section may upload photos.
create or replace function can_upload() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from position_sections ps
    where ps.position = my_position() and ps.can_edit
  );
$$;

-- 3) A public storage bucket called "images". Anyone can view a photo by URL;
--    only staff can upload, change, or delete.
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
  using (bucket_id = 'images' and can_upload()) with check (bucket_id = 'images' and can_upload());
create policy "images staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'images' and can_upload());

-- 4) Default settings: admin default theme and one welcome line per public page.
insert into site_settings (key, value) values
  ('theme_default', 'ana'),
  ('voice_welcome_fleet', 'Fleet. Aircraft across our four airlines.'),
  ('voice_welcome_events', 'Events and flight operations.'),
  ('voice_welcome_roster', 'Pilot roster and flight hours.'),
  ('voice_welcome_codeshares', 'Codeshare partners.'),
  ('voice_welcome_changelog', 'Changelog and updates.'),
  ('voice_welcome_staff', 'Meet our staff.')
on conflict (key) do nothing;
