// =============================================
// NAVIGATION
// =============================================
import { state, save } from './state.js'
import { getCurrentSeason } from './data.js'
import { renderTasks } from './tasks.js'
import { renderMenu } from './menu.js'
import { renderHistory } from './history.js'
import { renderShoppingList } from './shopping.js'
import { renderPlan } from './week-plan.js'

export function showView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'))
  document.getElementById('view-' + view).classList.add('active')
  document.querySelectorAll('.nav-tab').forEach(t => {
    if (t.textContent.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(view.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
      t.classList.add('active')
    }
  })
  state.currentView = view
  if (view === 'menu') renderMenu()
  if (view === 'historial') renderHistory()
  if (view === 'compras') renderShoppingList()
  if (view === 'plan') { window._pickingSlot = undefined; renderPlan() }
}

// =============================================
// NOTIFICATION (day before)
// =============================================

export function checkNotification(day) {
  const today = new Date().getDay()
  const prevDay = { lunes: 0, miercoles: 2, viernes: 4 }
  const container = document.getElementById('notif-' + day)
  if (!container) return

  if (today === prevDay[day]) {
    const recs = getRecommendedRecipes(day)
    const chosen = state.menuChoice && state.menuChoice.day === day ? state.menuChoice.recipeId : null
    renderNotif(container, day, recs, chosen)
  } else {
    container.innerHTML = ''
  }
}

export function getRecommendedRecipes(day) {
  const season = getCurrentSeason()
  const maxTime = { lunes: 90, miercoles: 50, viernes: 90 }
  const limit = maxTime[day] || 90

  const recentRecipeIds = new Set(
    (state.history || [])
      .filter(h => h.recipeId && (Date.now() - new Date(h.date)) < 14 * 24 * 3600 * 1000)
      .map(h => h.recipeId)
  )
  const plannedIds = new Set(state.weekPlan || [])

  let pool = state.recipes.filter(r => {
    if (r.tags.includes('frio') && (season === 'verano' || season === 'primavera')) return false
    if (r.tags.includes('calor') && (season === 'invierno' || season === 'otono')) return false
    if (r.time > limit) return false
    return true
  })

  const daySeed = new Date().getDay() * 1000 + ['lunes', 'miercoles', 'viernes'].indexOf(day)
  const seededRandom = (i) => ((daySeed * 9301 + i * 49297 + 233280) % 233280) / 233280

  const scored = pool.map((r, i) => {
    let score = seededRandom(i) * 0.4
    if (day === 'lunes' && r.tags.includes('mealprep')) score += 3
    if (day === 'miercoles' && r.tags.includes('rapido')) score += 3
    if (day === 'viernes' && (r.tags.includes('mealprep') || r.tags.includes('finde'))) score += 3
    if (recentRecipeIds.has(r.id)) score -= 4
    if (plannedIds.has(r.id)) score -= 5
    return { r, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 3).map(s => s.r)
}

export function renderNotif(container, day, recs, chosenId) {
  const dayLabels = { lunes: 'el lunes', miercoles: 'el miércoles', viernes: 'el viernes' }
  container.dataset.recs = JSON.stringify(recs)
  const chosenRecipe = state.recipes.find(r => r.id === chosenId)
  container.innerHTML = `
    <div class="notif-banner">
      <div class="notif-header">
        <span class="notif-icon">🔔</span>
        <div>
          <div class="notif-title">¡Mañana trabajás! Elegí qué cocinar ${dayLabels[day]}</div>
          <div class="notif-subtitle">Recomendaciones según estación, tiempo disponible y lo cocinado recientemente.</div>
        </div>
      </div>
      <div class="menu-options">
        ${recs.map(r => `
          <div class="menu-option-card ${chosenId === r.id ? 'selected' : ''}" onclick="chooseMenuOption('${day}','${r.id}',this)">
            <div style="font-size:1.5rem;margin-bottom:6px">${r.emoji}</div>
            <div class="menu-option-name">${r.name}</div>
            <div class="menu-option-time">⏱ ${r.time} min</div>
            <span class="menu-option-tag">${r.tags.includes('mealprep') ? 'Meal prep' : 'Plato fresco'}</span>
          </div>
        `).join('')}
      </div>
      ${chosenId && chosenRecipe ? `
        <div class="notif-confirm" style="margin-top:14px">
          <span style="color:var(--success);font-weight:700">✓ Elegiste: ${chosenRecipe.emoji} ${chosenRecipe.name}</span>
          <button class="btn btn-ghost" onclick="addMenuToTasks('${day}','${chosenId}')">Agregar a tareas del día</button>
        </div>
      ` : ''}
    </div>
  `
}

export function chooseMenuOption(day, recipeId, el) {
  document.querySelectorAll('#notif-' + day + ' .menu-option-card').forEach(c => c.classList.remove('selected'))
  el.classList.add('selected')
  const recipe = state.recipes.find(r => r.id === recipeId)
  state.menuChoice = { day, recipeId, recipeName: recipe?.name || '', recipeEmoji: recipe?.emoji || '' }
  save()
  const container = document.getElementById('notif-' + day)
  const recs = JSON.parse(container.dataset.recs || 'null') || getRecommendedRecipes(day)
  renderNotif(container, day, recs, recipeId)
}

export function addMenuToTasks(day, recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId)
  if (!recipe) return
  const already = state.tasks[day].find(t => t.menuLinked && t.recipeId === recipeId)
  if (already) { alert('Esta receta ya está en las tareas.'); return }
  const newTask = {
    id: 'm' + Date.now(),
    cat: 'cocina',
    icon: recipe.emoji,
    text: `Preparar: ${recipe.name}`,
    done: false,
    custom: true,
    menuLinked: true,
    recipeId,
  }
  state.tasks[day].push(newTask)
  save()
  renderTasks(day)
  alert(`✅ "${recipe.name}" agregada a las tareas de cocina del ${day}.`)
}
