// =============================================
// SHOPPING LIST
// =============================================

function categorizeShopping(name) {
  const n = name.toLowerCase();
  if (/carne|pollo|cerdo|pescado|merluza|res|bife|pechuga|muslo|osobuco|paleta|peceto|lomo|salmon/.test(n)) return 'Carnes y pescados';
  if (/leche|queso|crema|huevo|yogur|manteca/.test(n)) return 'Lácteos y huevos';
  if (/papa|zanahoria|cebolla|ajo|tomate|morrón|zucchini|berenjena|espinaca|lechuga|zapallo|choclo|verdeo|pepino|palta|apio|rúcula|brócoli|coliflor/.test(n)) return 'Verduras';
  if (/limón|naranja|manzana|banana|mango|frutilla|uva|pera/.test(n)) return 'Frutas';
  if (/arroz|quinoa|lenteja|harina|pasta|pan|fideos|avena|garbanzo|porotos/.test(n)) return 'Granos y cereales';
  if (/aceite|sal|pimienta|pimentón|comino|orégano|romero|tomillo|mostaza|vinagre|caldo|leche de coco|curry|condimento|aliño/.test(n)) return 'Condimentos y especias';
  return 'Otros';
}

function generateShoppingList() {
  const plan = state.weekPlan || [];
  if (!plan.length) return;
  const ingredientMap = {};
  plan.forEach(recipeId => {
    const recipe = state.recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    recipe.ingredients.forEach(ing => {
      const key = ing.name.toLowerCase().trim();
      if (ingredientMap[key]) {
        ingredientMap[key].sources.push(recipe.name);
      } else {
        ingredientMap[key] = {
          id: 'si' + Date.now() + Math.random().toString(36).slice(2),
          name: ing.name,
          amount: ing.amount,
          category: categorizeShopping(ing.name),
          checked: false,
          sources: [recipe.name]
        };
      }
    });
  });
  state.shoppingList = Object.values(ingredientMap);
  save();
  showView('compras');
}

function renderShoppingList() {
  const container = document.getElementById('shopping-list-container');
  const sourceEl = document.getElementById('shopping-source');
  if (!container) return;

  const items = state.shoppingList || [];
  if (!items.length) {
    container.innerHTML = `
      <div class="shopping-empty">
        <div class="shopping-empty-icon">🛒</div>
        <div style="font-size:15px;font-weight:700;margin-bottom:8px">La lista está vacía</div>
        <div style="font-size:13px">Armá el plan de la semana y generá la lista automáticamente.</div>
        <button class="btn btn-primary" style="margin-top:16px" onclick="showView('plan')">Ir al plan →</button>
      </div>`;
    if (sourceEl) sourceEl.textContent = '';
    return;
  }

  const total = items.length;
  const checked = items.filter(i => i.checked).length;
  if (sourceEl) {
    const planRecipes = (state.weekPlan || []).map(id => state.recipes.find(r => r.id === id)?.name).filter(Boolean);
    sourceEl.innerHTML = `<b>${checked}/${total}</b> tachados · Recetas: ${planRecipes.join(', ')}`;
  }

  const grouped = {};
  items.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  const catOrder = ['Carnes y pescados', 'Verduras', 'Frutas', 'Lácteos y huevos', 'Granos y cereales', 'Condimentos y especias', 'Otros'];
  const catIcons = { 'Carnes y pescados': '🥩', 'Lácteos y huevos': '🥛', 'Verduras': '🥦', 'Granos y cereales': '🌾', 'Condimentos y especias': '🧂', 'Frutas': '🍋', 'Otros': '📦' };

  const sortedCats = catOrder.filter(c => grouped[c]).concat(Object.keys(grouped).filter(c => !catOrder.includes(c)));

  container.innerHTML = sortedCats.map(cat => `
    <div class="shopping-category">
      <div class="shopping-category-title">${catIcons[cat] || '📦'} ${cat}</div>
      ${grouped[cat].map(item => `
        <div class="shopping-item ${item.checked ? 'checked' : ''}" onclick="toggleShoppingItem('${item.id}')">
          <div class="shopping-item-check">${item.checked ? '✓' : ''}</div>
          <div class="shopping-item-name">${item.name}</div>
          <div class="shopping-item-amount">${item.amount}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function toggleShoppingItem(id) {
  const item = (state.shoppingList || []).find(i => i.id === id);
  if (item) { item.checked = !item.checked; save(); renderShoppingList(); }
}

function clearCheckedItems() {
  state.shoppingList = (state.shoppingList || []).filter(i => !i.checked);
  save(); renderShoppingList();
}

function clearShoppingList() {
  if (!confirm('¿Borrar toda la lista de compras?')) return;
  state.shoppingList = [];
  save(); renderShoppingList();
}
