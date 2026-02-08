const CACHE_NAME = 'meal-planner-v1';
const urlsToCache = [
  '/',
  '/recipes',
  '/calendar',
  '/shopping-list',
  '/ai-generator',
  '/login',
  '/register',
  '/manifest.json',
  '/icon.svg',
  '/_next/static/css/',
  '/_next/static/js/'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external API requests
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response since it can only be consumed once
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-meal-plan') {
    event.waitUntil(syncMealPlan());
  }
});

async function syncMealPlan() {
  // Get pending actions from IndexedDB
  const pendingActions = await getPendingActions();
  
  for (const action of pendingActions) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(action),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Remove synced action from IndexedDB
      await removePendingAction(action.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// IndexedDB helpers for offline storage
function getPendingActions() {
  return new Promise((resolve) => {
    const request = indexedDB.open('MealPlannerOffline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingActions'], 'readonly');
      const store = transaction.objectStore('pendingActions');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
    };
  });
}

function removePendingAction(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('MealPlannerOffline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      store.delete(id);
      
      transaction.oncomplete = () => resolve();
    };
  });
}
