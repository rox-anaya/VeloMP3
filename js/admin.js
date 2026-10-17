/* =====================================================================
   js/admin.js
   The admin screen. It does five things:
     1. Finds who you are (login -> your staff row -> your position).
     2. Shows ONLY the sections your position may edit.
     3. Add, edit, delete and reorder entries (table sections), or edit a
        single record (Home page and Statistics).
     4. Uploads photos to Supabase Storage and fills in the image link.
     5. Access page (only for positions with "manage access").
   IMPORTANT: this file only HIDES buttons you can't use. The database rules
   (supabase/01_setup.sql and 02_...sql) are what really block changes.
   ===================================================================== */

// ---------- 1. SECTION SETTINGS ----------
// section  = the permission name used in the database
// table    = the database table this section edits
// fields   = form boxes. Types: text (default), textarea, number, date,
//            position (dropdown of positions), select (needs options),
//            image (link box + upload button), checkbox (on/off)
// single   = true for one-record sections (Home, Statistics); singleId = its id
// order/asc = how table rows are sorted; reorder = show up/down buttons
// pk       = the main key column (default "id")
const TABLES = {
  home: {
    section: 'home', label: 'Home page', table: 'home_config', single: true, singleId: 1,
    fields: [
      { key: 'va_name', label: 'Airline name' },
      { key: 'va_tagline', label: 'Tagline' },
      { key: 'hero_badge', label: 'Hero badge text' },
      { key: 'hero_bg_url', label: 'Hero background photo', type: 'image' },
      { key: 'logo_url', label: 'Logo', type: 'image' },
      { key: 'mission_text', label: 'Mission text', type: 'textarea' },
      { key: 'ceo_quote', label: 'CEO quote', type: 'textarea' },
      { key: 'ceo_name', label: 'CEO name' },
      { key: 'ceo_role', label: 'CEO role' },
      { key: 'notam_active', label: 'Show NOTAM banner', type: 'checkbox' },
      { key: 'notam_text', label: 'NOTAM text', type: 'textarea' },
      { key: 'notam_color', label: 'NOTAM color (e.g. #007fc1)' }
    ]
  },
  stats: {
    section: 'stats', label: 'Statistics', table: 'statistics', single: true, singleId: 1, stampDate: true,
    fields: [
      { key: 'total_hours', label: 'Total hours' },
      { key: 'total_pireps', label: 'Total PIREPs' },
      { key: 'hubs', label: 'Hubs' },
      { key: 'aircraft_family', label: 'Aircraft families' },
      { key: 'destinations', label: 'Destinations' }
    ]
  },
  showcase: {
    section: 'home', label: 'Home showcase photos', table: 'showcase', order: 'sort_order', asc: true, reorder: true,
    fields: [
      { key: 'image_url', label: 'Photo', type: 'image' },
      { key: 'caption', label: 'Caption' }
    ]
  },
  events: {
    section: 'events', label: 'Events', table: 'events', order: 'id', asc: false,
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'image_url', label: 'Photo', type: 'image' },
      { key: 'dep_icao', label: 'Departure ICAO' },
      { key: 'arr_icao', label: 'Arrival ICAO' },
      { key: 'time_zulu', label: 'Time (Zulu)' },
      { key: 'dep_date', label: 'Departure date', type: 'date' },
      { key: 'arr_date', label: 'Arrival date', type: 'date' },
      { key: 'status', label: 'Status' },
      { key: 'description', label: 'Description', type: 'textarea' }
    ]
  },
  fleet: {
    section: 'fleet', label: 'Fleet', table: 'fleet', order: 'id', asc: false,
    fields: [
      { key: 'name', label: 'Aircraft name' },
      { key: 'division', label: 'Airline', type: 'select', options: [
        ['ana', 'All Nippon Airways'], ['nca', 'All Nippon Cargo'],
        ['peach', 'Peach Aviation'], ['airjapan', 'Air Japan']
      ] },
      { key: 'category', label: 'Category' },
      { key: 'image_url', label: 'Photo', type: 'image' },
      { key: 'description', label: 'Description', type: 'textarea' }
    ]
  },
  roster: {
    section: 'roster', label: 'Roster', table: 'roster', order: 'id', asc: false,
    fields: [
      { key: 'pilot_name', label: 'Pilot name' },
      { key: 'callsign', label: 'Callsign' },
      { key: 'hours', label: 'Hours', type: 'number' },
      { key: 'rank_title', label: 'Rank' }
    ]
  },
  codeshares: {
    section: 'codeshares', label: 'Codeshares', table: 'codeshares', order: 'id', asc: false,
    fields: [
      { key: 'va_name', label: 'Airline name' },
      { key: 'network_tag', label: 'Network tag' },
      { key: 'status', label: 'Status' },
      { key: 'hubs', label: 'Hubs' },
      { key: 'approved_fleet', label: 'Approved fleet' },
      { key: 'description', label: 'Description', type: 'textarea' }
    ]
  },
  changelog: {
    section: 'changelog', label: 'Changelog', table: 'changelog', order: 'id', asc: false,
    fields: [
      { key: 'type', label: 'Type' },
      { key: 'version', label: 'Version' },
      { key: 'title', label: 'Title' },
      { key: 'image_url', label: 'Photo', type: 'image' },
      { key: 'external_link', label: 'Link' },
      { key: 'description', label: 'Description', type: 'textarea' }
    ]
  },
  staff: {
    section: 'staff', label: 'Staff', table: 'staff_members', order: 'sort_order', asc: true, reorder: true,
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'role_title', label: 'Position', type: 'position' },   // drives permissions
      { key: 'department', label: 'Department' },
      { key: 'callsign', label: 'Callsign' },
      { key: 'icon_class', label: 'Icon class (optional)' },
      { key: 'bio', label: 'Bio', type: 'textarea' },
      { key: 'user_id', label: 'Login user ID (from Supabase Auth)' }
    ]
  },
  settings: {
    section: 'settings', label: 'Site settings', table: 'site_settings', pk: 'key', order: 'key', asc: true,
    fields: [
      { key: 'key', label: 'Key (e.g. effect_default, voice_welcome_fleet)' },
      { key: 'value', label: 'Value', type: 'textarea' }
    ]
  }
};

// Sections shown in the Access grid.
const ALL_SECTIONS = [
  ['home', 'Home'], ['stats', 'Stats'], ['events', 'Events'], ['fleet', 'Fleet'],
  ['roster', 'Roster'], ['codeshares', 'Codeshares'], ['staff', 'Staff'],
  ['changelog', 'Changelog'], ['settings', 'Settings']
];

// ---------- 2. STATE AND HELPERS ----------
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let me = null;                // your staff row: { id, name, role_title }
let mySections = new Set();   // sections you may edit
let positions = [];           // position names, for dropdowns
let rows = [];                // rows currently on screen
let current = null;           // which section is open

// Builds one form box. "row" supplies the current value; "pk" is the key column.
function fieldHtml(f, row, isNew, pk) {
  const raw = isNew ? undefined : row[f.key];
  const val = raw ?? '';
  const ro = (!isNew && f.key === pk) ? 'readonly' : '';

  if (f.type === 'checkbox') {
    return `<label class="check"><input type="checkbox" name="${f.key}" ${raw ? 'checked' : ''}> ${esc(f.label)}</label>`;
  }
  let input;
  if (f.type === 'textarea') {
    input = `<textarea name="${f.key}" rows="3" ${ro}>${esc(val)}</textarea>`;
  } else if (f.type === 'select') {
    input = `<select name="${f.key}">${f.options.map(([v, l]) =>
      `<option value="${esc(v)}" ${v === val ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  } else if (f.type === 'position') {
    // Keep an old position name visible even if it's no longer in the list.
    const list = (val && !positions.includes(val)) ? [...positions, val] : positions;
    input = `<select name="${f.key}"><option value="">(none)</option>${list.map(p =>
      `<option ${p === val ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>`;
  } else if (f.type === 'image') {
    input = `<input name="${f.key}" value="${esc(val)}" placeholder="Paste a link, or upload a photo below">
             <input type="file" accept="image/*" data-upload="${f.key}" style="margin-top:6px">`;
  } else {
    input = `<input name="${f.key}" type="${f.type || 'text'}" value="${esc(val)}" ${ro}
             ${f.type === 'number' ? 'step="any"' : ''}>`;
  }
  return `<label>${esc(f.label)}${input}</label>`;
}

// Reads the form back into an object for the database.
// skipKey = a key column to leave out (existing rows must not rewrite their key).
function readFields(form, cfg, skipKey) {
  const out = {};
  for (const f of cfg.fields) {
    if (f.key === skipKey) continue;
    const el = form.elements[f.key];
    if (!el) continue;
    if (f.type === 'checkbox') { out[f.key] = el.checked; continue; }
    let v = el.value.trim();
    if (v === '') v = null;                       // empty box -> empty database value
    else if (f.type === 'number') v = Number(v);
    out[f.key] = v;
  }
  return out;
}

// ---------- 3. START: who are you? ----------
async function init() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) { location.href = 'login.html'; return; }

  $('#logout').onclick = async () => { await db.auth.signOut(); location.href = 'login.html'; };
  $('#main').onclick = onMainClick;
  $('#main').onchange = onMainChange;
  $('#modal').onchange = onMainChange;
  $('#modal').onclick = (e) => { if (e.target.id === 'modal') closeModal(); };
  $('#nav').onclick = (e) => { if (e.target.dataset.key) showSection(e.target.dataset.key); };

  // Find the staff row linked to this login.
  const { data: row, error } = await db.from('staff_members')
    .select('id,name,role_title').eq('user_id', session.user.id).maybeSingle();
  if (error || !row) {
    $('#who').textContent = session.user.email;
    $('#main').innerHTML = `<div class="panel">Your login is not linked to a staff member yet.
      Ask the CEO or COO to add your login ID in the Staff section.</div>`;
    return;
  }
  me = row;
  $('#who').textContent = `${row.name} · ${row.role_title}`;

  // What may your position edit?
  const { data: perms } = await db.from('position_sections')
    .select('section').eq('position', row.role_title).eq('can_edit', true);
  mySections = new Set((perms || []).map(p => p.section));

  // Can your position manage access?
  const { data: pos } = await db.from('positions')
    .select('can_manage_access').eq('name', row.role_title).maybeSingle();
  const canAccess = !!(pos && pos.can_manage_access);

  // Sidebar: only what you may edit, plus Access if allowed.
  const items = Object.entries(TABLES)
    .filter(([, cfg]) => mySections.has(cfg.section))
    .map(([key, cfg]) => ({ key, label: cfg.label }));
  if (canAccess) items.push({ key: 'access', label: 'Access (positions)' });

  $('#nav').innerHTML = items.length
    ? items.map(i => `<button data-key="${i.key}">${esc(i.label)}</button>`).join('')
    : '<p class="muted">Your position has no editable sections yet.</p>';

  if (items.length) showSection(items[0].key);
  else $('#main').innerHTML = '';
}

// ---------- 4. POSITIONS (for dropdowns) ----------
async function loadPositions() {
  const { data } = await db.from('positions').select('name').order('sort_order');
  positions = (data || []).map(p => p.name);
}

// ---------- 5. SHOW A SECTION ----------
async function showSection(key) {
  current = key;
  document.querySelectorAll('#nav button').forEach(b =>
    b.classList.toggle('active', b.dataset.key === key));
  await loadPositions();

  if (key === 'access') return renderAccess();
  const cfg = TABLES[key];
  if (cfg.single) return renderSingle(key);

  const { data, error } = await db.from(cfg.table)
    .select('*').order(cfg.order, { ascending: cfg.asc });
  if (error) { $('#main').innerHTML = `<div class="panel">Could not load: ${esc(error.message)}</div>`; return; }
  rows = data || [];

  const cols = cfg.fields.slice(0, 3);   // first three fields appear in the table
  $('#main').innerHTML = `
    <div class="panel">
      <div class="row-head">
        <h2>${esc(cfg.label)}</h2>
        <button class="btn" data-action="add">+ Add</button>
      </div>
      <div class="scroll"><table>
        <thead><tr>
          ${cfg.reorder ? '<th>Order</th>' : ''}
          ${cols.map(c => `<th>${esc(c.label)}</th>`).join('')}
          <th></th>
        </tr></thead>
        <tbody>
          ${rows.map((r, i) => `
            <tr>
              ${cfg.reorder ? `<td>
                <button class="btn ghost" data-action="up" data-i="${i}">▲</button>
                <button class="btn ghost" data-action="down" data-i="${i}">▼</button></td>` : ''}
              ${cols.map(c => `<td>${esc(r[c.key])}</td>`).join('')}
              <td>
                <button class="btn ghost" data-action="edit" data-i="${i}">Edit</button>
                <button class="btn danger" data-action="delete" data-i="${i}">Delete</button>
              </td>
            </tr>`).join('') || `<tr><td colspan="9">No entries yet.</td></tr>`}
        </tbody>
      </table></div>
    </div>`;
}

// ---------- 6. SINGLE-RECORD SECTIONS (Home, Statistics) ----------
async function renderSingle(key) {
  const cfg = TABLES[key];
  const { data } = await db.from(cfg.table).select('*').eq('id', cfg.singleId).maybeSingle();
  const row = data || {};
  $('#main').innerHTML = `
    <div class="panel">
      <h2>${esc(cfg.label)}</h2>
      <p class="muted">Edit the boxes, then press Save. Changes show on the public site straight away.</p>
      <form id="singleForm">
        ${cfg.fields.map(f => fieldHtml(f, row, false, null)).join('')}
        <button class="btn" type="submit">Save</button>
      </form>
    </div>`;
  $('#singleForm').onsubmit = (e) => saveSingle(e, cfg);
}

async function saveSingle(e, cfg) {
  e.preventDefault();
  const payload = { id: cfg.singleId, ...readFields(e.target, cfg, null) };
  if (cfg.stampDate) {
    payload.updated_date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  const { error } = await db.from(cfg.table).upsert(payload);
  alert(error ? 'Could not save: ' + error.message : 'Saved.');
}

// ---------- 7. BUTTON CLICKS ----------
async function onMainClick(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'add') return openForm(null);
  if (action === 'edit') return openForm(rows[Number(btn.dataset.i)]);
  if (action === 'delete') return removeRow(rows[Number(btn.dataset.i)]);
  if (action === 'up') return moveRow(Number(btn.dataset.i), -1);
  if (action === 'down') return moveRow(Number(btn.dataset.i), 1);
  if (action === 'add-position') return addPosition();
}

// ---------- 8. ADD / EDIT POPUP (table sections) ----------
function openForm(row) {
  const cfg = TABLES[current];
  const pk = cfg.pk || 'id';
  const isNew = !row;
  const fields = cfg.fields.map(f => fieldHtml(f, row || {}, isNew, pk)).join('');

  $('#modal').innerHTML = `
    <form id="rowForm">
      <h3>${isNew ? 'Add' : 'Edit'} ${esc(cfg.label)}</h3>
      ${fields}
      <div class="form-actions">
        <button type="button" class="btn ghost" id="cancelForm">Cancel</button>
        <button class="btn" type="submit">Save</button>
      </div>
    </form>`;
  $('#modal').classList.remove('hidden');
  $('#cancelForm').onclick = closeModal;
  $('#rowForm').onsubmit = (e) => saveRow(e, row, isNew);
}

// ---------- 9. SAVE A TABLE ROW (insert new, or update existing) ----------
async function saveRow(e, row, isNew) {
  e.preventDefault();
  const cfg = TABLES[current];
  const pk = cfg.pk || 'id';
  const payload = readFields(e.target, cfg, isNew ? null : pk);

  if (cfg.reorder && isNew) {
    // New items go to the bottom of the list.
    payload.sort_order = rows.reduce((m, r) => Math.max(m, r.sort_order || 0), 0) + 10;
  }

  const result = isNew
    ? await db.from(cfg.table).insert(payload)
    : await db.from(cfg.table).update(payload).eq(pk, row[pk]);

  if (result.error) { alert('Could not save: ' + result.error.message); return; }
  closeModal();
  showSection(current);
}

// ---------- 10. DELETE ----------
async function removeRow(row) {
  const cfg = TABLES[current];
  const pk = cfg.pk || 'id';
  if (!confirm('Delete this entry? This cannot be undone.')) return;
  const { error } = await db.from(cfg.table).delete().eq(pk, row[pk]);
  if (error) alert('Could not delete: ' + error.message);
  showSection(current);
}

// ---------- 11. REORDER (up/down) ----------
async function moveRow(i, dir) {
  const cfg = TABLES[current];
  const j = i + dir;
  if (j < 0 || j >= rows.length) return;

  // Swap the two rows, then number every row 10, 20, 30... so the order is clean.
  [rows[i], rows[j]] = [rows[j], rows[i]];
  for (let n = 0; n < rows.length; n++) {
    const want = (n + 1) * 10;
    if (rows[n].sort_order !== want) {
      const { error } = await db.from(cfg.table).update({ sort_order: want }).eq('id', rows[n].id);
      if (error) { alert('Could not reorder: ' + error.message); break; }
    }
  }
  showSection(current);
}

// ---------- 12. PHOTO UPLOAD + CHECKBOX CHANGES ----------
// One handler for both the page and the popup. Photo uploads and Access checkboxes come through here.
async function onMainChange(e) {
  const el = e.target;

  // Photo upload: send the file to the "images" bucket, then fill in its link.
  if (el.type === 'file' && el.dataset.upload) {
    const file = el.files[0];
    if (!file) return;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${current}/${Date.now()}-${safeName}`;
    const { error } = await db.storage.from('images').upload(path, file, { cacheControl: '3600' });
    if (error) { alert('Upload failed: ' + error.message); el.value = ''; return; }
    const url = db.storage.from('images').getPublicUrl(path).data.publicUrl;
    el.form.elements[el.dataset.upload].value = url;
    el.value = '';
    alert('Photo uploaded. Press Save to keep it.');
    return;
  }

  // Access page: what each position may edit.
  if (el.dataset.grant) {
    const [position, section] = el.dataset.grant.split('|');
    const { error } = await db.from('position_sections')
      .upsert({ position, section, can_edit: el.checked });
    if (error) { alert(error.message); el.checked = !el.checked; }
  }

  // Access page: which positions may manage access.
  if (el.dataset.access) {
    const name = el.dataset.access;
    // Warn before removing your own access, so you don't lock yourself out.
    if (me && name === me.role_title && !el.checked &&
        !confirm('This is your own position. Removing "Manage access" will lock you out of this page. Continue?')) {
      el.checked = true;
      return;
    }
    const { error } = await db.from('positions').update({ can_manage_access: el.checked }).eq('name', name);
    if (error) { alert(error.message); el.checked = !el.checked; }
  }
}

// ---------- 13. ACCESS PAGE ----------
async function renderAccess() {
  const [{ data: pos }, { data: grants }] = await Promise.all([
    db.from('positions').select('*').order('sort_order'),
    db.from('position_sections').select('position,section,can_edit')
  ]);
  const has = (p, s) => (grants || []).some(g => g.position === p && g.section === s && g.can_edit);

  $('#main').innerHTML = `
    <div class="panel">
      <h2>Access by position</h2>
      <p class="muted">Tick what each position may edit. Changes save immediately.
        "Manage access" lets that position open this page.
        "Home" covers the home page and showcase photos.</p>
      <div class="scroll"><table>
        <thead><tr>
          <th>Position</th><th>Manage access</th>
          ${ALL_SECTIONS.map(([, l]) => `<th>${esc(l)}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${(pos || []).map(p => `
            <tr>
              <td>${esc(p.name)}</td>
              <td><input type="checkbox" data-access="${esc(p.name)}" ${p.can_manage_access ? 'checked' : ''}></td>
              ${ALL_SECTIONS.map(([k]) => `
                <td><input type="checkbox" data-grant="${esc(p.name)}|${k}" ${has(p.name, k) ? 'checked' : ''}></td>`).join('')}
            </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
    <div class="panel">
      <div class="row-head">
        <input id="newPos" placeholder="New position name (must match the Staff position exactly)">
        <button class="btn" data-action="add-position">Add position</button>
      </div>
    </div>`;
}

async function addPosition() {
  const name = $('#newPos').value.trim();
  if (!name) { alert('Type a position name first.'); return; }
  const { error } = await db.from('positions').insert({ name, can_manage_access: false, sort_order: 100 });
  if (error) { alert(error.message); return; }
  renderAccess();
}

// ---------- 14. CLOSE POPUP ----------
function closeModal() {
  $('#modal').classList.add('hidden');
  $('#modal').innerHTML = '';
}

init();
