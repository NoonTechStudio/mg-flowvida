const CACHE = 'flowvida-v2';

// Only cache truly static public assets on install — never auth-gated pages
const PRECACHE = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Only handle GET from same origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Never cache API calls — always fresh data
  if (url.pathname.startsWith('/api/')) return;

  // Cache-first for _next/static (JS, CSS, fonts — content-hashed, safe forever)
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(request).then(
        (hit) => hit ?? fetch(request).then((res) => {
          caches.open(CACHE).then((c) => c.put(request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // Cache-first for public icons and manifest
  if (
    url.pathname === '/manifest.json' ||
    url.pathname.startsWith('/icon-') ||
    url.pathname === '/apple-touch-icon.png' ||
    url.pathname === '/Logo.png'
  ) {
    e.respondWith(
      caches.match(request).then(
        (hit) => hit ?? fetch(request).then((res) => {
          caches.open(CACHE).then((c) => c.put(request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // Network-first for all pages — always fresh, fall back to cache if offline
  e.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && res.status < 400) {
          caches.open(CACHE).then((c) => c.put(request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
