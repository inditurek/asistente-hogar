// =============================================
// FIREBASE AUTH + ROLES
// =============================================
import { auth, db } from '../src/firebase.js'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export { auth, db }

export let currentUser = null
export let currentRole = null  // 'admin' | 'user'
export let unsubscribeSnapshots = []

export function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  signInWithPopup(auth, provider).catch(e => {
    console.error('Error al iniciar sesión:', e)
    alert('No se pudo iniciar sesión. Intentá de nuevo.')
  })
}

export function signOut() {
  unsubscribeSnapshots.forEach(fn => fn())
  unsubscribeSnapshots = []
  currentRole = null
  fbSignOut(auth)
}

export async function loadOrCreateUserRole(user) {
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    currentRole = userSnap.data().role
  } else {
    const configSnap = await getDoc(doc(db, 'hogar', 'config'))
    if (!configSnap.exists() || !configSnap.data().founderId) {
      // Primer usuario → Admin automático
      currentRole = 'admin'
      await setDoc(userRef, {
        role: 'admin',
        name: user.displayName || '',
        email: user.email || '',
        joinedAt: new Date().toISOString(),
      })
      await setDoc(doc(db, 'hogar', 'config'), { founderId: user.uid })
    } else {
      // Usuario nuevo pero ya hay Admin → selección de rol
      currentRole = null
      showRoleSelection(user, userRef)
      return false
    }
  }
  applyRoleToUI()
  return true
}

export function showRoleSelection(user, userRef) {
  document.getElementById('loading-overlay').style.display = 'none'
  const overlay = document.getElementById('role-selection-overlay')
  overlay.style.display = 'flex'

  window._confirmRole = async (role) => {
    currentRole = role
    await setDoc(userRef, {
      role,
      name: user.displayName || '',
      email: user.email || '',
      joinedAt: new Date().toISOString(),
    })
    overlay.style.display = 'none'
    applyRoleToUI()
    window._finishAppInit?.(user)
  }
}

export function applyRoleToUI() {
  const isAdminUser = currentRole === 'admin'
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdminUser ? '' : 'none'
  })
  const badge = document.getElementById('role-badge')
  if (badge) {
    badge.textContent = isAdminUser ? '👑 Admin' : '👤 Usuario'
    badge.style.color = isAdminUser ? 'var(--gold)' : 'var(--muted)'
  }
}

export function isAdmin() {
  return currentRole === 'admin'
}

export { onAuthStateChanged }
