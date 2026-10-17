/* =====================================================================
   js/visitor.js
   The ONLY things a visitor can change: theme, weather effect, and voice.
   Every public page loads this file. It builds a small control bar at the
   bottom. Choices are saved in THIS browser only (localStorage).
   Each page sets its name with <body data-page="..."> so the right
   welcome line is spoken.
   ===================================================================== */
(function () {
  const PAGE = document.body.dataset.page || 'index';
  const KEYS = { theme: 'anvg_theme', effect: 'anvg_effect', voice: 'anvg_voice' };
  let S = {};   // site settings loaded from the database

  // ---------- THEME ----------
  function applyTheme(id) {
    // Remove every theme class first, so an old theme never sticks around.
    ANVG.THEMES.forEach(t => document.body.classList.remove('theme-' + t.id));
    if (id && id !== 'ana') document.body.classList.add('theme-' + id);
  }

  // ---------- WEATHER EFFECTS: rain, monsoon, snow ----------
  const COUNT = { low: 60, medium: 140, high: 280 };   // particles per intensity
  const LOOK = {
    rain:    { speedMin: 10, speedMax: 16, drift: -1.5, lenMin: 10, lenMax: 18, color: 'rgba(170,205,255,.55)' },
    monsoon: { speedMin: 16, speedMax: 24, drift: -4,   lenMin: 16, lenMax: 28, color: 'rgba(120,170,230,.7)' },
    snow:    { speedMin: 1,  speedMax: 2.5, drift: 0.6, lenMin: 2,  lenMax: 4,  color: 'rgba(255,255,255,.9)' }
  };
  let canvas = null, ctx = null, particles = [], frameId = null;

  // Make one raindrop or snowflake. "anywhere" = true spreads them over the
  // whole screen at start; false drops them in just above the top edge.
  function makeParticle(look, anywhere) {
    const rand = (a, b) => a + Math.random() * (b - a);
    return {
      x: Math.random() * canvas.width,
      y: anywhere ? Math.random() * canvas.height : -rand(0, 40),
      speed: rand(look.speedMin, look.speedMax),
      len: rand(look.lenMin, look.lenMax),
      wobble: Math.random() * Math.PI * 2   // used by snow to sway side to side
    };
  }

  function stopEffect() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = null;
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function startEffect(name, intensity) {
    stopEffect();
    const look = LOOK[name];
    if (!look) return;                       // "off" or unknown -> nothing to draw

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'anvgWeather';
      document.body.prepend(canvas);
      ctx = canvas.getContext('2d');
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const count = COUNT[intensity] || COUNT.medium;
    particles = Array.from({ length: count }, () => makeParticle(look, true));
    const isSnow = name === 'snow';

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = look.color;
      ctx.strokeStyle = look.color;
      ctx.lineWidth = 1;

      for (const p of particles) {
        p.y += p.speed;
        p.x += look.drift + (isSnow ? Math.sin(p.y / 30 + p.wobble) * 0.5 : 0);

        // Off the bottom? Send it back to the top at a new spot.
        if (p.y > canvas.height) Object.assign(p, makeParticle(look, false));

        ctx.beginPath();
        if (isSnow) {
          ctx.arc(p.x, p.y, p.len / 2, 0, Math.PI * 2);   // round flake
          ctx.fill();
        } else {
          ctx.moveTo(p.x, p.y);                            // slanted streak
          ctx.lineTo(p.x + look.drift, p.y + p.len);
          ctx.stroke();
        }
      }
      frameId = requestAnimationFrame(frame);
    }
    frame();
  }

  // ---------- VOICE ----------
  function speak(text) {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
    // Note: browsers block speech until the visitor has tapped something on the
    // page. That is why turning voice ON (a tap) speaks a confirmation right away.
  }

  // ---------- SETTINGS FROM THE DATABASE ----------
  async function loadSettings() {
    const { data, error } = await db.from('site_settings').select('key,value');
    if (error) { console.warn('Could not load settings:', error.message); S = {}; return; }
    S = Object.fromEntries((data || []).map(r => [r.key, r.value]));
  }

  // ---------- CONTROL BAR ----------
  function buildBar() {
    const bar = document.createElement('div');
    bar.className = 'visitor-bar';
    bar.innerHTML = `
      <select id="vTheme" aria-label="Theme">
        ${ANVG.THEMES.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
      </select>
      <select id="vEffect" aria-label="Weather effect">
        <option value="default">Effect: admin default</option>
        <option value="off">Effect: off</option>
        <option value="rain">Rain</option>
        <option value="monsoon">Monsoon</option>
        <option value="snow">Snow</option>
      </select>
      <button id="vVoice" class="btn ghost" aria-pressed="false">🔇 Voice off</button>`;
    document.body.appendChild(bar);

    // Show the saved choices.
    document.getElementById('vTheme').value = localStorage.getItem(KEYS.theme) || 'ana';
    document.getElementById('vEffect').value = localStorage.getItem(KEYS.effect) || 'default';

    document.getElementById('vTheme').addEventListener('change', (e) => {
      localStorage.setItem(KEYS.theme, e.target.value);
      applyTheme(e.target.value);
    });

    document.getElementById('vEffect').addEventListener('change', (e) => {
      localStorage.setItem(KEYS.effect, e.target.value);
      applyEffectFromChoice();
    });

    document.getElementById('vVoice').addEventListener('click', () => {
      const turnOn = localStorage.getItem(KEYS.voice) !== 'on';
      localStorage.setItem(KEYS.voice, turnOn ? 'on' : 'off');
      updateVoiceButton(turnOn);
      if (turnOn) speak('Voice announcer on. ' + (S['voice_welcome_' + PAGE] || ''));
      else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    });
  }

  function updateVoiceButton(on) {
    const b = document.getElementById('vVoice');
    b.textContent = on ? '🔊 Voice on' : '🔇 Voice off';
    b.setAttribute('aria-pressed', String(on));
  }

  // Visitor's choice wins; "default" means use the admin's default effect.
  function applyEffectFromChoice() {
    const choice = localStorage.getItem(KEYS.effect) || 'default';
    const name = choice === 'default' ? (S.effect_default || 'off') : choice;
    startEffect(name, S.effect_intensity || 'medium');
  }

  // ---------- START ----------
  document.addEventListener('DOMContentLoaded', async () => {
    buildBar();
    await loadSettings();
    // Visitor's own choice wins; otherwise use the admin's default theme.
    applyTheme(localStorage.getItem(KEYS.theme) || S.theme_default || 'ana');
    document.getElementById('vTheme').value = localStorage.getItem(KEYS.theme) || S.theme_default || 'ana';
    applyEffectFromChoice();

    const voiceOn = localStorage.getItem(KEYS.voice) === 'on';
    updateVoiceButton(voiceOn);
    if (voiceOn) speak(S['voice_welcome_' + PAGE] || '');   // may be blocked until a tap
  });
})();
