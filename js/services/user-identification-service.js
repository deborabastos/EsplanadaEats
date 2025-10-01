// js/services/user-identification-service.js - User identification combining fingerprint and name

import { FingerprintService } from './fingerprint-service.js';

/**
 * User Identification Service - Combines browser fingerprint with user input for unique identification
 */
export class UserIdentificationService {
    constructor() {
        this.fingerprintService = new FingerprintService();
        this.userData = null;
        this.isIdentified = false;
        this.storageKey = 'esplanada_user_identification';

        console.log('UserIdentificationService initialized');
    }

    /**
     * Check if user is already identified
     * @returns {boolean} True if user is identified
     */
    isUserIdentified() {
        return this.isIdentified && this.userData !== null;
    }

    /**
     * Get current user data
     * @returns {Object|null} Current user identification data
     */
    getUserData() {
        return this.userData;
    }

    /**
     * Generate unique user ID from fingerprint and name
     * @param {string} fingerprint - Browser fingerprint hash
     * @param {string} userName - User provided name
     * @returns {Promise<string>} Unique user ID
     */
    async generateUserId(fingerprint, userName) {
        const combinedData = `${fingerprint}:${userName.toLowerCase().trim()}`;

        // Use the same hash method from fingerprint service
        return await this.fingerprintService.generateHash(combinedData);
    }

    /**
     * Load existing user identification from localStorage
     * @returns {Object|null} Stored user data or null
     */
    loadUserIdentification() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) return null;

            const data = JSON.parse(stored);
            console.log('Loaded user identification from storage:', data);

            // Validate stored data
            if (!this.validateUserData(data)) {
                console.warn('Invalid user data in storage, clearing...');
                localStorage.removeItem(this.storageKey);
                return null;
            }

            return data;

        } catch (error) {
            console.error('Failed to load user identification:', error);
            localStorage.removeItem(this.storageKey);
            return null;
        }
    }

    /**
     * Save user identification to localStorage
     * @param {Object} userData - User identification data
     */
    saveUserIdentification(userData) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(userData));
            console.log('User identification saved to storage');
        } catch (error) {
            console.error('Failed to save user identification:', error);
        }
    }

    /**
     * Validate user data structure
     * @param {Object} data - User data to validate
     * @returns {boolean} True if valid
     */
    validateUserData(data) {
        if (!data || typeof data !== 'object') return false;

        const required = ['userId', 'userName', 'fingerprint', 'fingerprintData', 'createdAt'];
        return required.every(field => data.hasOwnProperty(field));
    }

    /**
     * Initialize user identification (load existing or generate new)
     * @returns {Promise<Object>} User identification data
     */
    async initializeUserIdentification() {
        try {
            console.log('Initializing user identification...');

            // Try to load existing identification
            const existingData = this.loadUserIdentification();
            if (existingData) {
                this.userData = existingData;
                this.isIdentified = true;
                console.log('User already identified:', existingData.userName);
                return existingData;
            }

            // Generate new fingerprint
            const fingerprintResult = await this.fingerprintService.generateFingerprint();
            console.log('New fingerprint generated for identification');

            return {
                needsIdentification: true,
                fingerprintData: fingerprintResult
            };

        } catch (error) {
            console.error('Failed to initialize user identification:', error);
            throw new Error('Could not initialize user identification');
        }
    }

    /**
     * Complete user identification with name input
     * @param {string} userName - User provided name
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Complete user identification data
     */
    async completeIdentification(userName, options = {}) {
        try {
            console.log('Completing user identification for:', userName);

            // Validate input
            if (!userName || typeof userName !== 'string') {
                throw new Error('User name is required');
            }

            const trimmedName = userName.trim();
            if (trimmedName.length < 2) {
                throw new Error('User name must be at least 2 characters');
            }

            if (trimmedName.length > 50) {
                throw new Error('User name must be less than 50 characters');
            }

            // Ensure we have a fingerprint
            if (!this.fingerprintService.hasFingerprint()) {
                await this.fingerprintService.generateFingerprint();
            }

            const fingerprint = this.fingerprintService.getFingerprint();
            const fingerprintData = this.fingerprintService.getFingerprintData();

            // Generate unique user ID
            const userId = await this.generateUserId(fingerprint, trimmedName);

            // Create user data object
            const userData = {
                userId,
                userName: trimmedName,
                displayName: options.displayName || trimmedName,
                fingerprint,
                fingerprintData,
                isAnonymous: options.isAnonymous || false,
                createdAt: new Date().toISOString(),
                lastActiveAt: new Date().toISOString(),
                version: '1.0'
            };

            // Save to storage
            this.saveUserIdentification(userData);

            // Update service state
            this.userData = userData;
            this.isIdentified = true;

            console.log('User identification completed successfully:', userData);

            return userData;

        } catch (error) {
            console.error('Failed to complete user identification:', error);
            throw error;
        }
    }

    /**
     * Update user last active timestamp
     */
    updateLastActive() {
        if (!this.userData) return;

        this.userData.lastActiveAt = new Date().toISOString();
        this.saveUserIdentification(this.userData);
    }

    /**
     * Clear user identification (logout)
     */
    clearIdentification() {
        try {
            localStorage.removeItem(this.storageKey);
            this.userData = null;
            this.isIdentified = false;
            console.log('User identification cleared');
        } catch (error) {
            console.error('Failed to clear user identification:', error);
        }
    }

    /**
     * Get user-friendly display name
     * @returns {string} Display name for the user
     */
    getDisplayName() {
        if (!this.userData) return 'Anonymous User';

        if (this.userData.isAnonymous) {
            return 'Anonymous User';
        }

        return this.userData.displayName || this.userData.userName;
    }

    /**
     * Check if user is anonymous
     * @returns {boolean} True if user is anonymous
     */
    isAnonymous() {
        return this.userData?.isAnonymous || false;
    }

    /**
     * Get user identification summary for display
     * @returns {Object} Summary data for UI
     */
    getIdentificationSummary() {
        if (!this.userData) {
            return {
                identified: false,
                message: 'Not identified'
            };
        }

        return {
            identified: true,
            userName: this.userData.userName,
            displayName: this.getDisplayName(),
            isAnonymous: this.userData.isAnonymous,
            createdAt: this.userData.createdAt,
            lastActive: this.userData.lastActiveAt,
            userId: this.userData.userId
        };
    }

    /**
     * Validate if user can perform certain actions
     * @param {string} action - Action to validate
     * @param {Object} context - Additional context
     * @returns {Object} Validation result
     */
    validateUserAction(action, context = {}) {
        if (!this.isIdentified) {
            return {
                allowed: false,
                reason: 'User not identified',
                requiresIdentification: true
            };
        }

        // Add more validation logic based on action type
        switch (action) {
            case 'rate_restaurant':
                return this.validateRatingAction(context);

            case 'add_restaurant':
                return {
                    allowed: true,
                    user: this.getIdentificationSummary()
                };

            default:
                return {
                    allowed: true,
                    user: this.getIdentificationSummary()
                };
        }
    }

    /**
     * Validate rating action
     * @param {Object} context - Rating context
     * @returns {Object} Validation result
     */
    validateRatingAction(context) {
        if (!context.restaurantId) {
            return {
                allowed: false,
                reason: 'Restaurant ID required'
            };
        }

        // Check for existing rating (this would need storage service integration)
        // For now, allow rating
        return {
            allowed: true,
            user: this.getIdentificationSummary(),
            restaurantId: context.restaurantId
        };
    }

    /**
     * Get user fingerprint for external use
     * @returns {string|null} User fingerprint
     */
    getUserFingerprint() {
        return this.userData?.fingerprint || null;
    }

    /**
     * Get user ID for external use
     * @returns {string|null} User ID
     */
    getUserId() {
        return this.userData?.userId || null;
    }

    /**
     * Clear current user identification
     * Forces user to re-identify on next interaction
     */
    clearUserIdentification() {
        console.log('Clearing user identification');

        // Clear in-memory data
        this.userData = null;
        this.isIdentified = false;

        // Clear localStorage
        localStorage.removeItem(this.storageKey);

        console.log('User identification cleared');
    }
}

export default UserIdentificationService;