# Story 4.2: Mobile Responsiveness

## User Story
Como usuário mobile, eu quero que o aplicativo funcione perfeitamente no meu celular e tablet, com interface adaptada para telas pequenas e gestos intuitivos para poder avaliar restaurantes facilmente em qualquer lugar.

## Acceptance Criteria
- [ ] Layout deve ser totalmente responsivo (mobile, tablet, desktop)
- [ ] Touch targets devem ter no mínimo 44x44 pixels
- [ ] Gestos de swipe devem funcionar para navegação
- [ ] Modal de restaurante deve ser fullscreen em mobile
- [ ] Formulário de avaliação deve ser otimizado para toque
- [ ] Carregamento de imagens deve ser priorizado em conexões lentas
- [ ] Teclado virtual não deve obscurecer elementos importantes
- [ ] Testes devem passar em todos os dispositivos principais

## Technical Implementation

### Mobile-First CSS Reset & Base Styles
```css
/* styles/mobile-base.css */
/* Mobile-first approach with progressive enhancement */

/* Base styles for all devices */
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

html {
  font-size: 16px;
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f9fafb;
  color: #1f2937;
  overflow-x: hidden;
}

/* Mobile-first container */
.container {
  width: 100%;
  max-width: 100%;
  padding: 1rem;
  margin: 0 auto;
}

/* Touch-friendly spacing */
.clickable {
  min-height: 44px;
  min-width: 44px;
  position: relative;
}

/* Responsive typography */
h1 { font-size: 1.5rem; }
h2 { font-size: 1.25rem; }
h3 { font-size: 1.125rem; }
p { font-size: 1rem; }

/* Responsive grid */
.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

/* Safe area for notched devices */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-left {
  padding-left: env(safe-area-inset-left);
}

.safe-area-right {
  padding-right: env(safe-area-inset-right);
}
```

### Responsive Restaurant Cards
```css
/* Mobile restaurant cards */
.restaurant-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.restaurant-photo {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
}

.restaurant-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.restaurant-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.restaurant-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

/* Tablet styles (768px and up) */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .restaurant-card {
    margin-bottom: 0;
  }

  .restaurant-photo {
    height: 150px;
  }
}

/* Desktop styles (1024px and up) */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    padding: 2rem;
  }

  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .restaurant-card {
    flex-direction: row;
    height: 180px;
  }

  .restaurant-photo {
    width: 180px;
    height: 100%;
    flex-shrink: 0;
  }

  .restaurant-info {
    padding: 1.25rem;
  }
}

/* Large desktop styles (1440px and up) */
@media (min-width: 1440px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Mobile-Optimized Modal
```css
/* Mobile modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 100%;
  max-height: 100%;
  overflow-y: auto;
  position: relative;
  width: 100%;
}

/* Mobile fullscreen modal */
@media (max-width: 767px) {
  .modal-overlay {
    padding: 0;
    align-items: stretch;
  }

  .modal-content {
    border-radius: 0;
    height: 100%;
    max-height: 100vh;
  }

  .modal-header {
    padding: 1rem;
    padding-top: env(safe-area-inset-top, 1rem);
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
  }

  .modal-body {
    padding: 1rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 1rem));
  }

  .modal-close {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .modal-close:hover {
    background: #e5e7eb;
  }
}

/* Tablet and desktop modal */
@media (min-width: 768px) {
  .modal-content {
    width: 90%;
    max-width: 600px;
    border-radius: 1rem;
    max-height: 90vh;
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-body {
    padding: 1.5rem;
  }
}
```

### Touch-Friendly Rating Form
```css
/* Mobile rating form */
.rating-form-container {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
}

.star {
  font-size: 2.5rem;
  color: #d1d5db;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.star:active {
  transform: scale(0.95);
}

.star.selected {
  color: #f59e0b;
}

.rating-comment {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  resize: vertical;
  margin-bottom: 0.5rem;
}

.photo-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.photo-upload-area:active {
  transform: scale(0.98);
  background: #f3f4f6;
}

.btn-primary {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
}

.btn-primary:active {
  transform: scale(0.98);
}

/* Tablet and desktop form adjustments */
@media (min-width: 768px) {
  .rating-form-container {
    padding: 1.5rem;
  }

  .star {
    font-size: 2rem;
  }

  .btn-primary {
    width: auto;
    padding: 0.75rem 2rem;
  }
}
```

### Mobile Gestures & Interactions
```javascript
// utils/MobileGestures.js
class MobileGestures {
  constructor() {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.setupGestures();
  }

  setupGestures() {
    // Modal swipe to close
    this.setupModalSwipe();

    // Restaurant card swipe actions
    this.setupCardSwipe();

    // Double tap to zoom
    this.setupDoubleTap();

    // Long press context menu
    this.setupLongPress();
  }

  setupModalSwipe() {
    const modals = document.querySelectorAll('.modal-content');

    modals.forEach(modal => {
      modal.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
      });

      modal.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touchX = e.changedTouches[0].screenX;
        const touchY = e.changedTouches[0].screenY;
        const diffX = this.touchStartX - touchX;
        const diffY = this.touchStartY - touchY;

        // Only vertical swipe
        if (Math.abs(diffY) > Math.abs(diffX)) {
          modal.style.transform = `translateY(${-diffY}px)`;
          modal.style.opacity = 1 - (Math.abs(diffY) / 300);
        }
      });

      modal.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        this.handleModalSwipe(modal);
      });
    });
  }

  handleModalSwipe(modal) {
    const diffY = this.touchStartY - this.touchEndY;

    if (diffY > 100) {
      // Swipe up to close
      this.closeModal(modal);
    } else {
      // Reset position
      modal.style.transform = 'translateY(0)';
      modal.style.opacity = 1;
    }
  }

  closeModal(modal) {
    modal.style.transition = 'all 0.3s ease';
    modal.style.transform = 'translateY(100%)';
    modal.style.opacity = 0;

    setTimeout(() => {
      const overlay = modal.closest('.modal-overlay');
      if (overlay) {
        overlay.remove();
      }
    }, 300);
  }

  setupCardSwipe() {
    const cards = document.querySelectorAll('.restaurant-card');

    cards.forEach(card => {
      card.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      });

      card.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleCardSwipe(card);
      });
    });
  }

  handleCardSwipe(card) {
    const diffX = this.touchStartX - this.touchEndX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe left - next action
        card.style.transform = 'translateX(-100%)';
        setTimeout(() => {
          card.style.transform = 'translateX(0)';
        }, 200);
      } else {
        // Swipe right - previous action
        card.style.transform = 'translateX(100%)';
        setTimeout(() => {
          card.style.transform = 'translateX(0)';
        }, 200);
      }
    }
  }

  setupDoubleTap() {
    const photos = document.querySelectorAll('.restaurant-photo img');

    photos.forEach(photo => {
      let lastTap = 0;

      photo.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;

        if (tapLength < 500 && tapLength > 0) {
          // Double tap - zoom photo
          this.zoomPhoto(photo);
        }

        lastTap = currentTime;
      });
    });
  }

  zoomPhoto(photo) {
    const overlay = document.createElement('div');
    overlay.className = 'photo-zoom-overlay';
    overlay.innerHTML = `
      <div class="photo-zoom-container">
        <img src="${photo.src}" alt="Zoomed photo" class="zoomed-photo">
        <button class="close-zoom">&times;</button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close on tap
    overlay.addEventListener('click', () => {
      overlay.remove();
    });

    // Prevent modal close when tapping photo
    overlay.querySelector('.photo-zoom-container').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  setupLongPress() {
    const cards = document.querySelectorAll('.restaurant-card');

    cards.forEach(card => {
      let pressTimer;

      card.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
          this.showCardContextMenu(card, e);
        }, 500);
      });

      card.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
      });

      card.addEventListener('touchmove', () => {
        clearTimeout(pressTimer);
      });
    });
  }

  showCardContextMenu(card, event) {
    // Show context menu for card actions
    console.log('Long press on card:', card.dataset.id);
  }
}
```

### Mobile Viewport Handling
```javascript
// utils/MobileViewport.js
class MobileViewport {
  constructor() {
    this.viewportHeight = window.innerHeight;
    this.setupViewportHandling();
  }

  setupViewportHandling() {
    // Handle viewport height changes (especially on mobile)
    this.handleViewportResize();

    // Handle keyboard appearing
    this.handleKeyboardAppearance();

    // Handle orientation changes
    this.handleOrientationChange();
  }

  handleViewportResize() {
    window.addEventListener('resize', () => {
      // Only handle actual height changes (not width changes)
      if (window.innerHeight !== this.viewportHeight) {
        this.viewportHeight = window.innerHeight;
        this.adjustLayoutForKeyboard();
      }
    });
  }

  handleKeyboardAppearance() {
    const inputs = document.querySelectorAll('input, textarea');

    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        document.body.classList.add('keyboard-open');
        this.scrollToFocusedInput(input);
      });

      input.addEventListener('blur', () => {
        document.body.classList.remove('keyboard-open');
      });
    });
  }

  scrollToFocusedInput(input) {
    setTimeout(() => {
      const rect = input.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - 100; // 100px offset

      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    }, 300);
  }

  adjustLayoutForKeyboard() {
    const isKeyboardOpen = window.innerHeight < this.viewportHeight * 0.8;

    if (isKeyboardOpen) {
      document.body.classList.add('keyboard-open');

      // Adjust modal position if open
      const modal = document.querySelector('.modal-content');
      if (modal) {
        modal.style.transform = `translateY(0) scale(${0.9})`;
      }
    } else {
      document.body.classList.remove('keyboard-open');

      // Reset modal position
      const modal = document.querySelector('.modal-content');
      if (modal) {
        modal.style.transform = 'translateY(0) scale(1)';
      }
    }
  }

  handleOrientationChange() {
    window.addEventListener('orientationchange', () => {
      // Give time for orientation change to complete
      setTimeout(() => {
        this.viewportHeight = window.innerHeight;
        this.adjustLayoutForOrientation();
      }, 100);
    });
  }

  adjustLayoutForOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isLandscape) {
      document.body.classList.add('landscape');
    } else {
      document.body.classList.remove('landscape');
    }

    // Adjust grid layout for landscape
    const grid = document.querySelector('.grid');
    if (grid) {
      if (isLandscape && window.innerWidth > 768) {
        grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
      } else {
        grid.style.gridTemplateColumns = '1fr';
      }
    }
  }
}
```

### Responsive Image Handling
```javascript
// utils/ResponsiveImages.js
class ResponsiveImages {
  constructor() {
    this.setupResponsiveImages();
  }

  setupResponsiveImages() {
    const images = document.querySelectorAll('img[data-src]');

    images.forEach(img => {
      this.setupImageSources(img);
      this.setupImageLoading(img);
    });
  }

  setupImageSources(img) {
    const baseSrc = img.dataset.src;
    const extension = baseSrc.split('.').pop();
    const baseName = baseSrc.replace(`.${extension}`, '');

    // Create responsive srcset
    const srcset = [
      `${baseName}-small.${extension} 400w`,
      `${baseName}-medium.${extension} 800w`,
      `${baseName}-large.${extension} 1200w`,
      `${baseName}.${extension} 1600w`
    ].join(', ');

    img.setAttribute('srcset', srcset);
    img.setAttribute('sizes', '(max-width: 400px) 400px, (max-width: 800px) 800px, (max-width: 1200px) 1200px, 1600px');
  }

  setupImageLoading(img) {
    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      });

      observer.observe(img);
    } else {
      // Fallback
      this.loadImage(img);
    }
  }

  loadImage(img) {
    const src = img.dataset.src;

    // Start loading
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      img.classList.add('loaded');
    };
    tempImg.onerror = () => {
      img.classList.add('error');
    };

    // Prioritize loading based on connection
    if (navigator.connection) {
      const connection = navigator.connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        // Load low quality first
        tempImg.src = this.getLowQualitySrc(src);
      } else {
        tempImg.src = src;
      }
    } else {
      tempImg.src = src;
    }
  }

  getLowQualitySrc(src) {
    // Return a compressed version or placeholder
    return src.replace(/(\.[\w\d_-]+)$/i, '-low$1');
  }
}
```

### Mobile Testing Framework
```javascript
// utils/MobileTesting.js
class MobileTesting {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  runTests() {
    console.log('Running mobile responsiveness tests...');

    // Test viewport
    this.testViewport();

    // Test touch targets
    this.testTouchTargets();

    // Test responsive layout
    this.testResponsiveLayout();

    // Test gestures
    this.testGestures();

    // Test performance
    this.testMobilePerformance();

    console.log('Mobile test results:', this.results);
    return this.results;
  }

  testViewport() {
    const viewport = document.querySelector('meta[name="viewport"]');
    const hasViewport = viewport && viewport.getAttribute('content').includes('width=device-width');

    this.results.push({
      test: 'Viewport Meta Tag',
      passed: hasViewport,
      details: hasViewport ? 'Viewport meta tag is properly configured' : 'Missing viewport meta tag'
    });
  }

  testTouchTargets() {
    const clickables = document.querySelectorAll('.clickable, button, a, .star');
    let allGood = true;
    const badTargets = [];

    clickables.forEach(element => {
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width < 44 || height < 44) {
        allGood = false;
        badTargets.push({
          element: element,
          width: width,
          height: height
        });
      }
    });

    this.results.push({
      test: 'Touch Target Size',
      passed: allGood,
      details: allGood ? 'All touch targets meet minimum size requirements' : `${badTargets.length} touch targets are too small`,
      badTargets: badTargets
    });
  }

  testResponsiveLayout() {
    const container = document.querySelector('.container');
    const grid = document.querySelector('.grid');

    // Test mobile layout
    window.resizeTo(375, 667); // iPhone 8
    const mobileColumns = window.getComputedStyle(grid).gridTemplateColumns;
    const isMobileSingleColumn = mobileColumns === '1fr';

    // Test tablet layout
    window.resizeTo(768, 1024); // iPad
    const tabletColumns = window.getComputedStyle(grid).gridTemplateColumns;
    const isTabletMultiColumn = tabletColumns.includes('repeat(2');

    // Reset
    window.resizeTo(window.screen.width, window.screen.height);

    this.results.push({
      test: 'Responsive Layout',
      passed: isMobileSingleColumn && isTabletMultiColumn,
      details: `Mobile: ${isMobileSingleColumn ? '✓' : '✗'}, Tablet: ${isTabletMultiColumn ? '✓' : '✗'}`
    });
  }

  testGestures() {
    const hasTouchSupport = 'ontouchstart' in window;
    const modal = document.querySelector('.modal-content');
    const hasModalSwipe = modal && modal.getAttribute('data-swipeable') === 'true';

    this.results.push({
      test: 'Gesture Support',
      passed: hasTouchSupport && hasModalSwipe,
      details: `Touch support: ${hasTouchSupport ? '✓' : '✗'}, Modal swipe: ${hasModalSwipe ? '✓' : '✗'}`
    });
  }

  testMobilePerformance() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
    const isFastEnough = loadTime < 3000; // 3 seconds

    this.results.push({
      test: 'Mobile Performance',
      passed: isFastEnough,
      details: `Load time: ${loadTime.toFixed(2)}ms`,
      loadTime: loadTime
    });
  }
}
```

## Dependencies
- **Story 4.1**: Performance optimization for mobile performance baseline
- **Story 3.2**: Rating form interface for mobile optimization
- **Story 1.4**: Modal framework for mobile modal behavior
- **Story 1.3**: Restaurant card display system for mobile layout

## Testing Checklist
- [ ] All touch targets are 44x44px minimum
- [ ] Modal is fullscreen on mobile
- [ ] Swipe gestures work for modal close
- [ ] Layout adapts to all screen sizes
- [ ] Keyboard doesn't obscure important elements
- [ ] Images load appropriately for screen size
- [ ] Double-tap zoom works on photos
- [ ] Long press context menu works
- [ ] Orientation changes are handled properly
- [ ] Performance is acceptable on mobile devices

## Notes
- Esta história garante que o aplicativo funcione perfeitamente em dispositivos móveis
- A abordagem mobile-first prioriza a experiência em telas pequenas
- Gestos intuitivos melhoram a usabilidade
- O design é adaptativo para diferentes tamanhos de tela
- O desempenho é otimizado para conexões móveis
- A acessibilidade é mantida em todos os dispositivos