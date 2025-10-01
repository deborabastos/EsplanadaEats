// js/services/rating-validation-service.js - Rating validation and security service

/**
 * Rating Validation Service - Comprehensive rating validation, fraud prevention, and security
 */
export class RatingValidationService {
    constructor(storageService) {
        this.storageService = storageService;
        this.validationRules = this.initializeValidationRules();
        this.rateLimits = new Map();
        this.suspiciousPatterns = this.initializeSuspiciousPatterns();
        this.lastSubmissionTime = 0;
        this.securityLogs = [];

        // Verify required StorageService methods
        this.verifyStorageServiceMethods();

        console.log('RatingValidationService initialized');
    }

    /**
     * Verify that StorageService has all required methods
     */
    verifyStorageServiceMethods() {
        const requiredMethods = [
            'getRatingsByUser',
            'createRating',
            'updateRating',
            'logSecurityEvent',
            'getUserRating'
        ];

        const missingMethods = requiredMethods.filter(method =>
            typeof this.storageService[method] !== 'function'
        );

        if (missingMethods.length > 0) {
            console.error('❌ RatingValidationService: StorageService missing methods:', missingMethods);
            console.log('Available StorageService methods:',
                Object.getOwnPropertyNames(Object.getPrototypeOf(this.storageService))
            );
            throw new Error(`StorageService is missing required methods: ${missingMethods.join(', ')}`);
        }

        console.log('✅ StorageService has all required methods for validation');
    }

    /**
     * Initialize validation rules for rating data
     */
    initializeValidationRules() {
        return {
            rating: {
                min: 1,
                max: 5,
                required: true,
                type: 'number'
            },
            restaurantId: {
                required: true,
                type: 'string',
                minLength: 1,
                maxLength: 100
            },
            userName: {
                required: true,
                type: 'string',
                minLength: 1,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\s\-']+$/
            },
            userFingerprint: {
                required: true,
                type: 'string',
                minLength: 10,
                maxLength: 200
            },
            quality: {
                required: false,
                type: 'number',
                min: 0,
                max: 5
            },
            taste: {
                required: false,
                type: 'number',
                min: 0,
                max: 5
            },
            priceRating: {
                required: false,
                type: 'number',
                min: 0,
                max: 5
            },
            ambiance: {
                required: false,
                type: 'number',
                min: 0,
                max: 5
            },
            service: {
                required: false,
                type: 'number',
                min: 0,
                max: 5
            },
            comment: {
                required: false,
                type: 'string',
                minLength: 0,
                maxLength: 500
            },
            moderationStatus: {
                required: true,
                type: 'string',
                allowedValues: ['approved', 'pending', 'rejected']
            }
        };
    }

    /**
     * Initialize suspicious patterns and thresholds
     */
    initializeSuspiciousPatterns() {
        return {
            rapidFire: {
                threshold: 3, // submissions
                timeframe: 60000, // 1 minute
                blockDuration: 300000 // 5 minutes
            },
            duplicateFingerprint: {
                threshold: 2, // same fingerprint
                timeframe: 3600000, // 1 hour
                blockDuration: 86400000 // 24 hours
            },
            suspiciousUserAgent: [
                /bot/i,
                /crawler/i,
                /spider/i,
                /scraper/i,
                /automated/i,
                /test/i,
                /headless/i,
                /phantom/i,
                /selenium/i
            ],
            rapidSubmission: {
                minInterval: 2000 // 2 seconds minimum between submissions
            }
        };
    }

    /**
     * Main validation method - validates a rating submission
     * @param {Object} ratingData - Rating data to validate
     * @returns {Promise<Object>} Validation result with metadata
     */
    async validateRating(ratingData) {
        console.log('🔍 Starting comprehensive rating validation');

        const validationErrors = [];
        const validationMetadata = {};

        try {
            // Step 1: Data format validation
            const formatValidation = this.validateDataFormat(ratingData);
            validationMetadata.formatValidation = formatValidation;
            if (!formatValidation.isValid) {
                validationErrors.push(...formatValidation.errors);
            }

            // Step 2: Rate limiting check
            const rateLimitCheck = await this.checkRateLimits(ratingData);
            validationMetadata.rateLimitCheck = rateLimitCheck;
            if (!rateLimitCheck.allowed) {
                validationErrors.push(rateLimitCheck.reason);
            }

            // Step 3: Duplicate check
            const duplicateCheck = await this.checkForDuplicates(ratingData);
            validationMetadata.duplicateCheck = duplicateCheck;
            if (!duplicateCheck.allowed) {
                validationErrors.push(duplicateCheck.reason);
            }

            // Step 4: Suspicious activity detection
            const suspiciousCheck = this.detectSuspiciousActivity(ratingData);
            validationMetadata.suspiciousCheck = suspiciousCheck;
            if (!suspiciousCheck.allowed) {
                validationErrors.push(suspiciousCheck.reason);
            }

            // Step 5: Business rules validation
            const businessRulesCheck = this.validateBusinessRules(ratingData);
            validationMetadata.businessRulesCheck = businessRulesCheck;
            if (!businessRulesCheck.allowed) {
                validationErrors.push(...businessRulesCheck.reasons);
            }

            // Log validation attempt
            await this.logValidationAttempt(ratingData, {
                isValid: validationErrors.length === 0,
                errors: validationErrors,
                metadata: validationMetadata
            });

            console.log('✅ Rating validation completed:', {
                isValid: validationErrors.length === 0,
                errorCount: validationErrors.length,
                metadata: validationMetadata
            });

            return {
                isValid: validationErrors.length === 0,
                errors: validationErrors,
                metadata: validationMetadata,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Error during rating validation:', error);
            await this.logSecurityEvent('validation_error', {
                error: error.message,
                ratingData: this.sanitizeRatingData(ratingData)
            });

            return {
                isValid: false,
                errors: ['Erro durante a validação da avaliação'],
                metadata: { error: error.message },
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Validate data format against defined rules
     * @param {Object} data - Rating data to validate
     * @returns {Object} Format validation result
     */
    validateDataFormat(data) {
        console.log('📋 Validating rating data format');

        const errors = [];

        // Validate each field according to rules
        Object.keys(this.validationRules).forEach(field => {
            const rules = this.validationRules[field];
            const value = data[field];

            if (!this.validateField(value, rules, field)) {
                const fieldName = this.getFieldDisplayName(field);
                if (rules.required && (value === undefined || value === null || value === '')) {
                    errors.push(`${fieldName} é obrigatório`);
                } else if (value !== undefined && value !== null && value !== '') {
                    if (rules.type === 'number') {
                        if (isNaN(Number(value))) {
                            errors.push(`${fieldName} deve ser um número válido`);
                        } else {
                            const numValue = Number(value);
                            if (rules.min !== undefined && numValue < rules.min) {
                                errors.push(`${fieldName} deve ser pelo menos ${rules.min}`);
                            }
                            if (rules.max !== undefined && numValue > rules.max) {
                                errors.push(`${fieldName} deve ser no máximo ${rules.max}`);
                            }
                        }
                    } else if (rules.type === 'string') {
                        if (typeof value !== 'string') {
                            errors.push(`${fieldName} deve ser um texto`);
                        } else {
                            if (rules.minLength && value.length < rules.minLength) {
                                errors.push(`${fieldName} deve ter pelo menos ${rules.minLength} caracteres`);
                            }
                            if (rules.maxLength && value.length > rules.maxLength) {
                                errors.push(`${fieldName} deve ter no máximo ${rules.maxLength} caracteres`);
                            }
                            if (rules.pattern && !rules.pattern.test(value)) {
                                errors.push(`${fieldName} contém caracteres inválidos`);
                            }
                            if (rules.allowedValues && !rules.allowedValues.includes(value)) {
                                errors.push(`${fieldName} deve ser um dos valores permitidos`);
                            }
                        }
                    }
                }
            }
        });

        // Additional cross-field validations
        if (data.rating !== undefined && data.quality !== undefined && data.rating !== data.quality) {
            errors.push('Avaliação geral deve ser igual à qualidade quando ambos são informados');
        }

        console.log('📊 Format validation result:', {
            isValid: errors.length === 0,
            errorCount: errors.length,
            errors: errors.slice(0, 3) // Show first 3 errors in console
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate individual field against rules
     * @param {*} value - Field value
     * @param {Object} rules - Validation rules
     * @param {string} fieldName - Field name for logging
     * @returns {boolean} Whether field is valid
     */
    validateField(value, rules, fieldName) {
        // Required field validation
        if (rules.required && (value === undefined || value === null || value === '')) {
            return false;
        }

        // If field is not required and empty, it's valid
        if (value === undefined || value === null || value === '') {
            return true;
        }

        // Type-specific validation
        if (rules.type === 'number') {
            if (!this.isValidNumber(value)) {
                return false;
            }
        } else if (rules.type === 'string') {
            if (typeof value !== 'string') {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if value is a valid number
     * @param {*} value - Value to check
     * @returns {boolean} Whether value is a valid number
     */
    isValidNumber(value) {
        return !isNaN(Number(value)) && isFinite(Number(value));
    }

    /**
     * Get display name for field
     * @param {string} field - Field name
     * @returns {string} Display name
     */
    getFieldDisplayName(field) {
        const displayNames = {
            rating: 'Avaliação',
            restaurantId: 'ID do Restaurante',
            userName: 'Nome do Usuário',
            userFingerprint: 'Identificação do Usuário',
            quality: 'Qualidade',
            taste: 'Sabor',
            priceRating: 'Preço',
            ambiance: 'Ambiente',
            service: 'Serviço',
            comment: 'Comentário',
            moderationStatus: 'Status de Moderação'
        };
        return displayNames[field] || field;
    }

    /**
     * Check rate limits for user and global submissions
     * @param {Object} ratingData - Rating data
     * @returns {Promise<Object>} Rate limit check result
     */
    async checkRateLimits(ratingData) {
        console.log('⏱️ Checking rate limits');

        const now = Date.now();
        const userKey = ratingData.userFingerprint;
        const globalKey = 'global';

        // Get or create user rate limit
        const userLimit = this.rateLimits.get(userKey) || {
            count: 0,
            resetTime: now + this.suspiciousPatterns.rapidFire.timeframe,
            blocked: false,
            blockUntil: 0,
            lastSubmission: 0
        };

        // Get or create global rate limit
        const globalLimit = this.rateLimits.get(globalKey) || {
            count: 0,
            resetTime: now + this.suspiciousPatterns.rapidFire.timeframe,
            blocked: false,
            blockUntil: 0
        };

        // Reset counters if timeframe expired
        if (now > userLimit.resetTime) {
            userLimit.count = 0;
            userLimit.resetTime = now + this.suspiciousPatterns.rapidFire.timeframe;
        }

        if (now > globalLimit.resetTime) {
            globalLimit.count = 0;
            globalLimit.resetTime = now + this.suspiciousPatterns.rapidFire.timeframe;
        }

        // Check if user is blocked
        if (userLimit.blocked && now < userLimit.blockUntil) {
            const remainingTime = Math.ceil((userLimit.blockUntil - now) / 1000);
            return {
                allowed: false,
                reason: `Você está temporariamente bloqueado. Tente novamente em ${remainingTime} segundos.`,
                blockedUntil: userLimit.blockUntil
            };
        }

        // Check if global is blocked
        if (globalLimit.blocked && now < globalLimit.blockUntil) {
            return {
                allowed: false,
                reason: 'Sistema temporariamente sobrecarregado. Tente novamente em alguns minutos.',
                blockedUntil: globalLimit.blockUntil
            };
        }

        // Check user-specific rate limit
        if (userLimit.count >= this.suspiciousPatterns.rapidFire.threshold) {
            userLimit.blocked = true;
            userLimit.blockUntil = now + this.suspiciousPatterns.rapidFire.blockDuration;
            this.rateLimits.set(userKey, userLimit);

            const blockDuration = Math.ceil(this.suspiciousPatterns.rapidFire.blockDuration / 1000);
            return {
                allowed: false,
                reason: `Muitas avaliações enviadas. Aguarde ${blockDuration} segundos.`,
                blockedUntil: userLimit.blockUntil
            };
        }

        // Check rapid submission (client-side protection)
        const timeSinceLastSubmission = now - (userLimit.lastSubmission || 0);
        if (timeSinceLastSubmission < this.suspiciousPatterns.rapidSubmission.minInterval) {
            return {
                allowed: false,
                reason: 'Envio muito rápido. Por favor, aguarde um momento.'
            };
        }

        // Update counters
        userLimit.count++;
        userLimit.lastSubmission = now;
        globalLimit.count++;

        this.rateLimits.set(userKey, userLimit);
        this.rateLimits.set(globalKey, globalLimit);

        console.log('✅ Rate limit check passed:', {
            userCount: userLimit.count,
            globalCount: globalLimit.count,
            timeSinceLastSubmission
        });

        return {
            allowed: true,
            metadata: {
                userCount: userLimit.count,
                globalCount: globalLimit.count,
                nextReset: userLimit.resetTime
            }
        };
    }

    /**
     * Check for duplicate ratings from same user
     * @param {Object} ratingData - Rating data
     * @returns {Promise<Object>} Duplicate check result
     */
    async checkForDuplicates(ratingData) {
        console.log('🔍 Checking for duplicate ratings');

        try {
            // Query existing ratings from same user for same restaurant
            const existingRatings = await this.storageService.getRatingsByUser(
                ratingData.userFingerprint,
                ratingData.restaurantId
            );

            if (existingRatings.length > 0) {
                const lastRating = existingRatings[0];
                const lastRatingTime = lastRating.createdAt.toDate ?
                    lastRating.createdAt.toDate().getTime() :
                    new Date(lastRating.createdAt).getTime();
                const currentTime = new Date().getTime();
                const timeDiff = currentTime - lastRatingTime;

                const minTimeBetweenRatings = 24 * 60 * 60 * 1000; // 24 hours

                if (timeDiff < minTimeBetweenRatings) {
                    const remainingHours = Math.ceil((minTimeBetweenRatings - timeDiff) / (1000 * 60 * 60));
                    return {
                        allowed: false,
                        reason: `Você já avaliou este restaurante. Aguarde ${remainingHours} horas para enviar nova avaliação.`,
                        existingRatingId: lastRating.id,
                        timeSinceLastRating: timeDiff
                    };
                }

                // Allow updating existing rating
                return {
                    allowed: true,
                    isUpdate: true,
                    existingRatingId: lastRating.id,
                    existingRating: lastRating
                };
            }

            console.log('✅ No duplicate ratings found');
            return {
                allowed: true,
                isUpdate: false
            };

        } catch (error) {
            console.error('❌ Error checking for duplicates:', error);

            // Log security event
            await this.logSecurityEvent('duplicate_check_error', {
                error: error.message,
                ratingData: this.sanitizeRatingData(ratingData)
            });

            // Allow rating but with warning
            return {
                allowed: true,
                warning: 'Não foi possível verificar avaliações duplicadas'
            };
        }
    }

    /**
     * Detect suspicious activity patterns
     * @param {Object} ratingData - Rating data
     * @returns {Object} Suspicious activity check result
     */
    detectSuspiciousActivity(ratingData) {
        console.log('🕵️ Detecting suspicious activity patterns');

        // Check user agent for suspicious patterns
        const userAgent = navigator.userAgent;
        for (const pattern of this.suspiciousPatterns.suspiciousUserAgent) {
            if (pattern.test(userAgent)) {
                this.logSecurityEvent('suspicious_user_agent', {
                    userAgent,
                    pattern: pattern.toString(),
                    ratingData: this.sanitizeRatingData(ratingData)
                });

                return {
                    allowed: false,
                    reason: 'Acesso detectado como automatizado. Use um navegador normal.',
                    detectionType: 'suspicious_user_agent'
                };
            }
        }

        // Check for extremely rapid submissions
        const submissionTime = Date.now();
        const timeSinceLastSubmission = submissionTime - this.lastSubmissionTime;

        if (this.lastSubmissionTime > 0 && timeSinceLastSubmission < this.suspiciousPatterns.rapidSubmission.minInterval) {
            this.logSecurityEvent('rapid_submission_detected', {
                timeSinceLastSubmission,
                ratingData: this.sanitizeRatingData(ratingData)
            });

            return {
                allowed: false,
                reason: 'Envio muito rápido detectado. Por favor, aguarde.',
                detectionType: 'rapid_submission'
            };
        }

        this.lastSubmissionTime = submissionTime;

        // Check for unusual rating patterns
        if (this.detectUnusualRatingPattern(ratingData)) {
            this.logSecurityEvent('unusual_rating_pattern', {
                ratingData: this.sanitizeRatingData(ratingData)
            });

            return {
                allowed: false,
                reason: 'Padrão de avaliação incomum detectado.',
                detectionType: 'unusual_pattern'
            };
        }

        console.log('✅ No suspicious activity detected');
        return {
            allowed: true
        };
    }

    /**
     * Detect unusual rating patterns
     * @param {Object} ratingData - Rating data
     * @returns {boolean} Whether unusual pattern is detected
     */
    detectUnusualRatingPattern(ratingData) {
        // Check for obviously suspicious patterns

        // Check if all ratings are exactly the same (suspicious)
        const ratings = [
            ratingData.quality,
            ratingData.taste,
            ratingData.priceRating,
            ratingData.ambiance,
            ratingData.service
        ].filter(r => r !== undefined && r !== null);

        if (ratings.length >= 3 && ratings.every(r => r === ratings[0]) && ratings[0] === 5) {
            return true; // All perfect scores - suspicious
        }

        if (ratings.length >= 3 && ratings.every(r => r === ratings[0]) && ratings[0] === 1) {
            return true; // All terrible scores - suspicious
        }

        // Check for impossible combinations
        if (ratingData.quality === 5 && ratingData.priceRating === 1 && ratingData.service === 1) {
            return true; // Excellent quality but terrible service and price - suspicious
        }

        return false;
    }

    /**
     * Validate business rules
     * @param {Object} ratingData - Rating data
     * @returns {Object} Business rules validation result
     */
    validateBusinessRules(ratingData) {
        console.log('📋 Validating business rules');

        const reasons = [];

        // Check rating time is not in the future
        const now = Date.now();
        const ratingTime = ratingData.timestamp ? new Date(ratingData.timestamp).getTime() : now;

        if (ratingTime > now + 60000) { // Allow 1 minute clock skew
            reasons.push('Data da avaliação não pode estar no futuro');
        }

        // Check rating time is not too far in the past
        const maxPastTime = now - (30 * 24 * 60 * 60 * 1000); // 30 days
        if (ratingTime < maxPastTime) {
            reasons.push('Data da avaliação é muito antiga (mais de 30 dias)');
        }

        // Validate rating consistency
        if (ratingData.rating && ratingData.quality && Math.abs(ratingData.rating - ratingData.quality) > 2) {
            reasons.push('Avaliação geral e qualidade devem ser consistentes');
        }

        // Check comment length and content
        if (ratingData.comment) {
            if (ratingData.comment.length > 500) {
                reasons.push('Comentário muito longo (máximo 500 caracteres)');
            }

            // Check for spam patterns in comment
            const spamPatterns = [
                /(.)\1{5,}/, // Repeated characters
                /^[A-Z\s]+$/, // All caps
                /(?:http|www)\S+/i // URLs
            ];

            for (const pattern of spamPatterns) {
                if (pattern.test(ratingData.comment)) {
                    reasons.push('Comentário contém padrões suspeitos');
                    break;
                }
            }
        }

        console.log('📊 Business rules validation result:', {
            allowed: reasons.length === 0,
            reasonCount: reasons.length,
            reasons: reasons.slice(0, 2) // Show first 2 reasons
        });

        return {
            allowed: reasons.length === 0,
            reasons
        };
    }

    /**
     * Log validation attempt
     * @param {Object} ratingData - Rating data
     * @param {Object} validationResult - Validation result
     */
    async logValidationAttempt(ratingData, validationResult) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ratingData: this.sanitizeRatingData(ratingData),
            validationResult: {
                isValid: validationResult.isValid,
                errorCount: validationResult.errors.length,
                metadata: {
                    formatValidation: validationResult.metadata.formatValidation?.isValid || false,
                    rateLimitCheck: validationResult.metadata.rateLimitCheck?.allowed || false,
                    duplicateCheck: validationResult.metadata.duplicateCheck?.allowed || false,
                    suspiciousCheck: validationResult.metadata.suspiciousCheck?.allowed || false,
                    businessRulesCheck: validationResult.metadata.businessRulesCheck?.allowed || false
                }
            }
        };

        this.securityLogs.push(logEntry);

        // Keep only last 100 logs in memory
        if (this.securityLogs.length > 100) {
            this.securityLogs = this.securityLogs.slice(-100);
        }

        console.log('📝 Validation attempt logged');
    }

    /**
     * Log security event
     * @param {string} eventType - Type of security event
     * @param {Object} data - Event data
     */
    async logSecurityEvent(eventType, data) {
        const securityEvent = {
            eventType,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            data
        };

        console.warn('🚨 Security event logged:', securityEvent);

        // In a production environment, this would be sent to a security monitoring service
        // For now, we'll store in memory and log to console
        this.securityLogs.push(securityEvent);

        // Could also send to Firebase for persistent storage
        try {
            // await this.storageService.logSecurityEvent(securityEvent);
        } catch (error) {
            console.error('Failed to log security event to storage:', error);
        }
    }

    /**
     * Sanitize rating data for logging (remove sensitive information)
     * @param {Object} ratingData - Raw rating data
     * @returns {Object} Sanitized rating data
     */
    sanitizeRatingData(ratingData) {
        const sanitized = { ...ratingData };

        // Remove or mask sensitive fields
        if (sanitized.comment && sanitized.comment.length > 100) {
            sanitized.comment = sanitized.comment.substring(0, 100) + '...';
        }

        // Keep fingerprint for security analysis but mask partial
        if (sanitized.userFingerprint) {
            sanitized.userFingerprint = sanitized.userFingerprint.substring(0, 10) + '...';
        }

        return sanitized;
    }

    /**
     * Clear rate limits (for testing or admin purposes)
     * @param {string} userFingerprint - User fingerprint to clear, or null for all
     */
    clearRateLimits(userFingerprint = null) {
        if (userFingerprint) {
            this.rateLimits.delete(userFingerprint);
            console.log(`🧹 Rate limits cleared for user: ${userFingerprint}`);
        } else {
            this.rateLimits.clear();
            console.log('🧹 All rate limits cleared');
        }
    }

    /**
     * Get current rate limit status
     * @param {string} userFingerprint - User fingerprint
     * @returns {Object} Rate limit status
     */
    getRateLimitStatus(userFingerprint) {
        const userLimit = this.rateLimits.get(userFingerprint);
        const globalLimit = this.rateLimits.get('global');

        return {
            user: userLimit || { count: 0, blocked: false },
            global: globalLimit || { count: 0, blocked: false },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get recent security logs
     * @param {number} limit - Maximum number of logs to return
     * @returns {Array} Recent security logs
     */
    getSecurityLogs(limit = 50) {
        return this.securityLogs.slice(-limit);
    }

    /**
     * Get validation summary statistics
     * @returns {Object} Validation statistics
     */
    getValidationStats() {
        const recentLogs = this.getSecurityLogs(100);

        const stats = {
            totalValidations: recentLogs.length,
            successfulValidations: 0,
            failedValidations: 0,
            securityEvents: 0,
            commonErrors: {},
            lastValidationTime: null
        };

        recentLogs.forEach(log => {
            if (log.validationResult) {
                if (log.validationResult.isValid) {
                    stats.successfulValidations++;
                } else {
                    stats.failedValidations++;
                }
            } else {
                stats.securityEvents++;
            }

            stats.lastValidationTime = log.timestamp;
        });

        return stats;
    }
}

export default RatingValidationService;