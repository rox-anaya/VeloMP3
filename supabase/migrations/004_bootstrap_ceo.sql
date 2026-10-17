-- =====================================================================
-- 004_bootstrap_ceo.sql — MANUAL. Creates the first (CEO) admin.
-- Run LAST, once, and only after you have done both steps below.
--
-- Step A: Supabase Dashboard > Authentication > Users > "Add user" >
--         "Create new user". Enter your email and a strong password.
--         Tick "Auto Confirm User". Copy the User UID shown in the list.
-- Step B: Replace PASTE-AUTH-USER-UID with that UID, and the name, then run.
--
-- Safe to re-run: it updates your row instead of creating a duplicate.
-- Only the CEO row is created here. Everyone else is added in the admin Staff section.
-- =====================================================================
insert into staff_members (user_id, name, role_title, department, sort_order)
values ('PASTE-AUTH-USER-UID'::uuid, 'Your Name', 'CEO', 'Executive', 10)
on conflict (user_id) do update
  set name = excluded.name, role_title = 'CEO';
