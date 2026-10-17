/* js/pages/events.js — list of events (newest first). */
(async function () {
  const content = document.getElementById('content');
  const { data, error } = await db.from('events').select('*').order('id', { ascending: false });
  if (error) { content.innerHTML = `<p class="err">Could not load events.</p>`; return; }
  const list = data || [];

  content.innerHTML = `<h1>Events</h1>` +
    (list.length ? '' : '<p class="muted">No events scheduled yet.</p>') +
    `<div class="grid">${list.map(ev => `
      <article class="card">
        ${ev.image_url ? `<img src="${esc(ev.image_url)}" alt="${esc(ev.title)}">` : ''}
        <div class="body">
          ${ev.status ? `<span class="badge">${esc(ev.status)}</span>` : ''}
          <h3>${esc(ev.title)}</h3>
          <p><b>${esc(ev.dep_icao || '—')}</b> → <b>${esc(ev.arr_icao || '—')}</b></p>
          <p class="muted">${ev.time_zulu ? esc(ev.time_zulu) + 'Z · ' : ''}${esc(ev.dep_date || '')}${ev.arr_date ? ' → ' + esc(ev.arr_date) : ''}</p>
          <p class="muted">${esc(ev.description || '')}</p>
        </div>
      </article>`).join('')}</div>`;
})();
