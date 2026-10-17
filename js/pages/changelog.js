/* js/pages/changelog.js — updates and releases, newest first. */
(async function () {
  const content = document.getElementById('content');
  const { data, error } = await db.from('changelog').select('*').order('id', { ascending: false });
  if (error) { content.innerHTML = `<p class="err">Could not load the changelog.</p>`; return; }
  const list = data || [];

  content.innerHTML = `<h1>Changelog</h1>` +
    (list.length ? '' : '<p class="muted">No updates yet.</p>') +
    `<div class="grid">${list.map(c => `
      <article class="card">
        ${c.image_url ? `<img src="${esc(c.image_url)}" alt="${esc(c.title)}">` : ''}
        <div class="body">
          ${c.type ? `<span class="badge">${esc(c.type)}</span>` : ''}
          ${c.version ? `<span class="muted"> ${esc(c.version)}</span>` : ''}
          <h3>${esc(c.title)}</h3>
          <p class="muted">${esc(c.description || '')}</p>
          ${c.external_link ? `<p><a class="accent" href="${esc(c.external_link)}" target="_blank" rel="noopener">Open link</a></p>` : ''}
        </div>
      </article>`).join('')}</div>`;
})();
