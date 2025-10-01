// js/models/user-tracking.js - User tracking data model for duplicate prevention

/**
 * UserTracking Model - Defines the structure and validation for user-restaurant relationship tracking
 */
export class UserTrackingModel {
    constructor(data = {}) {
        this.id = data.id || null;
        this.userId = data.userId || null;
        this.userFingerprint = data.userFingerprint || null;
        this.restaurantId = data.restaurantId || null;
        this.hasReviewed = data.hasReviewed || false;
        this.reviewCount = data.reviewCount || 0;
        this.lastInteraction = data.lastInteraction || null;
        this.firstInteraction = data.firstInteraction || null;
        this.interactionType = data.interactionType || 'view'; // view, review, favorite
        this.isFavorite = data.isFavorite || false;
        this.hasReported = data.hasReported || false;
        this.lastVisitDate = data.lastVisitDate || null;
        this.visitCount = data.visitCount || 0;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    /**
     * Validate user tracking data
     * @returns {Array} Array of validation error messages
     */
    validate() {
        const errors = [];

        // User identification validation
        if (!this.userId && !this.userFingerprint) {
            errors.push('Identificação do usuário é obrigatória');
        }

        if (this.userId && typeof this.userId !== 'string') {
            errors.push('ID do usuário deve ser uma string');
        }

        if (this.userFingerprint && typeof this.userFingerprint !== 'string') {
            errors.push('Identificação do usuário deve ser uma string');
        }

        // Restaurant ID validation
        if (!this.restaurantId || typeof this.restaurantId !== 'string') {
            errors.push('ID do restaurante é obrigatório');
        }

        // Review count validation
        if (this.reviewCount !== undefined && this.reviewCount !== null) {
            const reviews = Number(this.reviewCount);
            if (isNaN(reviews) || reviews < 0) {
                errors.push('Número de avaliações não pode ser negativo');
            }
        }

        // Visit count validation
        if (this.visitCount !== undefined && this.visitCount !== null) {
            const visits = Number(this.visitCount);
            if (isNaN(visits) || visits < 0) {
                errors.push('Número de visitas não pode ser negativo');
            }
        }

        // Interaction type validation
        const validInteractionTypes = ['view', 'review', 'favorite', 'report'];
        if (this.interactionType && !validInteractionTypes.includes(this.interactionType)) {
            errors.push('Tipo de interação inválido');
        }

        // Date validations
        const dateFields = ['lastInteraction', 'firstInteraction', 'lastVisitDate'];
        dateFields.forEach(field => {
            const value = this[field];
            if (value && !(value instanceof Date) && typeof value !== 'string') {
                errors.push(`${field} deve ser uma data válida`);
            }
        });

        return errors;
    }

    /**
     * Convert model to Firestore format
     * @returns {Object} Firestore document data
     */
    toFirestore() {
        return {
            userId: this.userId,
            userFingerprint: this.userFingerprint,
            restaurantId: this.restaurantId,
            hasReviewed: Boolean(this.hasReviewed),
            reviewCount: Number(this.reviewCount),
            lastInteraction: this.lastInteraction || firebase.firestore.FieldValue.serverTimestamp(),
            firstInteraction: this.firstInteraction || firebase.firestore.FieldValue.serverTimestamp(),
            interactionType: this.interactionType,
            isFavorite: Boolean(this.isFavorite),
            hasReported: Boolean(this.hasReported),
            lastVisitDate: this.lastVisitDate || null,
            visitCount: Number(this.visitCount),
            createdAt: this.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
    }

    /**
     * Create UserTrackingModel from Firestore document
     * @param {Object} doc - Firestore document snapshot
     * @returns {UserTrackingModel} User tracking model instance
     */
    static fromFirestore(doc) {
        const data = doc.data();

        return new UserTrackingModel({
            id: doc.id,
            userId: data.userId || null,
            userFingerprint: data.userFingerprint || null,
            restaurantId: data.restaurantId || null,
            hasReviewed: data.hasReviewed || false,
            reviewCount: data.reviewCount || 0,
            lastInteraction: data.lastInteraction?.toDate() || null,
            firstInteraction: data.firstInteraction?.toDate() || null,
            interactionType: data.interactionType || 'view',
            isFavorite: data.isFavorite || false,
            hasReported: data.hasReported || false,
            lastVisitDate: data.lastVisitDate?.toDate() || null,
            visitCount: data.visitCount || 0,
            createdAt: data.createdAt?.toDate() || null,
            updatedAt: data.updatedAt?.toDate() || null
        });
    }

    /**
     * Record a new interaction with restaurant
     * @param {string} interactionType - Type of interaction
     * @returns {UserTrackingModel} Updated tracking model
     */
    recordInteraction(interactionType = 'view') {
        const validTypes = ['view', 'review', 'favorite', 'report'];
        if (!validTypes.includes(interactionType)) {
            throw new Error('Tipo de interação inválido');
        }

        const now = new Date();
        const updates = {
            interactionType,
            lastInteraction: now,
            updatedAt: now
        };

        // Increment visit count for view interactions
        if (interactionType === 'view') {
            updates.visitCount = (this.visitCount || 0) + 1;
            updates.lastVisitDate = now;
        }

        // Update review information for review interactions
        if (interactionType === 'review') {
            updates.hasReviewed = true;
            updates.reviewCount = (this.reviewCount || 0) + 1;
        }

        // Update favorite status
        if (interactionType === 'favorite') {
            updates.isFavorite = true;
        }

        // Update report status
        if (interactionType === 'report') {
            updates.hasReported = true;
        }

        // Set first interaction if not exists
        if (!this.firstInteraction) {
            updates.firstInteraction = now;
        }

        return new UserTrackingModel({ ...this, ...updates });
    }

    /**
     * Mark as favorite
     * @returns {UserTrackingModel} Updated tracking model
     */
    markAsFavorite() {
        return new UserTrackingModel({
            ...this,
            isFavorite: true,
            interactionType: 'favorite',
            lastInteraction: new Date(),
            updatedAt: new Date()
        });
    }

    /**
     * Remove from favorites
     * @returns {UserTrackingModel} Updated tracking model
     */
    removeFromFavorites() {
        return new UserTrackingModel({
            ...this,
            isFavorite: false,
            interactionType: 'view',
            lastInteraction: new Date(),
            updatedAt: new Date()
        });
    }

    /**
     * Record a review
     * @returns {UserTrackingModel} Updated tracking model
     */
    recordReview() {
        return new UserTrackingModel({
            ...this,
            hasReviewed: true,
            reviewCount: (this.reviewCount || 0) + 1,
            interactionType: 'review',
            lastInteraction: new Date(),
            updatedAt: new Date()
        });
    }

    /**
     * Record a report
     * @returns {UserTrackingModel} Updated tracking model
     */
    recordReport() {
        return new UserTrackingModel({
            ...this,
            hasReported: true,
            interactionType: 'report',
            lastInteraction: new Date(),
            updatedAt: new Date()
        });
    }

    /**
     * Record a visit
     * @returns {UserTrackingModel} Updated tracking model
     */
    recordVisit() {
        return new UserTrackingModel({
            ...this,
            visitCount: (this.visitCount || 0) + 1,
            lastVisitDate: new Date(),
            interactionType: 'view',
            lastInteraction: new Date(),
            updatedAt: new Date()
        });
    }

    /**
     * Check if user can review this restaurant
     * @param {Object} options - Options for review check
     * @returns {boolean} True if user can review
     */
    canReview(options = {}) {
        const {
            allowMultipleReviews = false,
            minDaysBetweenReviews = 30,
            maxReviewsPerUser = 3
        } = options;

        // If user hasn't reviewed yet, they can review
        if (!this.hasReviewed) {
            return true;
        }

        // If multiple reviews are not allowed
        if (!allowMultipleReviews) {
            return false;
        }

        // Check review count limit
        if (this.reviewCount >= maxReviewsPerUser) {
            return false;
        }

        // Check time between reviews
        if (minDaysBetweenReviews > 0 && this.lastInteraction) {
            const daysSinceLastReview = (new Date() - this.lastInteraction) / (1000 * 60 * 60 * 24);
            if (daysSinceLastReview < minDaysBetweenReviews) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get time since last interaction
     * @returns {Object} Object with time information
     */
    getTimeSinceLastInteraction() {
        if (!this.lastInteraction) {
            return {
                days: null,
                hours: null,
                minutes: null,
                seconds: null,
                formatted: 'Nunca'
            };
        }

        const now = new Date();
        const diff = now - this.lastInteraction;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let formatted = '';
        if (days > 0) formatted += `${days}d `;
        if (hours > 0) formatted += `${hours}h `;
        if (minutes > 0) formatted += `${minutes}m `;
        if (seconds > 0 && days === 0 && hours === 0) formatted += `${seconds}s`;

        return {
            days,
            hours,
            minutes,
            seconds,
            formatted: formatted.trim() || 'Agora'
        };
    }

    /**
     * Check if this is a recent interaction
     * @param {number} hours - Hours threshold
     * @returns {boolean} True if recent
     */
    isRecentInteraction(hours = 24) {
        if (!this.lastInteraction) return false;

        const diff = new Date() - this.lastInteraction;
        const hoursSince = diff / (1000 * 60 * 60);

        return hoursSince <= hours;
    }

    /**
     * Get user engagement level
     * @returns {string} Engagement level (low, medium, high)
     */
    getEngagementLevel() {
        const totalInteractions = (this.visitCount || 0) + (this.reviewCount || 0);
        const daysSinceFirst = this.firstInteraction ?
            (new Date() - this.firstInteraction) / (1000 * 60 * 60 * 24) : 0;

        if (totalInteractions === 0) return 'none';
        if (totalInteractions <= 2 && daysSinceFirst > 30) return 'low';
        if (totalInteractions <= 5 && daysSinceFirst > 7) return 'medium';
        return 'high';
    }

    /**
     * Check if user has reported this restaurant
     * @returns {boolean} True if has reported
     */
    hasUserReported() {
        return this.hasReported === true;
    }

    /**
     * Check if user has favorited this restaurant
     * @returns {boolean} True if is favorite
     */
    isRestaurantFavorite() {
        return this.isFavorite === true;
    }

    /**
     * Get interaction summary
     * @returns {Object} Summary of user interactions
     */
    getInteractionSummary() {
        return {
            userId: this.userId,
            userFingerprint: this.userFingerprint,
            restaurantId: this.restaurantId,
            hasReviewed: this.hasReviewed,
            reviewCount: this.reviewCount || 0,
            visitCount: this.visitCount || 0,
            isFavorite: this.isFavorite,
            hasReported: this.hasReported,
            lastInteraction: this.lastInteraction,
            firstInteraction: this.firstInteraction,
            interactionType: this.interactionType,
            engagementLevel: this.getEngagementLevel(),
            timeSinceLastInteraction: this.getTimeSinceLastInteraction(),
            canReview: this.canReview()
        };
    }

    /**
     * Check if two tracking records are for the same user
     * @param {UserTrackingModel} otherTracking - Another tracking record
     * @returns {boolean} True if same user
     */
    isSameUser(otherTracking) {
        if (!otherTracking) return false;

        // Check by user ID if both have it
        if (this.userId && otherTracking.userId) {
            return this.userId === otherTracking.userId;
        }

        // Check by fingerprint if both have it
        if (this.userFingerprint && otherTracking.userFingerprint) {
            return this.userFingerprint === otherTracking.userFingerprint;
        }

        return false;
    }

    /**
     * Check if this tracking record is for a specific restaurant
     * @param {string} restaurantId - Restaurant ID to check
     * @returns {boolean} True if for this restaurant
     */
    isForRestaurant(restaurantId) {
        return this.restaurantId === restaurantId;
    }

    /**
     * Convert to JSON string
     * @returns {string} JSON representation
     */
    toJSON() {
        return JSON.stringify({
            ...this,
            lastInteraction: this.lastInteraction?.toISOString(),
            firstInteraction: this.firstInteraction?.toISOString(),
            lastVisitDate: this.lastVisitDate?.toISOString(),
            createdAt: this.createdAt?.toISOString(),
            updatedAt: this.updatedAt?.toISOString()
        });
    }

    /**
     * Create UserTrackingModel from JSON string
     * @param {string} jsonString - JSON string
     * @returns {UserTrackingModel} User tracking model instance
     */
    static fromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            // Parse date strings
            const dateFields = ['lastInteraction', 'firstInteraction', 'lastVisitDate', 'createdAt', 'updatedAt'];
            dateFields.forEach(field => {
                if (data[field]) {
                    data[field] = new Date(data[field]);
                }
            });

            return new UserTrackingModel(data);
        } catch (error) {
            throw new Error('JSON inválido para UserTrackingModel');
        }
    }

    /**
     * Generate user fingerprint for anonymous users
     * @returns {string} User fingerprint
     */
    static generateUserFingerprint() {
        // Use browser fingerprinting techniques
        const fingerprint = [];

        // Add browser info
        fingerprint.push(navigator.userAgent);
        fingerprint.push(navigator.language);
        fingerprint.push(navigator.platform);

        // Add screen info
        fingerprint.push(screen.width + 'x' + screen.height);
        fingerprint.push(screen.colorDepth);

        // Add timezone
        fingerprint.push(new Date().getTimezoneOffset());

        // Add browser capabilities
        fingerprint.push(navigator.cookieEnabled);
        fingerprint.push(navigator.doNotTrack);

        // Hash it to create a consistent identifier
        const fingerprintString = fingerprint.join('|');
        return btoa(fingerprintString).substring(0, 32);
    }

    /**
     * Check for duplicate review attempts
     * @param {UserTrackingModel} existingTracking - Existing tracking record
     * @param {Object} options - Options for duplicate check
     * @returns {boolean} True if this is a duplicate attempt
     */
    static isDuplicateReviewAttempt(existingTracking, options = {}) {
        if (!existingTracking) return false;

        const {
            allowMultipleReviews = false,
            minHoursBetweenReviews = 1
        } = options;

        // If user hasn't reviewed before, it's not a duplicate
        if (!existingTracking.hasReviewed) {
            return false;
        }

        // If multiple reviews are allowed, check time
        if (allowMultipleReviews && existingTracking.lastInteraction) {
            const hoursSinceLastReview = (new Date() - existingTracking.lastInteraction) / (1000 * 60 * 60);
            return hoursSinceLastReview < minHoursBetweenReviews;
        }

        // Otherwise, it's a duplicate if they've reviewed before
        return true;
    }
}

export default UserTrackingModel;