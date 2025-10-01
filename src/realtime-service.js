// Real-time Data Synchronization Service
// Story 0.3: Real-time Data Synchronization

class RealtimeService {
  constructor() {
    this.restaurantsListener = null;
    this.reviewsListeners = new Map();
    this.connectionState = 'online';
    this.offlineQueue = [];
    this.updateCallbacks = new Map();
    this.performanceOptimizer = new PerformanceOptimizer();
    this.conflictResolver = new ConflictResolver();
    this.connectionManager = new ConnectionManager();

    this.setupEventListeners();
  }

  // Setup event listeners for connection and data changes
  setupEventListeners() {
    // Listen to connection state changes
    this.connectionManager.onConnectionChange((state) => {
      this.connectionState = state;
      this.updateConnectionUI();

      if (state === 'online') {
        this.processOfflineQueue();
      }
    });

    // Listen to online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  // Restaurant collection real-time listener
  setupRestaurantsListener(callback) {
    if (this.restaurantsListener) {
      this.restaurantsListener(); // Unsubscribe existing listener
    }

    this.restaurantsListener = db.collection('restaurants')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const changes = snapshot.docChanges();
        this.performanceOptimizer.debounceUpdate(() => {
          this.processRestaurantChanges(changes, callback);
        }, 50); // Debounce rapid updates
      }, (error) => {
        this.handleListenerError(error, 'restaurants');
      });

    return this.restaurantsListener;
  }

  // Reviews listener for specific restaurant
  setupReviewsListener(restaurantId, callback) {
    // Remove existing listener for this restaurant
    if (this.reviewsListeners.has(restaurantId)) {
      this.reviewsListeners.get(restaurantId)();
    }

    const listener = db.collection('reviews')
      .where('restaurantId', '==', restaurantId)
      .orderBy('createdAt', 'desc')
      .limit(20) // Limit for performance
      .onSnapshot((snapshot) => {
        const reviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Update restaurant rating in real-time
        this.updateRestaurantRating(restaurantId, reviews);

        callback(reviews);
      }, (error) => {
        this.handleListenerError(error, `reviews-${restaurantId}`);
      });

    this.reviewsListeners.set(restaurantId, listener);
    return listener;
  }

  // Process restaurant changes efficiently
  processRestaurantChanges(changes, callback) {
    const updates = {
      added: [],
      modified: [],
      removed: []
    };

    changes.forEach(change => {
      const restaurant = {
        id: change.doc.id,
        ...change.doc.data()
      };

      switch (change.type) {
        case 'added':
          updates.added.push(restaurant);
          console.log(`🆕 New restaurant added: ${restaurant.name}`);
          break;
        case 'modified':
          updates.modified.push(restaurant);
          console.log(`🔄 Restaurant updated: ${restaurant.name}`);
          break;
        case 'removed':
          updates.removed.push(restaurant);
          console.log(`🗑️ Restaurant removed: ${restaurant.name}`);
          break;
      }
    });

    // Trigger UI update with debouncing
    this.performanceOptimizer.debounceUpdate(() => {
      callback(updates);
    }, 100);
  }

  // Update restaurant rating based on reviews
  async updateRestaurantRating(restaurantId, reviews) {
    if (reviews.length === 0) return;

    const totalQuality = reviews.reduce((sum, review) => sum + review.quality, 0);
    const totalPrice = reviews.reduce((sum, review) => sum + review.price, 0);

    const averageQuality = totalQuality / reviews.length;
    const averagePrice = totalPrice / reviews.length;

    try {
      await getRestaurantRef(restaurantId).update({
        averageQuality: Math.round(averageQuality * 10) / 10,
        averagePrice: Math.round(averagePrice * 10) / 10,
        totalRatings: reviews.length,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log(`📊 Updated rating for restaurant ${restaurantId}: ${averageQuality.toFixed(1)}/5 (${reviews.length} reviews)`);
    } catch (error) {
      console.error('❌ Failed to update restaurant rating:', error);
    }
  }

  // Optimistic update with conflict resolution
  async optimisticUpdate(docRef, updateData, originalData) {
    if (this.connectionState === 'offline') {
      return this.queueOfflineOperation({ type: 'update', docRef, updateData, originalData });
    }

    return this.conflictResolver.optimisticUpdate(docRef, updateData, originalData);
  }

  // Handle offline operations
  queueOfflineOperation(operation) {
    this.offlineQueue.push({
      ...operation,
      timestamp: Date.now(),
      id: 'offline-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    });

    this.updateOfflineQueueUI();
    console.log(`📴 Queued offline operation: ${operation.type}`);

    return Promise.resolve({ offline: true, operationId: operation.id });
  }

  // Process offline queue when connection is restored
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    console.log(`🔄 Processing ${this.offlineQueue.length} offline operations...`);

    const processed = [];
    const failed = [];

    for (const operation of this.offlineQueue) {
      try {
        await this.executeOfflineOperation(operation);
        processed.push(operation);
      } catch (error) {
        console.error('❌ Failed to process offline operation:', error);
        failed.push({ ...operation, error });
      }
    }

    // Remove processed operations
    this.offlineQueue = this.offlineQueue.filter(op => !processed.includes(op));

    this.updateOfflineQueueUI();

    if (failed.length > 0) {
      console.warn(`⚠️ ${failed.length} offline operations failed`);
      this.handleFailedOperations(failed);
    }

    console.log(`✅ Processed ${processed.length} offline operations`);
  }

  // Execute individual offline operation
  async executeOfflineOperation(operation) {
    switch (operation.type) {
      case 'update':
        await operation.docRef.update(operation.updateData);
        break;
      case 'create':
        await operation.collectionRef.add(operation.data);
        break;
      case 'delete':
        await operation.docRef.delete();
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  // Handle failed offline operations
  handleFailedOperations(failedOperations) {
    failedOperations.forEach(op => {
      showUserError(`Falha ao sincronizar: ${op.error.message}`);
    });
  }

  // Update connection UI
  updateConnectionUI() {
    const indicator = document.getElementById('connection-indicator');
    const statusText = document.getElementById('connection-status-text');
    const offlineCount = document.getElementById('offline-queue-count');

    if (indicator) {
      indicator.className = `connection-indicator ${this.connectionState}`;
      indicator.textContent = this.connectionState === 'online' ? '🟢 Online' : '🟡 Offline';
    }

    if (statusText) {
      statusText.textContent = this.connectionState === 'online'
        ? '✅ Conectado ao Firebase'
        : '⚠️ Offline - Mudanças serão sincronizadas';
    }

    if (offlineCount) {
      offlineCount.textContent = this.offlineQueue.length;
      offlineCount.style.display = this.offlineQueue.length > 0 ? 'inline' : 'none';
    }
  }

  // Update offline queue UI
  updateOfflineQueueUI() {
    const queueElement = document.getElementById('offline-queue');
    const queueCount = document.getElementById('offline-queue-count');

    if (queueElement) {
      if (this.offlineQueue.length > 0) {
        queueElement.style.display = 'block';
        queueElement.innerHTML = `
          <div class="offline-queue-item">
            📴 ${this.offlineQueue.length} alterações pendentes de sincronização
          </div>
        `;
      } else {
        queueElement.style.display = 'none';
      }
    }

    if (queueCount) {
      queueCount.textContent = this.offlineQueue.length;
      queueCount.style.display = this.offlineQueue.length > 0 ? 'inline' : 'none';
    }
  }

  // Handle online event
  handleOnline() {
    if (this.connectionState === 'offline') {
      this.connectionState = 'online';
      this.updateConnectionUI();
      this.processOfflineQueue();
      showUserError('🟢 Conexão restabelecida! Sincronizando alterações...');
    }
  }

  // Handle offline event
  handleOffline() {
    this.connectionState = 'offline';
    this.updateConnectionUI();
    showUserError('🟡 Você está offline. As alterações serão sincronizadas quando a conexão for restabelecida.');
  }

  // Handle listener errors
  handleListenerError(error, listenerType) {
    console.error(`❌ Listener error (${listenerType}):`, error);

    const errorMessages = {
      'permission-denied': 'Sem permissão para acessar dados em tempo real.',
      'unavailable': 'Serviço de tempo real indisponível.',
      'network-request-failed': 'Erro de rede na sincronização.'
    };

    const message = errorMessages[error.code] || 'Erro na sincronização em tempo real.';
    showUserError(message);

    // Attempt to reconnect after delay
    setTimeout(() => {
      console.log(`🔄 Attempting to reconnect ${listenerType} listener...`);
      this.reconnectListener(listenerType);
    }, 5000);
  }

  // Reconnect specific listener
  reconnectListener(listenerType) {
    if (listenerType === 'restaurants' && this.restaurantsListener) {
      this.setupRestaurantsListener(this.updateCallbacks.get('restaurants'));
    }
    // Add other listeners as needed
  }

  // Register update callback
  registerCallback(type, callback) {
    this.updateCallbacks.set(type, callback);
  }

  // Get current connection state
  getConnectionState() {
    return {
      state: this.connectionState,
      offlineQueueSize: this.offlineQueue.length,
      isOnline: this.connectionState === 'online'
    };
  }

  // Cleanup all listeners
  cleanup() {
    if (this.restaurantsListener) {
      this.restaurantsListener();
    }

    this.reviewsListeners.forEach((listener, restaurantId) => {
      listener();
    });

    this.reviewsListeners.clear();
    this.updateCallbacks.clear();
  }
}

// Connection Manager for Firebase and network monitoring
class ConnectionManager {
  constructor() {
    this.connectionState = 'unknown';
    this.connectionCallbacks = [];
    this.setupFirebaseConnectionMonitoring();
  }

  setupFirebaseConnectionMonitoring() {
    // Monitor Firestore connection state
    db.onSnapshotsInSync(() => {
      this.handleConnectionChange(true);
    });

    // Alternative method for more granular connection monitoring
    this.setupNetworkMonitoring();
  }

  setupNetworkMonitoring() {
    // Check initial connection state
    this.checkConnection();

    // Set up periodic connection checks
    setInterval(() => {
      this.checkConnection();
    }, 30000); // Check every 30 seconds
  }

  async checkConnection() {
    try {
      // Try to read a small document to test connection
      const testRef = db.collection('connection-tests').doc('ping');
      await testRef.get();
      this.handleConnectionChange(true);
    } catch (error) {
      if (error.code === 'unavailable' || error.code === 'network-request-failed') {
        this.handleConnectionChange(false);
      }
    }
  }

  handleConnectionChange(connected) {
    const newState = connected ? 'online' : 'offline';

    if (this.connectionState !== newState) {
      this.connectionState = newState;
      console.log(`🔄 Connection state changed: ${newState}`);

      this.connectionCallbacks.forEach(callback => {
        callback(newState);
      });
    }
  }

  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentState() {
    return this.connectionState;
  }
}

// Conflict Resolution for concurrent updates
class ConflictResolver {
  async optimisticUpdate(docRef, updateData, originalData) {
    try {
      // Apply update locally first (optimistic)
      await docRef.update(updateData);

      // Listen for server confirmation
      return new Promise((resolve, reject) => {
        const unsubscribe = docRef.onSnapshot((doc) => {
          if (doc.exists) {
            const serverData = doc.data();

            // Check if our update was applied successfully
            if (this.dataMatches(updateData, serverData)) {
              unsubscribe();
              resolve({ success: true, data: serverData });
            } else {
              // Conflict detected, resolve it
              this.resolveConflict(docRef, updateData, serverData, originalData)
                .then(resolvedData => {
                  unsubscribe();
                  resolve({ success: true, data: resolvedData, resolved: true });
                })
                .catch(error => {
                  unsubscribe();
                  reject(error);
                });
            }
          }
        }, (error) => {
          unsubscribe();
          reject(error);
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          unsubscribe();
          resolve({ success: true, data: updateData, timeout: true });
        }, 10000);
      });
    } catch (error) {
      // Rollback on error if possible
      if (originalData) {
        try {
          await docRef.set(originalData);
        } catch (rollbackError) {
          console.error('❌ Failed to rollback optimistic update:', rollbackError);
        }
      }
      throw error;
    }
  }

  dataMatches(expected, actual) {
    // Check if the important fields match
    const fieldsToCheck = Object.keys(expected);
    return fieldsToCheck.every(field => {
      return expected[field] === actual[field];
    });
  }

  async resolveConflict(docRef, localUpdate, serverData, originalData) {
    console.log('⚠️ Conflict detected, resolving...');

    // For ratings, use timestamp-based resolution
    if (localUpdate.updatedAt && serverData.updatedAt) {
      const localTime = new Date(localUpdate.updatedAt.toDate ? localUpdate.updatedAt.toDate() : localUpdate.updatedAt);
      const serverTime = new Date(serverData.updatedAt.toDate ? serverData.updatedAt.toDate() : serverData.updatedAt);

      if (localTime > serverTime) {
        console.log('🕐 Local update is newer, reapplying...');
        await docRef.update(localUpdate);
        return { ...serverData, ...localUpdate };
      } else {
        console.log('🕐 Server version is newer');
        return serverData;
      }
    }

    // For other conflicts, merge the data
    const mergedData = this.mergeData(serverData, localUpdate);
    await docRef.update(mergedData);
    return mergedData;
  }

  mergeData(base, update) {
    // Simple merge strategy
    return { ...base, ...update };
  }
}

// Performance Optimization for real-time updates
class PerformanceOptimizer {
  constructor() {
    this.updateQueue = [];
    this.debounceTimers = new Map();
    this.cache = new Map();
  }

  // Debounce rapid updates to prevent UI flickering
  debounceUpdate(updateFunction, delay = 100, key = 'default') {
    // Clear existing timer for this key
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    // Set new timer
    const timer = setTimeout(() => {
      updateFunction();
      this.debounceTimers.delete(key);
    }, delay);

    this.debounceTimers.set(key, timer);
  }

  // Batch multiple updates together
  async batchUpdates(updates) {
    if (updates.length === 0) return;

    const batch = db.batch();

    updates.forEach(update => {
      const { docRef, data } = update;
      batch.update(docRef, data);
    });

    try {
      await batch.commit();
      console.log(`✅ Batched ${updates.length} updates successfully`);
    } catch (error) {
      console.error('❌ Batch update failed:', error);
      throw error;
    }
  }

  // Cache data to reduce redundant requests
  getCachedData(key, fetchFunction, ttl = 30000) {
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return Promise.resolve(cached.data);
    }

    return fetchFunction().then(data => {
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      return data;
    });
  }

  // Clear cache
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Get performance metrics
  getMetrics() {
    return {
      cacheSize: this.cache.size,
      activeDebounceTimers: this.debounceTimers.size,
      queuedUpdates: this.updateQueue.length
    };
  }
}

// Create global instance
const realtimeService = new RealtimeService();

// Make it available globally
window.EsplanadaEatsRealtime = realtimeService;

console.log('🚀 Real-time Data Synchronization Service loaded');