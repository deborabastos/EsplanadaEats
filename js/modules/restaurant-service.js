// js/modules/restaurant-service.js - Restaurant data management service
import { getFirebaseServices, handleFirebaseError, retryOperation } from './firebase.js';

/**
 * Restaurant Service - Handles all restaurant-related data operations
 */
export class RestaurantService {
    constructor(firebaseApp) {
        this.firebaseApp = firebaseApp;
        this.db = null;
        this.storage = null;
        this.restaurantsRef = null;
        this.reviewsRef = null;
        this.unsubscribe = null;

        this.initialize();
    }

    /**
     * Initialize the service
     */
    initialize() {
        try {
            const { db, storage } = getFirebaseServices();
            this.db = db;
            this.storage = storage;
            this.restaurantsRef = db.collection('restaurants');
            this.reviewsRef = db.collection('reviews');

            console.log('RestaurantService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize RestaurantService:', error);
            throw error;
        }
    }

    /**
     * Get all restaurants from Firestore
     * @returns {Promise<Array>} Array of restaurant objects
     */
    async getRestaurants() {
        try {
            console.log('Fetching restaurants...');

            const snapshot = await retryOperation(async () => {
                return this.restaurantsRef
                    .orderBy('averageQuality', 'desc')
                    .limit(50)
                    .get();
            });

            const restaurants = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                restaurants.push({
                    id: doc.id,
                    ...data
                });
            });

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
     * @returns {Promise<Object>} Restaurant object
     */
    async getRestaurant(restaurantId) {
        try {
            console.log(`Fetching restaurant: ${restaurantId}`);

            const doc = await retryOperation(async () => {
                return this.restaurantsRef.doc(restaurantId).get();
            });

            if (!doc.exists) {
                throw new Error('Restaurante não encontrado');
            }

            const data = doc.data();
            console.log('Restaurant found:', data);

            return {
                id: doc.id,
                ...data
            };
        } catch (error) {
            console.error('Failed to get restaurant:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Create a new restaurant
     * @param {Object} restaurantData - Restaurant data
     * @returns {Promise<string>} New restaurant ID
     */
    async createRestaurant(restaurantData) {
        try {
            console.log('Creating new restaurant:', restaurantData);

            // Validate required fields
            if (!restaurantData.name || !restaurantData.name.trim()) {
                throw new Error('Nome do restaurante é obrigatório');
            }

            // Prepare restaurant data
            const newRestaurant = {
                name: restaurantData.name.trim(),
                description: restaurantData.description || '',
                cuisine: restaurantData.cuisine || 'Não especificada',
                address: restaurantData.address || '',
                phone: restaurantData.phone || '',
                website: restaurantData.website || '',
                photoUrl: restaurantData.photoUrl || null,
                averageQuality: 0,
                averageTaste: 0,
                averagePrice: 0,
                averageAmbiance: 0,
                averageService: 0,
                averageOverall: 0,
                totalReviews: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await retryOperation(async () => {
                return this.restaurantsRef.add(newRestaurant);
            });

            console.log('Restaurant created successfully:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Failed to create restaurant:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Update an existing restaurant
     * @param {string} restaurantId - Restaurant ID
     * @param {Object} restaurantData - Updated restaurant data
     * @returns {Promise<void>}
     */
    async updateRestaurant(restaurantId, restaurantData) {
        try {
            console.log(`Updating restaurant ${restaurantId}:`, restaurantData);

            // Validate required fields
            if (!restaurantData.name || !restaurantData.name.trim()) {
                throw new Error('Nome do restaurante é obrigatório');
            }

            const updateData = {
                name: restaurantData.name.trim(),
                description: restaurantData.description || '',
                cuisine: restaurantData.cuisine || 'Não especificada',
                address: restaurantData.address || '',
                phone: restaurantData.phone || '',
                website: restaurantData.website || '',
                photoUrl: restaurantData.photoUrl || null,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await retryOperation(async () => {
                return this.restaurantsRef.doc(restaurantId).update(updateData);
            });

            console.log('Restaurant updated successfully');
        } catch (error) {
            console.error('Failed to update restaurant:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Delete a restaurant
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise<void>}
     */
    async deleteRestaurant(restaurantId) {
        try {
            console.log(`Deleting restaurant: ${restaurantId}`);

            // First, delete associated reviews
            const reviewsSnapshot = await this.reviewsRef
                .where('restaurantId', '==', restaurantId)
                .get();

            const batch = this.db.batch();
            reviewsSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            // Delete restaurant photo if exists
            const restaurant = await this.getRestaurant(restaurantId);
            if (restaurant.photoUrl) {
                try {
                    const photoRef = this.storage.refFromURL(restaurant.photoUrl);
                    await photoRef.delete();
                } catch (photoError) {
                    console.warn('Failed to delete restaurant photo:', photoError);
                }
            }

            // Delete restaurant document
            batch.delete(this.restaurantsRef.doc(restaurantId));

            await retryOperation(async () => {
                return batch.commit();
            });

            console.log('Restaurant deleted successfully');
        } catch (error) {
            console.error('Failed to delete restaurant:', error);
            const errorMessage = handleFirebaseError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Set up real-time listener for restaurants
     * @param {Function} callback - Callback function to handle updates
     * @returns {Function} Unsubscribe function
     */
    onRestaurantsUpdate(callback) {
        try {
            console.log('Setting up real-time listener for restaurants');

            this.unsubscribe = this.restaurantsRef
                .orderBy('averageQuality', 'desc')
                .limit(50)
                .onSnapshot(snapshot => {
                    const restaurants = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        restaurants.push({
                            id: doc.id,
                            ...data
                        });
                    });

                    callback(restaurants);
                }, error => {
                    console.error('Real-time listener error:', error);
                    const errorMessage = handleFirebaseError(error);
                    console.error(errorMessage);
                });

            return this.unsubscribe;
        } catch (error) {
            console.error('Failed to set up real-time listener:', error);
            throw error;
        }
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        console.log('RestaurantService cleaned up');
    }
}