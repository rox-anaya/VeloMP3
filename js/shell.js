/* =====================================================================
   js/shell.js
   Shared header and footer for PUBLIC pages, so the menu is edited in one place.
   Also defines esc(), which protects page text from typed <tags>.
   ===================================================================== */

// The menu. Add a row here to add a page to the menu.
const SITE_PAGES = [
  ['index.html', 'Home'],
  ['fleet.html', 'Fleet'],
  ['events.html', 'Events'],
  ['roster.html', 'Roster'],
  ['codeshares.html', 'Codeshares'],
  ['changelog.html', 'Changelog'],
  ['staff.html', 'Staff']
];

// Turns risky characters into safe text, e.g. "<b>" becomes "&lt;b&gt;".
window.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

(function () {
  // Which page are we on? (Used to highlight the menu item.)
  const here = location.pathname.split('/').pop() || 'index.html';

  document.body.insertAdjacentHTML('afterbegin', `
    <header class="site-head">
      <strong>All Nippon Virtual Group</strong>
      <nav>${SITE_PAGES.map(([href, label]) =>
        `<a href="${href}" class="${href === here ? 'active' : ''}">${label}</a>`).join('')}</nav>
    </header>`);

  document.body.insertAdjacentHTML('beforeend', `
    <footer class="site-foot"><a href="login.html">Staff login</a></footer>`);
})();
