/**
 * Responsive Design System
 * Manages responsive behaviors, breakpoints, and device optimizations
 */
export class ResponsiveSystem {
    constructor() {
        this.breakpoints = {
            mobile: 0,
            tablet: 768,
            desktop: 1024,
            wide: 1280,
            ultrawide: 1536
        };

        this.currentBreakpoint = null;
        this.orientation = null;
        this.isTouchDevice = null;
        this.listeners = new Set();
        this.imageObserver = null;

        this.initialize();
    }

    /**
     * Initialize the responsive system
     */
    initialize() {
        // Set initial state
        this.updateBreakpoint();
        this.updateOrientation();
        this.detectTouchDevice();

        // Add event listeners
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 100));
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));

        // Initialize responsive features
        this.setupResponsiveBehaviors();
        this.setupTouchOptimizations();
        this.setupViewportOptimizations();
        this.setupImageOptimization();

        console.log('Responsive system initialized');
    }

    /**
     * Handle resize events with debouncing
     */
    handleResize() {
        const oldBreakpoint = this.currentBreakpoint;
        this.updateBreakpoint();

        if (oldBreakpoint !== this.currentBreakpoint) {
            this.notifyBreakpointChange(oldBreakpoint, this.currentBreakpoint);
        }

        this.updateTypography();
        this.updateSpacing();
        this.notifyResize();
    }

    /**
     * Handle orientation change events
     */
    handleOrientationChange() {
        const oldOrientation = this.orientation;
        this.updateOrientation();

        if (oldOrientation !== this.orientation) {
            this.updateBodyClasses();
            this.notifyOrientationChange(oldOrientation, this.orientation);
        }
    }

    /**
     * Update current breakpoint based on viewport width
     */
    updateBreakpoint() {
        const width = window.innerWidth;

        if (width >= this.breakpoints.ultrawide) {
            this.currentBreakpoint = 'ultrawide';
        } else if (width >= this.breakpoints.wide) {
            this.currentBreakpoint = 'wide';
        } else if (width >= this.breakpoints.desktop) {
            this.currentBreakpoint = 'desktop';
        } else if (width >= this.breakpoints.tablet) {
            this.currentBreakpoint = 'tablet';
        } else {
            this.currentBreakpoint = 'mobile';
        }
    }

    /**
     * Update device orientation
     */
    updateOrientation() {
        this.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    /**
     * Detect if device supports touch
     */
    detectTouchDevice() {
        this.isTouchDevice = 'ontouchstart' in window ||
                           navigator.maxTouchPoints > 0 ||
                           navigator.msMaxTouchPoints > 0;
    }

    /**
     * Setup responsive behaviors and classes
     */
    setupResponsiveBehaviors() {
        this.updateBodyClasses();
        this.updateTypography();
        this.updateSpacing();
    }

    /**
     * Update body classes for current breakpoint and orientation
     */
    updateBodyClasses() {
        const body = document.body;

        // Remove existing breakpoint classes
        body.classList.remove(
            'breakpoint-mobile',
            'breakpoint-tablet',
            'breakpoint-desktop',
            'breakpoint-wide',
            'breakpoint-ultrawide'
        );

        // Add current breakpoint class
        body.classList.add(`breakpoint-${this.currentBreakpoint}`);

        // Update orientation classes
        body.classList.remove('orientation-portrait', 'orientation-landscape');
        body.classList.add(`orientation-${this.orientation}`);

        // Add touch device class if applicable
        if (this.isTouchDevice) {
            body.classList.add('touch-device');
        }
    }

    /**
     * Setup touch-specific optimizations
     */
    setupTouchOptimizations() {
        if (!this.isTouchDevice) return;

        this.removeHoverEffects();
        this.increaseTapTargets();
        this.addTouchFeedback();
        this.setupOptimalScrolling();
    }

    /**
     * Remove hover effects on touch devices to prevent stuck states
     */
    removeHoverEffects() {
        const style = document.createElement('style');
        style.id = 'touch-optimizations';
        style.textContent = `
            .touch-device *:hover {
                transition: none !important;
            }

            .touch-device .restaurant-card:hover,
            .touch-device .btn:hover {
                transform: none !important;
                box-shadow: var(--shadow-sm) !important;
            }

            .touch-device .btn:active,
            .touch-device .restaurant-card:active {
                opacity: 0.8;
                transform: scale(0.98);
                transition: all 0.1s ease;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Ensure minimum tap target sizes for accessibility
     */
    increaseTapTargets() {
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, .restaurant-card');

        interactiveElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const width = parseFloat(computedStyle.width);
            const height = parseFloat(computedStyle.height);

            if (width < 44 || height < 44) {
                element.style.minWidth = '44px';
                element.style.minHeight = '44px';
                element.style.display = 'flex';
                element.style.alignItems = 'center';
                element.style.justifyContent = 'center';
            }
        });
    }

    /**
     * Add touch feedback for better user experience
     */
    addTouchFeedback() {
        // Touch feedback for buttons and interactive elements
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('button, a, .restaurant-card, .btn');
            if (target) {
                target.classList.add('touch-active');
            }
        });

        document.addEventListener('touchend', (e) => {
            const target = e.target.closest('button, a, .restaurant-card, .btn');
            if (target) {
                setTimeout(() => {
                    target.classList.remove('touch-active');
                }, 150);
            }
        });
    }

    /**
     * Optimize scrolling for touch devices
     */
    setupOptimalScrolling() {
        // Enable smooth scrolling
        document.documentElement.style.scrollBehavior = 'smooth';

        // Prevent overscroll bounce on iOS
        document.body.style.overscrollBehavior = 'none';

        // Add momentum scrolling for iOS
        const style = document.createElement('style');
        style.textContent = `
            .touch-device {
                -webkit-overflow-scrolling: touch;
            }

            .touch-device .restaurants-grid {
                -webkit-overflow-scrolling: touch;
            }
        `;

        if (!document.getElementById('touch-scrolling')) {
            style.id = 'touch-scrolling';
            document.head.appendChild(style);
        }
    }

    /**
     * Setup viewport optimizations for mobile devices
     */
    setupViewportOptimizations() {
        this.setupViewportUnits();
        this.setupSafeAreas();
    }

    /**
     * Fix viewport units on mobile browsers
     */
    setupViewportUnits() {
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', setViewportHeight);
    }

    /**
     * Handle safe area insets for notched devices
     */
    setupSafeAreas() {
        const style = document.createElement('style');
        style.id = 'safe-areas';
        style.textContent = `
            .modal-container {
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
                padding-left: env(safe-area-inset-left);
                padding-right: env(safe-area-inset-right);
            }

            .app-header {
                padding-top: calc(2rem + env(safe-area-inset-top));
            }

            @supports (padding: max(0px)) {
                .modal-container {
                    padding-left: max(1rem, env(safe-area-inset-left));
                    padding-right: max(1rem, env(safe-area-inset-right));
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup image optimization for responsive design
     */
    setupImageOptimization() {
        this.configureImageLoading();
        this.setupNetworkOptimization();
    }

    /**
     * Configure responsive image loading with lazy loading
     */
    configureImageLoading() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            this.imageObserver.unobserve(entry.target);
                        }
                    });
                },
                {
                    rootMargin: '50px',
                    threshold: 0.1
                }
            );

            // Observe existing images
            this.observeImages();
        }
    }

    /**
     * Setup network-based optimizations
     */
    setupNetworkOptimization() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        if (connection) {
            // Adjust quality based on connection speed
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                document.body.classList.add('low-quality-mode');
            }

            // Reduce data usage if data saver is enabled
            if (connection.saveData) {
                document.body.classList.add('data-saver-mode');
            }

            // Listen for connection changes
            connection.addEventListener('change', () => {
                this.adjustForConnectionSpeed(connection.effectiveType);
            });
        }
    }

    /**
     * Adjust image quality based on connection speed
     */
    adjustForConnectionSpeed(speed) {
        const body = document.body;

        body.classList.remove('low-quality-mode', 'data-saver-mode', 'high-quality-mode');

        if (speed === 'slow-2g' || speed === '2g') {
            body.classList.add('low-quality-mode');
        } else if (speed === '3g') {
            body.classList.add('data-saver-mode');
        } else {
            body.classList.add('high-quality-mode');
        }
    }

    /**
     * Observe images for lazy loading
     */
    observeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            if (this.imageObserver) {
                this.imageObserver.observe(img);
            } else {
                this.loadImage(img);
            }
        });
    }

    /**
     * Load image with appropriate size optimization
     */
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Determine appropriate image size based on container
        const containerWidth = img.parentElement.offsetWidth;
        const appropriateSize = this.getAppropriateImageSize(containerWidth);

        // Load appropriate image size
        const imgSrc = this.getImageUrlForSize(src, appropriateSize);

        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = imgSrc;
            img.classList.add('loaded');
            img.style.opacity = '1';
        };
        tempImg.onerror = () => {
            img.src = this.getFallbackImageUrl();
            img.classList.add('error');
        };

        tempImg.src = imgSrc;
    }

    /**
     * Get appropriate image size based on container width
     */
    getAppropriateImageSize(containerWidth) {
        if (containerWidth <= 400) return 'small';
        if (containerWidth <= 800) return 'medium';
        if (containerWidth <= 1200) return 'large';
        return 'xlarge';
    }

    /**
     * Get optimized image URL for size
     */
    getImageUrlForSize(originalUrl, size) {
        // For Firebase Storage, we can add size parameters
        if (originalUrl.includes('firebasestorage.googleapis.com')) {
            const url = new URL(originalUrl);
            url.searchParams.set('size', size);
            return url.toString();
        }
        return originalUrl;
    }

    /**
     * Get fallback image URL
     */
    getFallbackImageUrl() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEg2MFY2MEg0MFY0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
    }

    /**
     * Update responsive typography
     */
    updateTypography() {
        const root = document.documentElement;
        const fontSize = this.getResponsiveFontSize();
        const lineHeight = this.getResponsiveLineHeight();

        root.style.fontSize = `${fontSize}px`;
        root.style.setProperty('--line-height', lineHeight);
    }

    /**
     * Get responsive font size for current breakpoint
     */
    getResponsiveFontSize() {
        switch (this.currentBreakpoint) {
            case 'mobile': return 14;
            case 'tablet': return 15;
            case 'desktop': return 16;
            case 'wide': return 17;
            case 'ultrawide': return 18;
            default: return 16;
        }
    }

    /**
     * Get responsive line height for current breakpoint
     */
    getResponsiveLineHeight() {
        return this.currentBreakpoint === 'mobile' ? 1.4 : 1.5;
    }

    /**
     * Update responsive spacing
     */
    updateSpacing() {
        const root = document.documentElement;
        const spacingUnit = this.getResponsiveSpacingUnit();

        root.style.setProperty('--spacing-unit', `${spacingUnit}px`);
        root.style.setProperty('--spacing-xs', `${spacingUnit * 0.5}px`);
        root.style.setProperty('--spacing-sm', `${spacingUnit * 0.75}px`);
        root.style.setProperty('--spacing-md', `${spacingUnit}px`);
        root.style.setProperty('--spacing-lg', `${spacingUnit * 1.5}px`);
        root.style.setProperty('--spacing-xl', `${spacingUnit * 2}px`);
        root.style.setProperty('--spacing-2xl', `${spacingUnit * 3}px`);
    }

    /**
     * Get responsive spacing unit for current breakpoint
     */
    getResponsiveSpacingUnit() {
        switch (this.currentBreakpoint) {
            case 'mobile': return 12;
            case 'tablet': return 14;
            case 'desktop': return 16;
            case 'wide': return 18;
            case 'ultrawide': return 20;
            default: return 16;
        }
    }

    /**
     * Public methods to check current device state
     */
    getCurrentBreakpoint() {
        return this.currentBreakpoint;
    }

    getCurrentOrientation() {
        return this.orientation;
    }

    isMobile() {
        return this.currentBreakpoint === 'mobile';
    }

    isTablet() {
        return this.currentBreakpoint === 'tablet';
    }

    isDesktop() {
        return ['desktop', 'wide', 'ultrawide'].includes(this.currentBreakpoint);
    }

    isTouch() {
        return this.isTouchDevice;
    }

    /**
     * Subscribe to breakpoint changes
     */
    onBreakpointChange(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Notify listeners of breakpoint changes
     */
    notifyBreakpointChange(oldBreakpoint, newBreakpoint) {
        this.listeners.forEach(callback => {
            callback(oldBreakpoint, newBreakpoint);
        });
    }

    /**
     * Notify listeners of resize events
     */
    notifyResize() {
        this.listeners.forEach(callback => {
            callback(this.currentBreakpoint, this.orientation);
        });
    }

    /**
     * Notify listeners of orientation changes
     */
    notifyOrientationChange(oldOrientation, newOrientation) {
        this.listeners.forEach(callback => {
            callback(this.currentBreakpoint, newOrientation);
        });
    }

    /**
     * Utility method for debouncing
     */
    debounce(func, wait) {
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
     * Cleanup method
     */
    destroy() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleOrientationChange);

        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }

        this.listeners.clear();
    }
}

// Export singleton instance
export const responsiveSystem = new ResponsiveSystem();
export default responsiveSystem;