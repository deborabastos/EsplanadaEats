// js/services/realtime-rating-service.js - Real-time rating update system

/**
 * Real-time Rating Service - Handles real-time updates and synchronization
 */
export class RealtimeRatingService {
    constructor(storageService, calculationService) {
        this.storageService = storageService;
        this.calculationService = calculationService;

        // Active listeners for cleanup
        this.activeListeners = new Map();

        // Debouncing system to prevent excessive calculations
        this.updateQueue = new Map();
        this.debounceTimers = new Map();
        this.debounceDelay = 1000; // 1 second

        console.log('RealtimeRatingService initialized');
    }

    /**
     * Setup real-time listeners for rating updates
     */
    setupRealtimeUpdates() {
        try {
            console.log('Setting up real-time rating updates...');

            // Listen for all rating changes in the ratings collection
            this.setupGlobalRatingListener();

            console.log('Real-time rating updates setup complete');
        } catch (error) {
            console.error('Error setting up real-time updates:', error);
        }
    }

    /**
     * Setup global listener for all rating changes
     */
    setupGlobalRatingListener() {
        try {
            console.log('Setting up global ratings listener...');

            // Simplified query without multiple where clauses to avoid index requirement
            const query = this.storageService.ratingsCollection
                .orderBy('createdAt', 'desc')
                .limit(100); // Get recent ratings

            const unsubscribe = query.onSnapshot(
                snapshot => {
                    const changes = snapshot.docChanges();
                    // Filter for approved and non-reported ratings only
                    const relevantChanges = changes.filter(change => {
                        const data = change.doc.data();
                        return (data.moderationStatus === 'approved' || !data.moderationStatus) &&
                               (data.isReported === false || !data.isReported);
                    });

                    if (relevantChanges.length > 0) {
                        console.log(`📡 Detected ${relevantChanges.length} relevant rating changes`);
                        this.handleRatingUpdate(snapshot.docs, relevantChanges);
                    }
                },
                error => {
                    console.error('Global rating listener error:', error);
                }
            );

            // Store listener for cleanup
            this.globalRatingUnsubscribe = unsubscribe;

            console.log('Global ratings listener set up successfully');
        } catch (error) {
            console.error('Error setting up global rating listener:', error);
        }
    }

    /**
     * Handle rating updates from Firestore listener
     * @param {Array} docs - Firestore document snapshots
     * @param {Array} changes - Array of change information
     */
    async handleRatingUpdate(docs, changes) {
        try {
            const changedRestaurants = new Set();

            // Analyze changes to identify affected restaurants
            changes.forEach(change => {
                if (change.type === 'added' || change.type === 'modified') {
                    const rating = change.doc.data();
                    changedRestaurants.add(rating.restaurantId);
                    console.log(`Rating ${change.type} for restaurant ${rating.restaurantId}`);
                } else if (change.type === 'removed') {
                    const rating = change.doc.data();
                    changedRestaurants.add(rating.restaurantId);
                    console.log(`Rating removed for restaurant ${rating.restaurantId}`);
                }
            });

            // Process changed restaurants with debouncing
            changedRestaurants.forEach(restaurantId => {
                this.debouncedUpdate(restaurantId);
            });

        } catch (error) {
            console.error('Error handling rating update:', error);
        }
    }

    /**
     * Debounced update to prevent excessive calculations
     * @param {string} restaurantId - Restaurant ID to update
     */
    debouncedUpdate(restaurantId) {
        // Clear existing timer for this restaurant
        if (this.debounceTimers.has(restaurantId)) {
            clearTimeout(this.debounceTimers.get(restaurantId));
        }

        // Set new timer
        const timer = setTimeout(async () => {
            try {
                await this.processRestaurantUpdate(restaurantId);
            } catch (error) {
                console.error(`Error processing update for restaurant ${restaurantId}:`, error);
            } finally {
                this.debounceTimers.delete(restaurantId);
            }
        }, this.debounceDelay);

        this.debounceTimers.set(restaurantId, timer);
        console.log(`Scheduled debounced update for restaurant ${restaurantId} in ${this.debounceDelay}ms`);
    }

    /**
     * Process restaurant rating update
     * @param {string} restaurantId - Restaurant ID to update
     */
    async processRestaurantUpdate(restaurantId) {
        try {
            console.log(`Processing rating update for restaurant ${restaurantId}`);

            // Force refresh calculation
            const calculation = await this.calculationService.calculateRestaurantRating(
                restaurantId,
                true // Force refresh
            );

            // Notify all subscribers
            this.notifyRatingUpdate(restaurantId, calculation);

            console.log(`Successfully updated rating for restaurant ${restaurantId}:`, calculation);
        } catch (error) {
            console.error(`Error processing restaurant update for ${restaurantId}:`, error);
            throw error;
        }
    }

    /**
     * Subscribe to rating updates for a specific restaurant
     * @param {string} restaurantId - Restaurant ID to watch
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribeToRestaurantUpdates(restaurantId, callback) {
        const listenerId = `${restaurantId}_${Date.now()}_${Math.random()}`;

        this.activeListeners.set(listenerId, {
            restaurantId,
            callback
        });

        console.log(`Added subscriber ${listenerId} for restaurant ${restaurantId}`);

        // Return unsubscribe function
        return () => {
            this.activeListeners.delete(listenerId);
            console.log(`Removed subscriber ${listenerId} for restaurant ${restaurantId}`);
        };
    }

    /**
     * Notify all subscribers of rating updates
     * @param {string} restaurantId - Restaurant ID
     * @param {Object} calculation - New calculation result
     */
    notifyRatingUpdate(restaurantId, calculation) {
        // Notify specific restaurant subscribers
        this.activeListeners.forEach((listener, listenerId) => {
            if (listener.restaurantId === restaurantId) {
                try {
                    listener.callback(calculation);
                } catch (error) {
                    console.error(`Error in rating update callback ${listenerId}:`, error);
                }
            }
        });

        // Dispatch global event for general listeners
        const event = new CustomEvent('restaurantRatingUpdated', {
            detail: {
                restaurantId,
                calculation,
                timestamp: new Date().toISOString()
            }
        });

        document.dispatchEvent(event);
        console.log(`Dispatched rating update event for restaurant ${restaurantId}`);
    }

    /**
     * Subscribe to all rating updates (global listener)
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribeToAllUpdates(callback) {
        const listenerId = `global_${Date.now()}_${Math.random()}`;

        this.activeListeners.set(listenerId, {
            restaurantId: 'global',
            callback
        });

        console.log(`Added global subscriber ${listenerId}`);

        // Return unsubscribe function
        return () => {
            this.activeListeners.delete(listenerId);
            console.log(`Removed global subscriber ${listenerId}`);
        };
    }

    /**
     * Force immediate update for a restaurant (bypassing debounce)
     * @param {string} restaurantId - Restaurant ID to update
     */
    async forceUpdate(restaurantId) {
        try {
            console.log(`Force updating rating for restaurant ${restaurantId}`);

            // Clear any existing debounce timer
            if (this.debounceTimers.has(restaurantId)) {
                clearTimeout(this.debounceTimers.get(restaurantId));
                this.debounceTimers.delete(restaurantId);
            }

            // Process update immediately
            await this.processRestaurantUpdate(restaurantId);
        } catch (error) {
            console.error(`Error force updating restaurant ${restaurantId}:`, error);
            throw error;
        }
    }

    /**
     * Get status of active updates and listeners
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            activeListeners: this.activeListeners.size,
            queuedUpdates: this.updateQueue.size,
            pendingTimers: this.debounceTimers.size,
            hasGlobalListener: !!this.globalRatingUnsubscribe,
            listeners: Array.from(this.activeListeners.entries()).map(([id, listener]) => ({
                id,
                restaurantId: listener.restaurantId,
                type: listener.restaurantId === 'global' ? 'global' : 'restaurant'
            }))
        };
    }

    /**
     * Set debounce delay for updates
     * @param {number} delay - Delay in milliseconds
     */
    setDebounceDelay(delay) {
        this.debounceDelay = Math.max(100, delay); // Minimum 100ms
        console.log(`Set debounce delay to ${this.debounceDelay}ms`);
    }

    /**
     * Cancel pending updates for a restaurant
     * @param {string} restaurantId - Restaurant ID
     */
    cancelPendingUpdate(restaurantId) {
        if (this.debounceTimers.has(restaurantId)) {
            clearTimeout(this.debounceTimers.get(restaurantId));
            this.debounceTimers.delete(restaurantId);
            console.log(`Cancelled pending update for restaurant ${restaurantId}`);
        }
    }

    /**
     * Cancel all pending updates
     */
    cancelAllPendingUpdates() {
        this.debounceTimers.forEach((timer, restaurantId) => {
            clearTimeout(timer);
            console.log(`Cancelled pending update for restaurant ${restaurantId}`);
        });
        this.debounceTimers.clear();
        console.log('All pending updates cancelled');
    }

    /**
     * Cleanup method to clear all resources
     */
    cleanup() {
        try {
            // Cancel all pending timers
            this.cancelAllPendingUpdates();

            // Unsubscribe from global rating listener
            if (this.globalRatingUnsubscribe) {
                this.globalRatingUnsubscribe();
                this.globalRatingUnsubscribe = null;
                console.log('Unsubscribed from global rating listener');
            }

            // Clear all listeners
            this.activeListeners.clear();

            // Clear update queue
            this.updateQueue.clear();

            console.log('RealtimeRatingService cleaned up successfully');
        } catch (error) {
            console.error('Error during RealtimeRatingService cleanup:', error);
        }
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getMetrics() {
        const history = this.calculationService.getCalculationHistory();
        const recentHistory = history.slice(-100); // Last 100 calculations

        return {
            totalListeners: this.activeListeners.size,
            pendingUpdates: this.debounceTimers.size,
            recentCalculations: recentHistory.length,
            averageCalculationTime: this.calculateAverageCalculationTime(recentHistory),
            cacheHitRate: this.calculateCacheHitRate(),
            mostActiveRestaurants: this.getMostActiveRestaurants(recentHistory)
        };
    }

    /**
     * Calculate average calculation time from history
     * @param {Array} history - Calculation history
     * @returns {number} Average time in milliseconds
     */
    calculateAverageCalculationTime(history) {
        if (history.length === 0) return 0;

        // This would need timing information to be added to calculation history
        // For now, return a placeholder
        return 150; // Placeholder: 150ms average
    }

    /**
     * Calculate cache hit rate
     * @returns {number} Cache hit rate percentage
     */
    calculateCacheHitRate() {
        const cacheStatus = this.calculationService.getCacheStatus();
        // This is a simplified calculation
        return cacheStatus.cacheSize > 0 ? 75 : 0; // Placeholder
    }

    /**
     * Get most active restaurants from history
     * @param {Array} history - Calculation history
     * @returns {Array} Most active restaurants
     */
    getMostActiveRestaurants(history) {
        const restaurantCounts = {};

        history.forEach(entry => {
            const restaurantId = entry.restaurantId;
            restaurantCounts[restaurantId] = (restaurantCounts[restaurantId] || 0) + 1;
        });

        return Object.entries(restaurantCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([restaurantId, count]) => ({
                restaurantId,
                calculationCount: count
            }));
    }
}