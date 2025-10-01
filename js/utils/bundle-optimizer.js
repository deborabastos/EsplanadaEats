// js/utils/bundle-optimizer.js - Dynamic module loading and code splitting
// Version: 1.0.2 - Cache refresh for PerformanceMonitor fix

/**
 * BundleOptimizer - Handles dynamic module loading and code splitting
 */
export class BundleOptimizer {
    constructor(options = {}) {
        this.loadedModules = new Map();
        this.loadingModules = new Map();
        this.criticalModules = new Set();
        this.options = {
            enableCache: true,
            enablePreloading: true,
            retryAttempts: 3,
            retryDelay: 1000,
            ...options
        };

        console.log('BundleOptimizer initialized');
    }

    /**
     * Dynamic import with caching and error handling
     * @param {string} moduleName - Module identifier
     * @param {string} modulePath - Module path
     * @returns {Promise} Module import promise
     */
    async loadModule(moduleName, modulePath) {
        // Return from cache if already loaded
        if (this.loadedModules.has(moduleName)) {
            console.log(`📦 Module "${moduleName}" loaded from cache`);
            return this.loadedModules.get(moduleName);
        }

        // Return loading promise if currently loading
        if (this.loadingModules.has(moduleName)) {
            console.log(`⏳ Module "${moduleName}" already loading, waiting...`);
            return this.loadingModules.get(moduleName);
        }

        // Create loading promise with retry logic
        const loadPromise = this.loadModuleWithRetry(moduleName, modulePath);
        this.loadingModules.set(moduleName, loadPromise);

        try {
            const module = await loadPromise;
            this.loadedModules.set(moduleName, module);
            this.loadingModules.delete(moduleName);
            console.log(`✅ Module "${moduleName}" loaded successfully`);
            return module;
        } catch (error) {
            this.loadingModules.delete(moduleName);
            console.error(`❌ Failed to load module "${moduleName}":`, error);
            throw error;
        }
    }

    /**
     * Load module with retry logic
     * @param {string} moduleName - Module name
     * @param {string} modulePath - Module path
     * @returns {Promise} Module import promise
     */
    async loadModuleWithRetry(moduleName, modulePath) {
        let lastError;

        for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
            try {
                console.log(`🔄 Loading module "${moduleName}" (attempt ${attempt}/${this.options.retryAttempts})`);
                const module = await import(modulePath);
                return module;
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Attempt ${attempt} failed for module "${moduleName}":`, error.message);

                if (attempt < this.options.retryAttempts) {
                    await this.delay(this.options.retryDelay * attempt);
                }
            }
        }

        throw new Error(`Failed to load module "${moduleName}" after ${this.options.retryAttempts} attempts: ${lastError.message}`);
    }

    /**
     * Load critical modules immediately
     * @returns {Promise} Promise that resolves when all critical modules are loaded
     */
    async loadCriticalModules() {
        const criticalModules = [
            { name: 'RatingDisplay', path: '../components/rating-display.js' },
            { name: 'ModalService', path: '../modules/modal-service.js' },
            { name: 'ImageLoader', path: './image-loader.js' },
            { name: 'UIService', path: '../modules/ui-service.js' }
        ];

        console.log('🚀 Loading critical modules...');

        const loadPromises = criticalModules.map(async ({ name, path }) => {
            try {
                const module = await this.loadModule(name, path);
                this.criticalModules.add(name);
                return { name, status: 'success', module };
            } catch (error) {
                console.error(`❌ Failed to load critical module "${name}":`, error);
                return { name, status: 'error', error };
            }
        });

        const results = await Promise.all(loadPromises);
        const successful = results.filter(r => r.status === 'success');
        const failed = results.filter(r => r.status === 'error');

        console.log(`✅ Loaded ${successful.length} critical modules`);
        if (failed.length > 0) {
            console.warn(`⚠️ ${failed.length} critical modules failed to load`);
        }

        return { successful, failed };
    }

    /**
     * Load non-critical modules after page load
     */
    loadNonCriticalModules() {
        // Temporarily disabled - no non-critical modules to load
        console.log('📦 Non-critical modules loading skipped - no modules defined');

        // Future implementation:
        // const nonCriticalModules = [
        //     { name: 'ShareService', path: '../services/share-service.js' },
        //     { name: 'AnalyticsService', path: '../services/analytics-service.js' },
        //     { name: 'NotificationService', path: '../services/notification-service.js' }
        // ];
    }

    /**
     * Preload modules for better UX
     * @param {Array} modules - Array of { name, path } objects
     */
    preloadModules(modules) {
        if (!this.options.enablePreloading) {
            return;
        }

        modules.forEach(({ name, path }) => {
            if (!this.loadedModules.has(name) && !this.loadingModules.has(name)) {
                // Create link preload element
                const link = document.createElement('link');
                link.rel = 'modulepreload';
                link.href = new URL(path, import.meta.url).href;
                document.head.appendChild(link);
            }
        });
    }

    /**
     * Create lazy-loaded component
     * @param {string} moduleName - Module name
     * @param {string} modulePath - Module path
     * @param {string} exportName - Export name to use
     * @returns {Function} Lazy load function
     */
    createLazyComponent(moduleName, modulePath, exportName = 'default') {
        return async (props = {}) => {
            try {
                const module = await this.loadModule(moduleName, modulePath);
                const Component = module[exportName];

                if (!Component) {
                    throw new Error(`Export "${exportName}" not found in module "${moduleName}"`);
                }

                return typeof Component === 'function'
                    ? new Component(props)
                    : Component;
            } catch (error) {
                console.error(`Failed to create lazy component "${moduleName}":`, error);
                throw error;
            }
        };
    }

    /**
     * Optimize bundle loading based on user interaction
     */
    setupInteractionBasedLoading() {
        // Preload modules on hover
        document.addEventListener('mouseover', (event) => {
            const target = event.target.closest('[data-preload-module]');
            if (target) {
                const moduleName = target.dataset.preloadModule;
                const modulePath = target.dataset.preloadPath;

                if (moduleName && modulePath) {
                    this.preloadModules([{ name: moduleName, path: modulePath }]);
                }
            }
        }, { passive: true });

        // Load modules on click
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-load-module]');
            if (target) {
                const moduleName = target.dataset.loadModule;
                const modulePath = target.dataset.loadPath;

                if (moduleName && modulePath) {
                    this.loadModule(moduleName, modulePath);
                }
            }
        });
    }

    /**
     * Monitor bundle performance
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        const metrics = {
            loadedModules: this.loadedModules.size,
            loadingModules: this.loadingModules.size,
            criticalModules: this.criticalModules.size,
            cacheHitRatio: this.options.enableCache ?
                (this.loadedModules.size / (this.loadedModules.size + this.loadingModules.size) * 100).toFixed(1) + '%' :
                'disabled'
        };

        // Estimate bundle sizes
        if (window.performance && window.performance.memory) {
            const memory = window.performance.memory;
            metrics.memoryUsage = {
                used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
                total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
                limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + 'MB'
            };
        }

        return metrics;
    }

    /**
     * Clear module cache
     */
    clearCache() {
        this.loadedModules.clear();
        this.loadingModules.clear();
        this.criticalModules.clear();
        console.log('Bundle cache cleared');
    }

    /**
     * Utility function for delays
     * @param {number} ms - Delay in milliseconds
     * @returns {Promise} Delay promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Initialize the bundle optimizer
     */
    async initialize() {
        console.log('🚀 Initializing BundleOptimizer...');

        // Setup interaction-based loading
        this.setupInteractionBasedLoading();

        // Load critical modules
        await this.loadCriticalModules();

        // Load non-critical modules after page load
        if (document.readyState === 'complete') {
            this.loadNonCriticalModules();
        } else {
            window.addEventListener('load', () => {
                this.loadNonCriticalModules();
            });
        }

        console.log('✅ BundleOptimizer initialized');
    }
}

// Create global instance
let globalBundleOptimizer = null;

/**
 * Get or create global BundleOptimizer instance
 * @param {Object} options - Options for BundleOptimizer
 * @returns {BundleOptimizer} Global BundleOptimizer instance
 */
export function getBundleOptimizer(options = {}) {
    if (!globalBundleOptimizer) {
        globalBundleOptimizer = new BundleOptimizer(options);
    }
    return globalBundleOptimizer;
}

/**
 * Initialize bundle optimization
 * @param {Object} options - Options for initialization
 * @returns {Promise} Initialization promise
 */
export async function initializeBundleOptimization(options = {}) {
    const bundleOptimizer = getBundleOptimizer(options);
    return await bundleOptimizer.initialize();
}