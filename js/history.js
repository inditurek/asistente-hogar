// =============================================
// HISTORY
// =============================================

function renderHistory() {
  const container = document.getElementById('history-entries');
  const overview = document.getElementById('history-overview-stats');

  if (!state.history.length) {
    overview.innerHTML = '';
    container.innerHTML = `
      <div class="history-empty">
        <div class="icon">📊</div>
        <p>Todavía no hay jornadas registradas.<br>Iniciá el reloj cuando llegues y finalizalo cuando te vayas.</p>
      </div>
    `;
    return;
  }

  const totalSessions = state.history.length;
  const avgElapsed = state.history.reduce((a, e) => a + e.elapsed, 0) / totalSessions;
  const avgCompletion = state.history.reduce((a, e) => a + (e.doneTasks / (e.totalTasks || 1)), 0) / totalSessions;
  const onTime = state.history.filter(e => e.finishedOnTime).length;

  overview.innerHTML = `
    <div class="history-overview">
      <div class="overview-card">
        <div class="overview-value">${totalSessions}</div>
        <div class="overview-label">Jornadas registradas</div>
      </div>
      <div class="overview-card">
        <div class="overview-value">${formatTime(avgElapsed)}</div>
        <div class="overview-label">Tiempo promedio</div>
      </div>
      <div class="overview-card">
        <div class="overview-value">${Math.round(avgCompletion * 100)}%</div>
        <div class="overview-label">Tareas completadas (prom.)</div>
      </div>
      <div class="overview-card">
        <div class="overview-value">${onTime}/${totalSessions}</div>
        <div class="overview-label">Jornadas en tiempo</div>
      </div>
    </div>
    <div class="section-title-main">Registro de jornadas</div>
  `;

  container.innerHTML = state.history.map(entry => {
    const pct = Math.round((entry.doneTasks / (entry.totalTasks || 1)) * 100);
    const timeClass = entry.finishedOnTime ? 'stat-good' : 'stat-warn';
    const labelClass = `label-${entry.day}`;
    return `
      <div class="history-entry">
        <div class="history-entry-header">
          <div class="history-date">${entry.date}</div>
          <span class="history-day-label ${labelClass}">${entry.day}</span>
        </div>
        <div class="history-stats">
          <div class="stat-box">
            <div class="stat-value ${timeClass}">${formatTime(entry.elapsed)}</div>
            <div class="stat-label">Tiempo trabajado</div>
          </div>
          <div class="stat-box">
            <div class="stat-value ${pct === 100 ? 'stat-good' : pct >= 70 ? 'stat-warn' : 'stat-bad'}">${pct}%</div>
            <div class="stat-label">Tareas completadas</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${entry.doneTasks}/${entry.totalTasks}</div>
            <div class="stat-label">Tareas hechas</div>
          </div>
          <div class="stat-box">
            <div class="stat-value ${entry.finishedOnTime ? 'stat-good' : 'stat-bad'}">${entry.finishedOnTime ? '✓' : '✗'}</div>
            <div class="stat-label">Terminó antes de las 13:00</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function clearHistory() {
  if (!confirm('¿Borrar todo el historial?')) return;
  state.history = [];
  save();
  renderHistory();
}
