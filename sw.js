const CACHE_NAME = 'asistente-hogar-v1';
const ASSETS = ['/', '/index.html', '/css/styles.css', '/js/data.js', '/js/firebase-config.js', '/js/state.js', '/js/navigation.js', '/js/tasks.js', '/js/menu.js', '/js/history.js', '/js/notes.js', '/js/week-plan.js', '/js/shopping.js', '/js/app.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
