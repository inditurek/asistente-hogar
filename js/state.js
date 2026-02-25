// =============================================
// STATE
// =============================================

let state = {
  tasks: {
    lunes: DEFAULT_TASKS.lunes.map(t => ({...t, done: false, custom: false})),
    miercoles: DEFAULT_TASKS.miercoles.map(t => ({...t, done: false, custom: false})),
    viernes: DEFAULT_TASKS.viernes.map(t => ({...t, done: false, custom: false})),
  },
  sessions: {},
  history: [],
  recipes: PRELOADED_RECIPES,
  menuChoice: null,
  notes: { lunes: [], miercoles: [], viernes: [] },
  weekPlan: [],
  shoppingList: [],
  currentFilter: 'todos',
  currentSearch: '',
};

let clockIntervals = {};
let currentView = 'lunes';
let saveTimeout = null;

// =============================================
// FIREBASE SAVE
// =============================================

function sharedDoc(docName) {
  return db.collection('hogar').doc(docName);
}

async function saveToFirebase() {
  if (!currentUser) return;
  try {
    await sharedDoc('tasks').set(state.tasks);
    await sharedDoc('sessions').set(state.sessions || {});
    await sharedDoc('history').set({ entries: state.history || [] });
    const preloadedIds = new Set(PRELOADED_RECIPES.map(r => r.id));
    const customRecipes = state.recipes.filter(r => !preloadedIds.has(r.id));
    await sharedDoc('customRecipes').set({ recipes: customRecipes });
    await sharedDoc('menuChoice').set(state.menuChoice || {});
    await sharedDoc('notes').set(state.notes || { lunes: [], miercoles: [], viernes: [] });
    await sharedDoc('weekPlan').set({ recipes: state.weekPlan || [], updatedBy: currentUser.displayName || 'Alguien', updatedAt: new Date().toISOString() });
    await sharedDoc('shoppingList').set({ items: state.shoppingList || [] });
  } catch(e) {
    console.error('Error guardando:', e);
  }
}

function save() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveToFirebase(), 800);
}

// =============================================
// FIREBASE REALTIME LISTENERS
// =============================================

function mergeTasksFromFirestore(saved) {
  ['lunes', 'miercoles', 'viernes'].forEach(day => {
    if (saved[day] && Array.isArray(saved[day]) && saved[day].length > 0) {
      const defaultIds = new Set(DEFAULT_TASKS[day].map(t => t.id));
      const savedMap = {};
      saved[day].forEach(t => savedMap[t.id] = t);
      const merged = DEFAULT_TASKS[day].map(t => ({
        ...t,
        done: savedMap[t.id]?.done || false,
        custom: false
      }));
      saved[day].filter(t => !defaultIds.has(t.id)).forEach(t => merged.push(t));
      state.tasks[day] = merged;
    }
  });
}

function setupRealtimeListeners() {
  unsubscribeSnapshots.forEach(fn => fn());
  unsubscribeSnapshots = [];

  const unsubTasks = sharedDoc('tasks').onSnapshot(snap => {
    if (snap.exists) mergeTasksFromFirestore(snap.data());
    else saveToFirebase();
    ['lunes', 'miercoles', 'viernes'].forEach(day => renderTasks(day));
    ['lunes', 'miercoles', 'viernes'].forEach(day => checkNotification(day));
  }, e => console.error('tasks snapshot error:', e));
  unsubscribeSnapshots.push(unsubTasks);

  const unsubSess = sharedDoc('sessions').onSnapshot(snap => {
    if (snap.exists) {
      const remoteSessions = snap.data();
      ['lunes', 'miercoles', 'viernes'].forEach(day => {
        if (!clockIntervals[day]) state.sessions[day] = remoteSessions[day] || null;
      });
      ['lunes', 'miercoles', 'viernes'].forEach(day => {
        if (state.sessions[day] && state.sessions[day].running && !clockIntervals[day]) {
          document.getElementById('start-btn-' + day).style.display = 'none';
          document.getElementById('clock-' + day).style.display = 'grid';
          tickClock(day);
          clockIntervals[day] = setInterval(() => tickClock(day), 1000);
        }
      });
    }
  }, e => console.error('sessions error:', e));
  unsubscribeSnapshots.push(unsubSess);

  const unsubHist = sharedDoc('history').onSnapshot(snap => {
    if (snap.exists) state.history = snap.data().entries || [];
    if (currentView === 'historial') renderHistory();
  }, e => console.error('history error:', e));
  unsubscribeSnapshots.push(unsubHist);

  const unsubRecipes = sharedDoc('customRecipes').onSnapshot(snap => {
    if (snap.exists) {
      const custom = snap.data().recipes || [];
      state.recipes = [...PRELOADED_RECIPES, ...custom];
    }
    if (currentView === 'menu') renderMenu();
  }, e => console.error('recipes error:', e));
  unsubscribeSnapshots.push(unsubRecipes);

  const unsubMenu = sharedDoc('menuChoice').onSnapshot(snap => {
    if (snap.exists && snap.data().day) state.menuChoice = snap.data();
    ['lunes', 'miercoles', 'viernes'].forEach(day => checkNotification(day));
  }, e => console.error('menuChoice error:', e));
  unsubscribeSnapshots.push(unsubMenu);

  const unsubNotes = sharedDoc('notes').onSnapshot(snap => {
    if (snap.exists) state.notes = snap.data();
    ['lunes', 'miercoles', 'viernes'].forEach(day => renderNotes(day));
  }, e => console.error('notes error:', e));
  unsubscribeSnapshots.push(unsubNotes);

  const unsubPlan = sharedDoc('weekPlan').onSnapshot(snap => {
    if (snap.exists) {
      state.weekPlan = snap.data().recipes || [];
      state.weekPlanMeta = { updatedBy: snap.data().updatedBy, updatedAt: snap.data().updatedAt };
    }
    if (currentView === 'plan') renderPlan();
  }, e => console.error('weekPlan error:', e));
  unsubscribeSnapshots.push(unsubPlan);

  const unsubShopping = sharedDoc('shoppingList').onSnapshot(snap => {
    if (snap.exists) state.shoppingList = snap.data().items || [];
    if (currentView === 'compras') renderShoppingList();
  }, e => console.error('shoppingList error:', e));
  unsubscribeSnapshots.push(unsubShopping);
}
