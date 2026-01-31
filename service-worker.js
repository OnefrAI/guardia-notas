// ============================================
// NOTAS GUARD-IA - SERVICE WORKER
// Versión: 3.0 - Con auto-actualización
// ============================================

const CACHE_NAME = 'guardia-notas-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalar el Service Worker y cachear archivos
self.addEventListener('install', event => {
  console.log('SW: Instalando nueva versión...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Cacheando archivos');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', event => {
  console.log('SW: Activando...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW: Tomando control de clientes');
      return self.clients.claim();
    })
  );
});

// Estrategia: Network First, luego caché
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, actualizamos la caché
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, usamos la caché
        return caches.match(event.request);
      })
  );
});

// Escuchar mensajes de la app
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    console.log('SW: Recibido skipWaiting, activando...');
    self.skipWaiting();
  }
});