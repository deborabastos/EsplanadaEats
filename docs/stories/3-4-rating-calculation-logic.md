# Story 3.4: Rating Calculation Logic

## Status
Draft

## Story
**As a** user,
**I want** to see accurate and real-time updated rating averages for each restaurant,
**so that** I can make informed decisions based on community opinions.

## Acceptance Criteria
1. System must calculate rating averages with mathematical precision
2. Rating updates must reflect instantly in averages
3. Calculations must handle edge cases correctly (0 ratings, 1 rating)
4. System must prevent incorrect calculations due to concurrency
5. Averages must be rounded to 1 decimal place for better readability
6. Must implement cache to optimize frequent calculation performance
7. System must maintain change history for auditing
8. Calculations must work offline and sync when online
9. Must provide additional statistics (total ratings, distribution)

## Tasks / Subtasks
- [ ] Task 1: Implement mathematical calculation engine (AC: 1, 4)
  - [ ] Create precise average calculation algorithm
  - [ ] Implement concurrency-safe calculations
  - [ ] Add mathematical validation and accuracy checks
  - [ ] Handle floating-point precision issues
- [ ] Task 2: Create real-time update system (AC: 2)
  - [ ] Implement immediate average updates on rating changes
  - [ ] Add real-time synchronization across connected clients
  - [ ] Create efficient change propagation mechanisms
  - [ ] Ensure consistency across all views
- [ ] Task 3: Handle edge cases and boundaries (AC: 3)
  - [ ] Implement proper handling for zero ratings case
  - [ ] Add logic for single rating scenarios
  - [ ] Create validation for extreme rating distributions
  - [ ] Handle invalid or corrupted rating data
- [ ] Task 4: Develop caching and optimization (AC: 6)
  - [ ] Implement intelligent caching for calculated averages
  - [ ] Add cache invalidation strategies
  - [ ] Optimize calculation performance for high-frequency updates
  - [ ] Create cache warming mechanisms
- [ ] Task 5: Create auditing and history system (AC: 7)
  - [ ] Implement change logging for rating calculations
  - [ ] Add audit trail for all rating modifications
  - [ ] Create historical data retention policies
  - [ ] Add reporting and analytics capabilities
- [ ] Task 6: Implement offline functionality (AC: 8)
  - [ ] Create offline calculation capabilities
  - [ ] Add synchronization mechanisms for online state
  - [ ] Implement conflict resolution for concurrent updates
  - [ ] Ensure data consistency across offline/online transitions
- [ ] Task 7: Build statistics and analytics (AC: 9)
  - [ ] Calculate total ratings count
  - [ ] Implement rating distribution analysis
  - [ ] Add statistical insights and trends
  - [ ] Create performance metrics for rating systems

## Dev Notes
This story implements the core rating calculation logic that ensures mathematical precision, real-time updates, and robust handling of edge cases while maintaining data integrity and performance.
- [ ] Performance deve ser otimizada para grandes volumes de dados

## Technical Implementation

### Rating Calculation Service
```javascript
// services/RatingCalculationService.js
class RatingCalculationService {
  constructor(firebaseService) {
    this.firebaseService = firebaseService;
    this.calculationCache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
    this.calculationHistory = [];
  }

  async calculateRestaurantRating(restaurantId, forceRefresh = false) {
    try {
      // Check cache first
      const cacheKey = `restaurant_rating_${restaurantId}`;
      if (!forceRefresh && this.calculationCache.has(cacheKey)) {
        const cached = this.calculationCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Get all ratings for the restaurant
      const ratings = await this.getRestaurantRatings(restaurantId);

      // Calculate statistics
      const calculation = this.performRatingCalculation(ratings);

      // Update restaurant document with new rating
      await this.updateRestaurantRating(restaurantId, calculation);

      // Cache the result
      this.calculationCache.set(cacheKey, {
        data: calculation,
        timestamp: Date.now()
      });

      // Log calculation for audit
      this.logCalculation(restaurantId, calculation, ratings.length);

      return calculation;
    } catch (error) {
      console.error('Error calculating restaurant rating:', error);
      throw error;
    }
  }

  async getRestaurantRatings(restaurantId) {
    try {
      const snapshot = await this.firebaseService.db
        .collection('ratings')
        .where('restaurantId', '==', restaurantId)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting restaurant ratings:', error);
      return [];
    }
  }

  performRatingCalculation(ratings) {
    if (ratings.length === 0) {
      return {
        averageQuality: 0,
        totalRatings: 0,
        ratingDistribution: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        },
        confidenceScore: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    // Calculate basic statistics
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageQuality = totalRating / ratings.length;

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(rating => {
      ratingDistribution[rating.rating]++;
    });

    // Calculate confidence score based on number of ratings
    const confidenceScore = this.calculateConfidenceScore(ratings.length);

    // Calculate weighted average (giving more weight to recent ratings)
    const weightedAverage = this.calculateWeightedAverage(ratings);

    return {
      averageQuality: Math.round(averageQuality * 10) / 10, // Round to 1 decimal
      totalRatings: ratings.length,
      ratingDistribution,
      confidenceScore,
      weightedAverage: Math.round(weightedAverage * 10) / 10,
      standardDeviation: this.calculateStandardDeviation(ratings, averageQuality),
      median: this.calculateMedian(ratings.map(r => r.rating)),
      mode: this.calculateMode(ratings.map(r => r.rating)),
      lastUpdated: new Date().toISOString()
    };
  }

  calculateConfidenceScore(totalRatings) {
    // Confidence score based on number of ratings
    // More ratings = higher confidence
    if (totalRatings === 0) return 0;
    if (totalRatings === 1) return 0.3;
    if (totalRatings === 2) return 0.5;
    if (totalRatings === 3) return 0.7;
    if (totalRatings <= 5) return 0.8;
    if (totalRatings <= 10) return 0.9;
    return 1.0;
  }

  calculateWeightedAverage(ratings) {
    if (ratings.length === 0) return 0;

    const now = Date.now();
    let weightedSum = 0;
    let totalWeight = 0;

    ratings.forEach(rating => {
      const ratingTime = new Date(rating.timestamp).getTime();
      const ageInDays = (now - ratingTime) / (1000 * 60 * 60 * 24);

      // Weight decreases with age (half-life of 30 days)
      const weight = Math.pow(0.5, ageInDays / 30);

      weightedSum += rating.rating * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  calculateStandardDeviation(ratings, mean) {
    if (ratings.length === 0) return 0;

    const squaredDifferences = ratings.reduce((sum, rating) => {
      const difference = rating.rating - mean;
      return sum + (difference * difference);
    }, 0);

    const variance = squaredDifferences / ratings.length;
    return Math.sqrt(variance);
  }

  calculateMedian(ratings) {
    if (ratings.length === 0) return 0;

    const sorted = [...ratings].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  calculateMode(ratings) {
    if (ratings.length === 0) return 0;

    const frequency = {};
    ratings.forEach(rating => {
      frequency[rating] = (frequency[rating] || 0) + 1;
    });

    let maxFrequency = 0;
    let mode = 0;

    Object.keys(frequency).forEach(rating => {
      if (frequency[rating] > maxFrequency) {
        maxFrequency = frequency[rating];
        mode = parseInt(rating);
      }
    });

    return mode;
  }

  async updateRestaurantRating(restaurantId, calculation) {
    try {
      const restaurantRef = this.firebaseService.db
        .collection('restaurants')
        .doc(restaurantId);

      await restaurantRef.update({
        averageQuality: calculation.averageQuality,
        totalRatings: calculation.totalRatings,
        ratingDistribution: calculation.ratingDistribution,
        confidenceScore: calculation.confidenceScore,
        weightedAverage: calculation.weightedAverage,
        standardDeviation: calculation.standardDeviation,
        median: calculation.median,
        mode: calculation.mode,
        ratingLastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Invalidate cache for this restaurant
      this.invalidateCache(restaurantId);
    } catch (error) {
      console.error('Error updating restaurant rating:', error);
      throw error;
    }
  }

  async batchUpdateRestaurantRatings(restaurantIds) {
    try {
      const batch = this.firebaseService.db.batch();
      const updates = [];

      for (const restaurantId of restaurantIds) {
        const calculation = await this.calculateRestaurantRating(restaurantId, true);
        const restaurantRef = this.firebaseService.db
          .collection('restaurants')
          .doc(restaurantId);

        batch.update(restaurantRef, {
          averageQuality: calculation.averageQuality,
          totalRatings: calculation.totalRatings,
          ratingDistribution: calculation.ratingDistribution,
          confidenceScore: calculation.confidenceScore,
          weightedAverage: calculation.weightedAverage,
          standardDeviation: calculation.standardDeviation,
          median: calculation.median,
          mode: calculation.mode,
          ratingLastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });

        updates.push({ restaurantId, calculation });
      }

      await batch.commit();

      // Invalidate cache for all updated restaurants
      restaurantIds.forEach(id => this.invalidateCache(id));

      return updates;
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }

  async recalculateAllRatings() {
    try {
      // Get all restaurants
      const restaurantsSnapshot = await this.firebaseService.db
        .collection('restaurants')
        .get();

      const restaurantIds = restaurantsSnapshot.docs.map(doc => doc.id);

      console.log(`Recalculating ratings for ${restaurantIds.length} restaurants...`);

      // Process in batches to avoid overwhelming the system
      const batchSize = 50;
      const results = [];

      for (let i = 0; i < restaurantIds.length; i += batchSize) {
        const batch = restaurantIds.slice(i, i + batchSize);
        const batchResults = await this.batchUpdateRestaurantRatings(batch);
        results.push(...batchResults);

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < restaurantIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`Completed recalculation for ${results.length} restaurants`);
      return results;
    } catch (error) {
      console.error('Error recalculating all ratings:', error);
      throw error;
    }
  }

  invalidateCache(restaurantId) {
    const cacheKey = `restaurant_rating_${restaurantId}`;
    this.calculationCache.delete(cacheKey);
  }

  clearAllCache() {
    this.calculationCache.clear();
  }

  getCacheStatus() {
    return {
      cacheSize: this.calculationCache.size,
      cacheEntries: Array.from(this.calculationCache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        data: value.data
      }))
    };
  }

  logCalculation(restaurantId, calculation, ratingsCount) {
    const logEntry = {
      restaurantId,
      calculation,
      ratingsCount,
      timestamp: new Date().toISOString()
    };

    this.calculationHistory.push(logEntry);

    // Keep only last 1000 entries
    if (this.calculationHistory.length > 1000) {
      this.calculationHistory = this.calculationHistory.slice(-1000);
    }

    // Also log to Firebase for persistence
    this.firebaseService.logCalculationEvent(logEntry).catch(error => {
      console.error('Error logging calculation event:', error);
    });
  }

  getCalculationHistory(restaurantId = null, limit = 100) {
    let history = this.calculationHistory;

    if (restaurantId) {
      history = history.filter(entry => entry.restaurantId === restaurantId);
    }

    return history.slice(-limit);
  }

  async getRestaurantRatingStatistics(restaurantId) {
    try {
      const calculation = await this.calculateRestaurantRating(restaurantId);
      const ratings = await this.getRestaurantRatings(restaurantId);

      return {
        ...calculation,
        recentRatings: this.getRecentRatings(ratings),
        ratingTrend: this.calculateRatingTrend(ratings),
        topReviewers: this.getTopReviewers(ratings),
        ratingConsistency: this.calculateRatingConsistency(ratings)
      };
    } catch (error) {
      console.error('Error getting restaurant rating statistics:', error);
      throw error;
    }
  }

  getRecentRatings(ratings, limit = 10) {
    return ratings
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
      .map(rating => ({
        rating: rating.rating,
        timestamp: rating.timestamp,
        userFingerprint: rating.userFingerprint
      }));
  }

  calculateRatingTrend(ratings) {
    if (ratings.length < 2) return 'insufficient_data';

    const sortedRatings = ratings.sort((a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    const firstHalf = sortedRatings.slice(0, Math.floor(sortedRatings.length / 2));
    const secondHalf = sortedRatings.slice(Math.floor(sortedRatings.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.rating, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.rating, 0) / secondHalf.length;

    const difference = secondHalfAvg - firstHalfAvg;

    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }

  getTopReviewers(ratings, limit = 5) {
    const reviewerCounts = {};

    ratings.forEach(rating => {
      const fingerprint = rating.userFingerprint;
      reviewerCounts[fingerprint] = (reviewerCounts[fingerprint] || 0) + 1;
    });

    return Object.entries(reviewerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([fingerprint, count]) => ({
        fingerprint,
        count
      }));
  }

  calculateRatingConsistency(ratings) {
    if (ratings.length === 0) return 0;

    const values = ratings.map(r => r.rating);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    // Consistency score: lower standard deviation = higher consistency
    // Normalize to 0-1 scale
    const maxPossibleStdDev = 2; // Maximum reasonable standard deviation for 1-5 scale
    return Math.max(0, 1 - (standardDeviation / maxPossibleStdDev));
  }
}

// Export for use in other components
window.RatingCalculationService = RatingCalculationService;
```

### Real-time Rating Updates
```javascript
// services/RealtimeRatingService.js
class RealtimeRatingService {
  constructor(firebaseService, calculationService) {
    this.firebaseService = firebaseService;
    this.calculationService = calculationService;
    this.activeListeners = new Map();
    this.updateQueue = new Map();
    this.debounceTimers = new Map();
  }

  setupRealtimeUpdates() {
    // Listen for new ratings
    this.firebaseService.db
      .collection('ratings')
      .onSnapshot(this.handleRatingUpdate.bind(this));

    // Listen for rating updates
    this.firebaseService.db
      .collection('ratings')
      .onSnapshot(this.handleRatingUpdate.bind(this));
  }

  async handleRatingUpdate(snapshot) {
    const changedRestaurants = new Set();

    snapshot.docChanges().forEach(change => {
      if (change.type === 'added' || change.type === 'modified') {
        const rating = change.doc.data();
        changedRestaurants.add(rating.restaurantId);
      }
    });

    // Process changed restaurants with debouncing
    changedRestaurants.forEach(restaurantId => {
      this.debouncedUpdate(restaurantId);
    });
  }

  debouncedUpdate(restaurantId) {
    // Clear existing timer
    if (this.debounceTimers.has(restaurantId)) {
      clearTimeout(this.debounceTimers.get(restaurantId));
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.processRestaurantUpdate(restaurantId);
      this.debounceTimers.delete(restaurantId);
    }, 1000); // 1 second debounce

    this.debounceTimers.set(restaurantId, timer);
  }

  async processRestaurantUpdate(restaurantId) {
    try {
      const calculation = await this.calculationService.calculateRestaurantRating(
        restaurantId,
        true // Force refresh
      );

      // Notify listeners
      this.notifyRatingUpdate(restaurantId, calculation);
    } catch (error) {
      console.error('Error processing restaurant update:', error);
    }
  }

  subscribeToRestaurantUpdates(restaurantId, callback) {
    const listenerId = `${restaurantId}_${Date.now()}_${Math.random()}`;

    this.activeListeners.set(listenerId, {
      restaurantId,
      callback
    });

    // Return unsubscribe function
    return () => {
      this.activeListeners.delete(listenerId);
    };
  }

  notifyRatingUpdate(restaurantId, calculation) {
    this.activeListeners.forEach((listener, listenerId) => {
      if (listener.restaurantId === restaurantId) {
        try {
          listener.callback(calculation);
        } catch (error) {
          console.error('Error in rating update callback:', error);
        }
      }
    });

    // Also dispatch global event
    const event = new CustomEvent('restaurantRatingUpdated', {
      detail: {
        restaurantId,
        calculation
      }
    });

    document.dispatchEvent(event);
  }

  unsubscribeAll() {
    this.activeListeners.clear();
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

// Export for use in other components
window.RealtimeRatingService = RealtimeRatingService;
```

### Enhanced Rating Form with Real-time Updates
```javascript
// components/RatingForm.js (enhanced)
class RatingForm {
  constructor(restaurantId, restaurantName, firebaseService) {
    // ... existing constructor code ...

    this.calculationService = new RatingCalculationService(firebaseService);
    this.realtimeService = new RealtimeRatingService(firebaseService, this.calculationService);

    this.setupRealtimeUpdates();
  }

  setupRealtimeUpdates() {
    // Listen for rating updates
    this.realtimeService.subscribeToRestaurantUpdates(
      this.restaurantId,
      this.handleRatingUpdate.bind(this)
    );
  }

  handleRatingUpdate(calculation) {
    // Update the UI with new rating information
    this.updateRatingDisplay(calculation);
  }

  updateRatingDisplay(calculation) {
    // Update rating stars and statistics
    const ratingDisplay = document.querySelector('.rating-display');
    if (ratingDisplay) {
      ratingDisplay.innerHTML = this.renderRatingDisplay(calculation);
    }
  }

  renderRatingDisplay(calculation) {
    const { averageQuality, totalRatings, confidenceScore } = calculation;

    if (totalRatings === 0) {
      return '<div class="no-rating">Sem avaliações</div>';
    }

    const fullStars = Math.floor(averageQuality);
    const hasHalfStar = averageQuality % 1 !== 0;
    let starsHtml = '';

    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<span class="star filled">★</span>';
    }

    if (hasHalfStar) {
      starsHtml += '<span class="star half">☆</span>';
    }

    const emptyStars = 5 - Math.ceil(averageQuality);
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<span class="star empty">☆</span>';
    }

    return `
      <div class="rating-display">
        <div class="rating-stars">${starsHtml}</div>
        <div class="rating-info">
          <span class="rating-value">${averageQuality.toFixed(1)}</span>
          <span class="rating-count">(${totalRatings})</span>
          ${confidenceScore < 0.8 ? '<span class="confidence-low">⚠️</span>' : ''}
        </div>
      </div>
    `;
  }

  // ... rest of existing methods ...
}
```

### Testing
**Testing Checklist:**
- Average calculation works correctly for various rating counts
- Weighted average calculation considers rating age
- Statistical calculations (median, mode, standard deviation) are accurate
- Real-time updates work when ratings are added/modified
- Debouncing prevents excessive calculations
- Cache improves performance for repeated calculations
- Batch updates work efficiently for multiple restaurants
- Confidence score reflects rating reliability
- Rating trend analysis provides meaningful insights
- System handles edge cases (0 ratings, 1 rating, extreme values)
- Performance is optimized for large datasets

### Dependencies
- Story 3.1: User Identification System for tracking ratings
- Story 3.2: Rating Form & Interface for user input
- Story 3.3: Rating Validation & Rules for data integrity
- Story 0.2: Firebase Service for data storage
- Story 3.5: Rating Display System for UI updates

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-30 | 1.0 | Initial story creation with BMad framework | Dev Agent |

## Dev Agent Record

### Agent Model Used
*To be populated by development agent*

### Debug Log References
*To be populated by development agent*

### Completion Notes List
*To be populated by development agent*

### File List
*To be populated by development agent*

## QA Results
*To be populated by QA agent*