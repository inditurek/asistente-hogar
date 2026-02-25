// =============================================
// FIREBASE CONFIG
// =============================================

const firebaseConfig = {
  apiKey: "CLAVE_ELIMINADA",
  authDomain: "organizacion-del-hogar.firebaseapp.com",
  projectId: "organizacion-del-hogar",
  storageBucket: "organizacion-del-hogar.firebasestorage.app",
  messagingSenderId: "32562856639",
  appId: "1:32562856639:web:b162dd75308378510d7c0a"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
let currentUser = null;
let unsubscribeSnapshots = [];

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(e => {
    console.error('Error al iniciar sesión:', e);
    alert('No se pudo iniciar sesión. Intentá de nuevo.');
  });
}

function signOut() {
  unsubscribeSnapshots.forEach(fn => fn());
  unsubscribeSnapshots = [];
  auth.signOut();
}
