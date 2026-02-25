// =============================================
// WEEK PLAN
// =============================================

function renderPlan() {
  const sel = document.getElementById('plan-selections');
  const picker = document.getElementById('plan-recipe-picker');
  if (!sel || !picker) return;

  const plan = state.weekPlan || [];
  const meta = state.weekPlanMeta;
  const season = getCurrentSeason();
  const seasonLabel = { verano: '🌞 verano', otono: '🍂 otoño', invierno: '🧥 invierno', primavera: '🌸 primavera' }[season];

  const metaHtml = meta?.updatedBy
    ? `<p style="font-size:12px;color:var(--muted);margin-bottom:20px">Último cambio: <b>${meta.updatedBy}</b> · ${new Date(meta.updatedAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</p>`
    : '';

  sel.innerHTML = metaHtml + [0, 1, 2].map(i => {
    const recipeId = plan[i];
    const recipe = recipeId ? state.recipes.find(r => r.id === recipeId) : null;
    if (recipe) {
      return `
        <div class="plan-slot filled" id="plan-slot-${i}">
          <div class="plan-slot-number">${i + 1}</div>
          <div class="plan-slot-emoji">${recipe.emoji}</div>
          <div class="plan-slot-info">
            <div class="plan-slot-name">${recipe.name}</div>
            <div class="plan-slot-meta">⏱ ${recipe.time} min · ${recipe.tags.includes('mealprep') ? 'Meal prep' : 'Plato fresco'} · ${recipe.ingredients.length} ingredientes</div>
          </div>
          <button class="plan-slot-remove" onclick="event.stopPropagation();removePlanSlot(${i})">✕</button>
        </div>`;
    } else {
      return `
        <div class="plan-slot" id="plan-slot-${i}" onclick="pickRecipeForSlot(${i})">
          <div class="plan-slot-number">${i + 1}</div>
          <div style="color:var(--muted);font-size:14px">Tocá para elegir una receta · ${seasonLabel}</div>
        </div>`;
    }
  }).join('');

  if (window._pickingSlot !== undefined) {
    const available = state.recipes.filter(r => {
      if (r.tags.includes('frio') && (season === 'verano' || season === 'primavera')) return false;
      if (r.tags.includes('calor') && (season === 'invierno' || season === 'otono')) return false;
      return true;
    });
    picker.innerHTML = `
      <div style="font-weight:700;margin-bottom:10px;font-size:14px">¿Qué vas a cocinar en el lugar ${window._pickingSlot + 1}?</div>
      <input class="menu-search" type="text" placeholder="Buscar receta..." oninput="filterPlanPicker(this.value)" id="plan-picker-search" style="margin-bottom:12px" />
      <div class="plan-picker-grid" id="plan-picker-grid">
        ${available.map(r => `
          <div class="plan-picker-card ${plan.includes(r.id) ? 'already-selected' : ''}" onclick="selectRecipeForSlot(${window._pickingSlot},'${r.id}')">
            <div style="font-size:1.5rem">${r.emoji}</div>
            <div style="font-weight:700;font-size:13px;margin-top:4px">${r.name}</div>
            <div style="font-size:12px;color:var(--muted)">⏱ ${r.time} min</div>
          </div>
        `).join('')}
      </div>`;
    window._planPickerRecipes = available;
  } else if (plan.length > 0) {
    picker.innerHTML = `
      <div style="margin-top:8px;display:flex;flex-direction:column;gap:10px">
        <button class="btn btn-primary" onclick="generateShoppingList()" style="padding:14px;font-size:15px">
          🛒 Generar lista de compras (${plan.length} receta${plan.length > 1 ? 's' : ''})
        </button>
        ${plan.length < 3 ? `<p style="font-size:12px;color:var(--muted);text-align:center">Podés agregar hasta 3 recetas</p>` : ''}
      </div>`;
  } else {
    picker.innerHTML = '';
  }
}

function filterPlanPicker(query) {
  const grid = document.getElementById('plan-picker-grid');
  if (!grid || !window._planPickerRecipes) return;
  const plan = state.weekPlan || [];
  const q = query.toLowerCase();
  const filtered = q
    ? window._planPickerRecipes.filter(r => r.name.toLowerCase().includes(q))
    : window._planPickerRecipes;
  grid.innerHTML = filtered.map(r => `
    <div class="plan-picker-card ${plan.includes(r.id) ? 'already-selected' : ''}" onclick="selectRecipeForSlot(${window._pickingSlot},'${r.id}')">
      <div style="font-size:1.5rem">${r.emoji}</div>
      <div style="font-weight:700;font-size:13px;margin-top:4px">${r.name}</div>
      <div style="font-size:12px;color:var(--muted)">⏱ ${r.time} min</div>
    </div>
  `).join('');
}

function pickRecipeForSlot(i) {
  window._pickingSlot = i;
  renderPlan();
  document.getElementById('plan-recipe-picker')?.scrollIntoView({ behavior: 'smooth' });
}

function selectRecipeForSlot(i, recipeId) {
  if (!state.weekPlan) state.weekPlan = [];
  state.weekPlan[i] = recipeId;
  state.weekPlan = state.weekPlan.filter(Boolean);
  window._pickingSlot = undefined;
  save();
  renderPlan();
}

function removePlanSlot(i) {
  if (!state.weekPlan) return;
  state.weekPlan.splice(i, 1);
  window._pickingSlot = undefined;
  save();
  renderPlan();
}

function savePlan() {
  if (!state.weekPlan?.length) { alert('Agregá al menos una receta al plan primero.'); return; }
  save();
  generateShoppingList();
}
