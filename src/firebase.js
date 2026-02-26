import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        'organizacion-del-hogar.firebaseapp.com',
  projectId:         'organizacion-del-hogar',
  storageBucket:     'organizacion-del-hogar.firebasestorage.app',
  messagingSenderId: '32562856639',
  appId:             '1:32562856639:web:b162dd75308378510d7c0a',
}

const app = initializeApp(firebaseConfig)

export const db   = getFirestore(app)
export const auth = getAuth(app)
