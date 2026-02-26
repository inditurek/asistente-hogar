// =============================================
// STATE
// =============================================
import { db } from './firebase-config.js'
import { doc, setDoc } from 'firebase/firestore'
import { currentUser } from './firebase-config.js'
import { DEFAULT_TASKS, PRELOADED_RECIPES } from './data.js'

export let state = {
  tasks: {
    lunes:    DEFAULT_TASKS.lunes.map(t => ({ ...t, done: false, custom: false })),
    miercoles: DEFAULT_TASKS.miercoles.map(t => ({ ...t, done: false, custom: false })),
    viernes:  DEFAULT_TASKS.viernes.map(t => ({ ...t, done: false, custom: false })),
  },
  sessions:     {},
  history:      [],
  recipes:      [...PRELOADED_RECIPES],
  menuChoice:   null,
  notes:        { lunes: [], miercoles: [], viernes: [] },
  weekPlan:     [],
  weekPlanMeta: null,
  shoppingList: [],
  currentFilter: 'todos',
  currentSearch: '',
  // UI state — actualizado por showView()
  currentView: 'lunes',
}

export let clockIntervals = {}
let saveTimeout = null

// =============================================
// FIREBASE HELPERS
// =============================================

export function sharedDoc(docName) {
  return doc(db, 'hogar', docName)
}

export async function saveToFirebase() {
  if (!currentUser) return
  try {
    const preloadedIds = new Set(PRELOADED_RECIPES.map(r => r.id))
    const customRecipes = state.recipes.filter(r => !preloadedIds.has(r.id))

    await setDoc(sharedDoc('tasks'),        state.tasks)
    await setDoc(sharedDoc('sessions'),     state.sessions || {})
    await setDoc(sharedDoc('history'),      { entries: state.history || [] })
    await setDoc(sharedDoc('customRecipes'),{ recipes: customRecipes })
    await setDoc(sharedDoc('menuChoice'),   state.menuChoice || {})
    await setDoc(sharedDoc('notes'),        state.notes || { lunes: [], miercoles: [], viernes: [] })
    await setDoc(sharedDoc('weekPlan'), {
      recipes:   state.weekPlan || [],
      updatedBy: currentUser.displayName || 'Alguien',
      updatedAt: new Date().toISOString(),
    })
    await setDoc(sharedDoc('shoppingList'), { items: state.shoppingList || [] })
  } catch (e) {
    console.error('Error guardando:', e)
  }
}

export function save() {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => saveToFirebase(), 800)
}

// =============================================
// FIREBASE MERGE
// =============================================

export function mergeTasksFromFirestore(saved) {
  ;['lunes', 'miercoles', 'viernes'].forEach(day => {
    if (saved[day] && Array.isArray(saved[day]) && saved[day].length > 0) {
      const defaultIds = new Set(DEFAULT_TASKS[day].map(t => t.id))
      const savedMap = {}
      saved[day].forEach(t => { savedMap[t.id] = t })
      const merged = DEFAULT_TASKS[day].map(t => ({
        ...t,
        done:   savedMap[t.id]?.done || false,
        custom: false,
      }))
      saved[day].filter(t => !defaultIds.has(t.id)).forEach(t => merged.push(t))
      state.tasks[day] = merged
    }
  })
}
