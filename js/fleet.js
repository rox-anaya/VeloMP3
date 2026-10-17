/* js/pages/fleet.js — fleet grouped by airline. "division" holds the airline key. */
(async function () {
  const content = document.getElementById('content');

  // The four airlines, in display order. The key must match the admin dropdown.
  const AIRLINES = [
    { key: 'ana', name: 'All Nippon Airways', note: 'Mainline' },
    { key: 'nca', name: 'All Nippon Cargo', note: 'Heavy freight' },
    { key: 'peach', name: 'Peach Aviation', note: 'Low-cost leisure' },
    { key: 'airjapan', name: 'Air Japan', note: 'Medium-haul leisure' }
  ];

  const { data, error } = await db.from('fleet').select('*').order('id', { ascending: false });
  if (error) { content.innerHTML = `<p class="err">Could not load the fleet.</p>`; return; }
  const list = data || [];

  // Any aircraft with an unknown airline goes under All Nippon Airways.
  const keyOf = (r) => {
    const k = (r.division || '').toLowerCase();
    return AIRLINES.some(a => a.key === k) ? k : 'ana';
  };

  content.innerHTML = `<h1>Fleet</h1>` +
    (list.length ? '' : '<p class="muted">No aircraft listed yet.</p>') +
    AIRLINES.map(a => {
      const items = list.filter(r => keyOf(r) === a.key);
      if (!items.length) return '';
      return `<h2 class="section-title">${esc(a.name)} <span class="muted">${esc(a.note)}</span></h2>
        <div class="grid">${items.map(r => `
          <article class="card">
            ${r.image_url ? `<img src="${esc(r.image_url)}" alt="${esc(r.name)}">` : ''}
            <div class="body">
              <h3>${esc(r.name)}</h3>
              ${r.category ? `<span class="badge">${esc(r.category)}</span>` : ''}
              <p class="muted">${esc(r.description || '')}</p>
            </div>
          </article>`).join('')}</div>`;
    }).join('');
})();
