/* js/pages/staff.js — staff list in the order set in admin (sort_order). */
(async function () {
  const content = document.getElementById('content');
  const { data, error } = await db.from('staff_members').select('*').order('sort_order', { ascending: true });
  if (error) { content.innerHTML = `<p class="err">Could not load staff.</p>`; return; }
  const list = data || [];

  content.innerHTML = `<h1>Staff</h1>` +
    (list.length ? `<div class="grid">${list.map(m => `
      <article class="card"><div class="body">
        <h3>${esc(m.name)}</h3>
        ${m.role_title ? `<span class="badge">${esc(m.role_title)}</span>` : ''}
        ${m.department ? `<p class="muted">${esc(m.department)}</p>` : ''}
        ${m.callsign ? `<p><b>${esc(m.callsign)}</b></p>` : ''}
        <p class="muted">${esc(m.bio || '')}</p>
      </div></article>`).join('')}</div>` : '<p class="muted">No staff listed yet.</p>');
})();
