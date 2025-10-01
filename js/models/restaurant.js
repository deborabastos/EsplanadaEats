// js/models/restaurant.js - Restaurant data model
// Version: 1.0.2 - Fixed priceType and vegetarianOptions handling

/**
 * Restaurant Model - Defines the structure and validation for restaurant data
 */
export class RestaurantModel {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.description = data.description || '';
        this.cuisine = data.cuisine || '';
        this.price = data.price || 0;
        this.averageQuality = data.averageQuality || 0;
        this.averageTaste = data.averageTaste || 0;
        this.averagePrice = data.averagePrice || 0;
        this.averageAmbiance = data.averageAmbiance || 0;
        this.averageService = data.averageService || 0;
        this.averageOverall = data.averageOverall || 0;
        this.vegetarianOptions = data.vegetarianOptions || null;
        this.priceType = data.priceType || null;
        this.priceKilo = data.priceKilo || null;
        this.priceRange = data.priceRange || null;
        this.access = data.access || '';
        this.hours = data.hours || '';
        this.address = data.address || '';
        this.phone = data.phone || '';
        this.website = data.website || '';
        this.photoUrls = data.photoUrls || [];
        this.photoUrl = data.photoUrl || null; // Primary photo for backward compatibility
        this.totalReviews = data.totalReviews || 0;
        this.totalRatings = data.totalRatings || 0;
        this.ownerId = data.ownerId || null;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    /**
     * Validate restaurant data
     * @returns {Array} Array of validation error messages
     */
    validate() {
        const errors = [];

        // Name validation
        if (!this.name || typeof this.name !== 'string') {
            errors.push('Nome do restaurante é obrigatório');
        } else if (this.name.trim().length < 4) {
            errors.push('Nome do restaurante deve ter no mínimo 4 caracteres');
        } else if (this.name.trim().length > 100) {
            errors.push('Nome do restaurante deve ter no máximo 100 caracteres');
        }

        // Description validation
        if (this.description && this.description.length > 500) {
            errors.push('Descrição deve ter no máximo 500 caracteres');
        }

        // Cuisine validation
        if (this.cuisine && this.cuisine.length > 50) {
            errors.push('Tipo de cozinha deve ter no máximo 50 caracteres');
        }

        // Price validation
        if (this.price !== undefined && this.price !== null) {
            const priceNum = Number(this.price);
            if (isNaN(priceNum) || priceNum < 0) {
                errors.push('Preço deve ser um número positivo');
            } else if (priceNum > 1000) {
                errors.push('Preço informado parece muito alto');
            }
        }

        // Rating validations
        const ratingFields = [
            'averageQuality', 'averageTaste', 'averagePrice',
            'averageAmbiance', 'averageService', 'averageOverall'
        ];

        ratingFields.forEach(field => {
            const value = this[field];
            if (value !== undefined && value !== null) {
                const rating = Number(value);
                if (isNaN(rating) || rating < 0 || rating > 5) {
                    errors.push(`${field} deve estar entre 0 e 5`);
                }
            }
        });

        // Access validation
        if (this.access && this.access.length > 200) {
            errors.push('Informações de acesso devem ter no máximo 200 caracteres');
        }

        // Hours validation
        if (this.hours && this.hours.length > 100) {
            errors.push('Horário de funcionamento deve ter no máximo 100 caracteres');
        }

        // Address validation
        if (this.address && this.address.length > 200) {
            errors.push('Endereço deve ter no máximo 200 caracteres');
        }

        // Phone validation
        if (this.phone) {
            const phoneClean = this.phone.replace(/\D/g, '');
            if (phoneClean.length < 10 || phoneClean.length > 15) {
                errors.push('Telefone deve ter entre 10 e 15 dígitos');
            }
        }

        // Website validation
        if (this.website) {
            try {
                new URL(this.website);
            } catch (error) {
                errors.push('Website deve ser uma URL válida');
            }
        }

        // Photo URLs validation
        if (this.photoUrls && Array.isArray(this.photoUrls)) {
            if (this.photoUrls.length > 10) {
                errors.push('Número máximo de 10 fotos permitido');
            }

            this.photoUrls.forEach((url, index) => {
                if (typeof url !== 'string') {
                    errors.push(`URL da foto ${index + 1} deve ser uma string válida`);
                } else if (url.length > 500) {
                    errors.push(`URL da foto ${index + 1} deve ter no máximo 500 caracteres`);
                }
            });
        }

        // Total reviews validation
        if (this.totalReviews !== undefined && this.totalReviews !== null) {
            const reviews = Number(this.totalReviews);
            if (isNaN(reviews) || reviews < 0) {
                errors.push('Número de avaliações não pode ser negativo');
            }
        }

        return errors;
    }

    /**
     * Convert model to Firestore format
     * @returns {Object} Firestore document data
     */
    toFirestore() {
        return {
            name: this.name.trim(),
            description: this.description.trim(),
            cuisine: this.cuisine.trim(),
            price: Number(this.price),
            averageQuality: Number(this.averageQuality),
            averageTaste: Number(this.averageTaste),
            averagePrice: Number(this.averagePrice),
            averageAmbiance: Number(this.averageAmbiance),
            averageService: Number(this.averageService),
            averageOverall: Number(this.averageOverall),
            vegetarianOptions: this.vegetarianOptions,
            priceType: this.priceType,
            priceKilo: this.priceKilo,
            priceRange: this.priceRange,
            access: this.access.trim(),
            hours: this.hours.trim(),
            address: this.address.trim(),
            phone: this.phone.trim(),
            website: this.website.trim(),
            photoUrls: Array.isArray(this.photoUrls) ? this.photoUrls : [],
            photoUrl: this.photoUrl || (this.photoUrls && this.photoUrls.length > 0 ? this.photoUrls[0] : null),
            totalReviews: Number(this.totalReviews),
            totalRatings: Number(this.totalRatings),
            ownerId: this.ownerId,
            isActive: Boolean(this.isActive),
            createdAt: this.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
    }

    /**
     * Create RestaurantModel from Firestore document
     * @param {Object} doc - Firestore document snapshot
     * @returns {RestaurantModel} Restaurant model instance
     */
    static fromFirestore(doc) {
        const data = doc.data();

        return new RestaurantModel({
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            cuisine: data.cuisine || '',
            price: data.price || 0,
            averageQuality: data.averageQuality || 0,
            averageTaste: data.averageTaste || 0,
            averagePrice: data.averagePrice || 0,
            averageAmbiance: data.averageAmbiance || 0,
            averageService: data.averageService || 0,
            averageOverall: data.averageOverall || 0,
            vegetarianOptions: data.vegetarianOptions || null,
            priceType: data.priceType || null,
            priceKilo: data.priceKilo || null,
            priceRange: data.priceRange || null,
            access: data.access || '',
            hours: data.hours || '',
            address: data.address || '',
            phone: data.phone || '',
            website: data.website || '',
            photoUrls: data.photoUrls || [],
            photoUrl: data.photoUrl || null,
            totalReviews: data.totalReviews || 0,
            totalRatings: data.totalRatings || 0,
            ownerId: data.ownerId || null,
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: data.createdAt?.toDate() || null,
            updatedAt: data.updatedAt?.toDate() || null
        });
    }

    /**
     * Update restaurant with new data
     * @param {Object} updates - Object with fields to update
     * @returns {RestaurantModel} Updated restaurant model
     */
    update(updates) {
        const updatedData = { ...this };

        // Apply updates
        Object.keys(updates).forEach(key => {
            if (key === 'id') {
                console.warn('Cannot update restaurant ID');
                return;
            }
            updatedData[key] = updates[key];
        });

        // Update timestamp
        updatedData.updatedAt = new Date();

        return new RestaurantModel(updatedData);
    }

    /**
     * Add photo URL to restaurant
     * @param {string} photoUrl - Photo URL to add
     * @returns {RestaurantModel} Updated restaurant model
     */
    addPhoto(photoUrl) {
        if (!photoUrl || typeof photoUrl !== 'string') {
            throw new Error('URL da foto é inválida');
        }

        if (!this.photoUrls) {
            this.photoUrls = [];
        }

        if (this.photoUrls.length >= 10) {
            throw new Error('Número máximo de fotos atingido');
        }

        // Check for duplicate
        if (this.photoUrls.includes(photoUrl)) {
            throw new Error('Esta foto já foi adicionada');
        }

        const updatedPhotos = [...this.photoUrls, photoUrl];

        // Set primary photo if this is the first one
        const primaryPhoto = this.photoUrl || photoUrl;

        return new RestaurantModel({
            ...this,
            photoUrls: updatedPhotos,
            photoUrl: primaryPhoto,
            updatedAt: new Date()
        });
    }

    /**
     * Remove photo URL from restaurant
     * @param {string} photoUrl - Photo URL to remove
     * @returns {RestaurantModel} Updated restaurant model
     */
    removePhoto(photoUrl) {
        if (!this.photoUrls || !Array.isArray(this.photoUrls)) {
            throw new Error('Nenhuma foto para remover');
        }

        const photoIndex = this.photoUrls.indexOf(photoUrl);
        if (photoIndex === -1) {
            throw new Error('Foto não encontrada');
        }

        const updatedPhotos = this.photoUrls.filter(url => url !== photoUrl);

        // Update primary photo if necessary
        let primaryPhoto = this.photoUrl;
        if (primaryPhoto === photoUrl) {
            primaryPhoto = updatedPhotos.length > 0 ? updatedPhotos[0] : null;
        }

        return new RestaurantModel({
            ...this,
            photoUrls: updatedPhotos,
            photoUrl: primaryPhoto,
            updatedAt: new Date()
        });
    }

    /**
     * Get restaurant display name
     * @returns {string} Formatted restaurant name
     */
    getDisplayName() {
        return this.name || 'Restaurante Sem Nome';
    }

    /**
     * Check if restaurant has photos
     * @returns {boolean} True if restaurant has photos
     */
    hasPhotos() {
        return (this.photoUrls && this.photoUrls.length > 0) ||
               (this.photoUrl && this.photoUrl.trim() !== '');
    }

    /**
     * Get primary photo URL
     * @returns {string|null} Primary photo URL or null
     */
    getPrimaryPhoto() {
        return this.photoUrl ||
               (this.photoUrls && this.photoUrls.length > 0 ? this.photoUrls[0] : null);
    }

    /**
     * Get formatted rating display
     * @returns {string} Formatted rating with stars
     */
    getRatingDisplay() {
        const rating = this.averageOverall || 0;
        const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
        return `${stars} ${rating.toFixed(1)}`;
    }

    /**
     * Check if restaurant is currently open (simplified)
     * @returns {boolean} True if likely open
     */
    isLikelyOpen() {
        // This is a simplified version - in production, you'd parse actual hours
        if (!this.hours) return false;

        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay();

        // Basic heuristic - most restaurants are open 11:00-22:00, closed early morning
        return currentHour >= 11 && currentHour <= 22;
    }

    /**
     * Get restaurant summary for display
     * @returns {Object} Summary object with key information
     */
    getSummary() {
        return {
            id: this.id,
            name: this.getDisplayName(),
            cuisine: this.cuisine || 'Não especificada',
            rating: this.averageOverall || 0,
            totalReviews: this.totalReviews || 0,
            hasPhotos: this.hasPhotos(),
            primaryPhoto: this.getPrimaryPhoto(),
            isLikelyOpen: this.isLikelyOpen(),
            vegetarianOptions: this.vegetarianOptions
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
            updatedAt: this.updatedAt?.toISOString()
        });
    }

    /**
     * Create RestaurantModel from JSON string
     * @param {string} jsonString - JSON string
     * @returns {RestaurantModel} Restaurant model instance
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

            return new RestaurantModel(data);
        } catch (error) {
            throw new Error('JSON inválido para RestaurantModel');
        }
    }
}

export default RestaurantModel;