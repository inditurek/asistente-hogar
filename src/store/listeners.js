// =============================================
// FIRESTORE REALTIME LISTENERS
// Extraído de state.js para romper dependencias circulares.
// =============================================
import { onSnapshot } from 'firebase/firestore'
import { unsubscribeSnapshots } from '../../js/firebase-config.js'
import { state, sharedDoc, saveToFirebase, mergeTasksFromFirestore, clockIntervals } from '../../js/state.js'
import { PRELOADED_RECIPES } from '../../js/data.js'

// Importados para ser llamados cuando Firestore notifica cambios
import { renderTasks, tickClock, renderSessionBanner } from '../../js/tasks.js'
import { checkNotification } from '../../js/navigation.js'
import { renderHistory } from '../../js/history.js'
import { renderMenu } from '../../js/menu.js'
import { renderNotes } from '../../js/notes.js'
import { renderPlan } from '../../js/week-plan.js'
import { renderShoppingList } from '../../js/shopping.js'

export function setupRealtimeListeners() {
  unsubscribeSnapshots.forEach(fn => fn())
  unsubscribeSnapshots.length = 0

  const days = ['lunes', 'miercoles', 'viernes']

  const unsubTasks = onSnapshot(sharedDoc('tasks'), snap => {
    if (snap.exists()) mergeTasksFromFirestore(snap.data())
    else saveToFirebase()
    days.forEach(day => renderTasks(day))
    days.forEach(day => checkNotification(day))
  }, e => console.error('tasks snapshot error:', e))
  unsubscribeSnapshots.push(unsubTasks)

  const unsubSess = onSnapshot(sharedDoc('sessions'), snap => {
    if (snap.exists()) {
      const remoteSessions = snap.data()
      days.forEach(day => {
        if (!clockIntervals[day]) state.sessions[day] = remoteSessions[day] || null
      })
      days.forEach(day => {
        const s = state.sessions[day]
        if (s && s.running && !clockIntervals[day]) {
          document.getElementById('start-btn-' + day).style.display = 'none'
          document.getElementById('clock-' + day).style.display = 'grid'
          tickClock(day)
          clockIntervals[day] = setInterval(() => tickClock(day), 1000)
        }
      })
      renderSessionBanner(remoteSessions)
    } else {
      renderSessionBanner({})
    }
  }, e => console.error('sessions error:', e))
  unsubscribeSnapshots.push(unsubSess)

  const unsubHist = onSnapshot(sharedDoc('history'), snap => {
    if (snap.exists()) state.history = snap.data().entries || []
    if (state.currentView === 'historial') renderHistory()
  }, e => console.error('history error:', e))
  unsubscribeSnapshots.push(unsubHist)

  const unsubRecipes = onSnapshot(sharedDoc('customRecipes'), snap => {
    if (snap.exists()) {
      const custom = snap.data().recipes || []
      state.recipes = [...PRELOADED_RECIPES, ...custom]
    }
    if (state.currentView === 'menu') renderMenu()
  }, e => console.error('recipes error:', e))
  unsubscribeSnapshots.push(unsubRecipes)

  const unsubMenu = onSnapshot(sharedDoc('menuChoice'), snap => {
    if (snap.exists() && snap.data().day) state.menuChoice = snap.data()
    days.forEach(day => checkNotification(day))
  }, e => console.error('menuChoice error:', e))
  unsubscribeSnapshots.push(unsubMenu)

  const unsubNotes = onSnapshot(sharedDoc('notes'), snap => {
    if (snap.exists()) state.notes = snap.data()
    days.forEach(day => renderNotes(day))
  }, e => console.error('notes error:', e))
  unsubscribeSnapshots.push(unsubNotes)

  const unsubPlan = onSnapshot(sharedDoc('weekPlan'), snap => {
    if (snap.exists()) {
      state.weekPlan = snap.data().recipes || []
      state.weekPlanMeta = {
        updatedBy: snap.data().updatedBy,
        updatedAt: snap.data().updatedAt,
      }
    }
    if (state.currentView === 'plan') renderPlan()
  }, e => console.error('weekPlan error:', e))
  unsubscribeSnapshots.push(unsubPlan)

  const unsubShopping = onSnapshot(sharedDoc('shoppingList'), snap => {
    if (snap.exists()) state.shoppingList = snap.data().items || []
    if (state.currentView === 'compras') renderShoppingList()
  }, e => console.error('shoppingList error:', e))
  unsubscribeSnapshots.push(unsubShopping)
}
