// js/modules/firebase.js - Firebase initialization and configuration

// Import Firebase configuration
// Note: In a real project, this would be imported from a config file
// For now, we'll use the configuration that's already loaded via firebase-config.js

/**
 * Initialize Firebase application
 * @returns {Promise<Object>} Firebase app instance
 */
export async function initializeApp() {
    try {
        // Check if Firebase is already initialized
        if (!window.firebase) {
            throw new Error('Firebase SDK not loaded. Make sure Firebase scripts are included in HTML.');
        }

        // Check if Firebase is already initialized
        if (!firebase.apps.length) {
            throw new Error('Firebase not initialized. Make sure firebase-config.js is loaded.');
        }

        console.log('Firebase app initialized successfully');
        return firebase.app();

    } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        throw error;
    }
}

/**
 * Get Firebase services
 * @returns {Object} Firebase services (db, storage, auth)
 */
export function getFirebaseServices() {
    try {
        if (!firebase.apps.length) {
            throw new Error('Firebase not initialized');
        }

        const db = firebase.firestore();
        const storage = firebase.storage();
        const auth = firebase.auth();

        // Note: Offline persistence is already configured in src/firebase-config.js
        // No need to enable it again here to avoid duplicate setup and warnings

        return { db, storage, auth };
    } catch (error) {
        console.error('Failed to get Firebase services:', error);
        throw error;
    }
}

/**
 * Handle Firebase errors with user-friendly messages
 * @param {Error} error - Firebase error object
 * @returns {string} User-friendly error message
 */
export function handleFirebaseError(error) {
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
        'invalid-argument': 'Argumento inválido.',
        'deadline-exceeded': 'Operação excedeu o tempo limite.',
        'aborted': 'Operação abortada.',
        'out-of-range': 'Operação fora do intervalo permitido.',
        'unimplemented': 'Operação não implementada.',
        'internal': 'Erro interno do servidor.',
        'default': 'Ocorreu um erro. Tente novamente.'
    };

    // If it's a validation error from our models, return the original message
    if (error.message && !error.code) {
        return error.message;
    }

    return errorMessages[error.code] || errorMessages.default;
}

/**
 * Retry logic for Firebase operations
 * @param {Function} operation - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise} Operation result
 */
export async function retryOperation(operation, maxRetries = 3, delay = 1000) {
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

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }

    throw lastError;
}

// Note: firebase is a global variable loaded via CDN
// It cannot be exported as ES6 module, use window.firebase instead