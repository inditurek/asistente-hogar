// =============================================
// ROLES
// =============================================
import { db } from '../src/firebase.js'
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'

export let currentRole = null
export let founderUid = null
export let currentUserName = null
export let currentUserUid = null

export async function loadOrCreateUserRole(user) {
  const userRef = doc(db, 'users', user.uid)
  currentUserUid = user.uid
  const userDoc = await getDoc(userRef)

  if (userDoc.exists()) {
    currentRole = userDoc.data().role
    currentUserName = userDoc.data().name
    founderUid = await getFounderUid()
    applyRoleToUI()
    return true
  } else {
    showNameRegistration(user, userRef)
    return false
  }
}

async function getFounderUid() {
  const configRef = doc(db, 'hogar', 'config')
  const configDoc = await getDoc(configRef)
  return configDoc.exists() ? configDoc.data().founderId : null
}

function showNameRegistration(user, userRef) {
  document.getElementById('loading-overlay').style.display = 'none'
  const overlay = document.getElementById('name-registration-overlay')
  overlay.style.display = 'flex'

  window._confirmName = async () => {
    const input = document.getElementById('username-input')
    const name = input.value.trim()
    if (!name) { input.focus(); return }

    founderUid = await getFounderUid()
    const isFirst = !founderUid
    currentRole = isFirst ? 'admin' : 'user'
    currentUserName = name

    await setDoc(userRef, {
      role: currentRole,
      name,
      email: user.email || '',
      joinedAt: new Date().toISOString()
    })

    if (isFirst) {
      await setDoc(doc(db, 'hogar', 'config'), { founderId: user.uid })
      founderUid = user.uid
    }

    overlay.style.display = 'none'
    applyRoleToUI()
    window._finishAppInit(user)
  }
}

export function applyRoleToUI() {
  const isAdminUser = currentRole === 'admin'

  // Historial — solo Admin
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdminUser ? '' : 'none'
  })

  // Agregar / editar / eliminar tareas — solo Admin
  document.querySelectorAll('.task-actions').forEach(el => {
    el.style.display = isAdminUser ? '' : 'none'
  })
  document.querySelectorAll('.add-task-row').forEach(el => {
    el.style.display = isAdminUser ? '' : 'none'
  })

  // Resetear día — solo Admin
  document.querySelectorAll('[onclick*="resetDay"]').forEach(el => {
    el.style.display = isAdminUser ? '' : 'none'
  })

  // Agregar / editar / eliminar recetas — solo Admin
  document.querySelectorAll('.recipe-card-actions').forEach(el => {
    el.style.display = isAdminUser ? '' : 'none'
  })
  const addRecipeBtn = document.querySelector('[onclick="openAddRecipeModal()"]')
  if (addRecipeBtn) addRecipeBtn.style.display = isAdminUser ? '' : 'none'

  // Sugerir con IA — solo Admin
  const aiBtn = document.getElementById('ai-rec-btn')
  if (aiBtn) aiBtn.style.display = isAdminUser ? '' : 'none'

  // Badge de rol
  const badge = document.getElementById('role-badge')
  if (badge) {
    badge.textContent = isAdminUser ? '👑 Admin' : '👤 Usuario'
    badge.style.color = isAdminUser ? 'var(--gold)' : 'var(--muted)'
  }
}

export function isAdmin() {
  return currentRole === 'admin'
}

export function isFounder(uid) {
  return uid === founderUid
}

export async function loadUsersForHistory() {
  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }))
}

export async function setUserRole(targetUid, newRole) {
  await setDoc(doc(db, 'users', targetUid), { role: newRole }, { merge: true })
}

export async function deleteUser(targetUid) {
  await deleteDoc(doc(db, 'users', targetUid))
}