// js/services/rating-calculation-service.js - Mathematical calculation engine for ratings

/**
 * Rating Calculation Service - Handles all rating calculations with mathematical precision
 */
export class RatingCalculationService {
    constructor(storageService) {
        this.storageService = storageService;

        // Caching system for performance optimization
        this.calculationCache = new Map();
        this.cacheTimeout = 30000; // 30 seconds

        // History tracking for auditing
        this.calculationHistory = [];

        console.log('RatingCalculationService initialized');
    }

    /**
     * Calculate restaurant rating with comprehensive statistics
     * @param {string} restaurantId - Restaurant ID
     * @param {boolean} forceRefresh - Force refresh ignoring cache
     * @returns {Promise<Object>} Complete rating calculation
     */
    async calculateRestaurantRating(restaurantId, forceRefresh = false) {
        try {
            console.log(`Calculating rating for restaurant ${restaurantId}, forceRefresh: ${forceRefresh}`);

            // Check cache first
            const cacheKey = `restaurant_rating_${restaurantId}`;
            if (!forceRefresh && this.calculationCache.has(cacheKey)) {
                const cached = this.calculationCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    console.log(`Returning cached rating for restaurant ${restaurantId}`);
                    return cached.data;
                }
            }

            // Get all ratings for the restaurant
            const ratings = await this.getRestaurantRatings(restaurantId);
            console.log(`Found ${ratings.length} ratings for restaurant ${restaurantId}`);

            // Calculate comprehensive statistics
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

            console.log(`Calculated rating for restaurant ${restaurantId}:`, calculation);
            return calculation;
        } catch (error) {
            console.error('Error calculating restaurant rating:', error);
            throw error;
        }
    }

    /**
     * Get all ratings for a restaurant
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise<Array>} Array of rating objects
     */
    async getRestaurantRatings(restaurantId) {
        try {
            const ratings = await this.storageService.getRatingsByRestaurant(restaurantId);
            return ratings.map(rating => ({
                id: rating.id,
                rating: rating.rating,
                timestamp: rating.createdAt,
                userFingerprint: rating.userFingerprint,
                userName: rating.userName
            }));
        } catch (error) {
            console.error('Error getting restaurant ratings:', error);
            return [];
        }
    }

    /**
     * Perform comprehensive rating calculation
     * @param {Array} ratings - Array of rating objects
     * @returns {Object} Complete calculation result
     */
    performRatingCalculation(ratings) {
        if (ratings.length === 0) {
            return {
                averageQuality: 0,
                totalRatings: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                confidenceScore: 0,
                weightedAverage: 0,
                standardDeviation: 0,
                median: 0,
                mode: 0,
                lastUpdated: new Date().toISOString()
            };
        }

        // Calculate basic statistics
        const ratingValues = ratings.map(r => r.rating);
        const totalRating = ratingValues.reduce((sum, rating) => sum + rating, 0);
        const averageQuality = totalRating / ratingValues.length;

        // Calculate rating distribution
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach(rating => {
            ratingDistribution[rating.rating]++;
        });

        // Calculate advanced statistics
        const confidenceScore = this.calculateConfidenceScore(ratings.length);
        const weightedAverage = this.calculateWeightedAverage(ratings);
        const standardDeviation = this.calculateStandardDeviation(ratingValues, averageQuality);
        const median = this.calculateMedian(ratingValues);
        const mode = this.calculateMode(ratingValues);

        return {
            averageQuality: Math.round(averageQuality * 10) / 10, // Round to 1 decimal
            totalRatings: ratings.length,
            ratingDistribution,
            confidenceScore,
            weightedAverage: Math.round(weightedAverage * 10) / 10,
            standardDeviation: Math.round(standardDeviation * 100) / 100,
            median: Math.round(median * 10) / 10,
            mode: Math.round(mode),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Calculate confidence score based on number of ratings
     * @param {number} totalRatings - Total number of ratings
     * @returns {number} Confidence score (0-1)
     */
    calculateConfidenceScore(totalRatings) {
        if (totalRatings === 0) return 0;
        if (totalRatings === 1) return 0.3;
        if (totalRatings === 2) return 0.5;
        if (totalRatings === 3) return 0.7;
        if (totalRatings <= 5) return 0.8;
        if (totalRatings <= 10) return 0.9;
        return 1.0;
    }

    /**
     * Calculate weighted average (giving more weight to recent ratings)
     * @param {Array} ratings - Array of rating objects
     * @returns {number} Weighted average
     */
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

    /**
     * Calculate standard deviation
     * @param {Array} ratings - Array of rating values
     * @param {number} mean - Mean value
     * @returns {number} Standard deviation
     */
    calculateStandardDeviation(ratings, mean) {
        if (ratings.length === 0) return 0;

        const squaredDifferences = ratings.reduce((sum, rating) => {
            const difference = rating - mean;
            return sum + (difference * difference);
        }, 0);

        const variance = squaredDifferences / ratings.length;
        return Math.sqrt(variance);
    }

    /**
     * Calculate median value
     * @param {Array} ratings - Array of rating values
     * @returns {number} Median value
     */
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

    /**
     * Calculate mode (most frequent value)
     * @param {Array} ratings - Array of rating values
     * @returns {number} Mode value
     */
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

    /**
     * Update restaurant document with new rating calculation
     * @param {string} restaurantId - Restaurant ID
     * @param {Object} calculation - Calculation result
     */
    async updateRestaurantRating(restaurantId, calculation) {
        try {
            const updateData = {
                averageQuality: calculation.averageQuality,
                totalRatings: calculation.totalRatings,
                ratingDistribution: calculation.ratingDistribution,
                confidenceScore: calculation.confidenceScore,
                weightedAverage: calculation.weightedAverage,
                standardDeviation: calculation.standardDeviation,
                median: calculation.median,
                mode: calculation.mode,
                ratingLastUpdated: new Date().toISOString()
            };

            await this.storageService.updateRestaurantRatingOnly(restaurantId, updateData);
            console.log(`Updated restaurant ${restaurantId} with new rating calculation`);

            // Invalidate cache for this restaurant
            this.invalidateCache(restaurantId);
        } catch (error) {
            console.error('Error updating restaurant rating:', error);
            throw error;
        }
    }

    /**
     * Batch update multiple restaurants
     * @param {Array} restaurantIds - Array of restaurant IDs
     * @returns {Promise<Array>} Array of update results
     */
    async batchUpdateRestaurantRatings(restaurantIds) {
        try {
            console.log(`Batch updating ratings for ${restaurantIds.length} restaurants`);
            const results = [];

            for (const restaurantId of restaurantIds) {
                try {
                    const calculation = await this.calculateRestaurantRating(restaurantId, true);
                    results.push({ restaurantId, calculation, success: true });
                } catch (error) {
                    console.error(`Failed to update restaurant ${restaurantId}:`, error);
                    results.push({ restaurantId, error: error.message, success: false });
                }

                // Add small delay to avoid overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log(`Batch update completed: ${results.filter(r => r.success).length}/${results.length} successful`);
            return results;
        } catch (error) {
            console.error('Error in batch update:', error);
            throw error;
        }
    }

    /**
     * Recalculate all restaurant ratings
     * @returns {Promise<Array>} Array of all recalculation results
     */
    async recalculateAllRatings() {
        try {
            const restaurants = await this.storageService.getRestaurants();
            const restaurantIds = restaurants.map(r => r.id);

            console.log(`Recalculating ratings for ${restaurantIds.length} restaurants...`);
            return await this.batchUpdateRestaurantRatings(restaurantIds);
        } catch (error) {
            console.error('Error recalculating all ratings:', error);
            throw error;
        }
    }

    /**
     * Invalidate cache for a specific restaurant
     * @param {string} restaurantId - Restaurant ID
     */
    invalidateCache(restaurantId) {
        const cacheKey = `restaurant_rating_${restaurantId}`;
        this.calculationCache.delete(cacheKey);
    }

    /**
     * Clear all cached calculations
     */
    clearAllCache() {
        this.calculationCache.clear();
        console.log('All calculation cache cleared');
    }

    /**
     * Get cache status information
     * @returns {Object} Cache status
     */
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

    /**
     * Log calculation for auditing purposes
     * @param {string} restaurantId - Restaurant ID
     * @param {Object} calculation - Calculation result
     * @param {number} ratingsCount - Number of ratings used
     */
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
    }

    /**
     * Get calculation history
     * @param {string} restaurantId - Optional restaurant ID filter
     * @param {number} limit - Maximum number of entries to return
     * @returns {Array} Calculation history
     */
    getCalculationHistory(restaurantId = null, limit = 100) {
        let history = this.calculationHistory;

        if (restaurantId) {
            history = history.filter(entry => entry.restaurantId === restaurantId);
        }

        return history.slice(-limit);
    }

    /**
     * Get comprehensive restaurant rating statistics
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise<Object>} Comprehensive statistics
     */
    async getRestaurantRatingStatistics(restaurantId) {
        try {
            const calculation = await this.calculateRestaurantRating(restaurantId);
            const ratings = await this.getRestaurantRatings(restaurantId);

            return {
                ...calculation,
                recentRatings: this.getRecentRatings(ratings),
                ratingTrend: this.calculateRatingTrend(ratings),
                ratingConsistency: this.calculateRatingConsistency(ratings)
            };
        } catch (error) {
            console.error('Error getting restaurant rating statistics:', error);
            throw error;
        }
    }

    /**
     * Get recent ratings
     * @param {Array} ratings - Array of rating objects
     * @param {number} limit - Maximum number of recent ratings
     * @returns {Array} Recent ratings
     */
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

    /**
     * Calculate rating trend
     * @param {Array} ratings - Array of rating objects
     * @returns {string} Trend analysis result
     */
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

    /**
     * Calculate rating consistency
     * @param {Array} ratings - Array of rating objects
     * @returns {number} Consistency score (0-1)
     */
    calculateRatingConsistency(ratings) {
        if (ratings.length === 0) return 0;

        const values = ratings.map(r => r.rating);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const standardDeviation = Math.sqrt(variance);

        // Consistency score: lower standard deviation = higher consistency
        const maxPossibleStdDev = 2; // Maximum reasonable standard deviation for 1-5 scale
        return Math.max(0, 1 - (standardDeviation / maxPossibleStdDev));
    }

    /**
     * Cleanup method to clear resources
     */
    cleanup() {
        this.clearAllCache();
        this.calculationHistory = [];
        console.log('RatingCalculationService cleaned up');
    }
}