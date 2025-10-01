// js/main.js - Entry point for Esplanada Eats application
import { initializeApp } from './modules/firebase.js?v=1.0.1';
import { StorageService } from './services/storage-service.js?v=1.0.2';
import { UIService } from './modules/ui-service.js?v=1.1.2';
import { ModalService } from './modules/modal-service.js?v=1.0.9';
import { ConnectionManager } from './modules/connection-manager.js?v=1.0.1';
import { initializeBundleOptimization } from './utils/bundle-optimizer.js';
import { initializeLazyLoading } from './utils/image-loader.js';
import { getPerformanceMonitor } from './services/performance-monitor.js?v=1.0.4';
import { responsiveSystem } from './utils/responsive-system.js?v=1.0.0';

class App {
    constructor() {
        this.firebaseApp = null;
        this.storageService = null;
        this.uiService = null;
        this.modalService = null;
        this.connectionManager = null;
        this.performanceMonitor = null;
        this.responsiveSystem = responsiveSystem;
    }

    async initialize() {
        let initMeasure = null;

        try {
            console.log('🚀 Initializing Esplanada Eats application with performance optimizations...');

            // Initialize bundle optimization
            await initializeBundleOptimization();

            // Initialize responsive system first
            console.log('📱 Initializing responsive system...');
            this.responsiveSystem.initialize();

            // Initialize Firebase
            const firebaseStart = performance.now();
            this.firebaseApp = await initializeApp();
            const firebaseDuration = performance.now() - firebaseStart;
            console.log(`✅ Firebase initialized successfully in ${firebaseDuration.toFixed(2)}ms`);

            // Initialize services
            this.storageService = new StorageService(this.firebaseApp);
            this.uiService = new UIService();
            this.modalService = new ModalService();
            this.connectionManager = new ConnectionManager();

            // Initialize performance monitoring after services are ready
            this.performanceMonitor = getPerformanceMonitor();

            // Set performance monitor in services that need it
            this.uiService.setPerformanceMonitor(this.performanceMonitor);
            const initMeasure = this.performanceMonitor.startMeasure('app_initialization');

            // Initialize lazy loading for images
            initializeLazyLoading();

            // Setup service worker for caching
            this.setupServiceWorker();

            // Set up event listeners
            this.setupEventListeners();

            // Set up real-time restaurant listener
            this.setupRealtimeListener();

            // Load initial data
            await this.loadRestaurants();

            // Setup responsive system listeners
            this.setupResponsiveListeners();

            // Force initial layout calculation for large screens
            this.forceInitialLayoutCalculation();

            // Setup performance monitoring for development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                this.setupDevelopmentPerformanceMonitoring();
            }

            initMeasure.end();
            console.log('✅ Application initialized successfully with performance optimizations and responsive design');
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            if (initMeasure) {
                initMeasure.end({ error: error.message });
            }
            this.showError('Falha ao inicializar aplicação. Tente recarregar a página.');
        }
    }

    setupEventListeners() {
        // Add restaurant button
        const addRestaurantBtn = document.getElementById('add-restaurant-btn');
        if (addRestaurantBtn) {
            addRestaurantBtn.addEventListener('click', () => {
                this.modalService.showAddRestaurantModal();
            });
        }

        // Connection state changes
        if (this.connectionManager) {
            this.connectionManager.onConnectionChange((isOnline) => {
                this.updateConnectionIndicator(isOnline);
            });
        }

        // Modal close button
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.modalService.close();
            });
        }

        // Modal overlay click to close
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => {
                this.modalService.close();
            });
        }

        // Empty state button
        const emptyStateBtn = document.querySelector('.empty-state .btn');
        if (emptyStateBtn) {
            emptyStateBtn.addEventListener('click', () => {
                this.modalService.showAddRestaurantModal();
            });
        }
    }

    async loadRestaurants() {
        const loadMeasure = this.performanceMonitor?.startMeasure('load_restaurants');

        try {
            console.log('Loading restaurants...');
            const restaurants = await this.storageService.getRestaurants();
            console.log('Restaurants loaded:', restaurants.length);
            this.uiService.displayRestaurants(restaurants);
            loadMeasure?.end({ restaurantCount: restaurants.length });
        } catch (error) {
            console.error('Failed to load restaurants:', error);
            loadMeasure?.end({ error: error.message });
            this.showError('Falha ao carregar restaurantes');
        }
    }

  setupRealtimeListener() {
        try {
            console.log('Setting up real-time restaurant listener...');

            this.storageService.setupRestaurantsListener((restaurants, changes) => {
                console.log('Real-time update received:', changes.length, 'changes');
                this.uiService.displayRestaurants(restaurants);
            });

            console.log('Real-time listener set up successfully');
        } catch (error) {
            console.error('Failed to set up real-time listener:', error);
        }
    }

    updateConnectionIndicator(isOnline) {
        const indicator = document.getElementById('connection-indicator');
        if (indicator) {
            indicator.className = `connection-indicator ${isOnline ? 'online' : 'offline'}`;
            indicator.textContent = isOnline ? 'Online' : 'Offline';

            console.log(`Connection status: ${isOnline ? 'Online' : 'Offline'}`);
        }
    }

    showError(message) {
        console.error('Application error:', message);

        // For now, use alert. In future stories, this will be replaced with better UI
        if (typeof message === 'string') {
            alert(message);
        } else {
            alert('Ocorreu um erro inesperado. Tente novamente.');
        }
    }

    /**
     * Setup service worker for caching
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('✅ Service Worker registered successfully:', registration.scope);

                    // Listen for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('🔄 New Service Worker available, refreshing...');
                                window.location.reload();
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.warn('⚠️ Service Worker registration failed:', error);
                });
        } else {
            console.warn('⚠️ Service Worker not supported');
        }
    }

    /**
     * Setup development performance monitoring
     */
    setupDevelopmentPerformanceMonitoring() {
        // Add performance monitoring shortcuts
        window.performanceMetrics = () => {
            return this.performanceMonitor.getPerformanceSummary();
        };

        window.performanceReport = () => {
            const report = this.performanceMonitor.generateReport();
            console.log('Performance Report:', report);
            return report;
        };

        // Add performance indicator to the page
        const indicator = document.createElement('div');
        indicator.className = 'performance-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 11px;
            z-index: 10000;
            cursor: pointer;
        `;
        indicator.innerHTML = '📊 Performance';
        indicator.title = 'Click to view performance metrics';

        indicator.addEventListener('click', () => {
            const metrics = this.performanceMonitor.getPerformanceSummary();
            const summary = `
Performance Summary:
- Health Score: ${metrics.health}%
- Page Load: ${metrics.pageLoadTime.toFixed(0)}ms
- First Paint: ${metrics.firstContentfulPaint.toFixed(0)}ms
- Memory: ${metrics.memoryUsage.toFixed(1)}MB
- FPS: ${metrics.currentFPS}

Console: performanceReport() for detailed report
            `;
            console.log(summary);
        });

        document.body.appendChild(indicator);

        // Update indicator color based on performance
        setInterval(() => {
            const metrics = this.performanceMonitor.getPerformanceSummary();
            indicator.className = 'performance-indicator';
            if (metrics.health >= 80) {
                indicator.style.background = 'rgba(16, 185, 129, 0.9)';
            } else if (metrics.health >= 60) {
                indicator.style.background = 'rgba(245, 158, 11, 0.9)';
            } else {
                indicator.style.background = 'rgba(239, 68, 68, 0.9)';
            }
        }, 2000);

        console.log('📊 Development performance monitoring enabled');
    }

    /**
     * Setup responsive system listeners
     */
    setupResponsiveListeners() {
        // Listen for breakpoint changes
        this.responsiveSystem.onBreakpointChange((oldBreakpoint, newBreakpoint) => {
            console.log(`📱 Breakpoint changed from ${oldBreakpoint} to ${newBreakpoint}`);
            this.handleBreakpointChange(oldBreakpoint, newBreakpoint);
        });

        // Listen for orientation changes
        this.responsiveSystem.onBreakpointChange((breakpoint, orientation) => {
            console.log(`📱 Orientation changed to ${orientation}`);
            this.handleOrientationChange(orientation);
        });

        console.log('📱 Responsive system listeners configured');
    }

    /**
     * Handle breakpoint changes
     */
    handleBreakpointChange(oldBreakpoint, newBreakpoint) {
        // Adjust layout based on new breakpoint
        this.adjustLayoutForBreakpoint(newBreakpoint);

        // Force full-width layout for large screens
        if (newBreakpoint === 'wide' || newBreakpoint === 'ultrawide') {
            console.log(`🖥️ Large screen breakpoint ${newBreakpoint} detected, forcing full-width layout`);
            this.forceFullWidthLayout(`breakpoint_change_to_${newBreakpoint}`);
        }

        // Log performance metrics for breakpoint changes
        if (this.performanceMonitor) {
            this.performanceMonitor.mark(`breakpoint_change_${newBreakpoint}`);
        }

        // REMOVED: Don't reload restaurants on breakpoint change to prevent layout reset
        // This was causing the layout to reset when returning to large screens
        console.log(`📱 Breakpoint ${newBreakpoint} handled - layout adjusted by CSS`);

        // Only reload restaurants if it's a mobile-specific change that affects card structure
        if (newBreakpoint === 'mobile' || oldBreakpoint === 'mobile') {
            if (this.storageService) {
                console.log('📱 Mobile breakpoint change detected, reloading restaurants');
                this.loadRestaurants();
            }
        }
    }

    /**
     * Handle orientation changes
     */
    handleOrientationChange(orientation) {
        // Adjust UI for orientation changes
        this.adjustLayoutForOrientation(orientation);

        // Refresh any components that need orientation-specific layouts
        if (this.modalService && this.modalService.isModalOpen()) {
            // Adjust modal position for orientation change
            this.modalService.adjustForOrientation(orientation);
        }
    }

    /**
     * Adjust layout based on breakpoint
     */
    adjustLayoutForBreakpoint(breakpoint) {
        const body = document.body;

        // Add breakpoint-specific classes
        body.classList.remove('layout-mobile', 'layout-tablet', 'layout-desktop', 'layout-wide', 'layout-ultrawide');
        body.classList.add(`layout-${breakpoint}`);

        // Adjust modal positioning if open
        if (this.modalService && this.modalService.isModalOpen()) {
            this.modalService.adjustForBreakpoint(breakpoint);
        }

        // Adjust grid layout
        this.adjustGridForBreakpoint(breakpoint);
    }

    /**
     * Adjust layout based on orientation
     */
    adjustLayoutForOrientation(orientation) {
        const body = document.body;

        // Add orientation-specific classes
        body.classList.remove('orientation-portrait', 'orientation-landscape');
        body.classList.add(`orientation-${orientation}`);

        // Adjust viewport height for mobile browsers
        if (this.responsiveSystem.isMobile()) {
            this.responsiveSystem.setupViewportUnits();
        }
    }

    /**
     * Adjust grid layout for breakpoint
     * Note: Grid layout is now handled entirely by CSS media queries
     */
    adjustGridForBreakpoint(breakpoint) {
        // Grid layout is handled by CSS media queries in styles.css
        // No JavaScript manipulation needed
        console.log(`📱 Grid layout adjusted by CSS for breakpoint: ${breakpoint}`);
    }

    /**
     * Force full-width layout for large screens ONLY
     * Maintain full responsiveness for smaller screens
     */
    forceFullWidthLayout(source = 'initialization') {
        const width = window.innerWidth;
        console.log(`🔧 Forcing full-width layout (${source}) for screen width: ${width}px`);

        // Critical breakpoint at exactly 1400px - ONLY apply to large screens
        if (width >= 1400) {
            console.log('🖥️ CRITICAL: Screen >= 1400px detected, applying full-width layout ONLY');

            // Force CSS root variables update with maximum specificity
            const root = document.documentElement;
            root.style.setProperty('--container-max-width', 'none', 'important');

            // Force app-main styles with maximum specificity
            const appMain = document.querySelector('.app-main');
            if (appMain) {
                console.log('🔧 Applying full-width styles to app-main');
                appMain.style.setProperty('max-width', 'none', 'important');
                appMain.style.setProperty('width', '100%', 'important');
                appMain.style.setProperty('margin', '0 auto', 'important');
                appMain.style.setProperty('padding', '2rem', 'important');
            }

            // Force body styling
            document.body.style.setProperty('overflow-x', 'hidden', 'important');

            // Create a style element that ONLY applies to 1400px+ screens
            const style = document.createElement('style');
            style.id = 'force-full-width-override';
            style.textContent = `
                /* ONLY apply these styles to screens 1400px and larger */
                @media (min-width: 1400px) {
                    .app-main {
                        max-width: none !important;
                        width: 100% !important;
                        margin: 0 auto !important;
                    }
                    .restaurants-grid {
                        max-width: none !important;
                        width: 100% !important;
                        /* Smart grid for different card counts */
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
                    }
                    /* Specific layouts for exact card counts */
                    .restaurants-grid:has(.restaurant-card:nth-child(3):last-child) {
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 2rem !important;
                    }
                    .restaurants-grid:has(.restaurant-card:nth-child(2):last-child) {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 2rem !important;
                    }
                    .restaurants-grid:has(.restaurant-card:only-child) {
                        grid-template-columns: 1fr !important;
                        max-width: 600px !important;
                        margin: 0 auto !important;
                    }
                }
                /* DO NOT TOUCH smaller screens - let CSS media queries handle them */
            `;

            // Remove existing style if present
            const existingStyle = document.getElementById('force-full-width-override');
            if (existingStyle) {
                existingStyle.remove();
            }

            // Add new style
            document.head.appendChild(style);

            // Trigger multiple reflows to ensure styles are applied
            void document.body.offsetHeight;
            setTimeout(() => void document.body.offsetHeight, 10);

            console.log('✅ Full-width layout applied successfully for 1400px+ screens ONLY');
        } else {
            console.log(`📱 Screen width ${width}px is below 1400px threshold - using normal responsive layout`);

            // Remove the override style when below 1400px to restore normal responsiveness
            const overrideStyle = document.getElementById('force-full-width-override');
            if (overrideStyle) {
                overrideStyle.remove();
                console.log('🗑️ Removed full-width override style, restoring normal responsive layout');
            }

            // Also clear any inline styles that might interfere with responsiveness
            const appMain = document.querySelector('.app-main');
            if (appMain) {
                appMain.style.removeProperty('max-width');
                appMain.style.removeProperty('width');
                appMain.style.removeProperty('padding');
            }
        }
    }

    /**
     * Force initial layout calculation for large screens
     */
    forceInitialLayoutCalculation() {
        this.forceFullWidthLayout('initialization');
    }

    /**
     * Cleanup application resources
     */
    cleanup() {
        if (this.uiService) {
            this.uiService.cleanup();
        }

        if (this.performanceMonitor) {
            this.performanceMonitor.cleanup();
        }

        if (this.responsiveSystem) {
            this.responsiveSystem.destroy();
        }

        console.log('🧹 Application cleaned up');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting application...');
    const app = new App();
    app.initialize();

    // Make app globally available for other components
    window.app = app;
});

export default App;