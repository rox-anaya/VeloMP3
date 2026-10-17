/* =====================================================================
   js/config.js
   The ONE place with your Supabase connection and the theme list.
   Load it AFTER the Supabase library <script> on every page.
   ===================================================================== */

window.ANVG = {
  // Your EXISTING Supabase project.
  SUPABASE_URL: 'https://syculxnokrkluyzuempj.supabase.co',

  // The "publishable" key is designed to be public, like a website address.
  // It does NOT give anyone power over your data. Your security comes from the
  // Row Level Security rules in supabase/01_setup.sql.
  SUPABASE_KEY: 'sb_publishable_uSljNgeCYIweqTOPbfvk4Q_vnDyc9fC',

  // The 12 themes. "id" must match a body.theme-<id> rule in css/theme.css.
  // "ana" is the default and has no class.
  THEMES: [
    { id: 'ana',           name: 'ANA Triton Blue' },
    { id: 'peach',         name: 'Peach Aviation' },
    { id: 'nca',           name: 'Nippon Cargo Airlines' },
    { id: 'airjapan',      name: 'AirJapan Sunrise' },
    { id: 'staralliance',  name: 'Star Alliance Gold' },
    { id: 'honu',          name: 'Flying Honu Hawaii' },
    { id: 'oled',          name: 'Tokyo Midnight OLED' },
    { id: 'sakura',        name: 'Sakura Blossom' },
    { id: 'b787hud',       name: 'Boeing 787 HUD' },
    { id: 'airbuseis',     name: 'Airbus EIS2 Cockpit' },
    { id: 'pikachu',       name: 'Pokemon Pikachu Jet' },
    { id: 'polar',         name: 'Polar Daylight Frost' }
  ]
};

// Create the database connection that every other file uses as "db".
window.db = window.supabase.createClient(ANVG.SUPABASE_URL, ANVG.SUPABASE_KEY);
