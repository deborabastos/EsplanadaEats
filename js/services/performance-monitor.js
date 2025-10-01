// js/services/performance-monitor.js - Performance monitoring and metrics collection
// Version: 1.0.4 - Disabled problematic card render monitoring

/**
 * PerformanceMonitor - Collects and monitors application performance metrics
 */
export class PerformanceMonitor {
    constructor(options = {}) {
        this.metrics = new Map();
        this.startTime = performance.now();
        this.options = {
            enableFirebasePerformance: true,
            enableCustomMetrics: true,
            enableMemoryMonitoring: true,
            enableFPSMonitoring: true,
            sampleRate: 0.1, // 10% of users
            ...options
        };

        this.setupPerformanceMonitoring();
        console.log('PerformanceMonitor initialized');
    }

    /**
     * Setup all performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.recordPageLoadMetrics();
        });

        // Monitor Firebase performance if available
        if (this.options.enableFirebasePerformance && typeof firebase !== 'undefined' && firebase.performance) {
            this.setupFirebasePerformance();
        }

        // Setup custom metrics
        if (this.options.enableCustomMetrics) {
            this.setupCustomMetrics();
        }

        // Monitor memory usage
        if (this.options.enableMemoryMonitoring && performance.memory) {
            this.setupMemoryMonitoring();
        }

        // Monitor FPS
        if (this.options.enableFPSMonitoring) {
            this.setupFPSMonitoring();
        }

        // Monitor network performance
        this.setupNetworkMonitoring();

        // Setup performance observers
        this.setupPerformanceObservers();
    }

    /**
     * Record page load metrics
     */
    recordPageLoadMetrics() {
        if (!window.performance) {
            return;
        }

        try {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            const resources = performance.getEntriesByType('resource');

            const metrics = {
                // Navigation timing
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                largestContentfulPaint: this.getLargestContentfulPaint(),
                cumulativeLayoutShift: this.getCumulativeLayoutShift(),

                // Resource timing
                totalResources: resources.length,
                resourcesSize: this.calculateResourcesSize(resources),
                jsLoadTime: this.calculateJSLoadTime(resources),
                cssLoadTime: this.calculateCSSLoadTime(resources),
                imageLoadTime: this.calculateImageLoadTime(resources),

                // Memory usage
                memoryUsage: this.getMemoryUsage(),

                // Timestamp
                timestamp: Date.now()
            };

            this.metrics.set('pageLoad', metrics);
            this.logMetrics('Page Load', metrics);

            // Send to analytics if available
            this.sendToAnalytics('page_load', metrics);
        } catch (error) {
            console.error('Error recording page load metrics:', error);
        }
    }

    /**
     * Setup Firebase Performance Monitoring
     */
    setupFirebasePerformance() {
        try {
            const perf = firebase.performance();

            // Enable instrumentation
            perf.instrumentationEnabled = true;
            perf.dataCollectionEnabled = true;

            // Monitor Firestore operations
            this.firebasePerf = perf;

            console.log('✅ Firebase Performance Monitoring enabled');
        } catch (error) {
            console.warn('⚠️ Firebase Performance Monitoring setup failed:', error);
        }
    }

    /**
     * Setup custom metrics
     */
    setupCustomMetrics() {
        try {
            // Monitor rating form submission time
            this.setupFormSubmissionMonitoring();

            // Monitor modal open/close times
            this.setupModalPerformanceMonitoring();

            // Monitor restaurant card render time
            this.setupCardRenderMonitoring();

            // Monitor search performance
            this.setupSearchPerformanceMonitoring();
        } catch (error) {
            console.warn('⚠️ Failed to setup some custom metrics:', error);
        }
    }

    /**
     * Setup memory monitoring
     */
    setupMemoryMonitoring() {
        this.memoryInterval = setInterval(() => {
            const memoryMetrics = this.getMemoryUsage();
            if (memoryMetrics) {
                this.metrics.set('memory', memoryMetrics);

                // Warn if memory usage is high
                if (memoryMetrics.usedPercentage > 80) {
                    console.warn('⚠️ High memory usage detected:', memoryMetrics);
                }
            }
        }, 5000); // Check every 5 seconds
    }

    /**
     * Setup FPS monitoring
     */
    setupFPSMonitoring() {
        let lastTime = performance.now();
        let frames = 0;

        this.fpsInterval = setInterval(() => {
            frames++;
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= 1000) {
                const fps = Math.round((frames * 1000) / deltaTime);
                this.metrics.set('fps', {
                    value: fps,
                    timestamp: Date.now()
                });

                // Warn if FPS is low
                if (fps < 30) {
                    console.warn('⚠️ Low FPS detected:', fps);
                }

                frames = 0;
                lastTime = currentTime;
            }
        }, 100); // Sample every 100ms
    }

    /**
     * Setup network monitoring
     */
    setupNetworkMonitoring() {
        if ('connection' in navigator) {
            const connection = navigator.connection;

            // Monitor network changes
            connection.addEventListener('change', () => {
                const networkMetrics = {
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    saveData: connection.saveData
                };

                this.metrics.set('network', networkMetrics);
                console.log('📡 Network changed:', networkMetrics);
            });

            // Record initial network state
            this.metrics.set('network', {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            });
        }
    }

    /**
     * Setup performance observers
     */
    setupPerformanceObservers() {
        // Observe largest contentful paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.set('lcp', {
                        value: lastEntry.startTime,
                        element: lastEntry.element?.tagName || 'unknown'
                    });
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (error) {
                console.warn('LCP observer setup failed:', error);
            }

            // Observe layout shifts
            try {
                const clsObserver = new PerformanceObserver((list) => {
                    let clsValue = 0;
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    this.metrics.set('cls', { value: clsValue });
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (error) {
                console.warn('CLS observer setup failed:', error);
            }
        }
    }

    /**
     * Start custom performance measurement
     * @param {string} name - Measurement name
     * @returns {Object} Measurement object with end method
     */
    startMeasure(name) {
        const startTime = performance.now();
        const trace = this.firebasePerf?.trace(name);

        if (trace) {
            trace.start();
        }

        return {
            end: (metadata = {}) => {
                const endTime = performance.now();
                const duration = endTime - startTime;

                const result = {
                    name,
                    duration,
                    metadata,
                    timestamp: Date.now()
                };

                this.metrics.set(name, result);
                this.logMetrics(name, result);

                if (trace) {
                    trace.stop();
                }

                return result;
            }
        };
    }

    /**
     * Monitor form submission performance
     */
    setupFormSubmissionMonitoring() {
        document.addEventListener('submit', (event) => {
            const form = event.target;
            const formName = form.dataset.name || 'unnamed-form';

            const measure = this.startMeasure(`form_${formName}`);

            // Monitor form submission with a timeout
            setTimeout(() => {
                measure.end({ formType: formName });
            }, 100);
        }, true);
    }

    /**
     * Monitor modal performance
     */
    setupModalPerformanceMonitoring() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList?.contains('modal')) {
                        const measure = this.startMeasure('modal_open');
                        setTimeout(() => measure.end({ modalType: node.dataset.type || 'default' }), 100);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true });
    }

    /**
     * Monitor restaurant card render performance
     */
    setupCardRenderMonitoring() {
        // TEMPORARILY DISABLED - Preventing initialization errors
        // This method was causing circular dependency issues during app startup
        // TODO: Re-enable with proper dependency injection in future version
        console.log('⚠️ Card render monitoring temporarily disabled to prevent initialization errors');
        return;

        // Old implementation (commented out):
        /*
        // Delay monitoring until app is fully initialized
        // Use multiple attempts with increasing delays to handle race conditions
        const attempts = [1000, 2000, 5000]; // 1s, 2s, 5s delays

        const trySetupMonitoring = (delay) => {
            setTimeout(() => {
                try {
                    // Check all conditions safely before accessing any methods
                    if (!window.uiService) {
                        console.log('⏳ Waiting for uiService to be available...');
                        return;
                    }

                    if (!window.uiService.createRestaurantCard) {
                        console.log('⏳ Waiting for createRestaurantCard method to be available...');
                        return;
                    }

                    if (typeof window.uiService.createRestaurantCard !== 'function') {
                        console.warn('⚠️ createRestaurantCard is not a function');
                        return;
                    }

                    if (window.uiService.createRestaurantCard._performanceMonitored) {
                        console.log('✅ Card render monitoring already enabled');
                        return;
                    }

                    // Safely wrap the original method
                    const originalMethod = window.uiService.createRestaurantCard;

                    window.uiService.createRestaurantCard = function(...args) {
                        const measure = window.performanceMonitor?.startMeasure('card_render');
                        const result = originalMethod.apply(this, args);
                        setTimeout(() => measure?.end({ restaurantCount: 1 }), 0);
                        return result;
                    };

                    // Mark as monitored to avoid duplicate monitoring
                    window.uiService.createRestaurantCard._performanceMonitored = true;

                    console.log('✅ Restaurant card render monitoring enabled');

                } catch (error) {
                    console.warn('⚠️ Failed to setup card render monitoring:', error.message);

                    // Try again with longer delay if this isn't the last attempt
                    const currentIndex = attempts.indexOf(delay);
                    if (currentIndex < attempts.length - 1) {
                        console.log(`🔄 Retrying card render monitoring setup in ${attempts[currentIndex + 1]}ms...`);
                        trySetupMonitoring(attempts[currentIndex + 1]);
                    } else {
                        console.warn('❌ Card render monitoring setup failed after all attempts');
                    }
                }
            }, delay);
        };

        // Start with the first attempt
        trySetupMonitoring(attempts[0]);
        */
    }

    /**
     * Monitor search performance
     */
    setupSearchPerformanceMonitoring() {
        // Wait for DOM to be ready
        setTimeout(() => {
            const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
            searchInputs.forEach(input => {
                let searchTimer;
                input.addEventListener('input', () => {
                    clearTimeout(searchTimer);
                    searchTimer = setTimeout(() => {
                        const measure = this.startMeasure('search_query');
                        setTimeout(() => measure.end({ queryLength: input.value.length }), 0);
                    }, 300);
                });
            });
        }, 100);
    }

    /**
     * Get current memory usage
     * @returns {Object|null} Memory metrics
     */
    getMemoryUsage() {
        if (!performance.memory) {
            return null;
        }

        const memory = performance.memory;
        const used = memory.usedJSHeapSize;
        const total = memory.totalJSHeapSize;
        const limit = memory.jsHeapSizeLimit;

        return {
            used: Math.round(used / 1024 / 1024 * 100) / 100, // MB
            total: Math.round(total / 1024 / 1024 * 100) / 100, // MB
            limit: Math.round(limit / 1024 / 1024 * 100) / 100, // MB
            usedPercentage: Math.round((used / total) * 100 * 100) / 100,
            timestamp: Date.now()
        };
    }

    /**
     * Calculate total resources size
     * @param {Array} resources - Resource entries
     * @returns {number} Total size in bytes
     */
    calculateResourcesSize(resources) {
        return resources.reduce((total, resource) => {
            return total + (resource.transferSize || resource.encodedBodySize || 0);
        }, 0);
    }

    /**
     * Calculate JS load time
     * @param {Array} resources - Resource entries
     * @returns {number} Total JS load time in ms
     */
    calculateJSLoadTime(resources) {
        const jsResources = resources.filter(r => r.name.endsWith('.js'));
        return jsResources.reduce((total, resource) => {
            return total + (resource.duration || 0);
        }, 0);
    }

    /**
     * Calculate CSS load time
     * @param {Array} resources - Resource entries
     * @returns {number} Total CSS load time in ms
     */
    calculateCSSLoadTime(resources) {
        const cssResources = resources.filter(r => r.name.endsWith('.css'));
        return cssResources.reduce((total, resource) => {
            return total + (resource.duration || 0);
        }, 0);
    }

    /**
     * Calculate image load time
     * @param {Array} resources - Resource entries
     * @returns {number} Total image load time in ms
     */
    calculateImageLoadTime(resources) {
        const imageResources = resources.filter(r => {
            return r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
        });
        return imageResources.reduce((total, resource) => {
            return total + (resource.duration || 0);
        }, 0);
    }

    /**
     * Get largest contentful paint
     * @returns {number} LCP value in ms
     */
    getLargestContentfulPaint() {
        const lcp = performance.getEntriesByType('largest-contentful-paint');
        return lcp.length > 0 ? lcp[0].startTime : 0;
    }

    /**
     * Get cumulative layout shift
     * @returns {number} CLS value
     */
    getCumulativeLayoutShift() {
        // This is a simplified version - in practice you'd track this over time
        return 0;
    }

    /**
     * Log metrics to console
     * @param {string} name - Metric name
     * @param {Object} data - Metric data
     */
    logMetrics(name, data) {
        console.log(`[Performance] ${name}:`, data);
    }

    /**
     * Send metrics to analytics
     * @param {string} eventName - Event name
     * @param {Object} data - Event data
     */
    sendToAnalytics(eventName, data) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_metric', {
                event_name: eventName,
                ...data
            });
        }

        // Send to custom analytics if available
        if (window.customAnalytics) {
            window.customAnalytics.track('performance', { eventName, ...data });
        }
    }

    /**
     * Get all collected metrics
     * @returns {Object} All metrics
     */
    getMetrics() {
        return Object.fromEntries(this.metrics);
    }

    /**
     * Get performance summary
     * @returns {Object} Performance summary
     */
    getPerformanceSummary() {
        const metrics = this.getMetrics();
        const pageLoad = metrics.pageLoad || {};
        const memory = metrics.memory || {};
        const fps = metrics.fps || {};

        return {
            pageLoadTime: pageLoad.loadComplete || 0,
            firstContentfulPaint: pageLoad.firstContentfulPaint || 0,
            memoryUsage: memory.used || 0,
            currentFPS: fps.value || 0,
            totalMetrics: Object.keys(metrics).length,
            health: this.calculateHealthScore(metrics)
        };
    }

    /**
     * Calculate overall performance health score
     * @param {Object} metrics - All metrics
     * @returns {number} Health score (0-100)
     */
    calculateHealthScore(metrics) {
        let score = 100;

        // Deduct for slow page load
        if (metrics.pageLoad?.loadComplete > 3000) {
            score -= 20;
        }

        // Deduct for slow FCP
        if (metrics.pageLoad?.firstContentfulPaint > 1500) {
            score -= 15;
        }

        // Deduct for high memory usage
        if (metrics.memory?.usedPercentage > 80) {
            score -= 10;
        }

        // Deduct for low FPS
        if (metrics.fps?.value < 30) {
            score -= 15;
        }

        return Math.max(0, score);
    }

    /**
     * Generate performance report
     * @returns {string} Performance report HTML
     */
    generateReport() {
        const summary = this.getPerformanceSummary();
        const metrics = this.getMetrics();

        return `
            <div class="performance-report">
                <h3>Performance Report</h3>
                <div class="summary">
                    <div class="metric">
                        <label>Health Score:</label>
                        <span class="score ${summary.health >= 80 ? 'good' : summary.health >= 60 ? 'warning' : 'poor'}">${summary.health}</span>
                    </div>
                    <div class="metric">
                        <label>Page Load:</label>
                        <span>${summary.pageLoadTime.toFixed(0)}ms</span>
                    </div>
                    <div class="metric">
                        <label>First Paint:</label>
                        <span>${summary.firstContentfulPaint.toFixed(0)}ms</span>
                    </div>
                    <div class="metric">
                        <label>Memory:</label>
                        <span>${summary.memoryUsage.toFixed(1)}MB</span>
                    </div>
                    <div class="metric">
                        <label>FPS:</label>
                        <span>${summary.currentFPS}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Cleanup performance monitoring
     */
    cleanup() {
        if (this.memoryInterval) {
            clearInterval(this.memoryInterval);
        }
        if (this.fpsInterval) {
            clearInterval(this.fpsInterval);
        }

        this.metrics.clear();
        console.log('PerformanceMonitor cleaned up');
    }
}

// Create global instance
let globalPerformanceMonitor = null;

/**
 * Get or create global PerformanceMonitor instance
 * @param {Object} options - Options for PerformanceMonitor
 * @returns {PerformanceMonitor} Global PerformanceMonitor instance
 */
export function getPerformanceMonitor(options = {}) {
    if (!globalPerformanceMonitor) {
        globalPerformanceMonitor = new PerformanceMonitor(options);
        // Make it globally accessible for debugging
        window.performanceMonitor = globalPerformanceMonitor;
    }
    return globalPerformanceMonitor;
}

// Class is already exported above with "export class PerformanceMonitor"