// =============================================
// NOTES PER DAY
// =============================================

function renderNotes(day) {
  const el = document.getElementById('notes-list-' + day);
  if (!el) return;
  const notes = (state.notes && state.notes[day]) || [];
  if (!notes.length) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:4px 0">Sin notas todavía.</p>';
    return;
  }
  el.innerHTML = notes.slice().reverse().map(n => `
    <div class="note-item">
      <div>${n.text}</div>
      <div class="note-meta">— ${n.author} · ${new Date(n.at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</div>
    </div>
  `).join('');
}

function addNote(day) {
  const input = document.getElementById('note-input-' + day);
  const text = input?.value?.trim();
  if (!text) return;
  if (!state.notes) state.notes = { lunes: [], miercoles: [], viernes: [] };
  if (!state.notes[day]) state.notes[day] = [];
  state.notes[day].push({
    id: 'n' + Date.now(),
    text,
    author: currentUser?.displayName?.split(' ')[0] || 'Alguien',
    at: new Date().toISOString()
  });
  input.value = '';
  save();
  renderNotes(day);
}
