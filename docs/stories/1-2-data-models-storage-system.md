# Story 1.2: Data Models & Storage System

**As a developer, I want defined data models and storage management system, so that restaurant and rating data can be consistently stored and retrieved.**

## Overview
This story defines the data models and implements the storage management system that will handle all restaurant and rating data operations using Firebase Firestore.

## Acceptance Criteria

### AC 2.1: Restaurant data model defined with all required fields (name, hours, price, vegetarian options, access)
- [ ] Define restaurant data model with all required fields
- [ ] Include name field with validation (min 4 characters)
- [ ] Add price field with numeric validation
- [ ] Include vegetarian options field
- [ ] Add access information field
- [ ] Include timestamps for created and updated dates
- [ ] Add average quality rating field
- [ ] Include photo URLs array for restaurant images

### AC 2.2: Rating data model defined with user identification and rating criteria
- [ ] Define rating data model with user identification
- [ ] Include restaurant ID reference
- [ ] Add rating criteria (quality, price, service, etc.)
- [ ] Include user-generated comments field
- [ ] Add timestamps for created and updated dates
- [ ] Include rating validation (0-5 stars)
- [ ] Add user fingerprint for anonymous identification

### AC 2.3: Duplicate prevention data model for tracking user-restaurant relationships
- [ ] Define user-restaurant tracking data model
- [ ] Include user identifier field
- [ ] Add restaurant ID reference
- [ ] Include hasReviewed boolean field
- [ ] Add last interaction timestamp
- [ ] Include review count field
- [ ] Add duplicate prevention logic

### AC 2.4: CRUD operations implemented for all data models using Firebase Firestore
- [ ] Implement Create operations for all data models
- [ ] Implement Read operations with querying capabilities
- [ ] Implement Update operations with validation
- [ ] Implement Delete operations with proper cleanup
- [ ] Add batch operations for efficiency
- [ ] Include real-time listeners for live updates

### AC 2.5: Data validation and error handling for Firebase operations
- [ ] Implement comprehensive data validation
- [ ] Add Firebase-specific error handling
- [ ] Create user-friendly error messages
- [ ] Implement data sanitization
- [ ] Add offline operation handling
- [ ] Include retry logic for failed operations

## Technical Implementation Details

### Data Models Definition

```javascript
// js/models/restaurant.js
export class RestaurantModel {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.price = data.price || 0;
        this.averageQuality = data.averageQuality || 0;
        this.vegetarianOptions = data.vegetarianOptions || false;
        this.access = data.access || '';
        this.hours = data.hours || '';
        this.description = data.description || '';
        this.photoUrls = data.photoUrls || [];
        this.ownerId = data.ownerId || null;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    // Validation method
    validate() {
        const errors = [];

        if (!this.name || this.name.length < 4) {
            errors.push('Nome do restaurante deve ter no mínimo 4 caracteres');
        }

        if (!this.price || this.price <= 0) {
            errors.push('Preço deve ser um número positivo');
        }

        if (this.averageQuality < 0 || this.averageQuality > 5) {
            errors.push('Qualidade média deve estar entre 0 e 5');
        }

        return errors;
    }

    // Convert to Firestore format
    toFirestore() {
        return {
            name: this.name,
            price: this.price,
            averageQuality: this.averageQuality,
            vegetarianOptions: this.vegetarianOptions,
            access: this.access,
            hours: this.hours,
            description: this.description,
            photoUrls: this.photoUrls,
            ownerId: this.ownerId,
            createdAt: this.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
    }

    // Create from Firestore document
    static fromFirestore(doc) {
        const data = doc.data();
        return new RestaurantModel({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
        });
    }
}
```

```javascript
// js/models/rating.js
export class RatingModel {
    constructor(data) {
        this.id = data.id || null;
        this.restaurantId = data.restaurantId || null;
        this.userId = data.userId || null;
        this.userFingerprint = data.userFingerprint || null;
        this.rating = data.rating || 0;
        this.comment = data.comment || '';
        this.quality = data.quality || 0;
        this.priceRating = data.priceRating || 0;
        this.service = data.service || 0;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    validate() {
        const errors = [];

        if (!this.restaurantId) {
            errors.push('ID do restaurante é obrigatório');
        }

        if (!this.userId && !this.userFingerprint) {
            errors.push('Identificação do usuário é obrigatória');
        }

        if (this.rating < 0 || this.rating > 5) {
            errors.push('Avaliação deve estar entre 0 e 5');
        }

        if (this.quality < 0 || this.quality > 5) {
            errors.push('Qualidade deve estar entre 0 e 5');
        }

        return errors;
    }

    toFirestore() {
        return {
            restaurantId: this.restaurantId,
            userId: this.userId,
            userFingerprint: this.userFingerprint,
            rating: this.rating,
            comment: this.comment,
            quality: this.quality,
            priceRating: this.priceRating,
            service: this.service,
            createdAt: this.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: this.updatedAt || firebase.firestore.FieldValue.serverTimestamp()
        };
    }

    static fromFirestore(doc) {
        const data = doc.data();
        return new RatingModel({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
        });
    }
}
```

```javascript
// js/models/user-tracking.js
export class UserTrackingModel {
    constructor(data) {
        this.id = data.id || null;
        this.userId = data.userId || null;
        this.restaurantId = data.restaurantId || null;
        this.hasReviewed = data.hasReviewed || false;
        this.reviewCount = data.reviewCount || 0;
        this.lastInteraction = data.lastInteraction || null;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    validate() {
        const errors = [];

        if (!this.userId) {
            errors.push('ID do usuário é obrigatório');
        }

        if (!this.restaurantId) {
            errors.push('ID do restaurante é obrigatório');
        }

        return errors;
    }

    toFirestore() {
        return {
            userId: this.userId,
            restaurantId: this.restaurantId,
            hasReviewed: this.hasReviewed,
            reviewCount: this.reviewCount,
            lastInteraction: this.lastInteraction || firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: this.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: this.updatedAt || firebase.firestore.FieldValue.serverTimestamp()
        };
    }

    static fromFirestore(doc) {
        const data = doc.data();
        return new UserTrackingModel({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            lastInteraction: data.lastInteraction?.toDate()
        });
    }
}
```

### Storage Service Implementation

```javascript
// js/services/storage-service.js
import { RestaurantModel } from '../models/restaurant.js';
import { RatingModel } from '../models/rating.js';
import { UserTrackingModel } from '../models/user-tracking.js';

export class StorageService {
    constructor(firebaseApp) {
        this.db = firebaseApp.firestore();
        this.restaurantsCollection = this.db.collection('restaurants');
        this.ratingsCollection = this.db.collection('ratings');
        this.userTrackingCollection = this.db.collection('userTracking');
    }

    // Restaurant CRUD operations
    async createRestaurant(restaurantData) {
        try {
            const restaurant = new RestaurantModel(restaurantData);
            const errors = restaurant.validate();

            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            const docRef = await this.restaurantsCollection.add(restaurant.toFirestore());
            return docRef.id;
        } catch (error) {
            this.handleError(error, 'createRestaurant');
            throw error;
        }
    }

    async getRestaurants(options = {}) {
        try {
            let query = this.restaurantsCollection;

            // Apply ordering
            if (options.orderBy) {
                query = query.orderBy(options.orderBy, options.orderDirection || 'desc');
            }

            // Apply limit
            if (options.limit) {
                query = query.limit(options.limit);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => RestaurantModel.fromFirestore(doc));
        } catch (error) {
            this.handleError(error, 'getRestaurants');
            throw error;
        }
    }

    async getRestaurant(id) {
        try {
            const doc = await this.restaurantsCollection.doc(id).get();
            if (!doc.exists) {
                throw new Error('Restaurante não encontrado');
            }
            return RestaurantModel.fromFirestore(doc);
        } catch (error) {
            this.handleError(error, 'getRestaurant');
            throw error;
        }
    }

    async updateRestaurant(id, updates) {
        try {
            const restaurant = await this.getRestaurant(id);
            Object.assign(restaurant, updates);

            const errors = restaurant.validate();
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            await this.restaurantsCollection.doc(id).update(restaurant.toFirestore());
            return true;
        } catch (error) {
            this.handleError(error, 'updateRestaurant');
            throw error;
        }
    }

    async deleteRestaurant(id) {
        try {
            // Delete associated ratings and tracking data
            await this.deleteRatingsByRestaurant(id);
            await this.deleteTrackingByRestaurant(id);

            await this.restaurantsCollection.doc(id).delete();
            return true;
        } catch (error) {
            this.handleError(error, 'deleteRestaurant');
            throw error;
        }
    }

    // Rating CRUD operations
    async createRating(ratingData) {
        try {
            const rating = new RatingModel(ratingData);
            const errors = rating.validate();

            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            // Check for duplicates
            await this.checkDuplicateRating(rating.userId, rating.restaurantId);

            const docRef = await this.ratingsCollection.add(rating.toFirestore());

            // Update user tracking
            await this.updateUserTracking(rating.userId, rating.restaurantId);

            // Update restaurant average rating
            await this.updateRestaurantAverageRating(rating.restaurantId);

            return docRef.id;
        } catch (error) {
            this.handleError(error, 'createRating');
            throw error;
        }
    }

    async getRatingsByRestaurant(restaurantId) {
        try {
            const snapshot = await this.ratingsCollection
                .where('restaurantId', '==', restaurantId)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => RatingModel.fromFirestore(doc));
        } catch (error) {
            this.handleError(error, 'getRatingsByRestaurant');
            throw error;
        }
    }

    // Real-time listeners
    setupRestaurantsListener(callback) {
        return this.restaurantsCollection
            .orderBy('averageQuality', 'desc')
            .onSnapshot(snapshot => {
                const restaurants = snapshot.docs.map(doc => RestaurantModel.fromFirestore(doc));
                callback(restaurants);
            }, error => {
                this.handleError(error, 'restaurantsListener');
            });
    }

    setupRatingsListener(restaurantId, callback) {
        return this.ratingsCollection
            .where('restaurantId', '==', restaurantId)
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const ratings = snapshot.docs.map(doc => RatingModel.fromFirestore(doc));
                callback(ratings);
            }, error => {
                this.handleError(error, 'ratingsListener');
            });
    }

    // Helper methods
    async checkDuplicateRating(userId, restaurantId) {
        const snapshot = await this.ratingsCollection
            .where('userId', '==', userId)
            .where('restaurantId', '==', restaurantId)
            .get();

        if (!snapshot.empty) {
            throw new Error('Você já avaliou este restaurante');
        }
    }

    async updateUserTracking(userId, restaurantId) {
        const trackingRef = this.userTrackingCollection
            .where('userId', '==', userId)
            .where('restaurantId', '==', restaurantId);

        const snapshot = await trackingRef.get();

        if (snapshot.empty) {
            // Create new tracking record
            const tracking = new UserTrackingModel({
                userId,
                restaurantId,
                hasReviewed: true,
                reviewCount: 1
            });
            await this.userTrackingCollection.add(tracking.toFirestore());
        } else {
            // Update existing tracking record
            const doc = snapshot.docs[0];
            const tracking = UserTrackingModel.fromFirestore(doc);
            tracking.hasReviewed = true;
            tracking.reviewCount += 1;
            tracking.lastInteraction = new Date();
            await doc.ref.update(tracking.toFirestore());
        }
    }

    async updateRestaurantAverageRating(restaurantId) {
        const ratings = await this.getRatingsByRestaurant(restaurantId);

        if (ratings.length === 0) {
            await this.restaurantsCollection.doc(restaurantId).update({
                averageQuality: 0
            });
            return;
        }

        const averageQuality = ratings.reduce((sum, rating) => sum + rating.quality, 0) / ratings.length;

        await this.restaurantsCollection.doc(restaurantId).update({
            averageQuality: Math.round(averageQuality * 10) / 10
        });
    }

    // Error handling
    handleError(error, operation) {
        console.error(`StorageService error in ${operation}:`, error);

        // Map Firebase errors to user-friendly messages
        const errorMessages = {
            'permission-denied': 'Você não tem permissão para realizar esta operação.',
            'unavailable': 'Serviço temporariamente indisponível.',
            'network-request-failed': 'Erro de conexão. Verifique sua internet.',
            'default': 'Ocorreu um erro. Tente novamente.'
        };

        const message = errorMessages[error.code] || errorMessages.default;
        // Dispatch error event or call error handler
        window.dispatchEvent(new CustomEvent('storage-error', {
            detail: { message, operation, error }
        }));
    }
}
```

## Dependencies
- Story 1.1: Project Setup & Basic Structure (must be completed first)
- Firebase services initialized from Epic 0
- ES6 module support in the browser

## Success Metrics
- All data models are properly defined with validation
- CRUD operations work correctly for all models
- Real-time listeners provide live updates
- Data validation prevents invalid data storage
- Error handling provides user-friendly feedback
- Duplicate prevention works effectively

## Testing Approach
1. **Data Model Test**: Validate all model validation rules
2. **CRUD Operations Test**: Test create, read, update, delete operations
3. **Real-time Updates Test**: Verify live data synchronization
4. **Error Handling Test**: Test various error scenarios
5. **Integration Test**: Test data flow between models and UI

## Notes
- Uses Firebase Firestore for scalable, real-time data storage
- Implements comprehensive data validation at model level
- Includes proper error handling and user feedback
- Supports offline operations with automatic sync
- Prevents duplicate ratings through tracking system