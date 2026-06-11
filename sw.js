const CACHE = 'salin-lahi-v1';

const LOCAL_ASSETS = [
  './',
  './index.html',
  './data.json',
  './manifest.json',
  './3-krus.jpg',
  './aeta1.JPG',
  './aeta2.JPG',
  './aeta3.jpg',
  './barretto.jpg',
  './kalaklan-lighthouse.jpg',
  './kalapati.jpg',
  './marikit.jpg',
  './qr-code.png',
  './triangle.jpg',
  './ulo-ng-apo.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(LOCAL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;
  const isCDN = url.hostname.includes('cdn.tailwindcss.com') ||
                url.hostname.includes('fonts.googleapis.com') ||
                url.hostname.includes('fonts.gstatic.com');

  if (isLocal || isCDN) {
    // Cache-first for local assets and CDN fonts/scripts
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  } else {
    // Network-first for external images (Wikipedia, etc.)
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
