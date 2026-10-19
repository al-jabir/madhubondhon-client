/* MadhuBondhon service worker — offline shell for the installed PWA.
   Strategy:
   - App shell (navigation): network-first, cached copy as offline fallback.
   - Static assets (hashed /assets/*): cache-first (immutable content).
   - API calls (/api/*): always network, never cached (biodata freshness matters).
   Bump CACHE_VERSION whenever the deployment replaces the app shell. */
const CACHE_VERSION = 'mb-v1';
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const APP_SHELL_NEEDED = ['/', '/manifest.webmanifest', '/icons/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_NEEDED))
      .catch(() => undefined) // a failed precache must not block install
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // cross-origin (fonts CDN etc.) — default
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io')) return; // live data

  // Hashed build assets: cache-first (content-addressed, safe to keep forever).
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response && response.status === 200) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  // Navigations & shell files: network-first with offline fallback.
  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (response && response.status === 200 && (request.mode === 'navigate' || APP_SHELL_NEEDED.includes(url.pathname))) {
          const cache = await caches.open(APP_SHELL_CACHE);
          cache.put(request, response.clone());
        }
        return response;
      })
      .catch(async () => {
        const cache = await caches.open(APP_SHELL_CACHE);
        return (await cache.match(request)) || (await cache.match('/'));
      }),
  );
});
