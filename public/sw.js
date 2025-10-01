// public/sw.js - Service Worker for offline caching and performance optimization

const CACHE_NAME = 'esplanada-eats-v1.0.1';
const STATIC_CACHE_NAME = 'esplanada-eats-static-v1.0.1';
const DYNAMIC_CACHE_NAME = 'esplanada-eats-dynamic-v1.0.1';
const API_CACHE_NAME = 'esplanada-eats-api-v1.0.1';

// URLs to cache for offline functionality
const STATIC_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/js/app.js',
    '/manifest.json',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-512x512.png',
    '/images/placeholder-restaurant.svg'
];

// Critical JavaScript modules to cache
const CRITICAL_MODULES = [
    '/js/utils/image-loader.js',
    '/js/utils/bundle-optimizer.js',
    '/js/services/performance-monitor.js',
    '/js/components/rating-display.js',
    '/js/modules/ui-service.js',
    '/js/modules/modal-service.js'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /^https:\/\/firestore\.googleapis\.com\/.*\/restaurants/,
    /^https:\/\/firestore\.googleapis\.com\/.*\/ratings/
];

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

/**
 * Install event - Cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker installing...');

    event.waitUntil(
        (async () => {
            try {
                const staticCache = await caches.open(STATIC_CACHE_NAME);
                console.log('📦 Caching static assets...');
                await staticCache.addAll(STATIC_URLS);

                // Cache critical modules
                const moduleCache = await caches.open(CACHE_NAME);
                console.log('📦 Caching critical modules...');
                await moduleCache.addAll(CRITICAL_MODULES);

                console.log('✅ Static assets cached successfully');
                return self.skipWaiting();
            } catch (error) {
                console.error('❌ Failed to cache static assets:', error);
            }
        })()
    );
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker activating...');

    event.waitUntil(
        (async () => {
            try {
                const cacheNames = await caches.keys();
                const deletionPromises = cacheNames
                    .filter(name =>
                        name.startsWith('esplanada-eats-') &&
                        ![CACHE_NAME, STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, API_CACHE_NAME].includes(name)
                    )
                    .map(name => {
                        console.log('🗑️ Deleting old cache:', name);
                        return caches.delete(name);
                    });

                await Promise.all(deletionPromises);
                console.log('✅ Old caches cleaned up');
                return self.clients.claim();
            } catch (error) {
                console.error('❌ Failed to clean up caches:', error);
            }
        })()
    );
});

/**
 * Fetch event - Handle requests with different caching strategies
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle different request types
    if (isStaticAsset(request)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isAPIRequest(request)) {
        event.respondWith(handleAPIRequest(request));
    } else if (isImageRequest(request)) {
        event.respondWith(handleImageRequest(request));
    } else {
        event.respondWith(handleNavigationRequest(request));
    }
});

/**
 * Handle static asset requests (Cache First)
 */
async function handleStaticAsset(request) {
    return cacheFirst(request, STATIC_CACHE_NAME);
}

/**
 * Handle API requests (Network First with cache fallback)
 */
async function handleAPIRequest(request) {
    return networkFirst(request, API_CACHE_NAME, { maxAge: 5 * 60 * 1000 }); // 5 minutes
}

/**
 * Handle image requests (Stale While Revalidate)
 */
async function handleImageRequest(request) {
    return staleWhileRevalidate(request, DYNAMIC_CACHE_NAME, { maxEntries: 100 });
}

/**
 * Handle navigation requests (Network First)
 */
async function handleNavigationRequest(request) {
    try {
        // Try network first for navigation requests
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Fallback to cache for offline
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page as last resort
        return caches.match('/') || new Response('Offline', { status: 503 });
    }
}

/**
 * Cache First Strategy
 */
async function cacheFirst(request, cacheName) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('📦 Serving from cache:', request.url);
            return cachedResponse;
        }

        // Not in cache, fetch from network
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('❌ Cache First failed:', error);
        throw error;
    }
}

/**
 * Network First Strategy
 */
async function networkFirst(request, cacheName, options = {}) {
    const { maxAge } = options;

    try {
        // Try network first
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
            console.log('🌐 Served from network and cached:', request.url);
        }

        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(request);

        if (cachedResponse && !isStale(cachedResponse, maxAge)) {
            console.log('📦 Serving stale cache:', request.url);
            return cachedResponse;
        }

        console.error('❌ Network and cache failed:', error);
        throw error;
    }
}

/**
 * Stale While Revalidate Strategy
 */
async function staleWhileRevalidate(request, cacheName, options = {}) {
    const { maxEntries } = options;

    try {
        // Check cache first
        const cachedResponse = await caches.match(request);

        // Always try to update cache in background
        const fetchPromise = fetch(request).then(async (networkResponse) => {
            if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                cache.put(request, networkResponse.clone());

                // Clean up cache if needed
                if (maxEntries) {
                    await trimCache(cacheName, maxEntries);
                }
            }
            return networkResponse;
        });

        // Return cached version immediately if available
        if (cachedResponse) {
            console.log('📦 Serving from cache (background update):', request.url);
            // Don't wait for the fetch to complete
            fetchPromise.catch(error => {
                console.warn('Background update failed:', error);
            });
            return cachedResponse;
        }

        // No cache available, wait for network
        return await fetchPromise;
    } catch (error) {
        console.error('❌ Stale While Revalidate failed:', error);
        throw error;
    }
}

/**
 * Check if request is for static asset
 */
function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/styles/') ||
           url.pathname.startsWith('/js/') ||
           url.pathname.startsWith('/images/') ||
           url.pathname.endsWith('.css') ||
           url.pathname.endsWith('.js') ||
           url.pathname.endsWith('.png') ||
           url.pathname.endsWith('.jpg') ||
           url.pathname.endsWith('.jpeg') ||
           url.pathname.endsWith('.svg') ||
           url.pathname.endsWith('.webp');
}

/**
 * Check if request is for API
 */
function isAPIRequest(request) {
    const url = new URL(request.url);
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

/**
 * Check if request is for image
 */
function isImageRequest(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

/**
 * Check if cached response is stale
 */
function isStale(response, maxAge) {
    if (!maxAge || !response.headers.get('date')) {
        return false;
    }

    const cachedTime = new Date(response.headers.get('date')).getTime();
    const now = Date.now();
    return (now - cachedTime) > maxAge;
}

/**
 * Trim cache to keep only recent entries
 */
async function trimCache(cacheName, maxEntries) {
    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();

        if (keys.length > maxEntries) {
            const keysToDelete = keys.slice(0, keys.length - maxEntries);
            await Promise.all(keysToDelete.map(key => cache.delete(key)));
            console.log(`🗑️ Trimmed cache ${cacheName}: removed ${keysToDelete.length} entries`);
        }
    } catch (error) {
        console.error('❌ Failed to trim cache:', error);
    }
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync event:', event.tag);

    if (event.tag === 'sync-ratings') {
        event.waitUntil(syncOfflineRatings());
    } else if (event.tag === 'sync-restaurants') {
        event.waitUntil(syncOfflineRestaurants());
    }
});

/**
 * Sync offline ratings when back online
 */
async function syncOfflineRatings() {
    try {
        // Get offline ratings from IndexedDB
        const offlineRatings = await getOfflineRatings();

        for (const rating of offlineRatings) {
            try {
                // Try to sync each rating
                const response = await fetch('/api/ratings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(rating)
                });

                if (response.ok) {
                    // Remove from offline storage
                    await removeOfflineRating(rating.id);
                    console.log('✅ Synced rating:', rating.id);
                }
            } catch (error) {
                console.error('❌ Failed to sync rating:', rating.id, error);
            }
        }
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

/**
 * Sync offline restaurant data when back online
 */
async function syncOfflineRestaurants() {
    try {
        // Implementation for syncing restaurant data
        console.log('🔄 Syncing offline restaurant data...');
    } catch (error) {
        console.error('❌ Restaurant sync failed:', error);
    }
}

/**
 * Push notification handler
 */
self.addEventListener('push', (event) => {
    console.log('📬 Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/images/icons/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/icons/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Esplanada Eats', options)
    );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification click received');

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Message handler for communication with main app
 */
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ status: 'cleared' });
            });
            break;
        case 'PRELOAD_URLS':
            preloadUrls(payload.urls);
            break;
    }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('🗑️ All caches cleared');
    } catch (error) {
        console.error('❌ Failed to clear caches:', error);
    }
}

/**
 * Preload URLs into cache
 */
async function preloadUrls(urls) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        await cache.addAll(urls);
        console.log('📦 Preloaded URLs:', urls);
    } catch (error) {
        console.error('❌ Failed to preload URLs:', error);
    }
}

// Placeholder functions for IndexedDB operations
async function getOfflineRatings() {
    // Implementation would use IndexedDB
    return [];
}

async function removeOfflineRating(id) {
    // Implementation would remove from IndexedDB
}

console.log('🚀 Service Worker loaded successfully');