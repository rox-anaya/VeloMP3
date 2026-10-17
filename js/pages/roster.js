/* js/pages/roster.js — pilot roster, most hours first. */
(async function () {
  const content = document.getElementById('content');
  const { data, error } = await db.from('roster').select('*').order('hours', { ascending: false });
  if (error) { content.innerHTML = `<p class="err">Could not load the roster.</p>`; return; }
  const list = data || [];

  content.innerHTML = `<h1>Roster</h1>` +
    (list.length ? `<div class="scroll panel"><table class="roster">
      <thead><tr><th>#</th><th>Pilot</th><th>Callsign</th><th>Rank</th><th>Hours</th></tr></thead>
      <tbody>${list.map((p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${esc(p.pilot_name)}</td>
          <td>${esc(p.callsign)}</td>
          <td>${esc(p.rank_title || 'Trainee')}</td>
          <td>${esc(p.hours ?? 0)}</td>
        </tr>`).join('')}</tbody>
    </table></div>` : '<p class="muted">No pilots on the roster yet.</p>');
})();
