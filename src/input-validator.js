// Input Validation Service
// Story 0.4: Firebase Security Rules
// Provides client-side validation before data is sent to Firebase

class InputValidator {
    // Restaurant validation
    static validateRestaurant(data) {
        const errors = [];

        // Name validation
        if (!data.name || typeof data.name !== 'string') {
            errors.push('Nome do restaurante é obrigatório');
        } else {
            if (data.name.length < 4) {
                errors.push('Nome do restaurante deve ter no mínimo 4 caracteres');
            } else if (data.name.length > 100) {
                errors.push('Nome do restaurante deve ter no máximo 100 caracteres');
            } else if (!/^[a-zA-Z0-9\sÀ-ÿ'-]+$/.test(data.name)) {
                errors.push('Nome do restaurante contém caracteres inválidos');
            }
        }

        // Price validation
        if (!data.price || typeof data.price !== 'string') {
            errors.push('Faixa de preço é obrigatória');
        } else if (!/^R\$ \d+-\d+$/.test(data.price)) {
            errors.push('Formato de preço inválido. Use: R$ XX-XX');
        }

        // Hours validation
        if (!data.hours || typeof data.hours !== 'string') {
            errors.push('Horário de funcionamento é obrigatório');
        } else if (!/^\d{2}h\d{2}-\d{2}h\d{2}$/.test(data.hours)) {
            errors.push('Formato de horário inválido. Use: HHhMM-HHhMM');
        }

        // Vegetarian options validation
        if (!data.vegetarianOptions || typeof data.vegetarianOptions !== 'string') {
            errors.push('Informações sobre opções vegetarianas são obrigatórias');
        } else if (data.vegetarianOptions.length > 50) {
            errors.push('Descrição de opções vegetarianas muito longa');
        }

        // Access validation
        if (!data.access || typeof data.access !== 'string') {
            errors.push('Informações sobre acesso são obrigatórias');
        } else if (data.access.length > 50) {
            errors.push('Descrição de acesso muito longa');
        }

        // Description validation
        if (!data.description || typeof data.description !== 'string') {
            errors.push('Descrição do restaurante é obrigatória');
        } else if (data.description.length > 500) {
            errors.push('Descrição muito longa (máximo 500 caracteres)');
        }

        // Rating validation (optional)
        if (data.averageQuality !== undefined) {
            if (typeof data.averageQuality !== 'number' ||
                data.averageQuality < 0 ||
                data.averageQuality > 5) {
                errors.push('Qualidade média deve estar entre 0 e 5');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Review validation
    static validateReview(data) {
        const errors = [];

        // Restaurant ID validation
        if (!data.restaurantId || typeof data.restaurantId !== 'string') {
            errors.push('ID do restaurante é obrigatório');
        } else if (data.restaurantId.length === 0) {
            errors.push('ID do restaurante inválido');
        }

        // Quality rating validation
        if (!data.quality || typeof data.quality !== 'number') {
            errors.push('Avaliação de qualidade é obrigatória');
        } else if (data.quality < 0 || data.quality > 5) {
            errors.push('Avaliação de qualidade deve estar entre 0 e 5');
        }

        // Price rating validation
        if (!data.price || typeof data.price !== 'number') {
            errors.push('Avaliação de preço é obrigatória');
        } else if (data.price < 0 || data.price > 5) {
            errors.push('Avaliação de preço deve estar entre 0 e 5');
        }

        // User name validation
        if (!data.userName || typeof data.userName !== 'string') {
            errors.push('Nome do usuário é obrigatório');
        } else {
            if (data.userName.length < 2) {
                errors.push('Nome do usuário deve ter no mínimo 2 caracteres');
            } else if (data.userName.length > 50) {
                errors.push('Nome do usuário deve ter no máximo 50 caracteres');
            } else if (!/^[a-zA-Z0-9\sÀ-ÿ'-]+$/.test(data.userName)) {
                errors.push('Nome do usuário contém caracteres inválidos');
            }
        }

        // User fingerprint validation
        if (!data.userFingerprint || typeof data.userFingerprint !== 'string') {
            errors.push('Identificação do usuário é obrigatória');
        } else if (data.userFingerprint.length < 10) {
            errors.push('Identificação do usuário inválida');
        }

        // Comment validation (optional)
        if (data.comment !== undefined) {
            if (typeof data.comment !== 'string') {
                errors.push('Comentário deve ser um texto');
            } else if (data.comment.length > 500) {
                errors.push('Comentário muito longo (máximo 500 caracteres)');
            }
        }

        // Access validation (optional)
        if (data.access !== undefined) {
            if (typeof data.access !== 'string') {
                errors.push('Informação de acesso deve ser um texto');
            } else if (data.access.length > 50) {
                errors.push('Informação de acesso muito longa');
            }
        }

        // Vegetarian options validation (optional)
        if (data.vegetarianOptions !== undefined) {
            if (typeof data.vegetarianOptions !== 'string') {
                errors.push('Informação sobre vegetarianos deve ser um texto');
            } else if (data.vegetarianOptions.length > 50) {
                errors.push('Informação sobre vegetarianos muito longa');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Image validation
    static validateImage(file) {
        const errors = [];
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const minWidth = 100;
        const minHeight = 100;
        const maxWidth = 4096;
        const maxHeight = 4096;

        // File type validation
        if (!validTypes.includes(file.type)) {
            errors.push('Formato de imagem inválido. Use JPG, PNG ou WebP');
        }

        // File size validation
        if (file.size > maxSize) {
            errors.push('Imagem muito grande. Tamanho máximo: 5MB');
        }

        // File name validation
        if (file.name.length > 255) {
            errors.push('Nome do arquivo muito longo');
        } else if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
            errors.push('Nome do arquivo contém caracteres inválidos');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Sanitize text input
    static sanitizeText(text) {
        if (typeof text !== 'string') return '';

        return text
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
            .replace(/javascript:/gi, '') // Remove javascript protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    // Sanitize user name
    static sanitizeUserName(userName) {
        const sanitized = this.sanitizeText(userName);

        // Remove extra spaces and special characters
        return sanitized
            .replace(/\s+/g, ' ')
            .replace(/[^a-zA-Z0-9\sÀ-ÿ'-]/g, '')
            .trim();
    }

    // Generate user fingerprint
    static generateUserFingerprint() {
        const userAgent = navigator.userAgent;
        const screenResolution = `${screen.width}x${screen.height}`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const language = navigator.language;
        const platform = navigator.platform;

        // Create a simple hash
        const data = `${userAgent}|${screenResolution}|${timezone}|${language}|${platform}`;
        let hash = 0;

        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return `fp_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
    }

    // Validate URL
    static validateURL(url) {
        if (!url || typeof url !== 'string') return false;

        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Validate email (for future authentication)
    static validateEmail(email) {
        if (!email || typeof email !== 'string') return false;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone number (Brazilian format)
    static validatePhone(phone) {
        if (!phone || typeof phone !== 'string') return false;

        // Remove all non-digit characters
        const digits = phone.replace(/\D/g, '');

        // Check if it has 10 or 11 digits (Brazilian phone numbers)
        return digits.length === 10 || digits.length === 11;
    }
}

// Export for use in other modules
window.EsplanadaEatsValidator = InputValidator;

console.log('🔒 Input Validation Service loaded');