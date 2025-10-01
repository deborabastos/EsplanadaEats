// js/services/offline-rating-service.js - Offline support for rating calculations

/**
 * Offline Rating Service - Handles offline caching and synchronization for rating calculations
 */
export class OfflineRatingService {
    constructor(calculationService, storageService) {
        this.calculationService = calculationService;
        this.storageService = storageService;

        // IndexedDB setup
        this.dbName = 'EsplanadaEatsOffline';
        this.dbVersion = 1;
        this.db = null;

        // Offline state tracking
        this.isOffline = !navigator.onLine;
        this.syncQueue = [];
        this.isDbReady = false;

        // Cache management
        this.offlineCache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

        console.log('OfflineRatingService initialized');
        this.initialize();
    }

    /**
     * Initialize the offline service
     */
    async initialize() {
        try {
            await this.initializeDatabase();
            this.setupConnectionListeners();
            this.loadOfflineCache();

            console.log('OfflineRatingService initialization completed');
        } catch (error) {
            console.error('Failed to initialize OfflineRatingService:', error);
        }
    }

    /**
     * Initialize IndexedDB database
     */
    async initializeDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isDbReady = true;
                console.log('IndexedDB opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores for offline data
                if (!db.objectStoreNames.contains('calculations')) {
                    const calculationsStore = db.createObjectStore('calculations', { keyPath: 'restaurantId' });
                    calculationsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    calculationsStore.createIndex('expiry', 'expiry', { unique: false });
                }

                if (!db.objectStoreNames.contains('ratings')) {
                    const ratingsStore = db.createObjectStore('ratings', { keyPath: 'id', autoIncrement: true });
                    ratingsStore.createIndex('restaurantId', 'restaurantId', { unique: false });
                    ratingsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    ratingsStore.createIndex('synced', 'synced', { unique: false });
                }

                if (!db.objectStoreNames.contains('syncQueue')) {
                    const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                    syncQueueStore.createIndex('type', 'type', { unique: false });
                    syncQueueStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                console.log('IndexedDB schema created/updated');
            };
        });
    }

    /**
     * Setup online/offline event listeners
     */
    setupConnectionListeners() {
        window.addEventListener('online', () => {
            console.log('Connection restored - going online');
            this.isOffline = false;
            this.synchronizePendingData();
        });

        window.addEventListener('offline', () => {
            console.log('Connection lost - going offline');
            this.isOffline = true;
        });
    }

    /**
     * Get restaurant rating with offline support
     * @param {string} restaurantId - Restaurant ID
     * @param {boolean} forceRefresh - Force refresh ignoring cache
     * @returns {Promise<Object>} Rating calculation
     */
    async getRestaurantRating(restaurantId, forceRefresh = false) {
        try {
            // Try to get from online service first
            if (!this.isOffline && !forceRefresh) {
                try {
                    const onlineCalculation = await this.calculationService.calculateRestaurantRating(restaurantId, forceRefresh);
                    await this.cacheCalculation(restaurantId, onlineCalculation);
                    return onlineCalculation;
                } catch (error) {
                    console.warn('Online calculation failed, falling back to offline:', error);
                }
            }

            // Try to get from offline cache
            const cachedCalculation = await this.getCachedCalculation(restaurantId);
            if (cachedCalculation && !this.isExpired(cachedCalculation)) {
                console.log(`Returning cached calculation for restaurant ${restaurantId}`);
                return cachedCalculation.data;
            }

            // Calculate offline if we have ratings
            const offlineRatings = await this.getOfflineRatings(restaurantId);
            if (offlineRatings.length > 0) {
                console.log(`Performing offline calculation for restaurant ${restaurantId}`);
                const offlineCalculation = this.calculationService.performRatingCalculation(offlineRatings);
                await this.cacheCalculation(restaurantId, offlineCalculation);
                return offlineCalculation;
            }

            // Return default calculation if no data available
            console.log(`No data available for restaurant ${restaurantId}, returning default calculation`);
            return this.getDefaultCalculation();

        } catch (error) {
            console.error('Error getting restaurant rating:', error);
            return this.getDefaultCalculation();
        }
    }

    /**
     * Cache calculation result offline
     * @param {string} restaurantId - Restaurant ID
     * @param {Object} calculation - Calculation result
     */
    async cacheCalculation(restaurantId, calculation) {
        try {
            if (!this.isDbReady) return;

            const cacheEntry = {
                restaurantId,
                data: calculation,
                timestamp: Date.now(),
                expiry: Date.now() + this.cacheExpiry
            };

            const transaction = this.db.transaction(['calculations'], 'readwrite');
            const store = transaction.objectStore('calculations');
            await store.put(cacheEntry);

            // Also cache in memory for quick access
            this.offlineCache.set(restaurantId, cacheEntry);

            console.log(`Cached calculation for restaurant ${restaurantId}`);
        } catch (error) {
            console.error('Error caching calculation:', error);
        }
    }

    /**
     * Get cached calculation
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise<Object|null>} Cached calculation
     */
    async getCachedCalculation(restaurantId) {
        try {
            // Check memory cache first
            if (this.offlineCache.has(restaurantId)) {
                const cached = this.offlineCache.get(restaurantId);
                if (!this.isExpired(cached)) {
                    return cached;
                } else {
                    this.offlineCache.delete(restaurantId);
                }
            }

            // Check IndexedDB
            if (!this.isDbReady) return null;

            const transaction = this.db.transaction(['calculations'], 'readonly');
            const store = transaction.objectStore('calculations');
            const request = store.get(restaurantId);

            return new Promise((resolve) => {
                request.onsuccess = () => {
                    const result = request.result;
                    if (result && !this.isExpired(result)) {
                        this.offlineCache.set(restaurantId, result);
                        resolve(result);
                    } else {
                        resolve(null);
                    }
                };

                request.onerror = () => {
                    console.error('Error getting cached calculation:', request.error);
                    resolve(null);
                };
            });
        } catch (error) {
            console.error('Error getting cached calculation:', error);
            return null;
        }
    }

    /**
     * Check if cache entry is expired
     * @param {Object} cacheEntry - Cache entry
     * @returns {boolean} True if expired
     */
    isExpired(cacheEntry) {
        return Date.now() > cacheEntry.expiry;
    }

    /**
     * Get offline ratings for a restaurant
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise<Array>} Array of ratings
     */
    async getOfflineRatings(restaurantId) {
        try {
            if (!this.isDbReady) return [];

            const transaction = this.db.transaction(['ratings'], 'readonly');
            const store = transaction.objectStore('ratings');
            const index = store.index('restaurantId');
            const request = index.getAll(restaurantId);

            return new Promise((resolve) => {
                request.onsuccess = () => {
                    const ratings = request.result.map(rating => ({
                        id: rating.id,
                        rating: rating.rating,
                        timestamp: rating.timestamp,
                        userFingerprint: rating.userFingerprint,
                        userName: rating.userName
                    }));
                    resolve(ratings);
                };

                request.onerror = () => {
                    console.error('Error getting offline ratings:', request.error);
                    resolve([]);
                };
            });
        } catch (error) {
            console.error('Error getting offline ratings:', error);
            return [];
        }
    }

    /**
     * Store rating offline for later sync
     * @param {Object} rating - Rating data
     */
    async storeOfflineRating(rating) {
        try {
            if (!this.isDbReady) return;

            const offlineRating = {
                ...rating,
                synced: false,
                timestamp: Date.now()
            };

            const transaction = this.db.transaction(['ratings'], 'readwrite');
            const store = transaction.objectStore('ratings');
            await store.add(offlineRating);

            // Add to sync queue
            await this.addToSyncQueue({
                type: 'rating',
                action: 'create',
                data: rating,
                timestamp: Date.now()
            });

            console.log(`Stored rating offline for later sync: ${rating.restaurantId}`);
        } catch (error) {
            console.error('Error storing offline rating:', error);
        }
    }

    /**
     * Add operation to sync queue
     * @param {Object} operation - Operation to sync
     */
    async addToSyncQueue(operation) {
        try {
            if (!this.isDbReady) return;

            const transaction = this.db.transaction(['syncQueue'], 'readwrite');
            const store = transaction.objectStore('syncQueue');
            await store.add(operation);

            console.log(`Added operation to sync queue: ${operation.type} - ${operation.action}`);
        } catch (error) {
            console.error('Error adding to sync queue:', error);
        }
    }

    /**
     * Synchronize pending data when online
     */
    async synchronizePendingData() {
        if (this.isOffline || !this.isDbReady) return;

        try {
            console.log('Starting synchronization of pending data...');

            const syncOperations = await this.getSyncQueue();
            console.log(`Found ${syncOperations.length} operations to sync`);

            for (const operation of syncOperations) {
                try {
                    await this.processSyncOperation(operation);
                    await this.removeFromSyncQueue(operation.id);
                } catch (error) {
                    console.error(`Failed to sync operation ${operation.id}:`, error);
                }
            }

            console.log('Synchronization completed');
        } catch (error) {
            console.error('Error during synchronization:', error);
        }
    }

    /**
     * Get sync queue operations
     * @returns {Promise<Array>} Array of operations
     */
    async getSyncQueue() {
        if (!this.isDbReady) return [];

        const transaction = this.db.transaction(['syncQueue'], 'readonly');
        const store = transaction.objectStore('syncQueue');
        const request = store.getAll();

        return new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error('Error getting sync queue:', request.error);
                resolve([]);
            };
        });
    }

    /**
     * Process a single sync operation
     * @param {Object} operation - Operation to process
     */
    async processSyncOperation(operation) {
        switch (operation.type) {
            case 'rating':
                if (operation.action === 'create') {
                    await this.storageService.createRating(operation.data);
                    console.log(`Synced rating: ${operation.data.restaurantId}`);
                }
                break;
            // Add more operation types as needed
            default:
                console.warn(`Unknown operation type: ${operation.type}`);
        }
    }

    /**
     * Remove operation from sync queue
     * @param {number} operationId - Operation ID
     */
    async removeFromSyncQueue(operationId) {
        if (!this.isDbReady) return;

        const transaction = this.db.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        await store.delete(operationId);
    }

    /**
     * Load offline cache into memory
     */
    async loadOfflineCache() {
        try {
            if (!this.isDbReady) return;

            const transaction = this.db.transaction(['calculations'], 'readonly');
            const store = transaction.objectStore('calculations');
            const request = store.getAll();

            request.onsuccess = () => {
                const calculations = request.result;
                calculations.forEach(calculation => {
                    if (!this.isExpired(calculation)) {
                        this.offlineCache.set(calculation.restaurantId, calculation);
                    }
                });
                console.log(`Loaded ${calculations.length} calculations into offline cache`);
            };
        } catch (error) {
            console.error('Error loading offline cache:', error);
        }
    }

    /**
     * Get default calculation for restaurants with no data
     * @returns {Object} Default calculation
     */
    getDefaultCalculation() {
        return {
            averageQuality: 0,
            totalRatings: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            confidenceScore: 0,
            weightedAverage: 0,
            standardDeviation: 0,
            median: 0,
            mode: 0,
            lastUpdated: new Date().toISOString(),
            isOffline: true
        };
    }

    /**
     * Clear all offline data
     */
    async clearOfflineData() {
        try {
            if (!this.isDbReady) return;

            const stores = ['calculations', 'ratings', 'syncQueue'];
            for (const storeName of stores) {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                await store.clear();
            }

            this.offlineCache.clear();
            console.log('All offline data cleared');
        } catch (error) {
            console.error('Error clearing offline data:', error);
        }
    }

    /**
     * Get offline status information
     * @returns {Object} Status information
     */
    getOfflineStatus() {
        return {
            isOffline: this.isOffline,
            isDbReady: this.isDbReady,
            cacheSize: this.offlineCache.size,
            pendingSync: this.syncQueue.length
        };
    }

    /**
     * Cleanup method
     */
    cleanup() {
        try {
            // Clear memory cache
            this.offlineCache.clear();

            // Close database connection
            if (this.db) {
                this.db.close();
                this.db = null;
            }

            console.log('OfflineRatingService cleaned up');
        } catch (error) {
            console.error('Error during OfflineRatingService cleanup:', error);
        }
    }
}