// =============================================
// FIREBASE CONFIG
// =============================================
import { auth, db } from '../src/firebase.js'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc } from 'firebase/firestore'
import { loadOrCreateUserRole } from './roles.js'

export { auth, db }
export { loadOrCreateUserRole }

export const unsubscribeSnapshots = []
export let currentUser = null

export function sharedDoc(docName) {
  return doc(db, 'hogar', docName)
}

export function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  signInWithPopup(auth, provider).catch(e => {
    console.error('Error al iniciar sesión:', e)
    alert('No se pudo iniciar sesión. Intentá de nuevo.')
  })
}

export function signOut() {
  unsubscribeSnapshots.forEach(fn => fn())
  unsubscribeSnapshots.length = 0
  firebaseSignOut(auth)
}