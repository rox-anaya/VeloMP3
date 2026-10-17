# ANVG (All Nippon Virtual Group) — v3

## What this includes
**Public site** (visitors can change only theme, weather effect and voice):
- Home: hero, NOTAM banner, mission, CEO quote, statistics, photo showcase carousel
- Fleet (four airlines, each with its own photos and descriptions)
- Events, Roster, Codeshares, Changelog, Staff

**Admin** (staff sign in; they see only the sections their position may edit):
- Home page, Statistics (single-record editors)
- Home showcase photos (add, edit, delete, reorder)
- Events, Fleet, Roster, Codeshares, Changelog, Staff (add, edit, delete; Staff reorder)
- Photo uploads to Supabase Storage for every photo box
- Site settings: default theme, default effect and intensity, welcome lines per page
- Access page (positions and permissions), for positions with "manage access"

## Not included
- The old v2 pages About, Apply, Ranks, Routes and Training. They were not in your list of
  sections. Say so if you want them rebuilt, and I'll follow the same pattern.

## Setup, in order (fresh Supabase project)
1. In the new project: Authentication > Providers: keep Email on. Authentication > Sign In / Up:
   turn OFF "Allow new users to sign up" so strangers cannot create logins.
2. SQL Editor > New query, then run each file in order (paste, Run):
   - `supabase/migrations/001_tables.sql`
   - `supabase/migrations/002_security.sql`
   - `supabase/migrations/003_storage_and_seed.sql`
   - `supabase/migrations/004_bootstrap_ceo.sql` (after editing it, see step A-B inside)
   - `supabase/migrations/005_verify.sql` (read-only checks)
3. Put the website files in your GitHub repo, keeping the folder structure.
4. Deploy on Vercel: Add New Project > import the repo > Framework "Other" > no build command > Deploy.
5. Sign in at `/login.html`, open Admin, and add your staff: create each person's login
   (Authentication > Users > Add user), add their staff row with the matching position,
   and paste their UID into "Login user ID".

## Where things live
| Need | File |
|---|---|
| Supabase connection, theme list | `js/config.js` |
| Menu and footer for public pages | `js/shell.js` |
| Visitor theme / effect / voice bar | `js/visitor.js` |
| Admin screen (sections, forms, uploads, access) | `js/admin.js` |
| Public page content | `js/pages/*.js` (one per page) |
| Colors for the 12 themes and layout | `css/theme.css` |
| Database tables, security, storage, starting data | `supabase/migrations/001`–`005` |

## Adding a new section later
1. Add a table entry in `js/admin.js` (copy an existing one).
2. Add its table to `001_tables.sql` and its policy list to `002_security.sql`, then run a new migration file for the change.
3. Add a page in `js/pages/` and a menu row in `js/shell.js`.
