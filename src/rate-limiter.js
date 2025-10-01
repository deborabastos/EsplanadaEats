// Rate Limiting Service
// Story 0.4: Firebase Security Rules
// Prevents abuse by limiting the frequency of user actions

class RateLimiter {
    constructor() {
        this.limits = {
            restaurantCreation: { max: 3, window: 3600000 }, // 3 per hour
            reviewSubmission: { max: 10, window: 3600000 }, // 10 per hour
            photoUpload: { max: 20, window: 3600000 }, // 20 per hour
            reportSubmission: { max: 5, window: 3600000 }, // 5 per hour
            commentSubmission: { max: 15, window: 3600000 } // 15 per hour
        };

        this.userActions = new Map();
        this.loadFromLocalStorage();
    }

    // Load existing data from localStorage
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('esplanada_rate_limiter');
            if (stored) {
                const data = JSON.parse(stored);
                this.userActions = new Map(Object.entries(data));
            }
        } catch (error) {
            console.error('Failed to load rate limiter data:', error);
            this.userActions = new Map();
        }
    }

    // Save data to localStorage
    saveToLocalStorage() {
        try {
            const data = Object.fromEntries(this.userActions);
            localStorage.setItem('esplanada_rate_limiter', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save rate limiter data:', error);
        }
    }

    // Check if user can perform an action
    async checkRateLimit(userFingerprint, actionType) {
        const limit = this.limits[actionType];
        if (!limit) {
            console.warn(`Unknown action type: ${actionType}`);
            return true; // Allow unknown actions
        }

        const now = Date.now();
        const userKey = `${userFingerprint}_${actionType}`;
        const actions = this.userActions.get(userKey) || [];

        // Clean old actions outside the time window
        const recentActions = actions.filter(timestamp => now - timestamp < limit.window);

        // Check if limit exceeded
        if (recentActions.length >= limit.max) {
            const oldestAction = Math.min(...recentActions);
            const timeToWait = limit.window - (now - oldestAction);

            throw new RateLimitError(
                `Limite de ações excedido para ${actionType}. Aguarde ${Math.ceil(timeToWait / 1000)} segundos.`,
                actionType,
                limit.max,
                limit.window,
                timeToWait
            );
        }

        // Record this action
        recentActions.push(now);
        this.userActions.set(userKey, recentActions);
        this.saveToLocalStorage();

        return true;
    }

    // Get remaining actions for a user
    getRemainingActions(userFingerprint, actionType) {
        const limit = this.limits[actionType];
        if (!limit) return Infinity;

        const now = Date.now();
        const userKey = `${userFingerprint}_${actionType}`;
        const actions = this.userActions.get(userKey) || [];

        // Count actions within the time window
        const recentActions = actions.filter(timestamp => now - timestamp < limit.window);
        return Math.max(0, limit.max - recentActions.length);
    }

    // Get time until next allowed action
    getTimeUntilNextAction(userFingerprint, actionType) {
        const limit = this.limits[actionType];
        if (!limit) return 0;

        const now = Date.now();
        const userKey = `${userFingerprint}_${actionType}`;
        const actions = this.userActions.get(userKey) || [];

        if (actions.length < limit.max) return 0;

        // Find the oldest action within the time window
        const oldestAction = Math.min(...actions.filter(timestamp => now - timestamp < limit.window));
        return Math.max(0, limit.window - (now - oldestAction));
    }

    // Clear old data to prevent localStorage bloat
    cleanup() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        for (const [key, actions] of this.userActions.entries()) {
            const recentActions = actions.filter(timestamp => now - timestamp < maxAge);

            if (recentActions.length === 0) {
                this.userActions.delete(key);
            } else {
                this.userActions.set(key, recentActions);
            }
        }

        this.saveToLocalStorage();
    }

    // Get statistics for monitoring
    getStats(userFingerprint) {
        const stats = {};
        const now = Date.now();

        for (const [actionType, limit] of Object.entries(this.limits)) {
            const userKey = `${userFingerprint}_${actionType}`;
            const actions = this.userActions.get(userKey) || [];
            const recentActions = actions.filter(timestamp => now - timestamp < limit.window);

            stats[actionType] = {
                used: recentActions.length,
                limit: limit.max,
                window: limit.window,
                remaining: Math.max(0, limit.max - recentActions.length),
                resetTime: recentActions.length > 0 ? Math.max(...recentActions) + limit.window : now
            };
        }

        return stats;
    }
}

// Custom error class for rate limiting
class RateLimitError extends Error {
    constructor(message, actionType, limit, window, timeToWait) {
        super(message);
        this.name = 'RateLimitError';
        this.actionType = actionType;
        this.limit = limit;
        this.window = window;
        this.timeToWait = timeToWait;
    }
}

// Server-side rate limiting (for Cloud Functions or future backend)
class ServerRateLimiter {
    static async checkRateLimit(db, userId, actionType) {
        const limits = {
            restaurantCreation: { max: 5, window: 3600000 }, // 5 per hour
            reviewSubmission: { max: 15, window: 3600000 }, // 15 per hour
            photoUpload: { max: 30, window: 3600000 }, // 30 per hour
            reportSubmission: { max: 10, window: 3600000 }, // 10 per hour
        };

        const limit = limits[actionType];
        if (!limit) return true;

        const now = Date.now();
        const cutoffTime = now - limit.window;

        // Count recent actions
        const snapshot = await db.collection('rateLimits')
            .where('userId', '==', userId)
            .where('actionType', '==', actionType)
            .where('timestamp', '>', cutoffTime)
            .count()
            .get();

        if (snapshot.data().count >= limit.max) {
            throw new RateLimitError(
                `Rate limit exceeded for ${actionType}`,
                actionType,
                limit.max,
                limit.window,
                0 // Server doesn't calculate exact wait time
            );
        }

        // Record this action
        await db.collection('rateLimits').add({
            userId,
            actionType,
            timestamp: now,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return true;
    }

    // Clean up old rate limit entries
    static async cleanup(db) {
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

        const snapshot = await db.collection('rateLimits')
            .where('timestamp', '<', cutoffTime)
            .get();

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        if (snapshot.docs.length > 0) {
            await batch.commit();
            console.log(`Cleaned up ${snapshot.docs.length} old rate limit entries`);
        }
    }
}

// Create global instance
const rateLimiter = new RateLimiter();

// Auto-cleanup every hour
setInterval(() => {
    rateLimiter.cleanup();
}, 60 * 60 * 1000);

// Export for use in other modules
window.EsplanadaEatsRateLimiter = rateLimiter;
window.RateLimitError = RateLimitError;
window.ServerRateLimiter = ServerRateLimiter;

console.log('⚡ Rate Limiting Service loaded');