# Story 4.3: Offline Support

## User Story
Como usuário, eu quero poder acessar e interagir com o aplicativo mesmo quando estou sem conexão com a internet para poder visualizar restaurantes e avaliar em qualquer lugar, sincronizando meus dados quando a conexão for restabelecida.

## Acceptance Criteria
- [ ] Aplicativo deve carregar sem conexão com a internet
- [ ] Restaurantes devem ser visualizáveis offline
- [ ] Avaliações podem ser enviadas offline e sincronizadas depois
- [ ] Interface deve mostrar estado offline/online claramente
- [ ] Dados devem persistir entre sessões offline
- [ ] Sincronização deve acontecer automaticamente quando online
- [ ] Conflitos de sincronização devem ser resolvidos corretamente
- [ ] Usuário deve ser informado sobre status de sincronização

## Technical Implementation

### Service Worker Setup
```javascript
// public/sw.js
const CACHE_NAME = 'esplanada-eats-v2';
const STATIC_CACHE = 'static-v2';
const DATA_CACHE = 'data-v2';
const OFFLINE_URL = '/offline.html';

// Files to cache on install
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles/main.css',
  '/styles/mobile.css',
  '/js/app.js',
  '/js/firebase-config.js',
  '/images/logo.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle different types of requests
  if (event.request.method === 'GET') {
    // Handle static files
    if (isStaticRequest(event.request)) {
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request);
        })
      );
      return;
    }

    // Handle Firebase requests
    if (isFirebaseRequest(event.request)) {
      event.respondWith(handleFirebaseRequest(event.request));
      return;
    }

    // Handle other GET requests
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DATA_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache or offline page
          return caches.match(event.request).then((response) => {
            return response || caches.match(OFFLINE_URL);
          });
        })
    );
  }

  // Handle POST requests (for ratings)
  if (event.request.method === 'POST' && isRatingRequest(event.request)) {
    event.respondWith(handleOfflinePost(event.request));
  }
});

// Handle Firebase requests with offline support
async function handleFirebaseRequest(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // For Firebase queries, return empty data
    if (request.url.includes('firestore.googleapis.com')) {
      return new Response(JSON.stringify({ documents: [] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    throw error;
  }
}

// Handle offline POST requests
async function handleOfflinePost(request) {
  if (!navigator.onLine) {
    // Store request for later sync
    const requestData = await request.json();
    await storeOfflineRequest({
      url: request.url,
      method: request.method,
      data: requestData,
      timestamp: Date.now()
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Dados armazenados para sincronização posterior'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 202 // Accepted
    });
  }

  return fetch(request);
}

// Store offline requests in IndexedDB
async function storeOfflineRequest(requestData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineRequests', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['requests'], 'readwrite');
      const store = transaction.objectStore('requests');
      store.add(requestData);
      resolve();
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Sync offline requests when online
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Syncing offline requests...');
  event.waitUntil(syncOfflineRequests());
});

async function syncOfflineRequests() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineRequests', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['requests'], 'readwrite');
      const store = transaction.objectStore('requests');
      const getAll = store.getAll();

      getAll.onsuccess = async () => {
        const requests = getAll.result;

        for (const offlineRequest of requests) {
          try {
            const response = await fetch(offlineRequest.url, {
              method: offlineRequest.method,
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(offlineRequest.data)
            });

            if (response.ok) {
              // Remove synced request
              store.delete(offlineRequest.id);

              // Notify client of successful sync
              notifyClient('sync-success', {
                requestId: offlineRequest.id,
                data: offlineRequest.data
              });
            }
          } catch (error) {
            console.error('Failed to sync request:', error);
          }
        }

        resolve();
      };

      getAll.onerror = () => reject(getAll.error);
    };
  });
}

// Notify clients of sync events
function notifyClient(type, data) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: type,
        data: data
      });
    });
  });
}

// Helper functions
function isStaticRequest(request) {
  return STATIC_FILES.some(file => request.url.includes(file)) ||
         request.url.endsWith('.css') ||
         request.url.endsWith('.js') ||
         request.url.endsWith('.png') ||
         request.url.endsWith('.jpg') ||
         request.url.endsWith('.jpeg') ||
         request.url.endsWith('.svg');
}

function isFirebaseRequest(request) {
  return request.url.includes('firestore.googleapis.com') ||
         request.url.includes('firebaseio.com') ||
         request.url.includes('googleapis.com');
}

function isRatingRequest(request) {
  return request.url.includes('ratings') ||
         request.url.includes('submit-rating');
}
```

### Offline Support Manager
```javascript
// services/OfflineManager.js
class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.db = null;
    this.listeners = new Map();

    this.init();
  }

  async init() {
    // Initialize IndexedDB
    await this.initDatabase();

    // Setup online/offline listeners
    this.setupConnectivityListeners();

    // Register service worker
    await this.registerServiceWorker();

    // Load offline data
    await this.loadOfflineData();

    // Register for background sync
    await this.registerBackgroundSync();
  }

  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EsplanadaEatsDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;

        // Restaurants store
        if (!db.objectStoreNames.contains('restaurants')) {
          const restaurantStore = db.createObjectStore('restaurants', { keyPath: 'id' });
          restaurantStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Ratings store
        if (!db.objectStoreNames.contains('ratings')) {
          const ratingStore = db.createObjectStore('ratings', { keyPath: 'id' });
          ratingStore.createIndex('restaurantId', 'restaurantId', { unique: false });
          ratingStore.createIndex('userId', 'userId', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  setupConnectivityListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('offline');
    });
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event);
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-offline-data');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  // Cache restaurants for offline use
  async cacheRestaurants(restaurants) {
    const transaction = this.db.transaction(['restaurants'], 'readwrite');
    const store = transaction.objectStore('restaurants');

    for (const restaurant of restaurants) {
      await store.put(restaurant);
    }
  }

  // Get cached restaurants
  async getCachedRestaurants() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['restaurants'], 'readonly');
      const store = transaction.objectStore('restaurants');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Queue rating for offline sync
  async queueOfflineRating(ratingData) {
    const offlineRating = {
      ...ratingData,
      id: this.generateOfflineId(),
      offline: true,
      createdAt: new Date().toISOString(),
      synced: false
    };

    // Store in IndexedDB
    const transaction = this.db.transaction(['ratings'], 'readwrite');
    const store = transaction.objectStore('ratings');
    await store.add(offlineRating);

    // Add to sync queue
    await this.addToSyncQueue({
      type: 'rating',
      data: ratingData,
      timestamp: Date.now()
    });

    return offlineRating;
  }

  // Add item to sync queue
  async addToSyncQueue(item) {
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    await store.add(item);
  }

  // Sync offline data
  async syncOfflineData() {
    if (!this.isOnline) return;

    console.log('Syncing offline data...');

    // Get items from sync queue
    const syncItems = await this.getSyncQueueItems();

    for (const item of syncItems) {
      try {
        await this.syncItem(item);
        await this.removeFromSyncQueue(item.id);
      } catch (error) {
        console.error('Failed to sync item:', item, error);
      }
    }
  }

  // Sync individual item
  async syncItem(item) {
    switch (item.type) {
      case 'rating':
        return await this.syncRating(item.data);
      default:
        console.warn('Unknown sync item type:', item.type);
    }
  }

  // Sync rating with Firebase
  async syncRating(ratingData) {
    const response = await fetch('/api/ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ratingData)
    });

    if (!response.ok) {
      throw new Error('Failed to sync rating');
    }

    const result = await response.json();

    // Update local data with server response
    await this.updateLocalRating(ratingData, result);

    return result;
  }

  // Update local rating after sync
  async updateLocalRating(localData, serverData) {
    const transaction = this.db.transaction(['ratings'], 'readwrite');
    const store = transaction.objectStore('ratings');

    // Find and update the local rating
    const request = store.index('userId').openCursor(localData.userId);

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        const rating = cursor.value;
        if (rating.offline && rating.restaurantId === localData.restaurantId) {
          // Update with server data
          const updatedRating = {
            ...rating,
            ...serverData,
            offline: false,
            synced: true
          };
          cursor.update(updatedRating);
        }
        cursor.continue();
      }
    };
  }

  // Get sync queue items
  async getSyncQueueItems() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove item from sync queue
  async removeFromSyncQueue(id) {
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    await store.delete(id);
  }

  // Handle service worker messages
  handleServiceWorkerMessage(event) {
    const { type, data } = event.data;

    switch (type) {
      case 'sync-success':
        this.notifyListeners('sync-success', data);
        break;
      case 'sync-error':
        this.notifyListeners('sync-error', data);
        break;
    }
  }

  // Event listeners
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeListener(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Utility methods
  generateOfflineId() {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isOffline() {
    return !this.isOnline;
  }

  getPendingSyncCount() {
    return this.getSyncQueueItems().then(items => items.length);
  }

  async loadOfflineData() {
    // Load cached restaurants and ratings
    const restaurants = await this.getCachedRestaurants();
    this.notifyListeners('data-loaded', { restaurants });
  }
}
```

### Offline UI Components
```javascript
// components/OfflineIndicator.js
class OfflineIndicator {
  constructor() {
    this.indicator = null;
    this.syncIndicator = null;
    this.offlineManager = null;
    this.init();
  }

  async init() {
    // Create UI elements
    this.createIndicators();

    // Initialize offline manager
    if (window.OfflineManager) {
      this.offlineManager = new OfflineManager();
      this.setupEventListeners();
    }

    // Update initial state
    this.updateOnlineStatus(navigator.onLine);
  }

  createIndicators() {
    // Online/Offline indicator
    this.indicator = document.createElement('div');
    this.indicator.className = 'offline-indicator';
    this.indicator.innerHTML = `
      <div class="indicator-content">
        <span class="status-icon">🌐</span>
        <span class="status-text">Online</span>
      </div>
    `;
    document.body.appendChild(this.indicator);

    // Sync indicator
    this.syncIndicator = document.createElement('div');
    this.syncIndicator.className = 'sync-indicator';
    this.syncIndicator.innerHTML = `
      <div class="sync-content">
        <span class="sync-icon">🔄</span>
        <span class="sync-text">Sincronizando...</span>
        <span class="sync-count">0</span>
      </div>
    `;
    document.body.appendChild(this.syncIndicator);
  }

  setupEventListeners() {
    // Listen for online/offline events
    this.offlineManager.addListener('online', () => {
      this.updateOnlineStatus(true);
    });

    this.offlineManager.addListener('offline', () => {
      this.updateOnlineStatus(false);
    });

    // Listen for sync events
    this.offlineManager.addListener('sync-start', () => {
      this.showSyncIndicator();
    });

    this.offlineManager.addListener('sync-success', () => {
      this.showSyncSuccess();
    });

    this.offlineManager.addListener('sync-complete', () => {
      this.hideSyncIndicator();
    });

    // Update sync count
    this.updateSyncCount();
  }

  updateOnlineStatus(isOnline) {
    const icon = this.indicator.querySelector('.status-icon');
    const text = this.indicator.querySelector('.status-text');

    if (isOnline) {
      this.indicator.classList.remove('offline');
      this.indicator.classList.add('online');
      icon.textContent = '🌐';
      text.textContent = 'Online';
    } else {
      this.indicator.classList.remove('online');
      this.indicator.classList.add('offline');
      icon.textContent = '📴';
      text.textContent = 'Offline';
    }
  }

  showSyncIndicator() {
    this.syncIndicator.classList.add('visible');
    this.syncIndicator.classList.add('syncing');
  }

  hideSyncIndicator() {
    this.syncIndicator.classList.remove('visible');
    this.syncIndicator.classList.remove('syncing');
  }

  showSyncSuccess() {
    this.syncIndicator.classList.remove('syncing');
    this.syncIndicator.classList.add('success');

    setTimeout(() => {
      this.hideSyncIndicator();
    }, 2000);
  }

  async updateSyncCount() {
    if (!this.offlineManager) return;

    const count = await this.offlineManager.getPendingSyncCount();
    const countElement = this.syncIndicator.querySelector('.sync-count');

    if (count > 0) {
      countElement.textContent = count;
      this.syncIndicator.classList.add('has-pending');
    } else {
      countElement.textContent = '0';
      this.syncIndicator.classList.remove('has-pending');
    }
  }
}
```

### Offline Page
```html
<!-- offline.html -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esplanada Eats - Offline</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f9fafb;
            margin: 0;
            padding: 2rem;
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .offline-container {
            max-width: 400px;
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .offline-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }

        .offline-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1rem;
        }

        .offline-message {
            color: #6b7280;
            margin-bottom: 1.5rem;
            line-height: 1.5;
        }

        .offline-features {
            background: #f3f4f6;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1.5rem;
            text-align: left;
        }

        .offline-features h3 {
            font-size: 1rem;
            font-weight: 600;
            color: #374151;
            margin-top: 0;
            margin-bottom: 0.5rem;
        }

        .offline-features ul {
            margin: 0;
            padding-left: 1.5rem;
            color: #4b5563;
        }

        .offline-features li {
            margin-bottom: 0.25rem;
        }

        .retry-button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .retry-button:hover {
            background: #2563eb;
        }

        .cached-data {
            margin-top: 1rem;
            padding: 1rem;
            background: #eff6ff;
            border-radius: 0.5rem;
            border-left: 4px solid #3b82f6;
        }

        .cached-data h4 {
            margin: 0 0 0.5rem 0;
            color: #1e40af;
        }

        .cached-data p {
            margin: 0;
            color: #1e40af;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">📴</div>
        <h1 class="offline-title">Você está offline</h1>
        <p class="offline-message">
            Não parece que você está conectado à internet. Mas não se preocupe!
            Você ainda pode acessar alguns recursos do aplicativo.
        </p>

        <div class="offline-features">
            <h3>O que você pode fazer offline:</h3>
            <ul>
                <li>Visualizar restaurantes em cache</li>
                <li>Avaliar restaurantes (será sincronizado depois)</li>
                <li>Navegar pelo aplicativo normalmente</li>
            </ul>
        </div>

        <div class="cached-data">
            <h4>Dados disponíveis offline</h4>
            <p id="cached-count">Carregando...</p>
        </div>

        <button class="retry-button" onclick="window.location.reload()">
            Tentar novamente
        </button>
    </div>

    <script>
        // Load cached data count
        async function loadCachedData() {
            try {
                const db = await new Promise((resolve, reject) => {
                    const request = indexedDB.open('EsplanadaEatsDB', 1);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });

                const restaurantCount = await new Promise((resolve, reject) => {
                    const transaction = db.transaction(['restaurants'], 'readonly');
                    const store = transaction.objectStore('restaurants');
                    const request = store.count();
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });

                const ratingCount = await new Promise((resolve, reject) => {
                    const transaction = db.transaction(['ratings'], 'readonly');
                    const store = transaction.objectStore('ratings');
                    const request = store.count();
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });

                document.getElementById('cached-count').textContent =
                    `${restaurantCount} restaurantes e ${ratingCount} avaliações disponíveis offline`;

            } catch (error) {
                document.getElementById('cached-count').textContent =
                    'Não foi possível carregar dados offline';
            }
        }

        // Load cached data when page loads
        loadCachedData();

        // Check online status periodically
        setInterval(() => {
            if (navigator.onLine) {
                window.location.reload();
            }
        }, 5000);
    </script>
</body>
</html>
```

### CSS for Offline Indicators
```css
/* Offline indicator styles */
.offline-indicator {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #10b981;
    color: white;
    padding: 0.5rem;
    text-align: center;
    z-index: 1000;
    transition: all 0.3s ease;
    transform: translateY(0);
}

.offline-indicator.offline {
    background: #ef4444;
}

.offline-indicator .indicator-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
}

.sync-indicator {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: white;
    border-radius: 2rem;
    padding: 0.75rem 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    opacity: 0;
    transform: translateY(100%);
    transition: all 0.3s ease;
    z-index: 1000;
}

.sync-indicator.visible {
    opacity: 1;
    transform: translateY(0);
}

.sync-indicator.syncing .sync-icon {
    animation: spin 1s linear infinite;
}

.sync-indicator.success {
    background: #d1fae5;
    color: #065f46;
}

.sync-indicator.has-pending .sync-count {
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Offline mode styles for main app */
body.offline .requires-online {
    opacity: 0.5;
    pointer-events: none;
}

body.offline .offline-only {
    display: block;
}

body:not(.offline) .offline-only {
    display: none;
}

/* Toast notifications for sync status */
.sync-toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.sync-toast.show {
    opacity: 1;
}

.sync-toast.success {
    background: #10b981;
}

.sync-toast.error {
    background: #ef4444;
}
```

## Dependencies
- **Story 4.1**: Performance optimization for offline performance
- **Story 0.2**: Firebase SDK integration for data synchronization
- **Story 3.3**: Duplicate prevention logic for offline rating handling

## Testing Checklist
- [ ] Service worker registers correctly
- [ ] App loads without internet connection
- [ ] Offline page shows cached data
- [ ] Ratings can be submitted offline
- [ ] Sync happens automatically when online
- [ ] Offline/online indicators work correctly
- [ ] Data persists between sessions
- [ ] Conflicts are resolved properly
- [ ] Performance is acceptable offline
- [ ] All browsers support offline features

## Notes
- Esta história implementa suporte robusto para uso offline
- O aplicativo continua funcional sem conexão com a internet
- A sincronização é automática e transparente para o usuário
- Os dados são persistentes e consistentes
- A interface mostra claramente o estado offline/online
- O sistema é escalável e confiável
- A experiência do usuário é mantida mesmo offline