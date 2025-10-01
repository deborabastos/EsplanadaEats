// js/models/rating.js - Rating data model

/**
 * Rating Model - Defines the structure and validation for rating/review data
 */
export class RatingModel {
    constructor(data = {}) {
        this.id = data.id || null;
        this.restaurantId = data.restaurantId || null;
        this.userId = data.userId || null;
        this.userFingerprint = data.userFingerprint || null;
        this.userName = data.userName || 'Anônimo';
        this.rating = data.rating || 0; // Overall rating (0-5)
        this.comment = data.comment || '';
        this.quality = data.quality || 0; // Food quality (0-5)
        this.taste = data.taste || 0; // Taste (0-5)
        this.priceRating = data.priceRating || 0; // Price value (0-5)
        this.ambiance = data.ambiance || 0; // Ambiance (0-5)
        this.service = data.service || 0; // Service (0-5)
        this.photos = data.photos || [];
        this.isVerified = data.isVerified || false;
        this.isHelpful = data.isHelpful || 0; // Number of "helpful" votes
        this.isReported = data.isReported || false;
        this.moderationStatus = data.moderationStatus || 'approved'; // approved, pending, rejected
        this.response = data.response || null; // Owner response
        this.responseDate = data.responseDate || null;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    /**
     * Validate rating data
     * @returns {Array} Array of validation error messages
     */
    validate() {
        const errors = [];

        // Restaurant ID validation
        if (!this.restaurantId || typeof this.restaurantId !== 'string') {
            errors.push('ID do restaurante é obrigatório');
        }

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

        // User name validation
        if (this.userName && typeof this.userName !== 'string') {
            errors.push('Nome do usuário deve ser uma string');
        } else if (this.userName && this.userName.length > 50) {
            errors.push('Nome do usuário deve ter no máximo 50 caracteres');
        }

        // Rating validations (0-5 scale)
        const ratingFields = [
            { field: 'rating', name: 'Avaliação geral' },
            { field: 'quality', name: 'Qualidade' },
            { field: 'taste', name: 'Sabor' },
            { field: 'priceRating', name: 'Preço' },
            { field: 'ambiance', name: 'Ambiente' },
            { field: 'service', name: 'Serviço' }
        ];

        ratingFields.forEach(({ field, name }) => {
            const value = this[field];
            if (value !== undefined && value !== null) {
                const rating = Number(value);
                if (isNaN(rating) || rating < 0 || rating > 5) {
                    errors.push(`${name} deve estar entre 0 e 5`);
                }
            }
        });

        // Comment validation
        if (this.comment && typeof this.comment !== 'string') {
            errors.push('Comentário deve ser uma string');
        } else if (this.comment && this.comment.length > 1000) {
            errors.push('Comentário deve ter no máximo 1000 caracteres');
        }

        // Photos validation
        if (this.photos && Array.isArray(this.photos)) {
            if (this.photos.length > 5) {
                errors.push('Número máximo de 5 fotos permitido na avaliação');
            }

            this.photos.forEach((photo, index) => {
                if (typeof photo !== 'string') {
                    errors.push(`URL da foto ${index + 1} deve ser uma string válida`);
                } else if (photo.length > 500) {
                    errors.push(`URL da foto ${index + 1} deve ter no máximo 500 caracteres`);
                }
            });
        }

        // Moderation status validation
        const validStatuses = ['approved', 'pending', 'rejected'];
        if (this.moderationStatus && !validStatuses.includes(this.moderationStatus)) {
            errors.push('Status de moderação inválido');
        }

        // Helpful votes validation
        if (this.isHelpful !== undefined && this.isHelpful !== null) {
            const helpful = Number(this.isHelpful);
            if (isNaN(helpful) || helpful < 0) {
                errors.push('Número de votos úteis não pode ser negativo');
            }
        }

        // Response validation
        if (this.response && typeof this.response !== 'string') {
            errors.push('Resposta deve ser uma string');
        } else if (this.response && this.response.length > 500) {
            errors.push('Resposta deve ter no máximo 500 caracteres');
        }

        return errors;
    }

    /**
     * Convert model to Firestore format
     * @returns {Object} Firestore document data
     */
    toFirestore() {
        return {
            restaurantId: this.restaurantId,
            userId: this.userId,
            userFingerprint: this.userFingerprint,
            userName: this.userName.trim(),
            rating: Number(this.rating),
            comment: this.comment.trim(),
            quality: Number(this.quality),
            taste: Number(this.taste),
            priceRating: Number(this.priceRating),
            ambiance: Number(this.ambiance),
            service: Number(this.service),
            photos: Array.isArray(this.photos) ? this.photos : [],
            isVerified: Boolean(this.isVerified),
            isHelpful: Number(this.isHelpful),
            isReported: Boolean(this.isReported),
            moderationStatus: this.moderationStatus || 'approved',
            response: this.response?.trim() || null,
            responseDate: this.responseDate || null,
            createdAt: this.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: this.updatedAt || firebase.firestore.FieldValue.serverTimestamp()
        };
    }

    /**
     * Create RatingModel from Firestore document
     * @param {Object} doc - Firestore document snapshot
     * @returns {RatingModel} Rating model instance
     */
    static fromFirestore(doc) {
        const data = doc.data();

        return new RatingModel({
            id: doc.id,
            restaurantId: data.restaurantId || null,
            userId: data.userId || null,
            userFingerprint: data.userFingerprint || null,
            userName: data.userName || 'Anônimo',
            rating: data.rating || 0,
            comment: data.comment || '',
            quality: data.quality || 0,
            taste: data.taste || 0,
            priceRating: data.priceRating || 0,
            ambiance: data.ambiance || 0,
            service: data.service || 0,
            photos: data.photos || [],
            isVerified: data.isVerified || false,
            isHelpful: data.isHelpful || 0,
            isReported: data.isReported || false,
            moderationStatus: data.moderationStatus || 'approved',
            response: data.response || null,
            responseDate: data.responseDate?.toDate() || null,
            createdAt: data.createdAt?.toDate() || null,
            updatedAt: data.updatedAt?.toDate() || null
        });
    }

    /**
     * Calculate average rating from individual criteria
     * @returns {number} Calculated average rating
     */
    calculateAverageRating() {
        const criteria = [this.quality, this.taste, this.priceRating, this.ambiance, this.service];
        const validCriteria = criteria.filter(rating => rating > 0);

        if (validCriteria.length === 0) return 0;

        const sum = validCriteria.reduce((acc, rating) => acc + rating, 0);
        return Math.round((sum / validCriteria.length) * 10) / 10;
    }

    /**
     * Update rating with new values
     * @param {Object} updates - Object with fields to update
     * @returns {RatingModel} Updated rating model
     */
    update(updates) {
        const updatedData = { ...this };

        // Apply updates
        Object.keys(updates).forEach(key => {
            if (key === 'id') {
                console.warn('Cannot update rating ID');
                return;
            }
            updatedData[key] = updates[key];
        });

        // Recalculate overall rating if individual criteria changed
        const criteriaChanged = ['quality', 'taste', 'priceRating', 'ambiance', 'service']
            .some(criteria => updates.hasOwnProperty(criteria));

        if (criteriaChanged && !updates.rating) {
            updatedData.rating = updatedData.calculateAverageRating();
        }

        // Update timestamp
        updatedData.updatedAt = new Date();

        return new RatingModel(updatedData);
    }

    /**
     * Add photo to rating
     * @param {string} photoUrl - Photo URL to add
     * @returns {RatingModel} Updated rating model
     */
    addPhoto(photoUrl) {
        if (!photoUrl || typeof photoUrl !== 'string') {
            throw new Error('URL da foto é inválida');
        }

        if (!this.photos) {
            this.photos = [];
        }

        if (this.photos.length >= 5) {
            throw new Error('Número máximo de fotos na avaliação atingido');
        }

        // Check for duplicate
        if (this.photos.includes(photoUrl)) {
            throw new Error('Esta foto já foi adicionada');
        }

        const updatedPhotos = [...this.photos, photoUrl];

        return new RatingModel({
            ...this,
            photos: updatedPhotos,
            updatedAt: new Date()
        });
    }

    /**
     * Remove photo from rating
     * @param {string} photoUrl - Photo URL to remove
     * @returns {RatingModel} Updated rating model
     */
    removePhoto(photoUrl) {
        if (!this.photos || !Array.isArray(this.photos)) {
            throw new Error('Nenhuma foto para remover');
        }

        const photoIndex = this.photos.indexOf(photoUrl);
        if (photoIndex === -1) {
            throw new Error('Foto não encontrada');
        }

        const updatedPhotos = this.photos.filter(url => url !== photoUrl);

        return new RatingModel({
            ...this,
            photos: updatedPhotos,
            updatedAt: new Date()
        });
    }

    /**
     * Mark rating as helpful
     * @returns {RatingModel} Updated rating model
     */
    markHelpful() {
        return new RatingModel({
            ...this,
            isHelpful: (this.isHelpful || 0) + 1,
            updatedAt: new Date()
        });
    }

    /**
     * Report rating
     * @returns {RatingModel} Updated rating model
     */
    report() {
        return new RatingModel({
            ...this,
            isReported: true,
            moderationStatus: 'pending',
            updatedAt: new Date()
        });
    }

    /**
     * Add owner response
     * @param {string} response - Owner response text
     * @returns {RatingModel} Updated rating model
     */
    addOwnerResponse(response) {
        if (!response || typeof response !== 'string') {
            throw new Error('Resposta deve ser uma string válida');
        }

        if (response.trim().length === 0) {
            throw new Error('Resposta não pode estar vazia');
        }

        if (response.length > 500) {
            throw new Error('Resposta deve ter no máximo 500 caracteres');
        }

        return new RatingModel({
            ...this,
            response: response.trim(),
            responseDate: new Date(),
            updatedAt: new Date()
        });
    }

    /**
     * Get formatted rating display
     * @returns {string} Formatted rating with stars
     */
    getRatingDisplay() {
        const rating = this.rating || 0;
        const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
        return `${stars} ${rating.toFixed(1)}`;
    }

    /**
     * Get individual criteria ratings
     * @returns {Object} Object with individual criteria
     */
    getCriteriaRatings() {
        return {
            quality: this.quality || 0,
            taste: this.taste || 0,
            priceRating: this.priceRating || 0,
            ambiance: this.ambiance || 0,
            service: this.service || 0
        };
    }

    /**
     * Check if rating has photos
     * @returns {boolean} True if rating has photos
     */
    hasPhotos() {
        return this.photos && this.photos.length > 0;
    }

    /**
     * Check if rating has owner response
     * @returns {boolean} True if has owner response
     */
    hasResponse() {
        return this.response && this.response.trim().length > 0;
    }

    /**
     * Check if rating is verified
     * @returns {boolean} True if rating is verified
     */
    isVerifiedRating() {
        return this.isVerified === true;
    }

    /**
     * Check if rating can be displayed
     * @returns {boolean} True if rating is approved
     */
    canDisplay() {
        return this.moderationStatus === 'approved' && !this.isReported;
    }

    /**
     * Get rating summary for display
     * @returns {Object} Summary object with key information
     */
    getSummary() {
        return {
            id: this.id,
            restaurantId: this.restaurantId,
            userName: this.userName,
            rating: this.rating || 0,
            comment: this.comment,
            hasPhotos: this.hasPhotos(),
            photoCount: this.photos ? this.photos.length : 0,
            hasResponse: this.hasResponse(),
            isHelpful: this.isHelpful || 0,
            createdAt: this.createdAt,
            criteria: this.getCriteriaRatings()
        };
    }

    /**
     * Convert to JSON string
     * @returns {string} JSON representation
     */
    toJSON() {
        return JSON.stringify({
            ...this,
            createdAt: this.createdAt?.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
            responseDate: this.responseDate?.toISOString()
        });
    }

    /**
     * Create RatingModel from JSON string
     * @param {string} jsonString - JSON string
     * @returns {RatingModel} Rating model instance
     */
    static fromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            // Parse date strings
            if (data.createdAt) {
                data.createdAt = new Date(data.createdAt);
            }
            if (data.updatedAt) {
                data.updatedAt = new Date(data.updatedAt);
            }
            if (data.responseDate) {
                data.responseDate = new Date(data.responseDate);
            }

            return new RatingModel(data);
        } catch (error) {
            throw new Error('JSON inválido para RatingModel');
        }
    }

    /**
     * Generate user fingerprint for anonymous users
     * @returns {string} User fingerprint
     */
    static generateUserFingerprint() {
        // Simple fingerprint generation - in production, use more sophisticated methods
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;

        // Draw some text with random properties
        ctx.textBaseline = 'top';
        ctx.font = '15px Arial';
        ctx.fillText(navigator.userAgent, 2, 15);
        ctx.fillText(new Date().toString(), 2, 30);

        // Get canvas data as base64
        const fingerprint = canvas.toDataURL();

        // Hash it to create a consistent identifier
        return btoa(fingerprint).substring(0, 32);
    }

    /**
     * Check if two ratings are from the same user
     * @param {RatingModel} otherRating - Another rating to compare
     * @returns {boolean} True if from same user
     */
    isFromSameUser(otherRating) {
        if (!otherRating) return false;

        // Check by user ID if both have it
        if (this.userId && otherRating.userId) {
            return this.userId === otherRating.userId;
        }

        // Check by fingerprint if both have it
        if (this.userFingerprint && otherRating.userFingerprint) {
            return this.userFingerprint === otherRating.userFingerprint;
        }

        return false;
    }
}

export default RatingModel;