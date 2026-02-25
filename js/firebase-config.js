// =============================================
// FIREBASE CONFIG
// =============================================

const firebaseConfig = {
  apiKey: "AIzaSyD1sHFKsLq4VKlNU6aDFhBRIx35lB2_p2Y",
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
let currentRole = null; // 'admin' o 'user'
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
  currentRole = null;
  auth.signOut();
}

async function loadOrCreateUserRole(user) {
  const userRef = db.collection('users').doc(user.uid);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    // Usuario ya registrado — cargar su rol
    currentRole = userDoc.data().role;
  } else {
    // Usuario nuevo — ver si ya existe algún Admin
    const configDoc = await db.collection('hogar').doc('config').get();
    if (!configDoc.exists || !configDoc.data().founderId) {
      // Primer usuario → Admin automático
      currentRole = 'admin';
      await userRef.set({
        role: 'admin',
        name: user.displayName || '',
        email: user.email || '',
        joinedAt: new Date().toISOString()
      });
      await db.collection('hogar').doc('config').set({ founderId: user.uid });
    } else {
      // Usuario nuevo pero ya hay un Admin → mostrar pantalla de selección de rol
      currentRole = null;
      showRoleSelection(user, userRef);
      return false; // indica que hay que esperar selección
    }
  }
  applyRoleToUI();
  return true;
}

function showRoleSelection(user, userRef) {
  document.getElementById('loading-overlay').style.display = 'none';
  const overlay = document.getElementById('role-selection-overlay');
  overlay.style.display = 'flex';

  window._confirmRole = async (role) => {
    currentRole = role;
    await userRef.set({
      role,
      name: user.displayName || '',
      email: user.email || '',
      joinedAt: new Date().toISOString()
    });
    overlay.style.display = 'none';
    applyRoleToUI();
    finishAppInit(user);
  };
}

function applyRoleToUI() {
  const isAdmin = currentRole === 'admin';
  // Mostrar/ocultar historial según rol
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });
  // Badge de rol en el nav
  const badge = document.getElementById('role-badge');
  if (badge) {
    badge.textContent = isAdmin ? '👑 Admin' : '👤 Usuario';
    badge.style.color = isAdmin ? 'var(--gold)' : 'var(--muted)';
  }
}

function isAdmin() {
  return currentRole === 'admin';
}