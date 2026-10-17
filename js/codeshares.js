/* js/pages/codeshares.js — partner airlines we codeshare with. */
(async function () {
  const content = document.getElementById('content');
  const { data, error } = await db.from('codeshares').select('*').order('id', { ascending: false });
  if (error) { content.innerHTML = `<p class="err">Could not load codeshares.</p>`; return; }
  const list = data || [];

  content.innerHTML = `<h1>Codeshares</h1>` +
    (list.length ? '' : '<p class="muted">No codeshare partners yet.</p>') +
    `<div class="grid">${list.map(c => `
      <article class="card"><div class="body">
        ${c.status ? `<span class="badge">${esc(c.status)}</span>` : ''}
        <h3>${esc(c.va_name)}</h3>
        ${c.network_tag ? `<p><b>${esc(c.network_tag)}</b></p>` : ''}
        ${c.hubs ? `<p class="muted">Hubs: ${esc(c.hubs)}</p>` : ''}
        ${c.approved_fleet ? `<p class="muted">Approved fleet: ${esc(c.approved_fleet)}</p>` : ''}
        <p class="muted">${esc(c.description || '')}</p>
      </div></article>`).join('')}</div>`;
})();
