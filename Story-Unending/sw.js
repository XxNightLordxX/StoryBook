// Service Worker for Story-Unending
// Provides offline support with network-first caching strategy

const CACHE_NAME = 'story-unending-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/story-engine.js',
  '/backstory-engine.js',
  '/js/utils/security.js',
  '/js/utils/storage.js',
  '/js/utils/formatters.js',
  '/js/utils/ui-helpers.js',
  '/js/modules/app-state.js',
  '/js/modules/auth.js',
  '/js/modules/navigation.js',
  '/js/modules/admin.js',
  '/js/modules/generation.js',
  '/js/modules/initialization.js',
  '/js/modules/story-timeline.js',
  '/js/modules/misc.js',
  '/js/ui/dropdown.js',
  '/js/ui/modals.js',
  '/js/ui/notifications.js',
  '/js/ui/sidebar.js',
  '/js/ui/text-size.js',
  '/js/ui/stats.js'
];

// Install event - cache assets for offline use
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('SW: Some assets failed to cache:', err);
        });
      })
  );
});

// Fetch event - NETWORK FIRST, fall back to cache for offline support
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Got a valid network response - update the cache and return it
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Network failed - try to serve from cache (offline support)
        return caches.match(event.request);
      })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Claim all clients immediately
      self.clients.claim(),
      // Delete old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});