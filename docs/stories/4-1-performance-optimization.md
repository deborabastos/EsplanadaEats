# Story 4.1: Performance Optimization

## Status
Draft

## Story
**As a** user,
**I want** the application to load quickly and respond instantly to my actions,
**so that** I can have a fluid and satisfactory experience when using the restaurant rating system.

## Acceptance Criteria
1. Initial load time < 3 seconds on 3G connection
2. Images must load with lazy loading
3. Animations must be smooth (60fps)
4. No operation should block the interface for more than 100ms
5. Bundle size must be optimized (< 500KB)
6. Firebase queries must be optimized with proper indexing
7. Caching strategies must be implemented
8. Performance monitoring must be in place

## Tasks / Subtasks
- [ ] Task 1: Optimize initial load performance (AC: 1, 5)
  - [ ] Implement code splitting and lazy loading
  - [ ] Optimize bundle size and reduce JavaScript payload
  - [ ] Minimize and compress assets
  - [ ] Implement critical CSS inlining
- [ ] Task 2: Implement image optimization (AC: 2)
  - [ ] Add lazy loading for all images
  - [ ] Implement responsive image loading
  - [ ] Add image compression and format optimization
  - [ ] Create image loading placeholders
- [ ] Task 3: Optimize animations and interactions (AC: 3, 4)
  - [ ] Ensure 60fps animation performance
  - [ ] Implement non-blocking UI operations
  - [ ] Add web workers for heavy computations
  - [ ] Optimize rendering performance
- [ ] Task 4: Optimize database operations (AC: 6)
  - [ ] Implement Firebase query optimization
  - [ ] Add appropriate database indexes
  - [ ] Create efficient data retrieval patterns
  - [ ] Implement query result caching
- [ ] Task 5: Implement caching strategies (AC: 7)
  - [ ] Add browser caching for static assets
  - [ ] Implement service worker for offline caching
  - [ ] Create application-level caching strategies
  - [ ] Add cache invalidation mechanisms
- [ ] Task 6: Create performance monitoring (AC: 8)
  - [ ] Implement performance metrics collection
  - [ ] Add real-time performance monitoring
  - [ ] Create performance alerting system
  - [ ] Add performance profiling tools

## Dev Notes
This story focuses on comprehensive performance optimization to ensure fast loading, smooth interactions, and excellent user experience across all devices and network conditions.
- [ ] Cache deve ser implementado para recursos estáticos
- [ ] Firebase queries devem ser otimizadas com índices apropriados
- [ ] Tamanho total do bundle JavaScript deve ser < 500KB
- [ ] Score de performance Lighthouse > 90

## Technical Implementation

### Image Loading Optimization
```javascript
// utils/ImageLoader.js
class ImageLoader {
  constructor() {
    this.observer = null;
    this.loadedImages = new Set();
    this.setupIntersectionObserver();
  }

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
          rootMargin: '50px 0px',
          threshold: 0.1
        }
      );
    }
  }

  loadImage(imgElement) {
    const src = imgElement.dataset.src;
    if (!src || this.loadedImages.has(src)) return;

    // Create a temporary image to preload
    const tempImg = new Image();
    tempImg.onload = () => {
      imgElement.src = src;
      imgElement.classList.add('loaded');
      this.loadedImages.add(src);
    };
    tempImg.onerror = () => {
      imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEg2MFY2MEg0MFY0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
    };

    // Start loading with a small delay to prioritize critical resources
    setTimeout(() => {
      tempImg.src = src;
    }, 100);
  }

  observe(imgElement) {
    if (this.observer) {
      this.observer.observe(imgElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(imgElement);
    }
  }

  // Add CSS for smooth image loading
  static injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      img[data-src] {
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      img.loaded {
        opacity: 1;
      }
      .photo-placeholder,
      .restaurant-placeholder {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Enhanced image loading for restaurant cards
class OptimizedRestaurantCard {
  constructor(restaurant, imageLoader) {
    this.restaurant = restaurant;
    this.imageLoader = imageLoader;
  }

  render() {
    return `
      <div class="restaurant-card" data-id="${this.restaurant.id}">
        <div class="restaurant-photo">
          ${this.renderOptimizedPhoto()}
        </div>
        <div class="restaurant-info">
          <h3 class="restaurant-name">${this.escapeHtml(this.restaurant.name)}</h3>
          <div class="restaurant-rating">
            ${this.renderRatingDisplay()}
          </div>
        </div>
      </div>
    `;
  }

  renderOptimizedPhoto() {
    if (this.restaurant.photoUrls && this.restaurant.photoUrls.length > 0) {
      // Use a small placeholder first
      return `
        <img
          data-src="${this.restaurant.photoUrls[0]}"
          alt="${this.escapeHtml(this.restaurant.name)}"
          class="lazy-load"
          loading="lazy"
        >
      `;
    }
    return `<div class="photo-placeholder">🍽️</div>`;
  }

  // ... rest of the existing methods ...
}
```

### Firebase Query Optimization
```javascript
// services/OptimizedFirebaseService.js
class OptimizedFirebaseService {
  constructor() {
    this.firestore = firebase.firestore();
    this.cache = new Map();
    this.queryCache = new Map();
    this.setupFirestoreSettings();
  }

  setupFirestoreSettings() {
    // Enable offline persistence
    this.firestore.enablePersistence({ synchronizeTabs: true })
      .catch((err) => {
        console.error('Error enabling persistence:', err);
      });

    // Configure cache size
    this.firestore.settings({
      cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
  }

  // Optimized restaurant query with caching
  async getRestaurants(options = {}) {
    const { forceRefresh = false, limit = 50 } = options;
    const cacheKey = `restaurants_${limit}`;

    if (!forceRefresh && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let query = this.firestore.collection('restaurants')
        .orderBy('createdAt', 'desc')
        .limit(limit);

      const snapshot = await query.get();
      const restaurants = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Cache the result
      this.cache.set(cacheKey, restaurants);

      return restaurants;
    } catch (error) {
      console.error('Error getting restaurants:', error);
      throw error;
    }
  }

  // Optimized ratings query with real-time updates
  subscribeToRestaurantRatings(restaurantId, callback) {
    const cacheKey = `ratings_${restaurantId}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      callback(this.cache.get(cacheKey));
    }

    const unsubscribe = this.firestore
      .collection('ratings')
      .where('restaurantId', '==', restaurantId)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .onSnapshot((snapshot) => {
        const ratings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Update cache
        this.cache.set(cacheKey, ratings);
        callback(ratings);
      });

    return unsubscribe;
  }

  // Batch operations for better performance
  async batchUpdateRatings(updates) {
    const batch = this.firestore.batch();
    const restaurantRef = this.firestore.collection('restaurants');

    updates.forEach(({ restaurantId, averageQuality, totalRatings }) => {
      const docRef = restaurantRef.doc(restaurantId);
      batch.update(docRef, {
        averageQuality,
        totalRatings,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    this.queryCache.clear();
  }

  // Preload data for better UX
  async preloadData() {
    try {
      // Preload restaurants
      await this.getRestaurants();

      // Preload popular restaurants' ratings
      const popularRestaurants = await this.getRestaurants({ limit: 10 });
      const ratingPromises = popularRestaurants.map(restaurant => {
        return new Promise((resolve) => {
          const unsubscribe = this.subscribeToRestaurantRatings(
            restaurant.id,
            (ratings) => {
              resolve(ratings);
              unsubscribe();
            }
          );
        });
      });

      await Promise.all(ratingPromises);
    } catch (error) {
      console.error('Error preloading data:', error);
    }
  }
}
```

### Bundle Optimization
```javascript
// utils/BundleOptimizer.js
class BundleOptimizer {
  constructor() {
    this.loadedModules = new Set();
    this.loadingModules = new Map();
  }

  // Dynamic import for code splitting
  async loadModule(moduleName, modulePath) {
    if (this.loadedModules.has(moduleName)) {
      return this.loadedModules.get(moduleName);
    }

    if (this.loadingModules.has(moduleName)) {
      return this.loadingModules.get(moduleName);
    }

    const loadPromise = import(modulePath)
      .then((module) => {
        this.loadedModules.set(moduleName, module);
        this.loadingModules.delete(moduleName);
        return module;
      })
      .catch((error) => {
        this.loadingModules.delete(moduleName);
        throw error;
      });

    this.loadingModules.set(moduleName, loadPromise);
    return loadPromise;
  }

  // Load critical modules first
  async loadCriticalModules() {
    const criticalModules = [
      { name: 'RestaurantModal', path: './components/restaurant-modal.js' },
      { name: 'RatingForm', path: './components/rating-form.js' },
      { name: 'ImageLoader', path: './utils/ImageLoader.js' }
    ];

    await Promise.all(
      criticalModules.map(module => this.loadModule(module.name, module.path))
    );
  }

  // Load non-critical modules after page load
  loadNonCriticalModules() {
    const nonCriticalModules = [
      { name: 'Analytics', path: './services/analytics.js' },
      { name: 'ShareService', path: './services/share-service.js' }
    ];

    // Use requestIdleCallback for non-critical modules
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        nonCriticalModules.forEach(module => {
          this.loadModule(module.name, module.path);
        });
      });
    } else {
      // Fallback
      setTimeout(() => {
        nonCriticalModules.forEach(module => {
          this.loadModule(module.name, module.path);
        });
      }, 1000);
    }
  }
}
```

### Performance Monitoring
```javascript
// services/PerformanceMonitor.js
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.setupPerformanceMonitoring();
  }

  setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      this.recordPageLoadMetrics();
    });

    // Monitor Firebase performance
    if (typeof firebase !== 'undefined' && firebase.performance) {
      this.setupFirebasePerformance();
    }

    // Monitor custom metrics
    this.setupCustomMetrics();
  }

  recordPageLoadMetrics() {
    if (window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      };

      this.metrics.set('pageLoad', metrics);
      this.logMetrics('Page Load', metrics);
    }
  }

  setupFirebasePerformance() {
    const perf = firebase.performance();

    // Monitor Firestore operations
    perf.instrumentationEnabled = true;
    perf.dataCollectionEnabled = true;
  }

  setupCustomMetrics() {
    // Monitor rating form submission time
    const originalSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function() {
      const startTime = performance.now();
      const result = originalSubmit.apply(this, arguments);

      requestAnimationFrame(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.log(`Form submission took ${duration.toFixed(2)}ms`);
      });

      return result;
    };
  }

  startMeasure(name) {
    const startTime = performance.now();
    return {
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        this.metrics.set(name, duration);
        this.logMetrics(name, { duration });
        return duration;
      }
    };
  }

  logMetrics(name, data) {
    console.log(`[Performance] ${name}:`, data);

    // Send to analytics if available
    if (window.gtag) {
      gtag('event', 'performance_metric', {
        metric_name: name,
        ...data
      });
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}
```

### CSS Performance Optimization
```css
/* Performance-optimized CSS */
:root {
  --transition-duration: 0.2s;
  --transition-timing: ease;
}

/* Optimize animations */
* {
  transition-property: transform, opacity;
  transition-duration: var(--transition-duration);
  transition-timing-function: var(--transition-timing);
}

/* Hardware acceleration for smooth animations */
.restaurant-card,
.modal-content,
.rating-form {
  transform: translateZ(0);
  will-change: transform, opacity;
}

/* Optimize image rendering */
img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

/* Reduce paint complexity */
.simplified-background {
  background: #f9fafb;
  /* Avoid complex gradients or patterns */
}

/* Optimize font rendering */
body {
  font-smoothing: antialiased;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Contain paint and layout */
.rating-stars,
.restaurant-photo {
  contain: layout style paint;
}

/* Use CSS containment for better performance */
.restaurant-card {
  contain: layout;
}

/* Optimize scrolling */
.restaurant-list {
  overflow-y: auto;
  scroll-behavior: smooth;
  will-change: scroll-position;
}

/* Reduce expensive box shadows */
.modal {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* Instead of multiple shadows */
}
```

### Service Worker for Caching
```javascript
// public/sw.js
const CACHE_NAME = 'esplanada-eats-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/js/bundle.js',
  '/images/icons/icon-192x192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### Performance Testing Script
```javascript
// utils/PerformanceTest.js
class PerformanceTest {
  constructor() {
    this.results = [];
  }

  async runTests() {
    console.log('Starting performance tests...');

    // Test image loading
    await this.testImageLoading();

    // Test Firebase queries
    await this.testFirebaseQueries();

    // Test animations
    await this.testAnimations();

    // Test memory usage
    await this.testMemoryUsage();

    console.log('Performance tests completed:', this.results);
    return this.results;
  }

  async testImageLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const startTime = performance.now();

    await Promise.all(Array.from(images).map(img => {
      return new Promise((resolve) => {
        img.onload = img.onerror = resolve;
      });
    }));

    const duration = performance.now() - startTime;
    this.results.push({
      test: 'Image Loading',
      duration: duration.toFixed(2),
      imageCount: images.length
    });
  }

  async testFirebaseQueries() {
    const testQueries = [
      () => firebase.firestore().collection('restaurants').limit(10).get(),
      () => firebase.firestore().collection('ratings').limit(5).get()
    ];

    for (const query of testQueries) {
      const startTime = performance.now();
      try {
        await query();
        const duration = performance.now() - startTime;
        this.results.push({
          test: 'Firebase Query',
          duration: duration.toFixed(2)
        });
      } catch (error) {
        this.results.push({
          test: 'Firebase Query',
          duration: 'ERROR',
          error: error.message
        });
      }
    }
  }

  async testAnimations() {
    const animatedElements = document.querySelectorAll('.restaurant-card');
    const startTime = performance.now();

    animatedElements.forEach(el => {
      el.style.transform = 'scale(1.05)';
    });

    await new Promise(resolve => setTimeout(resolve, 300));

    animatedElements.forEach(el => {
      el.style.transform = 'scale(1)';
    });

    const duration = performance.now() - startTime;
    this.results.push({
      test: 'Animations',
      duration: duration.toFixed(2),
      elementCount: animatedElements.length
    });
  }

  async testMemoryUsage() {
    if (performance.memory) {
      const memory = performance.memory;
      this.results.push({
        test: 'Memory Usage',
        usedJSHeapSize: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
        totalJSHeapSize: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB'
      });
    }
  }
}
```

## Dependencies
- **Story 2.2**: Image upload optimization for consistent image handling
- **Story 0.2**: Firebase SDK integration for database optimization
- **Story 1.3**: Restaurant card display system for optimization target

## Testing Checklist
- [ ] Lazy loading works for all images
- [ ] Page load time is under 3 seconds on 3G
- [ ] Animations run at 60fps
- [ ] Firebase queries use proper indexes
- [ ] Bundle size is under 500KB
- [ ] Service worker caches static assets
- [ ] Memory usage is reasonable
- [ ] No layout shifts during load
- [ ] Performance monitoring works
- [ ] Lighthouse score > 90

## Notes
- Esta história foca em otimizações de desempenho críticas
- As melhorias são implementadas de forma não-intrusiva
- Monitoramento contínuo permite identificar regressões
- O sistema é projetado para ser escalável e performático
- A experiência do usuário é priorizada em todas as otimizações
- Testes automatizados garantem a qualidade das otimizações