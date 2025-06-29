// Service Worker for Templi - Template Explorer

const CACHE_NAME = 'templi-cache-v1';
const RUNTIME_CACHE = 'templi-runtime-v1';

// Resources to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Cache priority levels
const CACHE_LEVELS = {
  CRITICAL: 'critical', // UI components, fonts, core CSS
  HIGH: 'high',         // Template thumbnails, user profile images
  MEDIUM: 'medium',     // Template preview images
  LOW: 'low'            // Full template assets, videos
};

// Install event - precache critical resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Helper function to determine cache level based on URL
function getCacheLevel(url) {
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  
  // Critical assets (UI components, fonts, core CSS)
  if (
    path.includes('/static/css/') ||
    path.includes('/static/js/') ||
    path.includes('/fonts/') ||
    path === '/' ||
    path === '/index.html' ||
    path === '/manifest.json' ||
    path === '/favicon.ico'
  ) {
    return CACHE_LEVELS.CRITICAL;
  }
  
  // High priority (template thumbnails, user profile images)
  if (
    path.includes('/thumbnails/') ||
    path.includes('/profiles/') ||
    path.includes('/icons/')
  ) {
    return CACHE_LEVELS.HIGH;
  }
  
  // Medium priority (template preview images)
  if (
    path.includes('/previews/') ||
    path.includes('/images/')
  ) {
    return CACHE_LEVELS.MEDIUM;
  }
  
  // Low priority (full template assets, videos)
  if (
    path.includes('/templates/') ||
    path.includes('/videos/')
  ) {
    return CACHE_LEVELS.LOW;
  }
  
  // Default to medium priority
  return CACHE_LEVELS.MEDIUM;
}

// Helper function to determine if a request should be cached
function shouldCache(request, url) {
  // Only cache GET requests
  if (request.method !== 'GET') return false;
  
  const urlObj = new URL(url);
  
  // Don't cache API requests except for templates data
  if (urlObj.pathname.includes('/api/')) {
    return urlObj.pathname.includes('/api/templates');
  }
  
  // Don't cache browser extensions or third-party requests
  if (
    urlObj.origin !== location.origin &&
    !urlObj.hostname.includes('cloudfront.net') &&
    !urlObj.hostname.includes('googleapis.com') &&
    !urlObj.hostname.includes('gstatic.com')
  ) {
    return false;
  }
  
  return true;
}

// Fetch event - network first with cache fallback for API, cache first for assets
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin) || 
      event.request.url.includes('cloudfront.net') || 
      event.request.url.includes('googleapis.com')) {
    
    const url = event.request.url;
    const cacheLevel = getCacheLevel(url);
    
    // Don't cache if it shouldn't be cached
    if (!shouldCache(event.request, url)) {
      return;
    }
    
    // For API requests - network first, then cache
    if (url.includes('/api/')) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Clone the response to store in cache
            const responseToCache = response.clone();
            
            // Only cache successful responses
            if (response.status === 200) {
              caches.open(RUNTIME_CACHE)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          })
          .catch(() => {
            // Fallback to cache if network fails
            return caches.match(event.request);
          })
      );
      return;
    }
    
    // For critical and high priority assets - cache first, then network
    if (cacheLevel === CACHE_LEVELS.CRITICAL || cacheLevel === CACHE_LEVELS.HIGH) {
      event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              // Return cached response immediately
              // Fetch from network in the background to update cache
              fetch(event.request)
                .then(response => {
                  if (response.status === 200) {
                    caches.open(RUNTIME_CACHE)
                      .then(cache => {
                        cache.put(event.request, response);
                      });
                  }
                })
                .catch(() => {});
              
              return cachedResponse;
            }
            
            // If not in cache, fetch from network
            return fetch(event.request)
              .then(response => {
                // Clone the response to store in cache
                const responseToCache = response.clone();
                
                if (response.status === 200) {
                  caches.open(RUNTIME_CACHE)
                    .then(cache => {
                      cache.put(event.request, responseToCache);
                    });
                }
                
                return response;
              });
          })
      );
      return;
    }
    
    // For medium and low priority assets - network first with cache fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to store in cache
          const responseToCache = response.clone();
          
          if (response.status === 200) {
            caches.open(RUNTIME_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
  }
});

// Background sync for offline interactions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-interactions') {
    event.waitUntil(syncInteractions());
  }
});

// Helper function to sync pending interactions
async function syncInteractions() {
  try {
    const db = await openDB();
    const pendingInteractions = await db.getAll('pendingInteractions');
    
    if (pendingInteractions.length === 0) return;
    
    // Process each pending interaction
    for (const interaction of pendingInteractions) {
      try {
        const response = await fetch('/api/interactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${interaction.token}`
          },
          body: JSON.stringify(interaction.data)
        });
        
        if (response.ok) {
          // Remove from pending if successful
          await db.delete('pendingInteractions', interaction.id);
        }
      } catch (error) {
        console.error('Failed to sync interaction:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing interactions:', error);
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('templi-offline-db', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingInteractions')) {
        db.createObjectStore('pendingInteractions', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });
}

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_TEMPLATES') {
    // Precache template assets
    const templates = event.data.templates;
    if (!templates || !Array.isArray(templates)) return;
    
    caches.open(RUNTIME_CACHE).then(cache => {
      const urls = templates.flatMap(template => {
        const urls = [];
        if (template.thumbnailUrl) urls.push(template.thumbnailUrl);
        if (template.previewUrl) urls.push(template.previewUrl);
        return urls;
      });
      
      // Cache in batches to avoid overwhelming the browser
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        batches.push(batch);
      }
      
      // Process batches sequentially
      return batches.reduce((promise, batch) => {
        return promise.then(() => {
          return Promise.all(batch.map(url => {
            return fetch(url, { mode: 'no-cors' })
              .then(response => cache.put(url, response))
              .catch(error => console.error('Failed to cache:', url, error));
          }));
        });
      }, Promise.resolve());
    });
  }
});