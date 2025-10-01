// js/utils/validation.js - Data validation utilities

/**
 * Validation utilities for data models and user input
 */
export class ValidationUtils {
    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    static isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    /**
     * Validate phone number (Brazilian format)
     * @param {string} phone - Phone number to validate
     * @returns {boolean} True if valid
     */
    static isValidPhone(phone) {
        if (!phone || typeof phone !== 'string') return false;

        // Remove non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');

        // Check if it has 10 or 11 digits (Brazilian format)
        return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    }

    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid
     */
    static isValidUrl(url) {
        if (!url || typeof url !== 'string') return false;

        try {
            new URL(url.trim());
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Validate rating value (0-5)
     * @param {number} rating - Rating to validate
     * @returns {boolean} True if valid
     */
    static isValidRating(rating) {
        const num = Number(rating);
        return !isNaN(num) && num >= 0 && num <= 5;
    }

    /**
     * Validate price value
     * @param {number|string} price - Price to validate
     * @returns {boolean} True if valid
     */
    static isValidPrice(price) {
        const num = Number(price);
        return !isNaN(num) && num >= 0 && num <= 10000;
    }

    /**
     * Validate text length
     * @param {string} text - Text to validate
     * @param {number} minLength - Minimum length
     * @param {number} maxLength - Maximum length
     * @returns {boolean} True if valid
     */
    static isValidTextLength(text, minLength = 0, maxLength = Infinity) {
        if (typeof text !== 'string') return false;

        const trimmed = text.trim();
        return trimmed.length >= minLength && trimmed.length <= maxLength;
    }

    /**
     * Validate restaurant name
     * @param {string} name - Restaurant name to validate
     * @returns {Object} Validation result
     */
    static validateRestaurantName(name) {
        if (!name || typeof name !== 'string') {
            return {
                isValid: false,
                error: 'Nome do restaurante é obrigatório'
            };
        }

        const trimmed = name.trim();

        if (trimmed.length < 4) {
            return {
                isValid: false,
                error: 'Nome do restaurante deve ter no mínimo 4 caracteres'
            };
        }

        if (trimmed.length > 100) {
            return {
                isValid: false,
                error: 'Nome do restaurante deve ter no máximo 100 caracteres'
            };
        }

        // Check for invalid characters
        const invalidChars = /[<>{}[\]\\`~]/;
        if (invalidChars.test(trimmed)) {
            return {
                isValid: false,
                error: 'Nome contém caracteres inválidos'
            };
        }

        return {
            isValid: true,
            value: trimmed
        };
    }

    /**
     * Validate restaurant description
     * @param {string} description - Description to validate
     * @returns {Object} Validation result
     */
    static validateRestaurantDescription(description) {
        if (!description || description.trim().length === 0) {
            return {
                isValid: true,
                value: ''
            };
        }

        const trimmed = description.trim();

        if (trimmed.length > 500) {
            return {
                isValid: false,
                error: 'Descrição deve ter no máximo 500 caracteres'
            };
        }

        return {
            isValid: true,
            value: trimmed
        };
    }

    /**
     * Validate rating comment
     * @param {string} comment - Comment to validate
     * @returns {Object} Validation result
     */
    static validateRatingComment(comment) {
        if (!comment || comment.trim().length === 0) {
            return {
                isValid: true,
                value: ''
            };
        }

        const trimmed = comment.trim();

        if (trimmed.length > 1000) {
            return {
                isValid: false,
                error: 'Comentário deve ter no máximo 1000 caracteres'
            };
        }

        // Check for profanity (basic implementation)
        const profanityList = ['palavrao1', 'palavrao2', 'palavrao3']; // In production, use proper profanity filter
        const hasProfanity = profanityList.some(word =>
            trimmed.toLowerCase().includes(word.toLowerCase())
        );

        if (hasProfanity) {
            return {
                isValid: false,
                error: 'Comentário contém linguagem inadequada'
            };
        }

        return {
            isValid: true,
            value: trimmed
        };
    }

    /**
     * Validate image URL
     * @param {string} imageUrl - Image URL to validate
     * @returns {Object} Validation result
     */
    static validateImageUrl(imageUrl) {
        if (!imageUrl || imageUrl.trim().length === 0) {
            return {
                isValid: true,
                value: null
            };
        }

        const trimmed = imageUrl.trim();

        if (!this.isValidUrl(trimmed)) {
            return {
                isValid: false,
                error: 'URL da imagem inválida'
            };
        }

        if (trimmed.length > 500) {
            return {
                isValid: false,
                error: 'URL da imagem deve ter no máximo 500 caracteres'
            };
        }

        // Check if it's an image URL (basic check)
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const hasImageExtension = imageExtensions.some(ext =>
            trimmed.toLowerCase().includes(ext)
        );

        if (!hasImageExtension) {
            return {
                isValid: false,
                error: 'URL deve apontar para uma imagem'
            };
        }

        return {
            isValid: true,
            value: trimmed
        };
    }

    /**
     * Sanitize HTML content
     * @param {string} html - HTML content to sanitize
     * @returns {string} Sanitized HTML
     */
    static sanitizeHtml(html) {
        if (!html || typeof html !== 'string') return '';

        // Basic HTML sanitization - in production, use proper library like DOMPurify
        const tempDiv = document.createElement('div');
        tempDiv.textContent = html;
        return tempDiv.innerHTML;
    }

    /**
     * Validate form data
     * @param {HTMLFormElement} form - Form element
     * @param {Object} rules - Validation rules
     * @returns {Object} Validation result
     */
    static validateForm(form, rules) {
        const formData = new FormData(form);
        const errors = {};
        const validatedData = {};

        for (const [fieldName, rule] of Object.entries(rules)) {
            const value = formData.get(fieldName);

            // Skip validation for fields not present in form
            if (value === null && rule.required === false) {
                continue;
            }

            // Required validation
            if (rule.required && (!value || value.toString().trim().length === 0)) {
                errors[fieldName] = rule.errorMessage || `${fieldName} é obrigatório`;
                continue;
            }

            // Skip further validation if field is empty and not required
            if (!value || value.toString().trim().length === 0) {
                validatedData[fieldName] = '';
                continue;
            }

            // Apply custom validation
            if (rule.validate) {
                const result = rule.validate(value.toString().trim());
                if (result.isValid) {
                    validatedData[fieldName] = result.value || value.toString().trim();
                } else {
                    errors[fieldName] = result.error || rule.errorMessage || 'Valor inválido';
                }
            } else {
                validatedData[fieldName] = value.toString().trim();
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            data: validatedData
        };
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Generate validation report for data model
     * @param {Object} model - Data model instance
     * @returns {Object} Validation report
     */
    static generateValidationReport(model) {
        if (!model || typeof model.validate !== 'function') {
            return {
                isValid: false,
                error: 'Modelo inválido ou método validate não encontrado'
            };
        }

        const errors = model.validate();

        return {
            isValid: errors.length === 0,
            errors,
            modelType: model.constructor.name,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Error handling utilities
 */
export class ErrorUtils {
    /**
     * Create user-friendly error message from Firebase error
     * @param {Error} error - Firebase error object
     * @returns {string} User-friendly error message
     */
    static handleFirebaseError(error) {
        console.error('Firebase error:', error);

        const errorMessages = {
            'permission-denied': 'Você não tem permissão para realizar esta operação.',
            'unavailable': 'Serviço temporariamente indisponível. Tente novamente.',
            'network-request-failed': 'Erro de conexão. Verifique sua internet.',
            'timeout': 'Operação demorou demais. Tente novamente.',
            'too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
            'unauthenticated': 'Você precisa estar autenticado para realizar esta operação.',
            'not-found': 'Recurso não encontrado.',
            'already-exists': 'Este recurso já existe.',
            'resource-exhausted': 'Cota de recursos excedida. Tente novamente mais tarde.',
            'cancelled': 'Operação cancelada.',
            'data-loss': 'Ocorreu uma perda de dados.',
            'unknown': 'Ocorreu um erro desconhecido. Tente novamente.',
            'invalid-argument': 'Dados inválidos fornecidos.',
            'deadline-exceeded': 'Operação excedeu o tempo limite.',
            'aborted': 'Operação abortada.',
            'out-of-range': 'Operação fora do intervalo permitido.',
            'unimplemented': 'Operação não implementada.',
            'internal': 'Erro interno do servidor.',
            'default': 'Ocorreu um erro. Tente novamente.'
        };

        return errorMessages[error.code] || errorMessages.default;
    }

    /**
     * Handle validation errors
     * @param {Array} errors - Array of validation error messages
     * @returns {string} Formatted error message
     */
    static handleValidationErrors(errors) {
        if (!Array.isArray(errors) || errors.length === 0) {
            return 'Ocorreu um erro de validação.';
        }

        if (errors.length === 1) {
            return errors[0];
        }

        // Format multiple errors
        const formattedErrors = errors.slice(0, 3).join('; ');
        const suffix = errors.length > 3 ? ` e mais ${errors.length - 3} erro(s).` : '.';

        return `Erros de validação: ${formattedErrors}${suffix}`;
    }

    /**
     * Create error object with context
     * @param {string} message - Error message
     * @param {Object} context - Error context
     * @returns {Error} Enhanced error object
     */
    static createError(message, context = {}) {
        const error = new Error(message);
        error.context = context;
        error.timestamp = new Date().toISOString();
        error.userMessage = context.userMessage || message;
        return error;
    }

    /**
     * Log error with context
     * @param {Error} error - Error object
     * @param {Object} context - Additional context
     */
    static logError(error, context = {}) {
        const logData = {
            message: error.message,
            stack: error.stack,
            context: { ...error.context, ...context },
            timestamp: error.timestamp || new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        console.error('Application error:', logData);

        // In production, you might want to send this to an error tracking service
        if (window.Sentry || window.errorTrackingService) {
            (window.Sentry || window.errorTrackingService).captureException(error, {
                extra: logData
            });
        }
    }

    /**
     * Show error to user
     * @param {string|Error} error - Error message or object
     * @param {Function} callback - Optional callback
     */
    static showErrorToUser(error, callback = null) {
        const message = error.message || error.userMessage || error.toString();

        // For now, use alert - in future, use better UI
        alert(message);

        if (callback) {
            callback();
        }
    }

    /**
     * Retry operation with exponential backoff
     * @param {Function} operation - Operation to retry
     * @param {number} maxRetries - Maximum number of retries
     * @param {number} baseDelay - Base delay in milliseconds
     * @returns {Promise} Operation result
     */
    static async retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Attempting operation (try ${attempt}/${maxRetries})`);
                return await operation();
            } catch (error) {
                lastError = error;
                console.error(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);

                // Don't retry on authentication or permission errors
                if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
                    throw error;
                }

                // If this is the last attempt, throw the error
                if (attempt === maxRetries) {
                    throw error;
                }

                // Calculate delay with exponential backoff
                const delay = baseDelay * Math.pow(2, attempt - 1);
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    }

    /**
     * Check if error is recoverable
     * @param {Error} error - Error object
     * @returns {boolean} True if error is recoverable
     */
    static isRecoverableError(error) {
        const recoverableCodes = [
            'network-request-failed',
            'unavailable',
            'timeout',
            'deadline-exceeded',
            'resource-exhausted'
        ];

        return recoverableCodes.includes(error.code);
    }
}

export default {
    ValidationUtils,
    ErrorUtils
};