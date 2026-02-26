// =============================================
// MENU VIEW
// =============================================
import { state, save } from './state.js'
import { getCurrentSeason } from './data.js'
import { getRecommendedRecipes } from './navigation.js'

export function setFilter(filter, btn) {
  state.currentFilter = filter
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'))
  btn.classList.add('active')
  renderMenu()
}

export function filterRecipes(val) {
  state.currentSearch = val
  renderMenu()
}

export function renderMenu() {
  const season = getCurrentSeason()
  const seasonInfo = {
    verano:    ['🌞 Verano',   'rgba(212,168,71,0.2)',  'var(--gold)'],
    otono:     ['🍂 Otoño',    'rgba(200,105,58,0.2)',  'var(--lunes)'],
    invierno:  ['❄️ Invierno', 'rgba(100,160,220,0.2)', '#7AB8E8'],
    primavera: ['🌸 Primavera','rgba(107,191,142,0.2)', 'var(--success)'],
  }
  const [label, bg, color] = seasonInfo[season]
  const badge = document.getElementById('season-badge')
  if (badge) { badge.textContent = label; badge.style.background = bg; badge.style.color = color }
  renderRecipeGrid()
  renderTodayRec()
}

export function renderTodayRec() {
  const today = new Date().getDay()
  const dayMap = { 1: 'lunes', 3: 'miercoles', 5: 'viernes' }
  const todayKey = dayMap[today]
  const container = document.getElementById('today-rec')
  if (!todayKey) { container.innerHTML = ''; return }
  const recs = getRecommendedRecipes(todayKey)
  container.innerHTML = `
    <div style="margin-bottom:10px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold)">
      ⭐ Recomendados para hoy (${todayKey})
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px">
      ${recs.map(r => `<span class="recommend-badge" onclick="openRecipe('${r.id}')" style="cursor:pointer">${r.emoji} ${r.name}</span>`).join('')}
    </div>
  `
}

export function renderRecipeGrid() {
  const grid = document.getElementById('recipes-grid')
  let recipes = state.recipes
  if (state.currentFilter !== 'todos') recipes = recipes.filter(r => r.tags.includes(state.currentFilter))
  if (state.currentSearch) {
    const s = state.currentSearch.toLowerCase()
    recipes = recipes.filter(r => r.name.toLowerCase().includes(s))
  }

  if (!recipes.length) {
    grid.innerHTML = '<p style="color:var(--muted);padding:20px">No se encontraron recetas.</p>'
    return
  }

  grid.innerHTML = recipes.map(r => `
    <div class="recipe-card" onclick="openRecipe('${r.id}')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div class="recipe-emoji">${r.emoji}</div>
        <div class="recipe-card-actions" onclick="event.stopPropagation()">
          <button class="task-action-btn" onclick="openEditRecipeModal('${r.id}')" title="Editar">✏️</button>
          <button class="task-action-btn task-action-delete" onclick="deleteRecipe('${r.id}')" title="Eliminar">🗑</button>
        </div>
      </div>
      <div class="recipe-name">${r.name}</div>
      <div class="recipe-meta">
        <span>⏱ ${r.time} min</span>
        <span>🥄 ${r.ingredients.length} ingredientes</span>
      </div>
      <div class="recipe-chips">
        ${r.tags.includes('mealprep') ? '<span class="recipe-chip chip-mealprep">Meal prep</span>' : ''}
        ${r.tags.includes('rapido') ? '<span class="recipe-chip chip-rapido">Rápido</span>' : ''}
        ${r.tags.includes('finde') ? '<span class="recipe-chip chip-finde">Fin de semana</span>' : ''}
        ${r.tags.includes('singluten') ? '<span class="recipe-chip chip-singluten">Sin gluten</span>' : ''}
        ${r.tags.includes('calor') ? '<span class="recipe-chip chip-calor">🌞 Verano</span>' : ''}
        ${r.tags.includes('frio') ? '<span class="recipe-chip chip-frio">🧥 Invierno</span>' : ''}
        ${r.tags.includes('fresco') ? '<span class="recipe-chip chip-fresco">🍃 Todo el año</span>' : ''}
      </div>
    </div>
  `).join('')
}

export function openRecipe(id) {
  const recipe = state.recipes.find(r => r.id === id)
  if (!recipe) return
  document.getElementById('menu-list-view').style.display = 'none'
  document.getElementById('menu-detail-view').classList.add('active')

  const today = new Date().getDay()
  const dayMap = { 1: 'lunes', 3: 'miercoles', 5: 'viernes' }
  const todayKey = dayMap[today]
  const alreadyAdded = todayKey && state.tasks[todayKey].find(t => t.menuLinked && t.recipeId === id)

  document.getElementById('recipe-detail-content').innerHTML = `
    <div class="recipe-detail-header">
      <div class="recipe-detail-emoji">${recipe.emoji}</div>
      <div class="recipe-detail-title">${recipe.name}</div>
      <div class="recipe-detail-meta">
        <span>⏱ <strong>${recipe.time} min</strong></span>
        <span>🥄 <strong>${recipe.ingredients.length} ingredientes</strong></span>
      </div>
    </div>
    <div class="recipe-section">
      <div class="recipe-section-title">Ingredientes</div>
      <ul class="ingredients-list">
        ${recipe.ingredients.map(i => `
          <li class="ingredient-item">
            <span class="ingredient-name">${i.name}</span>
            <span class="ingredient-amount">${i.amount}</span>
          </li>
        `).join('')}
      </ul>
    </div>
    <div class="recipe-section">
      <div class="recipe-section-title">Preparación paso a paso</div>
      <ol class="steps-list">
        ${recipe.steps.map((s, i) => `
          <li class="step-item">
            <div class="step-num">${i + 1}</div>
            <div class="step-text">${s}</div>
          </li>
        `).join('')}
      </ol>
    </div>
    <div class="recipe-section">
      <div class="recipe-section-title">Conservación</div>
      <div class="conservation-box">🧊 ${recipe.conservation}</div>
    </div>
    ${todayKey ? `
      <button class="add-to-day-btn" onclick="addMenuToTasks('${todayKey}','${id}')" ${alreadyAdded ? 'disabled' : ''}>
        ${alreadyAdded ? '✓ Ya está en las tareas de hoy' : `+ Agregar a las tareas de ${todayKey}`}
      </button>
    ` : ''}
  `
}

export function closeRecipeDetail() {
  document.getElementById('menu-list-view').style.display = ''
  document.getElementById('menu-detail-view').classList.remove('active')
}

// =============================================
// ADD / EDIT RECIPE MODAL
// =============================================

export function openAddRecipeModal() {
  document.getElementById('r-name').value = ''
  document.getElementById('r-emoji').value = ''
  document.getElementById('r-time').value = ''
  document.getElementById('r-mealprep').checked = false
  document.getElementById('r-rapido').checked = false
  document.getElementById('r-finde').checked = false
  document.getElementById('r-sg').checked = true
  document.getElementById('r-ingredients').value = ''
  document.getElementById('r-steps').value = ''
  document.getElementById('r-storage').value = ''
  document.getElementById('r-edit-id').value = ''
  document.querySelector('#add-recipe-modal .modal-title').textContent = 'Nueva receta'
  document.getElementById('add-recipe-modal').classList.add('open')
}

export function closeAddRecipeModal() {
  document.getElementById('add-recipe-modal').classList.remove('open')
}

export function openEditRecipeModal(id) {
  const recipe = state.recipes.find(r => r.id === id)
  if (!recipe) return
  document.getElementById('r-name').value = recipe.name
  document.getElementById('r-emoji').value = recipe.emoji
  document.getElementById('r-time').value = recipe.time
  document.getElementById('r-mealprep').checked = recipe.tags.includes('mealprep')
  document.getElementById('r-rapido').checked = recipe.tags.includes('rapido')
  document.getElementById('r-finde').checked = recipe.tags.includes('finde')
  document.getElementById('r-sg').checked = recipe.tags.includes('singluten')
  document.getElementById('r-ingredients').value = recipe.ingredients.map(i => `${i.name} ${i.amount}`).join('\n')
  document.getElementById('r-steps').value = recipe.steps.join('\n')
  document.getElementById('r-storage').value = recipe.conservation
  document.getElementById('r-edit-id').value = id
  document.querySelector('#add-recipe-modal .modal-title').textContent = 'Editar receta'
  document.getElementById('add-recipe-modal').classList.add('open')
}

export function deleteRecipe(id) {
  if (!confirm('¿Eliminar esta receta?')) return
  state.recipes = state.recipes.filter(r => r.id !== id)
  save()
  renderMenu()
}

export function saveNewRecipe() {
  const name = document.getElementById('r-name').value.trim()
  const emoji = document.getElementById('r-emoji').value.trim() || '🍽️'
  const time = parseInt(document.getElementById('r-time').value) || 30
  const tags = []
  if (document.getElementById('r-mealprep').checked) tags.push('mealprep')
  if (document.getElementById('r-rapido').checked) tags.push('rapido')
  if (document.getElementById('r-finde').checked) tags.push('finde')
  if (document.getElementById('r-sg').checked) tags.push('singluten')

  const ingredients = document.getElementById('r-ingredients').value.trim().split('\n').filter(Boolean).map(line => {
    const parts = line.trim().split(/\s+/)
    const amount = parts.slice(-1)[0]
    const n = parts.slice(0, -1).join(' ')
    return { name: n || line, amount }
  })

  const steps = document.getElementById('r-steps').value.trim().split('\n').filter(Boolean)
  const conservation = document.getElementById('r-storage').value.trim() || 'Consultar según ingredientes.'

  if (!name) { alert('Ingresá el nombre de la receta.'); return }

  const editId = document.getElementById('r-edit-id').value
  if (editId) {
    const idx = state.recipes.findIndex(r => r.id === editId)
    if (idx !== -1) {
      state.recipes[idx] = { ...state.recipes[idx], emoji, name, time, tags, ingredients, steps, conservation }
    }
  } else {
    const recipe = { id: 'c' + Date.now(), emoji, name, time, tags, ingredients, steps, conservation }
    state.recipes.push(recipe)
  }

  save()
  closeAddRecipeModal()
  renderMenu()
}
