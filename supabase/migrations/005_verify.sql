-- =====================================================================
-- 005_verify.sql — READ-ONLY checks. Run after 001-004 to confirm the setup.
-- Expected: every public table has rls = true; the bucket "images" exists;
-- CEO and COO have many grants; your CEO row exists.
-- =====================================================================
select tablename, rowsecurity as rls_on
from pg_tables where schemaname = 'public' order by tablename;

select tablename, policyname, cmd, roles
from pg_policies where schemaname in ('public', 'storage') order by tablename, policyname;

select id, public from storage.buckets where id = 'images';

select position, count(*) as sections_granted
from position_sections where can_edit group by position order by position;

select name, role_title, user_id is not null as has_login
from staff_members order by sort_order;
