// =============================================
// HISTORY
// =============================================
import { state, save } from './state.js'
import { formatTime } from './tasks.js'

export function renderHistory() {
  const container = document.getElementById('history-entries')
  const overview = document.getElementById('history-overview-stats')

  if (!state.history.length) {
    overview.innerHTML = ''
    container.innerHTML = `
      <div class="history-empty">
        <div class="icon">📊</div>
        <p>Todavía no hay jornadas registradas.<br>Iniciá el reloj cuando llegues y finalizalo cuando te vayas.</p>
      </div>
    `
    return
  }

  const totalSessions = state.history.length
  const avgElapsed = state.history.reduce((a, e) => a + e.elapsed, 0) / totalSessions
  const avgCompletion = state.history.reduce((a, e) => a + (e.doneTasks / (e.totalTasks || 1)), 0) / totalSessions
  const onTime = state.history.filter(e => e.finishedOnTime).length

  overview.innerHTML = `
    <div class="history-overview">
      <div class="overview-card"><div class="overview-value">${totalSessions}</div><div class="overview-label">Jornadas registradas</div></div>
      <div class="overview-card"><div class="overview-value">${formatTime(avgElapsed)}</div><div class="overview-label">Tiempo promedio</div></div>
      <div class="overview-card"><div class="overview-value">${Math.round(avgCompletion * 100)}%</div><div class="overview-label">Tareas completadas (prom.)</div></div>
      <div class="overview-card"><div class="overview-value">${onTime}/${totalSessions}</div><div class="overview-label">Jornadas en tiempo</div></div>
    </div>
    <div class="section-title-main">Registro de jornadas</div>
  `

  container.innerHTML = state.history.map(entry => {
    const pct = Math.round((entry.doneTasks / (entry.totalTasks || 1)) * 100)
    const timeClass = entry.finishedOnTime ? 'stat-good' : 'stat-warn'
    const labelClass = `label-${entry.day}`
    return `
      <div class="history-entry">
        <div class="history-entry-header">
          <div class="history-date">${entry.date}</div>
          <span class="history-day-label ${labelClass}">${entry.day}</span>
        </div>
        <div class="history-stats">
          <div class="stat-box"><div class="stat-value ${timeClass}">${formatTime(entry.elapsed)}</div><div class="stat-label">Tiempo trabajado</div></div>
          <div class="stat-box"><div class="stat-value ${pct === 100 ? 'stat-good' : pct >= 70 ? 'stat-warn' : 'stat-bad'}">${pct}%</div><div class="stat-label">Tareas completadas</div></div>
          <div class="stat-box"><div class="stat-value">${entry.doneTasks}/${entry.totalTasks}</div><div class="stat-label">Tareas hechas</div></div>
          <div class="stat-box"><div class="stat-value ${entry.finishedOnTime ? 'stat-good' : 'stat-bad'}">${entry.finishedOnTime ? '✓' : '✗'}</div><div class="stat-label">Terminó antes de las 13:00</div></div>
        </div>
      </div>
    `
  }).join('')
}

export function clearHistory() {
  if (!confirm('¿Borrar todo el historial?')) return
  state.history = []
  save()
  renderHistory()
}

export async function renderUsersPanel() {
  const { loadUsersForHistory, setUserRole, isFounder } = await import('./roles.js')
  const { auth } = await import('../src/firebase.js')

  const container = document.getElementById('users-panel')
  if (!container) return

  const users = await loadUsersForHistory()
  const currentUid = auth.currentUser?.uid
  const canManage = isFounder(currentUid)

  container.innerHTML = `
    <div class="section-title-main" style="margin-top:32px">👥 Perfiles de la casa</div>
    ${users.map(u => `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 20px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-weight:700;font-size:14px">${u.name}</div>
          <div style="font-size:12px;color:var(--muted)">${u.email}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:12px;font-weight:700;color:${u.role === 'admin' ? 'var(--gold)' : 'var(--muted)'}">
            ${u.role === 'admin' ? '👑 Admin' : '👤 Usuario'}
          </span>
          ${canManage && u.uid !== currentUid ? `
            <button onclick="window._toggleRole('${u.uid}','${u.role}')"
              style="font-size:11px;padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:none;cursor:pointer;font-family:'Lato',sans-serif;color:var(--muted)">
              ${u.role === 'admin' ? 'Degradar' : 'Promover'}
            </button>
          ` : ''}
        </div>
      </div>
    `).join('')}
  `

  window._toggleRole = async (uid, currentRoleVal) => {
    const newRole = currentRoleVal === 'admin' ? 'user' : 'admin'
    if (!confirm(`¿Cambiar este usuario a ${newRole === 'admin' ? 'Admin' : 'Usuario'}?`)) return
    await setUserRole(uid, newRole)
    renderUsersPanel()
  }
}