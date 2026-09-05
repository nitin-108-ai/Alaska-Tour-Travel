/**
 * Alaska Tour & Travel — Production Progressive Web App Service Worker
 * 
 * Safety & Security Rules:
 * 1. NEVER caches private or sensitive API data (JWTs, auth, payments, bookings, admin).
 * 2. Caches application shell (HTML, CSS, JS, branding assets, fonts) for repeat visits.
 * 3. Graceful offline fallback page for navigation when disconnected.
 * 4. Cache versioning with automatic cleanup of outdated caches.
 */

const CACHE_VERSION = 'alaska-pwa-v1';
const SHELL_CACHE = `alaska-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `alaska-static-${CACHE_VERSION}`;

// Application shell assets to precache on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './MAIN.html',
  './MAIN.css',
  './config.js',
  './api.js',
  './script.js',
  './pwa.js',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png',
  './tour.html',
  './train.html',
  './bus.html',
  './bookti.html',
  './bookti.css',
  './contact.html',
  './term.html',
  './term.css',
  './offline.html'
];

// Sensitive endpoints that MUST NEVER be cached
function isSensitiveApiRequest(url) {
  const path = url.pathname.toLowerCase();
  return (
    path.startsWith('/api/') ||
    path.includes('/auth/') ||
    path.includes('/admin/') ||
    path.includes('/bookings') ||
    path.includes('/payments') ||
    path.includes('/transfers') ||
    path.includes('/app-download')
  );
}

// 1. Install Event — Pre-cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      // Precache individual items gracefully without failing everything if one CDN asset is slow
      return Promise.allSettled(
        PRECACHE_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('[PWA SW] Precache skipped for:', asset, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event — Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== SHELL_CACHE && key !== STATIC_CACHE) {
            console.log('[PWA SW] Deleting obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event — Safe, role-aware routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests (POST, PUT, PATCH, DELETE must always go to network)
  if (request.method !== 'GET') {
    return;
  }

  // A. Sensitive API Requests — NETWORK ONLY (Never cache sensitive data)
  if (isSensitiveApiRequest(url) || url.origin !== self.location.origin && url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            message: 'You are currently offline. Please connect to the internet to perform booking, payment, or account operations.',
            offline: true
          }),
          {
            status: 503,
            statusText: 'Service Unavailable (Offline)',
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // B. HTML Navigation Requests — Network-First with Cache Fallback and Offline Page
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to branded offline page
          const offlinePage = await caches.match('./offline.html');
          return offlinePage || caches.match('offline.html') || new Response(
            '<h1>Alaska Tour & Travel</h1><p>You are currently offline. Please reconnect to continue.</p>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // C. Static Assets (CSS, JS, Images, Fonts) — Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok && networkResponse.type !== 'opaque') {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails, cachedResponse will be returned
        });

      return cachedResponse || fetchPromise;
    })
  );
});
