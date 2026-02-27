// =============================================
// ENTRY POINT (Vite)
// Importa todos los módulos y expone las funciones
// como window.* para los onclick inline del HTML.
// =============================================
import { auth } from './firebase.js'
import { onAuthStateChanged } from 'firebase/auth'
import {
  signInWithGoogle,
  signOut as doSignOut,
  loadOrCreateUserRole,
} from '../js/firebase-config.js'
import { setupRealtimeListeners } from './store/listeners.js'
import { showView, chooseMenuOption, addMenuToTasks } from '../js/navigation.js'
import {
  toggleTask, addTask, editTask, saveEditTask, deleteTask,
  resetDay, startSession, endSession,
} from '../js/tasks.js'
import {
  setFilter, filterRecipes, openRecipe, closeRecipeDetail,
  openAddRecipeModal, closeAddRecipeModal, openEditRecipeModal,
  deleteRecipe, saveNewRecipe,
} from '../js/menu.js'
import { addNote } from '../js/notes.js'
import { getAIRecommendations, addAIRecipe } from '../js/app.js'
import {
  toggleShoppingItem, clearCheckedItems, clearShoppingList, generateShoppingList,
} from '../js/shopping.js'
import {
  filterPlanPicker, pickRecipeForSlot, selectRecipeForSlot,
  removePlanSlot, savePlan,
} from '../js/week-plan.js'
import { clearHistory } from '../js/history.js'
import { renderUsersPanel } from '../js/history.js'
import * as Roles from '../js/roles.js'
window.Roles = Roles

// =============================================
// GLOBALS para onclick inline del HTML
// =============================================
window.signInWithGoogle     = signInWithGoogle
window.signOut              = doSignOut
window.showView             = showView
window.chooseMenuOption     = chooseMenuOption
window.addMenuToTasks       = addMenuToTasks

window.toggleTask           = toggleTask
window.addTask              = addTask
window.editTask             = editTask
window.saveEditTask         = saveEditTask
window.deleteTask           = deleteTask
window.resetDay             = resetDay
window.startSession         = startSession
window.endSession           = endSession

window.addNote              = addNote

window.getAIRecommendations = getAIRecommendations
window.addAIRecipe          = addAIRecipe

window.setFilter            = setFilter
window.filterRecipes        = filterRecipes
window.openRecipe           = openRecipe
window.closeRecipeDetail    = closeRecipeDetail
window.openAddRecipeModal   = openAddRecipeModal
window.closeAddRecipeModal  = closeAddRecipeModal
window.openEditRecipeModal  = openEditRecipeModal
window.deleteRecipe         = deleteRecipe
window.saveNewRecipe        = saveNewRecipe

window.toggleShoppingItem   = toggleShoppingItem
window.clearCheckedItems    = clearCheckedItems
window.clearShoppingList    = clearShoppingList
window.generateShoppingList = generateShoppingList

window.filterPlanPicker     = filterPlanPicker
window.pickRecipeForSlot    = pickRecipeForSlot
window.selectRecipeForSlot  = selectRecipeForSlot
window.removePlanSlot       = removePlanSlot
window.savePlan             = savePlan

window.clearHistory         = clearHistory
window.applyRoleToUI = Roles.applyRoleToUI
window.renderUsersPanel = renderUsersPanel

// =============================================
// AUTH FLOW
// =============================================

function showAuthOverlay() {
  document.getElementById('loading-overlay').style.display = 'none'
  document.getElementById('auth-overlay').style.display   = 'flex'
}

async function finishAppInit(user) {
  document.getElementById('auth-overlay').style.display    = 'none'
  document.getElementById('loading-overlay').style.display = 'flex'
  document.getElementById('loading-msg').textContent       = 'Cargando datos...'

  setupRealtimeListeners()

  const userName = Roles.currentUserName || user?.displayName?.split(' ')[0] || ''
  const nameEl = document.getElementById('user-name')
  if (nameEl) nameEl.textContent = userName
  Roles.applyRoleToUI()
  renderUsersPanel()

  document.getElementById('loading-overlay').style.display = 'none'
  showView('lunes')
}
// Usado por firebase-config.js → showRoleSelection → window._confirmRole
window._finishAppInit = finishAppInit

onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById('loading-msg').textContent = 'Verificando usuario...'
    const ready = await loadOrCreateUserRole(user)
    if (ready) await finishAppInit(user)
    // Si ready === false, el overlay de selección de rol se encarga del flujo
  } else {
    showAuthOverlay()
  }
window.getCurrentRole = () => currentRole
window.applyRoleToUI = applyRoleToUI
})

// Service Worker: registrado automáticamente por vite-plugin-pwa
