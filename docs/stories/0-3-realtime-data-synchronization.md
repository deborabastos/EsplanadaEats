# Story 0.3: Real-time Data Synchronization

**As a developer, I want to implement real-time data synchronization, so that users see live updates from other users.**

## Overview
This story implements real-time data synchronization capabilities that enable collaborative features, allowing multiple users to see live updates from other users' actions.

## Acceptance Criteria

### AC 3.1: Real-time listeners for restaurants collection implemented
- [ ] Create real-time listener for restaurants collection changes
- [ ] Implement snapshot listener for document additions
- [ ] Implement snapshot listener for document modifications
- [ ] Implement snapshot listener for document deletions
- [ ] Handle initial data load and subsequent updates separately

### AC 3.2: Real-time listeners for reviews collection implemented
- [ ] Create real-time listener for reviews collection changes
- [ ] Implement query listeners for restaurant-specific reviews
- [ ] Handle review additions, modifications, and deletions
- [ ] Set up efficient queries to avoid unnecessary data loading
- [ ] Implement batch processing for multiple review updates

### AC 3.3: UI automatically updates when data changes
- [ ] Connect real-time listeners to UI update functions
- [ ] Implement smooth transitions for data changes
- [ ] Prevent UI flickering during rapid updates
- [ ] Update restaurant ratings in real-time when new reviews are added
- [ ] Refresh restaurant list automatically when new restaurants are added

### AC 3.4: Connection state management for online/offline scenarios
- [ ] Implement Firebase connection state monitoring
- [ ] Show online/offline status indicators to users
- [ ] Handle automatic reconnection when connection is restored
- [ ] Queue offline operations for automatic sync when online
- [ ] Provide user feedback for pending operations

### AC 3.5: Conflict resolution for concurrent updates implemented
- [ ] Implement optimistic updates for better user experience
- [ ] Handle server timestamp conflicts
- [ ] Create conflict resolution strategy for concurrent rating updates
- [ ] Implement merge strategies for concurrent restaurant modifications
- [ ] Provide user feedback for resolved conflicts

### AC 3.6: Performance optimization for real-time updates
- [ ] Implement debouncing for rapid successive updates
- [ ] Use efficient query patterns to minimize data transfer
- [ ] Cache data locally to reduce redundant requests
- [ ] Implement pagination for large collections
- [ ] Optimize UI rendering for frequent updates

## Technical Implementation Details

### Real-time Listeners Implementation
```javascript
// Real-time service module
class RealtimeService {
  constructor() {
    this.restaurantsListener = null;
    this.reviewsListeners = new Map();
    this.connectionState = 'online';
  }

  // Restaurant collection listener
  setupRestaurantsListener(callback) {
    this.restaurantsListener = db.collection('restaurants')
      .onSnapshot((snapshot) => {
        const changes = snapshot.docChanges();
        this.processRestaurantChanges(changes, callback);
      }, (error) => {
        this.handleListenerError(error, 'restaurants');
      });
  }

  // Reviews listener for specific restaurant
  setupReviewsListener(restaurantId, callback) {
    const listener = db.collection('reviews')
      .where('restaurantId', '==', restaurantId)
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const reviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(reviews);
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
          break;
        case 'modified':
          updates.modified.push(restaurant);
          break;
        case 'removed':
          updates.removed.push(restaurant);
          break;
      }
    });

    callback(updates);
  }
}
```

### Connection State Management
```javascript
// Connection state monitoring
class ConnectionManager {
  constructor() {
    this.setupConnectionMonitoring();
    this.offlineQueue = [];
  }

  setupConnectionMonitoring() {
    // Firebase connection state
    firebase.database().ref('.info/connected').on('value', (snapshot) => {
      this.handleConnectionChange(snapshot.val());
    });

    // Network connectivity
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  handleConnectionChange(connected) {
    this.connectionState = connected ? 'online' : 'offline';
    this.updateConnectionUI();

    if (connected) {
      this.processOfflineQueue();
    }
  }

  handleOnline() {
    if (this.connectionState === 'offline') {
      this.connectionState = 'online';
      this.updateConnectionUI();
      this.processOfflineQueue();
    }
  }

  handleOffline() {
    this.connectionState = 'offline';
    this.updateConnectionUI();
    this.enableOfflineMode();
  }

  updateConnectionUI() {
    const indicator = document.getElementById('connection-indicator');
    if (indicator) {
      indicator.className = this.connectionState;
      indicator.textContent = this.connectionState === 'online' ? 'Online' : 'Offline';
    }
  }
}
```

### Conflict Resolution
```javascript
// Conflict resolution for concurrent updates
class ConflictResolver {
  // Optimistic update with rollback
  async optimisticUpdate(docRef, updateData, originalData) {
    try {
      // Apply update locally first
      await docRef.update(updateData);

      // Listen for server confirmation
      return new Promise((resolve, reject) => {
        const unsubscribe = docRef.onSnapshot((doc) => {
          if (doc.exists) {
            const serverData = doc.data();
            if (this.dataMatches(updateData, serverData)) {
              // Update successful
              unsubscribe();
              resolve(serverData);
            } else {
              // Conflict detected, resolve it
              this.resolveConflict(docRef, updateData, serverData, originalData);
              unsubscribe();
              resolve(serverData);
            }
          }
        });
      });
    } catch (error) {
      // Rollback on error
      await docRef.set(originalData);
      throw error;
    }
  }

  // Simple conflict resolution strategy
  resolveConflict(docRef, localUpdate, serverData, originalData) {
    // For ratings, use the latest timestamp
    if (localUpdate.rating !== undefined) {
      const localTime = localUpdate.updatedAt;
      const serverTime = serverData.updatedAt;

      if (localTime > serverTime) {
        // Local update is newer, reapply
        return docRef.update(localUpdate);
      }
      // Server version wins, update local state
      return serverData;
    }

    // For other fields, merge changes
    const mergedData = { ...serverData, ...localUpdate };
    return docRef.update(mergedData);
  }
}
```

### Performance Optimization
```javascript
// Debounced updates for performance
class PerformanceOptimizer {
  constructor() {
    this.updateQueue = [];
    this.debounceTimer = null;
  }

  // Debounce rapid UI updates
  debounceUpdate(updateFunction, delay = 100) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      updateFunction();
    }, delay);
  }

  // Batch multiple updates
  batchUpdates(updates) {
    return db.batch().commit(updates);
  }

  // Efficient query with caching
  getCachedQuery(queryKey, queryBuilder) {
    const cached = this.cache.get(queryKey);
    if (cached) {
      return Promise.resolve(cached);
    }

    return queryBuilder().then(data => {
      this.cache.set(queryKey, data);
      return data;
    });
  }
}
```

## Dependencies
- Story 0.2: Firebase SDK Integration (must be completed first)
- Firebase services properly initialized
- UI framework capable of dynamic updates

## Success Metrics
- Real-time updates work within 2 seconds of data changes
- UI updates are smooth without flickering
- Offline mode properly queues and syncs operations
- Connection state is accurately reflected in UI
- Conflict resolution handles concurrent updates gracefully
- Performance remains good even with frequent updates

## Testing Approach
1. **Real-time Update Test**: Verify data changes propagate to all connected users
2. **Offline Mode Test**: Test queuing and sync when connection is lost/restored
3. **Conflict Resolution Test**: Simulate concurrent updates to verify conflict handling
4. **Performance Test**: Measure update latency and UI responsiveness
5. **Connection State Test**: Verify accurate online/offline state management

## Notes
- Uses Firebase's built-in real-time capabilities with Firestore
- Implements optimistic updates for better user experience
- Includes comprehensive error handling for network issues
- Performance optimizations ensure smooth user experience even with frequent updates
- Connection state management provides clear feedback to users