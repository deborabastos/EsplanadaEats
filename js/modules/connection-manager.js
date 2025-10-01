// js/modules/connection-manager.js - Connection state management service

/**
 * Connection Manager - Handles online/offline state management
 */
export class ConnectionManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.connectionCallback = null;
        this.checkInterval = null;

        this.initialize();
    }

    /**
     * Initialize the connection manager
     */
    initialize() {
        try {
            // Set up online/offline event listeners
            window.addEventListener('online', this.handleOnline.bind(this));
            window.addEventListener('offline', this.handleOffline.bind(this));

            // Set up periodic connection check
            this.startPeriodicCheck();

            console.log(`ConnectionManager initialized. Current status: ${this.isOnline ? 'Online' : 'Offline'}`);
        } catch (error) {
            console.error('Failed to initialize ConnectionManager:', error);
        }
    }

    /**
     * Handle online event
     */
    handleOnline() {
        if (!this.isOnline) {
            this.isOnline = true;
            console.log('Connection restored: Online');
            this.notifyConnectionChange(true);
        }
    }

    /**
     * Handle offline event
     */
    handleOffline() {
        if (this.isOnline) {
            this.isOnline = false;
            console.log('Connection lost: Offline');
            this.notifyConnectionChange(false);
        }
    }

    /**
     * Set up periodic connection check
     */
    startPeriodicCheck() {
        // Check connection every 30 seconds
        this.checkInterval = setInterval(() => {
            this.checkConnection();
        }, 30000);
    }

    /**
     * Check current connection status
     */
    async checkConnection() {
        try {
            // Try to fetch a small resource to check connectivity
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });

            // If we get here, we're online
            if (!this.isOnline) {
                this.isOnline = true;
                console.log('Connection check: Online');
                this.notifyConnectionChange(true);
            }
        } catch (error) {
            // Connection check failed
            if (this.isOnline) {
                this.isOnline = false;
                console.log('Connection check: Offline');
                this.notifyConnectionChange(false);
            }
        }
    }

    /**
     * Notify subscribers of connection change
     * @param {boolean} isOnline - Connection status
     */
    notifyConnectionChange(isOnline) {
        if (this.connectionCallback) {
            this.connectionCallback(isOnline);
        }

        // Dispatch custom event for other listeners
        window.dispatchEvent(new CustomEvent('connectionChange', {
            detail: { isOnline }
        }));
    }

    /**
     * Register callback for connection changes
     * @param {Function} callback - Callback function
     */
    onConnectionChange(callback) {
        this.connectionCallback = callback;

        // Immediately notify with current status
        if (callback) {
            callback(this.isOnline);
        }
    }

    /**
     * Get current connection status
     * @returns {boolean} True if online
     */
    getConnectionStatus() {
        return this.isOnline;
    }

    /**
     * Show connection status toast (will be implemented in future stories)
     * @param {boolean} isOnline - Connection status
     */
    showConnectionStatus(isOnline) {
        // This will be implemented in future stories with toast notifications
        console.log(`Connection status: ${isOnline ? 'Online' : 'Offline'}`);
    }

    /**
     * Wait for connection to be restored
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<boolean>} Promise that resolves when connection is restored
     */
    async waitForConnection(timeout = 60000) {
        return new Promise((resolve) => {
            if (this.isOnline) {
                resolve(true);
                return;
            }

            let timeoutId;
            let unsubscribe;

            const cleanup = () => {
                if (timeoutId) clearTimeout(timeoutId);
                if (unsubscribe) unsubscribe();
            };

            // Set up timeout
            timeoutId = setTimeout(() => {
                cleanup();
                resolve(false);
            }, timeout);

            // Set up connection listener
            unsubscribe = this.onConnectionChange((isOnline) => {
                if (isOnline) {
                    cleanup();
                    resolve(true);
                }
            });
        });
    }

    /**
     * Execute operation with retry logic for connection issues
     * @param {Function} operation - Function to execute
     * @param {number} maxRetries - Maximum number of retries
     * @param {number} retryDelay - Delay between retries in milliseconds
     * @returns {Promise} Operation result
     */
    async executeWithRetry(operation, maxRetries = 3, retryDelay = 2000) {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Wait for connection if offline
                if (!this.isOnline) {
                    console.log(`Waiting for connection (attempt ${attempt}/${maxRetries})`);
                    const connected = await this.waitForConnection(10000);
                    if (!connected) {
                        throw new Error('Sem conexão com a internet');
                    }
                }

                // Execute operation
                console.log(`Executing operation (attempt ${attempt}/${maxRetries})`);
                return await operation();
            } catch (error) {
                lastError = error;
                console.error(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);

                // Don't retry on non-connection errors
                if (!this.isConnectionError(error)) {
                    throw error;
                }

                // If this is the last attempt, throw the error
                if (attempt === maxRetries) {
                    throw error;
                }

                // Wait before retrying
                console.log(`Retrying in ${retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }

        throw lastError;
    }

    /**
     * Check if error is connection-related
     * @param {Error} error - Error object
     * @returns {boolean} True if error is connection-related
     */
    isConnectionError(error) {
        const connectionErrorCodes = [
            'network-request-failed',
            'unavailable',
            'timeout',
            'deadline-exceeded'
        ];

        const connectionErrorMessages = [
            'network error',
            'connection refused',
            'timeout',
            'unreachable',
            'offline'
        ];

        const errorString = error.message.toLowerCase();

        return (
            connectionErrorCodes.includes(error.code) ||
            connectionErrorMessages.some(msg => errorString.includes(msg))
        );
    }

    /**
     * Get connection statistics
     * @returns {Object} Connection statistics
     */
    getConnectionStats() {
        return {
            isOnline: this.isOnline,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            } : null
        };
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }

        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);

        console.log('ConnectionManager cleaned up');
    }
}