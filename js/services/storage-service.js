// js/services/storage-service.js - Complete storage management service

import { RestaurantModel } from '../models/restaurant.js?v=1.0.2';
import { RatingModel } from '../models/rating.js';
import { UserTrackingModel } from '../models/user-tracking.js';
import { getFirebaseServices, handleFirebaseError, retryOperation } from '../modules/firebase.js';

/**
 * Storage Service - Handles all CRUD operations for data models
 */
export class StorageService {
    constructor(firebaseApp) {
        this.firebaseApp = firebaseApp;
        const { db, storage } = getFirebaseServices();
        this.db = db;
        this.storage = storage;

        // Collection references
        this.restaurantsCollection = db.collection('restaurants');
        this.ratingsCollection = db.collection('ratings');
        this.userTrackingCollection = db.collection('userTracking');

        // Active listeners for cleanup
        this.activeListeners = new Map();

        console.log('StorageService initialized successfully - v2.1 (VALIDATION SUPPORT)');

        // Debug: Verify validation methods are available
        console.log('StorageService validation methods available:', {
            getRatingsByUser: typeof this.getRatingsByUser,
            getUserRating: typeof this.getUserRating,
            logSecurityEvent: typeof this.logSecurityEvent,
            getSecurityLogs: typeof this.getSecurityLogs
        });
    }

    // ==================== RESTAURANT CRUD OPERATIONS ====================

    /**
     * Create a new restaurant
     * @param {Object} restaurantData - Restaurant data
     * @returns {Promise<string>} Restaurant ID
     */
    async createRestaurant(restaurantData) {
        try {
            console.log('Creating restaurant:', restaurantData);

            const restaurant = new RestaurantModel(restaurantData);
            const errors = restaurant.validate();

            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            const docRef = await retryOperation(async () => {
                return this.restaurantsCollection.add(restaurant.toFirestore());
            });

            console.log('Restaurant created successfully:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Failed to create restaurant:', error);
            console.error('Firebase error code:', error.code);
            console.error('Firebase error message:', error.message);
            const errorMessage = handleFirebaseError(error);
            console.error('Processed error message:', errorMessage);
            throw new Error(errorMessage);
        }
    }

    /**
     * Get all restaurants with optional filtering
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of RestaurantModel instances
     */
    async getRestaurants(options = {}) {
        try {
            console.log('Fetching restaurants with options:', options);

            const {
                orderBy = 'averageOverall',
                orderDirection = 'desc',
                limit = 50,
                where = null,
                startAfter = null
            } = options;

            let query = this.restaurantsCollection;

            // Apply where clauses
            if (where) {
                where.forEach(clause => {
                    query = query.where(clause.field, clause.operator, clause.value);
                });
            }

            // Apply ordering
            query = query.orderBy(orderBy, orderDirection);

            // Apply pagination
            if (startAfter) {
                query = query.startAfter(startAfter);
            }

            // Apply limit
            if (limit) {
                query = query.limit(limit);
            }

            const snapshot = await retryOperation(async () => {
                return query.get();
            });

            const restaurants = snapshot.docs.map(doc => RestaurantModel.fromFirestore(doc));
            console.log(`Found ${restaurants.length} restaurants`);

            return restaurants;
        } catch (error) {
            console.error('Failed to get restaurants:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Get a single restaurant by ID
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise<RestaurantModel>} Restaurant model instance
     */
    async getRestaurant(restaurantId) {
        try {
            console.log(`Fetching restaurant: ${restaurantId}`);

            if (!restaurantId) {
                throw new Error('ID do restaurante é obrigatório');
            }

            const doc = await retryOperation(async () => {
                return this.restaurantsCollection.doc(restaurantId).get();
            });

            if (!doc.exists) {
                throw new Error('Restaurante não encontrado');
            }

            const restaurant = RestaurantModel.fromFirestore(doc);
            console.log('Restaurant found:', restaurant.name);

            return restaurant;
        } catch (error) {
            console.error('Failed to get restaurant:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Update an existing restaurant
     * @param {string} restaurantId - Restaurant ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<RestaurantModel>} Updated restaurant model
     */
    async updateRestaurant(restaurantId, updates) {
        try {
            console.log(`Updating restaurant ${restaurantId}:`, updates);

            const existingRestaurant = await this.getRestaurant(restaurantId);
            const updatedRestaurant = existingRestaurant.update(updates);

            const errors = updatedRestaurant.validate();
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            await retryOperation(async () => {
                return this.restaurantsCollection.doc(restaurantId).update(updatedRestaurant.toFirestore());
            });

            console.log('Restaurant updated successfully');
            return updatedRestaurant;
        } catch (error) {
            console.error('Failed to update restaurant:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Update restaurant photo URLs with relaxed validation
     * @param {string} restaurantId - Restaurant ID
     * @param {Array} photoUrls - Array of photo URLs
     * @returns {Promise<boolean>} True if successful
     */
    async updateRestaurantPhotos(restaurantId, photoUrls) {
        try {
            console.log(`Updating photos for restaurant ${restaurantId}:`, photoUrls);

            if (!restaurantId) {
                throw new Error('Restaurant ID is required');
            }

            if (!Array.isArray(photoUrls)) {
                throw new Error('Photo URLs must be an array');
            }

            // Create minimal update data with only photo URLs and timestamp
            const updateData = {
                photoUrls: photoUrls,
                updatedAt: new Date()
            };

            // Use direct Firestore update to bypass full model validation
            await retryOperation(async () => {
                return this.restaurantsCollection.doc(restaurantId).update(updateData);
            });

            console.log('Restaurant photos updated successfully');
            return true;
        } catch (error) {
            console.error('Failed to update restaurant photos:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Delete a restaurant and associated data
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise<boolean>} True if successful
     */
    async deleteRestaurant(restaurantId) {
        try {
            console.log(`Deleting restaurant: ${restaurantId}`);

            // Get restaurant to check for photos
            const restaurant = await this.getRestaurant(restaurantId);

            // Delete associated data in a batch
            const batch = this.db.batch();

            // Delete associated ratings
            const ratingsSnapshot = await this.ratingsCollection
                .where('restaurantId', '==', restaurantId)
                .get();

            ratingsSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            // Delete user tracking records
            const trackingSnapshot = await this.userTrackingCollection
                .where('restaurantId', '==', restaurantId)
                .get();

            trackingSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            // Delete restaurant document
            const restaurantRef = this.restaurantsCollection.doc(restaurantId);
            batch.delete(restaurantRef);

            await retryOperation(async () => {
                return batch.commit();
            });

            // Delete photos from storage if they exist
            if (restaurant.hasPhotos()) {
                await this.deleteRestaurantPhotos(restaurant);
            }

            console.log('Restaurant deleted successfully');
            return true;
        } catch (error) {
            console.error('Failed to delete restaurant:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    // ==================== RATING CRUD OPERATIONS ====================

    /**
     * Create a new rating
     * @param {Object} ratingData - Rating data
     * @returns {Promise<string>} Rating ID
     */
    async createRating(ratingData) {
        try {
            const rating = new RatingModel(ratingData);
            const errors = rating.validate();

            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            // Check for duplicate ratings
            await this.checkDuplicateRating(rating.userId, rating.userFingerprint, rating.restaurantId);

            const docRef = await retryOperation(async () => {
                return this.ratingsCollection.add(rating.toFirestore());
            });

            // Update user tracking
            await this.updateUserTracking(rating.userId, rating.userFingerprint, rating.restaurantId, 'review');

            // Update restaurant average rating
            await this.updateRestaurantAverageRating(rating.restaurantId);

            console.log('Rating created successfully:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Failed to create rating:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Get ratings for a restaurant
     * @param {string} restaurantId - Restaurant ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of RatingModel instances
     */
    async getRatingsByRestaurant(restaurantId, options = {}) {
        try {
            console.log(`Fetching ratings for restaurant: ${restaurantId}`);

            const {
                orderBy = 'createdAt',
                orderDirection = 'desc',
                limit = 50,
                approvedOnly = true
            } = options;

            let query = this.ratingsCollection
                .where('restaurantId', '==', restaurantId);

            // Filter by moderation status if requested
            if (approvedOnly) {
                query = query.where('moderationStatus', '==', 'approved');
                query = query.where('isReported', '==', false);
            }

            // Apply ordering and limit
            query = query.orderBy(orderBy, orderDirection);
            if (limit) {
                query = query.limit(limit);
            }

            const snapshot = await retryOperation(async () => {
                return query.get();
            });

            const ratings = snapshot.docs.map(doc => RatingModel.fromFirestore(doc));
            console.log(`Found ${ratings.length} ratings for restaurant ${restaurantId}`);

            return ratings;
        } catch (error) {
            console.error('Failed to get ratings:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Get a single rating by ID
     * @param {string} ratingId - Rating ID
     * @returns {Promise<RatingModel>} Rating model instance
     */
    async getRating(ratingId) {
        try {
            console.log(`Fetching rating: ${ratingId}`);

            if (!ratingId) {
                throw new Error('ID da avaliação é obrigatório');
            }

            const doc = await retryOperation(async () => {
                return this.ratingsCollection.doc(ratingId).get();
            });

            if (!doc.exists) {
                throw new Error('Avaliação não encontrada');
            }

            const rating = RatingModel.fromFirestore(doc);
            console.log('Rating found for restaurant:', rating.restaurantId);

            return rating;
        } catch (error) {
            console.error('Failed to get rating:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Update an existing rating
     * @param {string} ratingId - Rating ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<RatingModel>} Updated rating model
     */
    async updateRating(ratingId, updates) {
        try {
            console.log(`Updating rating ${ratingId}:`, updates);

            const existingRating = await this.getRating(ratingId);
            const updatedRating = existingRating.update(updates);

            const errors = updatedRating.validate();
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            await retryOperation(async () => {
                return this.ratingsCollection.doc(ratingId).update(updatedRating.toFirestore());
            });

            // Update restaurant average rating if rating criteria changed
            const ratingFields = ['quality', 'taste', 'priceRating', 'ambiance', 'service'];
            const criteriaChanged = ratingFields.some(field => updates.hasOwnProperty(field));

            if (criteriaChanged) {
                await this.updateRestaurantAverageRating(updatedRating.restaurantId);
            }

            console.log('Rating updated successfully');
            return updatedRating;
        } catch (error) {
            console.error('Failed to update rating:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Delete a rating
     * @param {string} ratingId - Rating ID
     * @returns {Promise<boolean>} True if successful
     */
    async deleteRating(ratingId) {
        try {
            console.log(`Deleting rating: ${ratingId}`);

            const rating = await this.getRating(ratingId);
            const restaurantId = rating.restaurantId;

            await retryOperation(async () => {
                return this.ratingsCollection.doc(ratingId).delete();
            });

            // Update user tracking
            await this.updateUserTrackingAfterRatingDeletion(rating.userId, rating.userFingerprint, restaurantId);

            // Update restaurant average rating
            await this.updateRestaurantAverageRating(restaurantId);

            console.log('Rating deleted successfully');
            return true;
        } catch (error) {
            console.error('Failed to delete rating:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    // ==================== USER TRACKING CRUD OPERATIONS ====================

    /**
     * Create or update user tracking record
     * @param {Object} trackingData - User tracking data
     * @returns {Promise<string>} Tracking ID
     */
    async createOrUpdateUserTracking(trackingData) {
        try {
            console.log('Creating/updating user tracking:', trackingData);

            const tracking = new UserTrackingModel(trackingData);
            const errors = tracking.validate();

            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            // Check if tracking record already exists
            const existingDoc = await this.findUserTrackingRecord(
                tracking.userId,
                tracking.userFingerprint,
                tracking.restaurantId
            );

            if (existingDoc) {
                // Update existing record
                const updatedTracking = new UserTrackingModel({
                    ...tracking,
                    id: existingDoc.id,
                    createdAt: existingDoc.createdAt,
                    updatedAt: new Date()
                });

                await retryOperation(async () => {
                    return this.userTrackingCollection.doc(existingDoc.id).update(updatedTracking.toFirestore());
                });

                console.log('User tracking updated successfully');
                return existingDoc.id;
            } else {
                // Create new record
                const docRef = await retryOperation(async () => {
                    return this.userTrackingCollection.add(tracking.toFirestore());
                });

                console.log('User tracking created successfully');
                return docRef.id;
            }
        } catch (error) {
            console.error('Failed to create/update user tracking:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Get user tracking records
     * @param {string} userId - User ID
     * @param {string} userFingerprint - User fingerprint
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of UserTrackingModel instances
     */
    async getUserTracking(userId, userFingerprint, options = {}) {
        try {
            console.log('Fetching user tracking records');

            let query = this.userTrackingCollection;

            // Apply user filter
            if (userId) {
                query = query.where('userId', '==', userId);
            } else if (userFingerprint) {
                query = query.where('userFingerprint', '==', userFingerprint);
            } else {
                throw new Error('ID do usuário ou fingerprint é obrigatório');
            }

            // Apply additional filters
            if (options.restaurantId) {
                query = query.where('restaurantId', '==', options.restaurantId);
            }

            if (options.hasReviewed !== undefined) {
                query = query.where('hasReviewed', '==', options.hasReviewed);
            }

            if (options.isFavorite !== undefined) {
                query = query.where('isFavorite', '==', options.isFavorite);
            }

            // Apply ordering
            query = query.orderBy('lastInteraction', 'desc');

            // Apply limit
            if (options.limit) {
                query = query.limit(options.limit);
            }

            const snapshot = await retryOperation(async () => {
                return query.get();
            });

            const trackingRecords = snapshot.docs.map(doc => UserTrackingModel.fromFirestore(doc));
            console.log(`Found ${trackingRecords.length} tracking records`);

            return trackingRecords;
        } catch (error) {
            console.error('Failed to get user tracking:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    // ==================== REAL-TIME LISTENERS ====================

    /**
     * Set up real-time listener for restaurants
     * @param {Function} callback - Callback function
     * @param {Object} options - Query options
     * @returns {Function} Unsubscribe function
     */
    setupRestaurantsListener(callback, options = {}) {
        try {
            console.log('Setting up restaurants real-time listener');

            const {
                orderBy = 'averageOverall',
                orderDirection = 'desc',
                limit = 50,
                where = null
            } = options;

            let query = this.restaurantsCollection;

            // Apply filters
            if (where) {
                where.forEach(clause => {
                    query = query.where(clause.field, clause.operator, clause.value);
                });
            }

            // Apply ordering and limit
            query = query.orderBy(orderBy, orderDirection);
            if (limit) {
                query = query.limit(limit);
            }

            const unsubscribe = query.onSnapshot(
                snapshot => {
                    const restaurants = snapshot.docs.map(doc => RestaurantModel.fromFirestore(doc));
                    callback(restaurants, snapshot.docChanges());
                },
                error => {
                    console.error('Restaurants listener error:', error);
                    const errorMessage = handleFirebaseError(error);
                    callback([], [], error);
                }
            );

            // Store listener for cleanup
            const listenerId = `restaurants_${Date.now()}`;
            this.activeListeners.set(listenerId, unsubscribe);

            console.log('Restaurants listener set up successfully');
            return unsubscribe;
        } catch (error) {
            console.error('Failed to set up restaurants listener:', error);
            throw error;
        }
    }

    /**
     * Set up real-time listener for ratings
     * @param {string} restaurantId - Restaurant ID
     * @param {Function} callback - Callback function
     * @param {Object} options - Query options
     * @returns {Function} Unsubscribe function
     */
    setupRatingsListener(restaurantId, callback, options = {}) {
        try {
            console.log(`Setting up ratings listener for restaurant: ${restaurantId}`);

            const {
                orderBy = 'createdAt',
                orderDirection = 'desc',
                limit = 50,
                approvedOnly = true
            } = options;

            let query = this.ratingsCollection
                .where('restaurantId', '==', restaurantId);

            // Apply moderation filter
            if (approvedOnly) {
                query = query.where('moderationStatus', '==', 'approved');
                query = query.where('isReported', '==', false);
            }

            // Apply ordering and limit
            query = query.orderBy(orderBy, orderDirection);
            if (limit) {
                query = query.limit(limit);
            }

            const unsubscribe = query.onSnapshot(
                snapshot => {
                    const ratings = snapshot.docs.map(doc => RatingModel.fromFirestore(doc));
                    callback(ratings, snapshot.docChanges());
                },
                error => {
                    console.error('Ratings listener error:', error);
                    const errorMessage = handleFirebaseError(error);
                    callback([], [], error);
                }
            );

            // Store listener for cleanup
            const listenerId = `ratings_${restaurantId}_${Date.now()}`;
            this.activeListeners.set(listenerId, unsubscribe);

            console.log('Ratings listener set up successfully');
            return unsubscribe;
        } catch (error) {
            console.error('Failed to set up ratings listener:', error);
            throw error;
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check for duplicate rating
     * @param {string} userId - User ID
     * @param {string} userFingerprint - User fingerprint
     * @param {string} restaurantId - Restaurant ID
     * @param {Object} options - Duplicate check options
     */
    async checkDuplicateRating(userId, userFingerprint, restaurantId, options = {}) {
        try {
            const existingTracking = await this.findUserTrackingRecord(userId, userFingerprint, restaurantId);

            if (UserTrackingModel.isDuplicateReviewAttempt(existingTracking, options)) {
                throw new Error('Você já avaliou este restaurante recentemente');
            }
        } catch (error) {
            console.error('Error checking duplicate rating:', error);
            throw error;
        }
    }

    /**
     * Find existing user tracking record
     * @param {string} userId - User ID
     * @param {string} userFingerprint - User fingerprint
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise<Object|null>} Tracking record or null
     */
    async findUserTrackingRecord(userId, userFingerprint, restaurantId) {
        try {
            let query = this.userTrackingCollection
                .where('restaurantId', '==', restaurantId);

            if (userId) {
                query = query.where('userId', '==', userId);
            } else if (userFingerprint) {
                query = query.where('userFingerprint', '==', userFingerprint);
            } else {
                return null;
            }

            const snapshot = await query.limit(1).get();
            return snapshot.empty ? null : UserTrackingModel.fromFirestore(snapshot.docs[0]);
        } catch (error) {
            console.error('Error finding user tracking record:', error);
            return null;
        }
    }

    /**
     * Update user tracking after review
     * @param {string} userId - User ID
     * @param {string} userFingerprint - User fingerprint
     * @param {string} restaurantId - Restaurant ID
     * @param {string} interactionType - Type of interaction
     */
    async updateUserTracking(userId, userFingerprint, restaurantId, interactionType = 'review') {
        try {
            const existingTracking = await this.findUserTrackingRecord(userId, userFingerprint, restaurantId);

            if (existingTracking) {
                const updatedTracking = existingTracking.recordInteraction(interactionType);
                await this.userTrackingCollection.doc(existingTracking.id).update(updatedTracking.toFirestore());
            } else {
                const newTracking = new UserTrackingModel({
                    userId,
                    userFingerprint,
                    restaurantId,
                    interactionType
                }).recordInteraction(interactionType);

                await this.userTrackingCollection.add(newTracking.toFirestore());
            }

            console.log('User tracking updated successfully');
        } catch (error) {
            console.error('Error updating user tracking:', error);
        }
    }

    /**
     * Update user tracking after rating deletion
     * @param {string} userId - User ID
     * @param {string} userFingerprint - User fingerprint
     * @param {string} restaurantId - Restaurant ID
     */
    async updateUserTrackingAfterRatingDeletion(userId, userFingerprint, restaurantId) {
        try {
            const existingTracking = await this.findUserTrackingRecord(userId, userFingerprint, restaurantId);

            if (existingTracking && existingTracking.reviewCount > 0) {
                const updatedTracking = new UserTrackingModel({
                    ...existingTracking,
                    reviewCount: Math.max(0, existingTracking.reviewCount - 1),
                    hasReviewed: existingTracking.reviewCount > 1,
                    updatedAt: new Date()
                });

                await this.userTrackingCollection.doc(existingTracking.id).update(updatedTracking.toFirestore());
            }

            console.log('User tracking updated after rating deletion');
        } catch (error) {
            console.error('Error updating user tracking after deletion:', error);
        }
    }

    /**
     * Update restaurant rating fields only (bypassing full validation)
     * @param {string} restaurantId - Restaurant ID
     * @param {Object} ratingData - Rating data to update
     */
    async updateRestaurantRatingOnly(restaurantId, ratingData) {
        try {
            console.log(`🔄 Updating rating fields for restaurant ${restaurantId}:`, ratingData);

            await this.restaurantsCollection.doc(restaurantId).update(ratingData);
            console.log('✅ Restaurant rating fields updated successfully');
        } catch (error) {
            console.error('Error updating restaurant rating fields:', error);
            throw error;
        }
    }

    /**
     * Update restaurant average rating using advanced calculation service
     * @param {string} restaurantId - Restaurant ID
     */
    async updateRestaurantAverageRating(restaurantId) {
        try {
            // Import RatingCalculationService dynamically to avoid circular dependencies
            const { RatingCalculationService } = await import('./rating-calculation-service.js?v=1.0.1');

            if (!this.calculationService) {
                this.calculationService = new RatingCalculationService(this);
            }

            console.log(`🔄 Updating restaurant ${restaurantId} with advanced calculation...`);

            // Calculate comprehensive rating statistics
            const calculation = await this.calculationService.calculateRestaurantRating(restaurantId, true);

            console.log('✅ Advanced rating calculation completed:', calculation);
        } catch (error) {
            console.error('Error updating restaurant average rating:', error);

            // Fallback to simple calculation if advanced service fails
            console.log('🔄 Falling back to simple calculation...');
            await this.updateRestaurantAverageRatingFallback(restaurantId);
        }
    }

    /**
     * Fallback method for basic rating calculation
     * @param {string} restaurantId - Restaurant ID
     */
    async updateRestaurantAverageRatingFallback(restaurantId) {
        try {
            console.log('🔄 FALLBACK: Atualizando média do restaurante:', restaurantId);
            const ratings = await this.getRatingsByRestaurant(restaurantId, { approvedOnly: false });
            console.log('📊 Avaliações encontradas:', ratings.length);

            if (ratings.length === 0) {
                await this.restaurantsCollection.doc(restaurantId).update({
                    averageQuality: 0,
                    totalRatings: 0
                });
                return;
            }

            // Calculate simple average
            const totalRating = ratings.reduce((sum, rating) => sum + (rating.rating || 0), 0);
            const averageQuality = Math.round((totalRating / ratings.length) * 10) / 10;

            const updateData = {
                averageQuality: averageQuality,
                totalRatings: ratings.length,
                ratingLastUpdated: new Date().toISOString()
            };

            await this.restaurantsCollection.doc(restaurantId).update(updateData);
            console.log('✅ Restaurant average rating updated successfully (fallback)');
        } catch (error) {
            console.error('Error in fallback rating update:', error);
        }
    }

    /**
     * Delete restaurant photos from storage
     * @param {RestaurantModel} restaurant - Restaurant model
     */
    async deleteRestaurantPhotos(restaurant) {
        try {
            if (!restaurant.hasPhotos()) return;

            const photoUrls = restaurant.photoUrls || [];
            if (restaurant.photoUrl && !photoUrls.includes(restaurant.photoUrl)) {
                photoUrls.push(restaurant.photoUrl);
            }

            const deletePromises = photoUrls.map(async (photoUrl) => {
                try {
                    const photoRef = this.storage.refFromURL(photoUrl);
                    await photoRef.delete();
                    console.log('Photo deleted successfully:', photoUrl);
                } catch (error) {
                    console.warn('Failed to delete photo:', photoUrl, error);
                }
            });

            await Promise.all(deletePromises);
        } catch (error) {
            console.error('Error deleting restaurant photos:', error);
        }
    }

    /**
     * Batch operation for creating multiple restaurants
     * @param {Array} restaurantsData - Array of restaurant data
     * @returns {Promise<Array>} Array of restaurant IDs
     */
    async batchCreateRestaurants(restaurantsData) {
        try {
            console.log(`Batch creating ${restaurantsData.length} restaurants`);

            const batch = this.db.batch();
            const restaurantIds = [];

            restaurantsData.forEach(restaurantData => {
                const restaurant = new RestaurantModel(restaurantData);
                const errors = restaurant.validate();

                if (errors.length === 0) {
                    const docRef = this.restaurantsCollection.doc();
                    batch.set(docRef, restaurant.toFirestore());
                    restaurantIds.push(docRef.id);
                } else {
                    console.warn('Skipping invalid restaurant:', errors);
                }
            });

            if (restaurantIds.length > 0) {
                await retryOperation(async () => {
                    return batch.commit();
                });
            }

            console.log(`Successfully created ${restaurantIds.length} restaurants`);
            return restaurantIds;
        } catch (error) {
            console.error('Failed to batch create restaurants:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Clean up all active listeners
     */
    cleanup() {
        console.log(`Cleaning up ${this.activeListeners.size} active listeners`);

        this.activeListeners.forEach((unsubscribe, listenerId) => {
            try {
                unsubscribe();
                console.log(`Cleaned up listener: ${listenerId}`);
            } catch (error) {
                console.error(`Error cleaning up listener ${listenerId}:`, error);
            }
        });

        this.activeListeners.clear();
        console.log('StorageService cleaned up successfully');
    }

    /**
     * Get ratings by user fingerprint and restaurant
     * @param {string} userFingerprint - User fingerprint
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise<Array>} Array of existing ratings
     */
    async getRatingsByUser(userFingerprint, restaurantId) {
        try {
            console.log(`🔍 Looking for existing ratings from user ${userFingerprint} for restaurant ${restaurantId}`);

            const snapshot = await this.ratingsCollection
                .where('userFingerprint', '==', userFingerprint)
                .where('restaurantId', '==', restaurantId)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            const ratings = [];
            snapshot.forEach(doc => {
                ratings.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`📊 Found ${ratings.length} existing ratings for this user/restaurant combination`);
            return ratings;

        } catch (error) {
            console.error('Error getting ratings by user:', error);
            return [];
        }
    }

    /**
     * Get user rating for a specific restaurant
     * @param {string} restaurantId - Restaurant ID
     * @param {string} userFingerprint - User fingerprint
     * @returns {Promise<Object|null>} User's existing rating or null
     */
    async getUserRating(restaurantId, userFingerprint) {
        try {
            console.log(`🔍 Getting user rating for restaurant ${restaurantId}`);

            const snapshot = await this.ratingsCollection
                .where('restaurantId', '==', restaurantId)
                .where('userFingerprint', '==', userFingerprint)
                .limit(1)
                .get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };

        } catch (error) {
            console.error('Error getting user rating:', error);
            return null;
        }
    }

    /**
     * Update existing rating
     * @param {string} ratingId - Rating ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated rating
     */
    async updateRating(ratingId, updateData) {
        try {
            console.log(`🔄 Updating rating ${ratingId}`);

            const ratingRef = this.ratingsCollection.doc(ratingId);

            // Prepare update data with timestamp
            const dataToUpdate = {
                ...updateData,
                updatedAt: new Date()
            };

            await ratingRef.update(dataToUpdate);

            // Get updated rating
            const updatedRating = await ratingRef.get();
            const ratingData = {
                id: updatedRating.id,
                ...updatedRating.data()
            };

            console.log('✅ Rating updated successfully:', ratingId);

            // Update restaurant average rating
            if (updateData.restaurantId) {
                await this.updateRestaurantAverageRating(updateData.restaurantId);
            }

            return ratingData;

        } catch (error) {
            console.error('Error updating rating:', error);
            throw error;
        }
    }

    /**
     * Check if user has already rated a restaurant
     * @param {string} userFingerprint - User fingerprint
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise<boolean>} Whether user has already rated
     */
    async hasUserRatedRestaurant(userFingerprint, restaurantId) {
        try {
            const existingRatings = await this.getRatingsByUser(userFingerprint, restaurantId);
            return existingRatings.length > 0;
        } catch (error) {
            console.error('Error checking if user rated restaurant:', error);
            return false;
        }
    }

    /**
     * Log security event
     * @param {Object} securityEvent - Security event data
     * @returns {Promise<string>} Security event ID
     */
    async logSecurityEvent(securityEvent) {
        try {
            console.log('🔒 Logging security event:', securityEvent.eventType);

            const securityLog = {
                ...securityEvent,
                timestamp: new Date(),
                loggedAt: new Date().toISOString()
            };

            const docRef = await this.db.collection('security_logs').add(securityLog);
            console.log('✅ Security event logged:', docRef.id);
            return docRef.id;

        } catch (error) {
            console.error('Error logging security event:', error);
            // Don't throw error for logging failures
            return null;
        }
    }

    /**
     * Get security logs (admin only)
     * @param {number} limit - Maximum number of logs to return
     * @returns {Promise<Array>} Array of security logs
     */
    async getSecurityLogs(limit = 100) {
        try {
            console.log(`🔒 Getting last ${limit} security logs`);

            const snapshot = await this.db
                .collection('security_logs')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            const logs = [];
            snapshot.forEach(doc => {
                logs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return logs;

        } catch (error) {
            console.error('Error getting security logs:', error);
            return [];
        }
    }

  
    /**
     * Get all ratings from the database
     * @returns {Promise<Array>} Array of all ratings
     */
    async getAllRatings() {
        try {
            console.log('Fetching all ratings from database');

            const snapshot = await this.ratingsCollection.get();

            const ratings = [];
            snapshot.forEach(doc => {
                ratings.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`Found ${ratings.length} ratings in database`);
            return ratings;

        } catch (error) {
            console.error('Error getting all ratings:', error);
            return [];
        }
    }

    /**
     * Batch update ratings for multiple restaurants
     * @param {Array<string>} restaurantIds - Array of restaurant IDs
     * @returns {Promise<Object>} Batch update results
     */
    async batchUpdateRestaurantRatings(restaurantIds) {
        try {
            console.log(`🔄 Batch updating ratings for ${restaurantIds.length} restaurants...`);

            // Import RatingCalculationService dynamically
            const { RatingCalculationService } = await import('./rating-calculation-service.js?v=1.0.1');

            if (!this.calculationService) {
                this.calculationService = new RatingCalculationService(this);
            }

            const results = {
                successful: [],
                failed: [],
                totalProcessed: 0,
                startTime: Date.now()
            };

            // Process restaurants in batches to avoid overwhelming Firestore
            const batchSize = 10; // Process 10 restaurants at a time

            for (let i = 0; i < restaurantIds.length; i += batchSize) {
                const batch = restaurantIds.slice(i, i + batchSize);

                for (const restaurantId of batch) {
                    try {
                        results.totalProcessed++;

                        // Calculate comprehensive rating statistics
                        const calculation = await this.calculationService.calculateRestaurantRating(restaurantId, true);

                        // Prepare update data with all calculated fields
                        const updateData = {
                            averageQuality: calculation.averageQuality,
                            averageTaste: calculation.averageTaste || calculation.averageQuality,
                            averageAmbiance: calculation.averageAmbiance || calculation.averageQuality,
                            averageService: calculation.averageService || calculation.averageQuality,
                            averagePrice: calculation.averagePrice || calculation.averageQuality,
                            averageOverall: calculation.weightedAverage,
                            totalRatings: calculation.totalRatings,
                            confidenceScore: calculation.confidenceScore,
                            ratingDistribution: calculation.ratingDistribution,
                            lastRatingUpdate: new Date().toISOString(),
                            calculationMetadata: {
                                lastCalculatedAt: Date.now(),
                                calculationVersion: '3.4.0',
                                standardDeviation: calculation.standardDeviation,
                                median: calculation.median,
                                mode: calculation.mode
                            }
                        };

                        await this.updateRestaurantRatingOnly(restaurantId, updateData);

                        results.successful.push({
                            restaurantId,
                            averageQuality: calculation.averageQuality,
                            totalRatings: calculation.totalRatings,
                            confidenceScore: calculation.confidenceScore
                        });

                        // Add small delay to prevent rate limiting
                        await new Promise(resolve => setTimeout(resolve, 50));

                    } catch (error) {
                        console.error(`❌ Failed to update restaurant ${restaurantId}:`, error);
                        results.failed.push({
                            restaurantId,
                            error: error.message
                        });
                    }
                }

                // Add delay between batches
                if (i + batchSize < restaurantIds.length) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            const endTime = Date.now();
            const processingTime = endTime - results.startTime;

            console.log(`✅ Batch update completed:`, {
                totalProcessed: results.totalProcessed,
                successful: results.successful.length,
                failed: results.failed.length,
                processingTime: `${processingTime}ms`,
                averageTimePerRestaurant: `${Math.round(processingTime / results.totalProcessed)}ms`
            });

            if (results.failed.length > 0) {
                console.warn(`⚠️ Failed to update ${results.failed.length} restaurants:`, results.failed);
            }

            return results;

        } catch (error) {
            console.error('❌ Error in batch update restaurant ratings:', error);
            throw error;
        }
    }

    /**
     * Get storage statistics
     * @returns {Promise<Object>} Storage statistics
     */
    async getStorageStats() {
        try {
            const restaurantsCount = (await this.restaurantsCollection.get()).size;
            const ratingsCount = (await this.ratingsCollection.get()).size;
            const trackingCount = (await this.userTrackingCollection.get()).size;

            return {
                restaurants: restaurantsCount,
                ratings: ratingsCount,
                userTracking: trackingCount,
                activeListeners: this.activeListeners.size
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return {
                restaurants: 0,
                ratings: 0,
                userTracking: 0,
                activeListeners: this.activeListeners.size
            };
        }
    }
}

export default StorageService;