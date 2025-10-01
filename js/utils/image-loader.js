// js/utils/image-loader.js - Optimized image loading with lazy loading

/**
 * ImageLoader - Handles optimized image loading with lazy loading and smooth transitions
 */
export class ImageLoader {
    constructor(options = {}) {
        this.observer = null;
        this.loadedImages = new Set();
        this.loadingImages = new Set();
        this.options = {
            rootMargin: '50px 0px',
            threshold: 0.1,
            loadingDelay: 100,
            placeholderColor: '#f3f4f6',
            errorColor: '#e5e7eb',
            ...options
        };

        this.setupIntersectionObserver();
        this.injectStyles();

        console.log('ImageLoader initialized');
    }

    /**
     * Setup Intersection Observer for lazy loading
     */
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            this.observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    rootMargin: this.options.rootMargin,
                    threshold: this.options.threshold
                }
            );
            console.log('Intersection Observer setup complete');
        } else {
            console.warn('Intersection Observer not supported, using fallback');
        }
    }

    /**
     * Load a single image with optimization
     * @param {HTMLImageElement} imgElement - Image element to load
     */
    loadImage(imgElement) {
        const src = imgElement.dataset.src;
        if (!src || this.loadedImages.has(src) || this.loadingImages.has(src)) {
            return;
        }

        this.loadingImages.add(src);

        // Add loading state
        imgElement.classList.add('loading');

        // Create a temporary image to preload
        const tempImg = new Image();

        tempImg.onload = () => {
            // Apply the loaded image with smooth transition
            imgElement.src = src;
            imgElement.classList.remove('loading');
            imgElement.classList.add('loaded');

            this.loadedImages.add(src);
            this.loadingImages.delete(src);

            console.log(`✅ Image loaded: ${src}`);
        };

        tempImg.onerror = () => {
            imgElement.classList.remove('loading');
            imgElement.classList.add('error');
            imgElement.src = this.generateErrorPlaceholder();

            this.loadingImages.delete(src);

            console.warn(`❌ Failed to load image: ${src}`);
        };

        // Start loading with small delay to prioritize critical resources
        setTimeout(() => {
            if (this.loadingImages.has(src)) {
                tempImg.src = src;
            }
        }, this.options.loadingDelay);
    }

    /**
     * Generate error placeholder SVG
     * @returns {string} Base64 encoded SVG
     */
    generateErrorPlaceholder() {
        const svg = `
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="${this.options.errorColor}"/>
                <path d="M40 40H60V60H40V40Z" fill="#9CA3AF"/>
                <text x="50" y="80" font-family="Arial" font-size="8" fill="#6B7280" text-anchor="middle">Erro</text>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    /**
     * Generate loading placeholder SVG
     * @returns {string} Base64 encoded SVG
     */
    generateLoadingPlaceholder() {
        const svg = `
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="${this.options.placeholderColor}"/>
                <circle cx="50" cy="50" r="20" stroke="#9CA3AF" stroke-width="2" fill="none"/>
                <path d="M50 30 A20 20 0 0 1 70 50" stroke="#3B82F6" stroke-width="2" fill="none">
                    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite"/>
                </path>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    /**
     * Observe image element for lazy loading
     * @param {HTMLImageElement} imgElement - Image element to observe
     */
    observe(imgElement) {
        if (this.observer) {
            this.observer.observe(imgElement);
        } else {
            // Fallback for browsers without IntersectionObserver
            this.loadImage(imgElement);
        }
    }

    /**
     * Setup multiple images with automatic observation
     * @param {NodeList|Array} imgElements - Image elements to setup
     */
    setupImages(imgElements) {
        const elements = Array.from(imgElements).filter(img => img.dataset.src);

        elements.forEach(img => {
            // Set initial placeholder
            if (!img.src) {
                img.src = this.generateLoadingPlaceholder();
            }
            this.observe(img);
        });

        console.log(`Setup ${elements.length} images for lazy loading`);
    }

    /**
     * Create optimized image element
     * @param {Object} options - Image options
     * @returns {HTMLImageElement} Optimized image element
     */
    createOptimizedImage(options = {}) {
        const {
            src,
            alt = '',
            className = '',
            width = null,
            height = null,
            loading = 'lazy',
            sizes = null,
            srcset = null
        } = options;

        const img = document.createElement('img');
        img.dataset.src = src;
        img.alt = alt;
        img.className = `lazy-load ${className}`;

        if (width) img.width = width;
        if (height) img.height = height;
        if (loading) img.loading = loading;
        if (sizes) img.sizes = sizes;
        if (srcset) img.srcset = srcset;

        // Set initial placeholder
        img.src = this.generateLoadingPlaceholder();

        // Start observing
        this.observe(img);

        return img;
    }

    /**
     * Inject CSS styles for smooth image loading
     */
    injectStyles() {
        const styleId = 'image-loader-styles';

        if (document.getElementById(styleId)) {
            return; // Already injected
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            img.lazy-load {
                opacity: 0;
                transition: opacity 0.3s ease, transform 0.3s ease;
                background-color: ${this.options.placeholderColor};
            }

            img.lazy-load.loading {
                opacity: 0.7;
                transform: scale(1.02);
            }

            img.lazy-load.loaded {
                opacity: 1;
                transform: scale(1);
            }

            img.lazy-load.error {
                opacity: 0.8;
                filter: grayscale(50%);
            }

            .photo-placeholder,
            .restaurant-placeholder {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading-shimmer 1.5s infinite;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #9ca3af;
                font-size: 2rem;
            }

            @keyframes loading-shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            .restaurant-card-photo {
                position: relative;
                overflow: hidden;
            }

            .restaurant-card-photo img.lazy-load {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            /* Optimize image rendering for performance */
            img {
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
                image-rendering: pixelated;
            }

            @media (min-resolution: 2dppx) {
                img {
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Preload critical images
     * @param {Array} criticalImages - Array of image URLs to preload
     */
    async preloadCriticalImages(criticalImages) {
        const preloadPromises = criticalImages.map(src => {
            return new Promise((resolve) => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = src;
                link.onload = resolve;
                link.onerror = resolve;
                document.head.appendChild(link);
            });
        });

        try {
            await Promise.all(preloadPromises);
            console.log(`✅ Preloaded ${criticalImages.length} critical images`);
        } catch (error) {
            console.warn('⚠️ Some critical images failed to preload:', error);
        }
    }

    /**
     * Get performance metrics
     * @returns {Object} Image loading performance metrics
     */
    getMetrics() {
        return {
            loadedImages: this.loadedImages.size,
            loadingImages: this.loadingImages.size,
            memoryUsage: this.loadedImages.size * 2 + 'MB (estimated)' // Rough estimate
        };
    }

    /**
     * Clear loaded images cache
     */
    clearCache() {
        this.loadedImages.clear();
        this.loadingImages.clear();
        console.log('Image cache cleared');
    }

    /**
     * Destroy the image loader
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.clearCache();
        console.log('ImageLoader destroyed');
    }
}

// Create global instance
let globalImageLoader = null;

/**
 * Get or create global ImageLoader instance
 * @returns {ImageLoader} Global ImageLoader instance
 */
export function getImageLoader() {
    if (!globalImageLoader) {
        globalImageLoader = new ImageLoader();
    }
    return globalImageLoader;
}

/**
 * Initialize lazy loading for all images with data-src attribute
 */
export function initializeLazyLoading() {
    const imageLoader = getImageLoader();
    const lazyImages = document.querySelectorAll('img[data-src]');
    imageLoader.setupImages(lazyImages);
    return imageLoader;
}