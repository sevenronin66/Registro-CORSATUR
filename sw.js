// Guarda la app en el teléfono para que abra aunque no haya señal.
// Si cambiás algún archivo de la app, subí también este número (v2, v3…) para que los teléfonos se actualicen.
const VERSION = 'ptar-v1';
const ARCHIVOS = ['./', './index.html', './config.js', './manifest.webmanifest', './marca.svg',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // los datos van directo a Google
  // Primero intenta traer la versión nueva; si no hay señal, usa la guardada.
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r && r.ok) { const copia = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copia)); }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
  );
});
