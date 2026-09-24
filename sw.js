// Guarda la app en el teléfono para que abra aunque no haya señal.
// Si cambiás algún archivo de la app, subí también este número (v3, v4…). Los teléfonos toman la versión nueva
// la segunda vez que abren la app (la primera la descargan por detrás).
const VERSION = 'ptar-v3';
const ARCHIVOS = ['./', './index.html', './panel.html', './config.js', './manifest.webmanifest', './manifest-panel.webmanifest', './marca.svg', './icon-panel-192.png', './icon-panel-512.png', './chart.umd.min.js',
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
  // Abre al instante con la copia guardada en el teléfono y, por detrás, baja la versión nueva
  // para la próxima vez. Si no hay copia, la trae de internet.
  const deRed = fetch(e.request).then((r) => {
    if (r && r.ok) { const copia = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copia)); }
    return r;
  });
  e.waitUntil(deRed.catch(() => {}));
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((guardada) => guardada ||
      deRed.catch(() => caches.match(url.pathname.endsWith('panel.html') ? './panel.html' : './index.html')))
  );
});
