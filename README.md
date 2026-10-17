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

## Setup, in order
1. **Back up your data.** Supabase > Database > Backups, or export each table.
2. **Run `supabase/01_setup.sql`** in the SQL Editor. It sets up positions, permissions,
   and the security rules.
3. **Run `supabase/02_home_showcase_storage.sql`**. It adds the showcase table, the
   public `images` photo bucket, and default settings.
4. **Create your login.** Supabase > Authentication > Users > Add user (auto confirm). Copy the UID.
5. **Link yourself.** Run the bootstrap line at the bottom of `01_setup.sql`, with your
   UID and your staff row id. Your staff row's position must be `CEO`.
6. **Put the files in a GitHub repo**, keeping the folder structure.
7. **Deploy on Vercel:** Add New Project > import the repo > Framework "Other" >
   no build command > Deploy.
8. **Sign in** at `/login.html`, then open Admin.
9. **Add staff:** create each person's login (step 4), add their staff row with the matching
   position, and paste their UID into "Login user ID".
10. **Delete the old v2 files** from the old repo, so the old PIN admin page is gone.

## Where things live
| Need | File |
|---|---|
| Supabase connection, theme list | `js/config.js` |
| Menu and footer for public pages | `js/shell.js` |
| Visitor theme / effect / voice bar | `js/visitor.js` |
| Admin screen (sections, forms, uploads, access) | `js/admin.js` |
| Public page content | `js/pages/*.js` (one per page) |
| Colors for the 12 themes and layout | `css/theme.css` |
| Database tables and security rules | `supabase/01_…sql`, `supabase/02_…sql` |

## Adding a new section later
1. Add a table entry in `js/admin.js` (copy an existing one).
2. Add its table to the list in `01_setup.sql` and re-run it.
3. Add a page in `js/pages/` and a menu row in `js/shell.js`.
4. 
