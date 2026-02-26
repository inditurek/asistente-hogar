// =============================================
// TASKS
// =============================================
import { state, clockIntervals, save } from './state.js'
import { CATEGORIES } from './data.js'

export function getDayColor(day) {
  return day === 'lunes' ? 'var(--lunes)' : day === 'miercoles' ? 'var(--miercoles)' : 'var(--viernes)'
}

export function renderTasks(day) {
  const tasks = state.tasks[day]
  const done = tasks.filter(t => t.done).length
  const total = tasks.length
  const pct = total ? Math.round((done / total) * 100) : 0
  const color = getDayColor(day)

  document.getElementById('progress-' + day).innerHTML = `
    <div class="day-progress" style="margin-bottom:20px">
      <div class="progress-label">Progreso</div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" style="width:${pct}%;background:${color}"></div>
      </div>
      <div class="progress-count" style="color:${color}">${done}/${total}</div>
    </div>
  `

  const cats = {}
  tasks.forEach(t => {
    if (!cats[t.cat]) cats[t.cat] = []
    cats[t.cat].push(t)
  })

  let html = ''
  for (const [cat, items] of Object.entries(cats)) {
    const catInfo = CATEGORIES[cat] || { label: cat, icon: '📌' }
    html += `<div class="category-section">
      <div class="category-header">
        <span class="category-icon">${catInfo.icon}</span>
        <span class="category-name">${catInfo.label}</span>
      </div>
      <ul class="task-list">`
    items.forEach(t => {
      html += `<li class="task-item ${t.done ? 'done' : ''}" id="task-li-${t.id}">
        <div class="task-check" onclick="toggleTask('${day}','${t.id}')">
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="task-text" onclick="toggleTask('${day}','${t.id}')">${t.text}</span>
        ${t.menuLinked ? '<span class="task-tag tag-menu">🍽 Menú</span>' : ''}
        <div class="task-actions">
          <button class="task-action-btn" onclick="editTask('${day}','${t.id}')" title="Editar">✏️</button>
          <button class="task-action-btn task-action-delete" onclick="deleteTask('${day}','${t.id}')" title="Eliminar">🗑</button>
        </div>
      </li>`
    })
    html += `</ul>
      <div class="add-task-row">
        <input class="task-input" id="new-task-${day}-${cat}" placeholder="Agregar tarea de ${catInfo.label.toLowerCase()}..." onkeydown="if(event.key==='Enter')addTask('${day}','${cat}','${day}-${cat}')"/>
        <button class="btn-add" onclick="addTask('${day}','${cat}','${day}-${cat}')">+</button>
      </div>
    </div>`
  }

  document.getElementById('tasks-' + day).innerHTML = html

  if (done === total && total > 0) {
    document.getElementById('tasks-' + day).insertAdjacentHTML('afterbegin', `
      <div class="summary-banner" style="margin-bottom:20px">
        <div class="summary-icon">🎉</div>
        <div class="summary-text">
          <h3>¡Todas las tareas completadas!</h3>
          <p>Excelente jornada. Podés finalizar el reloj cuando te vayas.</p>
        </div>
      </div>
    `)
  }
}

export function toggleTask(day, id) {
  const task = state.tasks[day].find(t => t.id === id)
  if (task) { task.done = !task.done; save(); renderTasks(day) }
}

export function addTask(day, cat, inputId) {
  const input = document.getElementById('new-task-' + inputId)
  const text = input.value.trim()
  if (!text) return
  const newId = day[0] + Date.now()
  state.tasks[day].push({ id: newId, cat, icon: '📌', text, done: false, custom: true })
  input.value = ''
  save()
  renderTasks(day)
}

export function editTask(day, id) {
  const task = state.tasks[day].find(t => t.id === id)
  if (!task) return
  const li = document.getElementById('task-li-' + id)
  if (!li) return
  const textEl = li.querySelector('.task-text')
  const currentText = task.text
  textEl.outerHTML = `<input class="task-input task-edit-input" id="edit-input-${id}" value="${currentText.replace(/"/g, '&quot;')}"
    onkeydown="if(event.key==='Enter')saveEditTask('${day}','${id}');if(event.key==='Escape')renderTasks('${day}')"
    style="flex:1;margin:0 8px" />
    <button class="btn btn-primary" style="padding:6px 12px;font-size:12px" onclick="saveEditTask('${day}','${id}')">✓</button>`
  const input = document.getElementById('edit-input-' + id)
  if (input) { input.focus(); input.select() }
}

export function saveEditTask(day, id) {
  const input = document.getElementById('edit-input-' + id)
  if (!input) return
  const newText = input.value.trim()
  if (!newText) return
  const task = state.tasks[day].find(t => t.id === id)
  if (task) { task.text = newText; save(); renderTasks(day) }
}

export function deleteTask(day, id) {
  if (!confirm('¿Eliminar esta tarea?')) return
  state.tasks[day] = state.tasks[day].filter(t => t.id !== id)
  save()
  renderTasks(day)
}

export function resetDay(day) {
  if (!confirm('¿Resetear todas las tareas de este día?')) return
  state.tasks[day] = state.tasks[day].map(t => ({ ...t, done: false }))
  save()
  renderTasks(day)
}

// =============================================
// CLOCK
// =============================================

export function formatTime(ms) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600).toString().padStart(2, '0')
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${h}:${m}:${sec}`
}

export function startSession(day) {
  if (state.sessions[day] && state.sessions[day].running) return
  const now = Date.now()
  state.sessions[day] = { start: now, running: true, elapsed: 0 }
  save()
  document.getElementById('start-btn-' + day).style.display = 'none'
  document.getElementById('clock-' + day).style.display = 'grid'
  tickClock(day)
  clockIntervals[day] = setInterval(() => tickClock(day), 1000)
}

export function tickClock(day) {
  const session = state.sessions[day]
  if (!session || !session.running) return
  const elapsed = Date.now() - session.start

  const startDate = new Date(session.start)
  const endTime = new Date(startDate)
  endTime.setHours(13, 0, 0, 0)
  if (endTime.getTime() <= session.start) endTime.setTime(session.start + 5 * 60 * 60 * 1000)
  const remaining = endTime.getTime() - Date.now()

  const elEl = document.getElementById('elapsed-' + day)
  const remEl = document.getElementById('remaining-' + day)
  if (!elEl) return

  elEl.textContent = formatTime(elapsed)

  if (remaining <= 0) {
    elEl.className = 'clock-time critical'
    remEl.className = 'clock-remaining critical'
    remEl.innerHTML = `Tiempo extra: <span>+${formatTime(Math.abs(remaining))}</span>`
  } else if (remaining < 30 * 60 * 1000) {
    elEl.className = 'clock-time critical'
    remEl.className = 'clock-remaining critical'
    remEl.innerHTML = `Tiempo restante: <span>${formatTime(remaining)}</span>`
  } else if (remaining < 60 * 60 * 1000) {
    elEl.className = 'clock-time warning'
    remEl.className = 'clock-remaining warning'
    remEl.innerHTML = `Tiempo restante: <span>${formatTime(remaining)}</span>`
  } else {
    elEl.className = 'clock-time'
    remEl.className = 'clock-remaining'
    remEl.innerHTML = `Tiempo restante hasta las 13:00: <span>${formatTime(remaining)}</span>`
  }
}

export function endSession(day) {
  const session = state.sessions[day]
  if (!session) return
  clearInterval(clockIntervals[day])
  const elapsed = Date.now() - session.start
  const tasks = state.tasks[day]
  const done = tasks.filter(t => t.done).length
  const total = tasks.length

  const entry = {
    id: Date.now(),
    day,
    date: new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    elapsed,
    doneTasks: done,
    totalTasks: total,
    finishedOnTime: elapsed <= 5 * 60 * 60 * 1000,
  }
  state.history.unshift(entry)
  state.sessions[day] = null
  save()
  document.getElementById('clock-' + day).style.display = 'none'
  document.getElementById('start-btn-' + day).style.display = ''
  renderTasks(day)
  alert(`✅ Jornada finalizada.\nTiempo trabajado: ${formatTime(elapsed)}\nTareas completadas: ${done}/${total}`)
}
