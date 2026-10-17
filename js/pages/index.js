/* =====================================================================
   js/pages/index.js — the home page.
   Reads: home_config (id 1), statistics (id 1), showcase (photos), site_settings.
   Shows: hero, NOTAM banner, mission, CEO quote, stats, photo carousel.
   ===================================================================== */
(async function () {
  const content = document.getElementById('content');

  // Load everything at once (faster than one request after another).
  const [home, stats, photos, welcome] = await Promise.all([
    db.from('home_config').select('*').eq('id', 1).maybeSingle(),
    db.from('statistics').select('*').eq('id', 1).maybeSingle(),
    db.from('showcase').select('*').order('sort_order', { ascending: true }),
    db.from('site_settings').select('value').eq('key', 'welcome_home').maybeSingle()
  ]);
  const h = home.data || {};
  const s = stats.data || {};
  const slides = (photos.data || []).filter(p => p.image_url);

  // Hero with optional background photo.
  const heroStyle = h.hero_bg_url
    ? `background-image: linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.75)), url('${esc(h.hero_bg_url)}');`
    : '';

  // NOTAM banner: shows only when admin turns it on and writes text.
  const notam = (h.notam_active && h.notam_text)
    ? `<div class="notam" style="background:${esc(h.notam_color || '#007fc1')}">${esc(h.notam_text)}</div>`
    : '';

  // Stats: each box shows only if it has a value.
  const statItems = [
    ['Flight hours', s.total_hours], ['PIREPs', s.total_pireps], ['Hubs', s.hubs],
    ['Aircraft families', s.aircraft_family], ['Destinations', s.destinations]
  ].filter(([, v]) => v !== null && v !== undefined && v !== '');

  content.innerHTML = `
    <section class="hero panel" style="${heroStyle}">
      ${h.hero_badge ? `<span class="badge">${esc(h.hero_badge)}</span>` : ''}
      <h1>${esc(h.va_name || 'All Nippon Virtual Group')}</h1>
      <p>${esc(h.va_tagline || '')}</p>
      <p class="muted">${esc(welcome.data?.value || '')}</p>
    </section>

    ${notam}

    ${statItems.length ? `<div class="stat-row">${statItems.map(([label, v]) =>
      `<div class="stat"><b>${esc(v)}</b>${esc(label)}</div>`).join('')}</div>` : ''}

    ${slides.length ? `
      <div class="carousel" id="showcase">
        <img id="slide" src="${esc(slides[0].image_url)}" alt="${esc(slides[0].caption || 'Fleet photo')}">
        <div class="cap" id="slideCap">${esc(slides[0].caption || '')}</div>
        ${slides.length > 1 ? `<button class="btn ghost nav prev" id="prev">‹</button>
                              <button class="btn ghost nav next" id="next">›</button>` : ''}
      </div>` : ''}

    ${h.mission_text ? `<h2 class="section-title">Our mission</h2><p>${esc(h.mission_text)}</p>` : ''}

    ${h.ceo_quote ? `<blockquote class="panel"><p>“${esc(h.ceo_quote)}”</p>
      <p class="muted">${esc(h.ceo_name || '')}${h.ceo_role ? ' · ' + esc(h.ceo_role) : ''}</p></blockquote>` : ''}
  `;

  // Photo carousel: move to the next photo every 6 seconds, or with the buttons.
  if (slides.length > 1) {
    let i = 0;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      document.getElementById('slide').src = slides[i].image_url;
      document.getElementById('slideCap').textContent = slides[i].caption || '';
    };
    document.getElementById('prev').onclick = () => show(i - 1);
    document.getElementById('next').onclick = () => show(i + 1);
    setInterval(() => show(i + 1), 6000);
  }
})();
