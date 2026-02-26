// =============================================
// AI RECOMMENDATIONS (Claude API)
// =============================================
import { state, save } from './state.js'
import { getCurrentSeason } from './data.js'
import { renderMenu } from './menu.js'

export async function getAIRecommendations() {
  const btn = document.getElementById('ai-rec-btn')
  const result = document.getElementById('ai-rec-result')
  btn.disabled = true
  btn.textContent = '✨ Consultando IA...'
  result.innerHTML = ''

  const season = getCurrentSeason()
  const seasonLabels = { verano: 'verano', otono: 'otoño', invierno: 'invierno', primavera: 'primavera' }
  const recentHistory = state.history.slice(0, 10)
  const existingNames = state.recipes.map(r => r.name).join(', ')

  const prompt = `Sos un asistente de cocina para una familia argentina de 4 personas.
Actualmente es ${seasonLabels[season]} en Buenos Aires.
Las recetas que ya tienen son: ${existingNames}.
Historial reciente de jornadas (${recentHistory.length} registros): ${JSON.stringify(recentHistory.map(h => ({ dia: h.day, fecha: h.date, tareasCompletas: h.doneTasks + '/' + h.totalTasks })))}.

Sugerí 3 recetas nuevas que NO estén ya en su lista, apropiadas para la estación, sin TACC (sin gluten), que sean prácticas para meal prep o rápidas de preparar.
Para cada receta incluí: nombre, emoji, tiempo en minutos, tags (mealprep/rapido/finde/singluten/calor/frio/fresco), ingredientes con cantidades para 4 personas, pasos, y cómo conservarla.
Respondé SOLO con un JSON array con esta estructura exacta, sin texto extra:
[{"name":"...","emoji":"...","time":30,"tags":["mealprep","singluten"],"ingredients":[{"name":"...","amount":"..."}],"steps":["..."],"conservation":"..."}]`

  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.content?.map(c => c.text || '').join('') || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const recipes = JSON.parse(clean)

    result.innerHTML = `
      <div style="background:linear-gradient(135deg,#fdf8e8,#f5edcc);border:1px solid var(--gold);border-radius:16px;padding:20px 24px;margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:14px">✨ Sugerencias de la IA para este ${seasonLabels[season]}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">
          ${recipes.map((r, i) => `
            <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px">
              <div style="font-size:1.8rem;margin-bottom:6px">${r.emoji}</div>
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${r.name}</div>
              <div style="font-size:12px;color:var(--muted);margin-bottom:8px">⏱ ${r.time} min · ${r.ingredients.length} ingredientes</div>
              <button onclick="addAIRecipe(${i})" style="width:100%;padding:8px;border-radius:8px;border:none;background:var(--gold);color:#fff;font-weight:700;font-size:12px;cursor:pointer">+ Agregar al menú</button>
            </div>
          `).join('')}
        </div>
      </div>
    `

    window._aiSuggestions = recipes

  } catch (e) {
    result.innerHTML = `<div style="color:var(--danger);padding:12px;font-size:13px">No se pudo obtener sugerencias. Intentá de nuevo.</div>`
    console.error('AI error:', e)
  }

  btn.disabled = false
  btn.textContent = '✨ Sugerir con IA'
}

export function addAIRecipe(index) {
  const recipe = window._aiSuggestions?.[index]
  if (!recipe) return
  const newRecipe = { id: 'ai' + Date.now() + index, ...recipe }
  state.recipes.push(newRecipe)
  save()
  renderMenu()
  document.getElementById('ai-rec-result').innerHTML = `<div style="color:var(--success);padding:8px 0;font-size:13px;font-weight:700">✓ "${recipe.name}" agregada al menú</div>`
}
