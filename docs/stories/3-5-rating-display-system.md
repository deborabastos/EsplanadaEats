# Story 3.5: Rating Display System

## Status
Draft

## Story
**As a** user,
**I want** to see clear and attractive visualizations of restaurant ratings, including stars, statistics, and trends,
**so that** I can quickly understand the quality and popularity of each establishment.

## Acceptance Criteria
1. System must display ratings with visual stars (1-5)
2. Must show rating averages with 1 decimal place
3. Total number of ratings must be clearly displayed
4. Interface must be responsive and work on all devices
5. Rating displays must update in real-time
6. Visual design must be consistent and accessible
7. System must handle different rating states (no ratings, new ratings)
8. Display must support both compact and detailed views

## Tasks / Subtasks
- [ ] Task 1: Create visual star rating display (AC: 1, 6)
  - [ ] Implement 5-star visual rating system
  - [ ] Add half-star support for decimal ratings
  - [ ] Create consistent visual styling
  - [ ] Ensure accessibility with ARIA labels
- [ ] Task 2: Implement rating statistics display (AC: 2, 3)
  - [ ] Show average rating with 1 decimal precision
  - [ ] Display total number of ratings
  - [ ] Add confidence indicators for low-rating counts
  - [ ] Create rating distribution visualization
- [ ] Task 3: Develop responsive design (AC: 4)
  - [ ] Implement mobile-friendly rating displays
  - [ ] Add responsive layout adaptations
  - [ ] Ensure touch-friendly interactions
  - [ ] Test across various device sizes
- [ ] Task 4: Create real-time updates (AC: 5)
  - [ ] Implement live rating updates
  - [ ] Add smooth transition animations
  - [ ] Create notification system for rating changes
  - [ ] Ensure immediate visual feedback
- [ ] Task 5: Handle edge cases and states (AC: 7)
  - [ ] Create "no ratings" placeholder display
  - [ ] Add new rating highlighting
  - [ ] Handle missing or invalid rating data
  - [ ] Implement loading states for rating updates
- [ ] Task 6: Build flexible display modes (AC: 8)
  - [ ] Create compact rating display for cards
  - [ ] Implement detailed rating view for modals
  - [ ] Add expandable rating information
  - [ ] Support different display contexts

## Dev Notes
This story implements a comprehensive rating display system that provides clear, attractive, and accessible visual representations of restaurant ratings across the application.
- [ ] Deve incluir indicadores de confiança para avaliações com poucos dados
- [ ] Animações suaves devem melhorar a experiência visual
- [ ] Sistema deve suportar diferentes temas de visualização
- [ ] Deve fornecer estatísticas detalhadas quando disponível
- [ ] Interface deve ser acessível e compatível com leitores de tela
- [ ] Visualização deve atualizar-se em tempo real com novas avaliações

## Technical Implementation

### Rating Display Component
```javascript
// components/RatingDisplay.js
class RatingDisplay {
  constructor(container, restaurantId, firebaseService, options = {}) {
    this.container = container;
    this.restaurantId = restaurantId;
    this.firebaseService = firebaseService;
    this.options = {
      showDetails: options.showDetails || false,
      showTrend: options.showTrend || false,
      theme: options.theme || 'default',
      size: options.size || 'medium',
      animated: options.animated !== false,
      ...options
    };

    this.calculationService = new RatingCalculationService(firebaseService);
    this.realtimeService = new RealtimeRatingService(firebaseService, this.calculationService);

    this.init();
  }

  async init() {
    await this.loadRatingData();
    this.setupRealtimeUpdates();
    this.render();
  }

  async loadRatingData() {
    try {
      this.ratingData = await this.calculationService.getRestaurantRatingStatistics(
        this.restaurantId
      );
    } catch (error) {
      console.error('Error loading rating data:', error);
      this.ratingData = this.getDefaultRatingData();
    }
  }

  getDefaultRatingData() {
    return {
      averageQuality: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      confidenceScore: 0,
      weightedAverage: 0,
      standardDeviation: 0,
      median: 0,
      mode: 0,
      lastUpdated: new Date().toISOString(),
      ratingTrend: 'stable',
      ratingConsistency: 0
    };
  }

  setupRealtimeUpdates() {
    this.realtimeService.subscribeToRestaurantUpdates(
      this.restaurantId,
      this.handleRatingUpdate.bind(this)
    );
  }

  handleRatingUpdate(newRatingData) {
    this.ratingData = newRatingData;
    this.render();
  }

  render() {
    this.container.innerHTML = this.generateHTML();
    this.setupEventListeners();
    this.applyTheme();
    this.setupAnimations();
  }

  generateHTML() {
    const { averageQuality, totalRatings, confidenceScore, ratingTrend } = this.ratingData;

    return `
      <div class="rating-display rating-display-${this.options.size} rating-display-${this.options.theme}">
        <div class="rating-main">
          ${this.renderStars(averageQuality)}
          <div class="rating-numbers">
            <span class="rating-average">${averageQuality.toFixed(1)}</span>
            <span class="rating-count">(${totalRatings})</span>
            ${this.renderConfidenceIndicator(confidenceScore)}
          </div>
        </div>

        ${this.options.showTrend ? this.renderTrendIndicator(ratingTrend) : ''}
        ${this.options.showDetails ? this.renderDetailedStats() : ''}
      </div>
    `;
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - Math.ceil(rating);

    let starsHtml = '<div class="rating-stars">';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += `<span class="star star-full" data-rating="${i + 1}">★</span>`;
    }

    // Half star
    if (hasHalfStar) {
      starsHtml += `<span class="star star-half" data-rating="${fullStars + 1}">☆</span>`;
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += `<span class="star star-empty" data-rating="${fullStars + (hasHalfStar ? 1 : 0) + i + 1}">☆</span>`;
    }

    starsHtml += '</div>';
    return starsHtml;
  }

  renderConfidenceIndicator(confidenceScore) {
    if (confidenceScore >= 0.8) {
      return '<span class="confidence-indicator confidence-high" title="Alta confiança">✓</span>';
    } else if (confidenceScore >= 0.5) {
      return '<span class="confidence-indicator confidence-medium" title="Confiança média">⚠️</span>';
    } else {
      return '<span class="confidence-indicator confidence-low" title="Baixa confiança">❓</span>';
    }
  }

  renderTrendIndicator(trend) {
    const trendIcons = {
      improving: '📈',
      declining: '📉',
      stable: '➡️'
    };

    const trendLabels = {
      improving: 'Melhorando',
      declining: 'Piorando',
      stable: 'Estável'
    };

    return `
      <div class="rating-trend rating-trend-${trend}">
        <span class="trend-icon">${trendIcons[trend] || trendIcons.stable}</span>
        <span class="trend-label">${trendLabels[trend] || trendLabels.stable}</span>
      </div>
    `;
  }

  renderDetailedStats() {
    const { ratingDistribution, standardDeviation, median, mode, recentRatings } = this.ratingData;

    return `
      <div class="rating-details">
        <div class="rating-distribution">
          <h4>Distribuição de Avaliações</h4>
          ${this.renderDistributionChart(ratingDistribution)}
        </div>

        <div class="rating-statistics">
          <div class="stat-item">
            <span class="stat-label">Mediana:</span>
            <span class="stat-value">${median.toFixed(1)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Moda:</span>
            <span class="stat-value">${mode}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Desvio Padrão:</span>
            <span class="stat-value">${standardDeviation.toFixed(2)}</span>
          </div>
        </div>

        ${recentRatings && recentRatings.length > 0 ? this.renderRecentRatings(recentRatings) : ''}
      </div>
    `;
  }

  renderDistributionChart(distribution) {
    const maxCount = Math.max(...Object.values(distribution));
    const totalRatings = Object.values(distribution).reduce((sum, count) => sum + count, 0);

    return `
      <div class="distribution-chart">
        ${[5, 4, 3, 2, 1].map(rating => {
          const count = distribution[rating];
          const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return `
            <div class="distribution-bar">
              <span class="bar-label">${rating}★</span>
              <div class="bar-container">
                <div class="bar-fill" style="width: ${barWidth}%"></div>
              </div>
              <span class="bar-count">${count}</span>
              <span class="bar-percentage">${percentage.toFixed(1)}%</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderRecentRatings(recentRatings) {
    return `
      <div class="recent-ratings">
        <h4>Avaliações Recentes</h4>
        <div class="recent-ratings-list">
          ${recentRatings.slice(0, 5).map(rating => `
            <div class="recent-rating">
              <span class="recent-rating-stars">${'★'.repeat(rating.rating)}${'☆'.repeat(5 - rating.rating)}</span>
              <span class="recent-rating-time">${this.formatTimeAgo(rating.timestamp)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;

    return time.toLocaleDateString('pt-BR');
  }

  setupEventListeners() {
    // Add hover effects for stars
    const stars = this.container.querySelectorAll('.star');
    stars.forEach(star => {
      star.addEventListener('mouseenter', () => {
        this.highlightStars(parseInt(star.dataset.rating));
      });

      star.addEventListener('mouseleave', () => {
        this.highlightStars(this.ratingData.averageQuality);
      });
    });

    // Add click handler for rating details toggle
    if (this.options.showDetails) {
      const detailsToggle = this.container.querySelector('.rating-details-toggle');
      if (detailsToggle) {
        detailsToggle.addEventListener('click', () => {
          this.toggleDetails();
        });
      }
    }
  }

  highlightStars(rating) {
    const stars = this.container.querySelectorAll('.star');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('highlighted');
      } else {
        star.classList.remove('highlighted');
      }
    });
  }

  toggleDetails() {
    const details = this.container.querySelector('.rating-details');
    if (details) {
      details.classList.toggle('expanded');
    }
  }

  applyTheme() {
    const theme = this.options.theme;
    this.container.setAttribute('data-theme', theme);

    // Apply theme-specific styles
    const themeStyles = {
      default: {
        primaryColor: '#f59e0b',
        secondaryColor: '#d1d5db',
        backgroundColor: '#ffffff'
      },
      dark: {
        primaryColor: '#fbbf24',
        secondaryColor: '#4b5563',
        backgroundColor: '#1f2937'
      },
      minimal: {
        primaryColor: '#6b7280',
        secondaryColor: '#e5e7eb',
        backgroundColor: '#ffffff'
      }
    };

    const style = themeStyles[theme] || themeStyles.default;
    Object.assign(this.container.style, {
      '--rating-primary-color': style.primaryColor,
      '--rating-secondary-color': style.secondaryColor,
      '--rating-background-color': style.backgroundColor
    });
  }

  setupAnimations() {
    if (!this.options.animated) return;

    // Animate stars on load
    const stars = this.container.querySelectorAll('.star');
    stars.forEach((star, index) => {
      star.style.opacity = '0';
      star.style.transform = 'scale(0.5)';

      setTimeout(() => {
        star.style.transition = 'all 0.3s ease';
        star.style.opacity = '1';
        star.style.transform = 'scale(1)';
      }, index * 100);
    });

    // Animate numbers
    this.animateNumber('.rating-average', this.ratingData.averageQuality);
    this.animateNumber('.rating-count', this.ratingData.totalRatings);
  }

  animateNumber(selector, targetValue) {
    const element = this.container.querySelector(selector);
    if (!element) return;

    const isDecimal = targetValue % 1 !== 0;
    const startValue = 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentValue = startValue + (targetValue - startValue) * this.easeOutQuad(progress);

      if (isDecimal) {
        element.textContent = currentValue.toFixed(1);
      } else {
        element.textContent = Math.floor(currentValue);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  easeOutQuad(t) {
    return t * (2 - t);
  }

  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.render();
  }

  destroy() {
    // Cleanup event listeners and subscriptions
    if (this.realtimeService) {
      this.realtimeService.unsubscribeAll();
    }
  }
}

// Export for use in other components
window.RatingDisplay = RatingDisplay;
```

### Rating Display CSS
```css
/* components/rating-display.css */
.rating-display {
  display: inline-block;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--rating-text-color, #374151);
  background: var(--rating-background-color, #ffffff);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

.rating-display:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Size variations */
.rating-display-small {
  padding: 8px;
  font-size: 0.875rem;
}

.rating-display-small .rating-stars {
  font-size: 1rem;
}

.rating-display-medium {
  padding: 12px;
  font-size: 1rem;
}

.rating-display-medium .rating-stars {
  font-size: 1.25rem;
}

.rating-display-large {
  padding: 16px;
  font-size: 1.125rem;
}

.rating-display-large .rating-stars {
  font-size: 1.5rem;
}

/* Main rating display */
.rating-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-stars {
  display: flex;
  gap: 2px;
  line-height: 1;
}

.star {
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--rating-secondary-color, #d1d5db);
  user-select: none;
}

.star.highlighted {
  color: var(--rating-primary-color, #f59e0b);
  transform: scale(1.1);
}

.star-full {
  color: var(--rating-primary-color, #f59e0b);
}

.star-half {
  color: var(--rating-primary-color, #f59e0b);
  position: relative;
}

.star-half::after {
  content: '★';
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  overflow: hidden;
  color: var(--rating-primary-color, #f59e0b);
}

.star-empty {
  color: var(--rating-secondary-color, #d1d5db);
}

.rating-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.rating-average {
  font-size: 1.125em;
  color: var(--rating-text-color, #374151);
}

.rating-count {
  font-size: 0.875em;
  color: var(--rating-text-color-secondary, #6b7280);
}

/* Confidence indicators */
.confidence-indicator {
  font-size: 0.875em;
  cursor: help;
}

.confidence-high {
  color: #10b981;
}

.confidence-medium {
  color: #f59e0b;
}

.confidence-low {
  color: #ef4444;
}

/* Trend indicators */
.rating-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875em;
  margin-top: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
}

.rating-trend-improving {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.rating-trend-declining {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.rating-trend-stable {
  color: #6b7280;
  background: rgba(107, 114, 128, 0.1);
}

/* Detailed statistics */
.rating-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--rating-border-color, #e5e7eb);
}

.rating-details h4 {
  margin: 0 0 12px 0;
  font-size: 0.875em;
  font-weight: 600;
  color: var(--rating-text-color, #374151);
}

/* Distribution chart */
.distribution-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.distribution-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75em;
}

.bar-label {
  width: 20px;
  text-align: right;
  font-weight: 500;
}

.bar-container {
  flex: 1;
  height: 20px;
  background: var(--rating-secondary-color, #e5e7eb);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--rating-primary-color, #f59e0b);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-count {
  min-width: 30px;
  text-align: right;
  font-weight: 500;
}

.bar-percentage {
  min-width: 45px;
  text-align: right;
  color: var(--rating-text-color-secondary, #6b7280);
}

/* Statistics */
.rating-statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: var(--rating-background-secondary, #f9fafb);
  border-radius: 4px;
  font-size: 0.875em;
}

.stat-label {
  color: var(--rating-text-color-secondary, #6b7280);
}

.stat-value {
  font-weight: 600;
  color: var(--rating-text-color, #374151);
}

/* Recent ratings */
.recent-ratings {
  margin-top: 12px;
}

.recent-ratings-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recent-rating {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 0.75em;
}

.recent-rating-stars {
  color: var(--rating-primary-color, #f59e0b);
}

.recent-rating-time {
  color: var(--rating-text-color-secondary, #6b7280);
}

/* Theme variations */
.rating-display-dark {
  color: #f9fafb;
  background: #1f2937;
}

.rating-display-dark .rating-text-color {
  color: #f9fafb;
}

.rating-display-dark .rating-text-color-secondary {
  color: #d1d5db;
}

.rating-display-dark .rating-border-color {
  border-color: #374151;
}

.rating-display-dark .rating-background-secondary {
  background: #374151;
}

.rating-display-minimal {
  border: 1px solid var(--rating-border-color, #e5e7eb);
}

.rating-display-minimal .rating-stars {
  gap: 0;
}

.rating-display-minimal .star {
  font-size: 0.875em;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .rating-display {
    padding: 8px;
  }

  .rating-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .rating-stars {
    font-size: 1rem;
  }

  .rating-numbers {
    font-size: 0.875rem;
  }

  .rating-details {
    margin-top: 12px;
    padding-top: 12px;
  }

  .distribution-chart {
    gap: 4px;
  }

  .rating-statistics {
    grid-template-columns: 1fr;
  }
}

/* Animations */
@keyframes starPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.star:hover {
  animation: starPulse 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rating-details {
  animation: slideIn 0.3s ease;
}
```

### Enhanced Restaurant Card with Rating Display
```javascript
// components/RestaurantCard.js (enhanced)
class RestaurantCard {
  constructor(restaurant, firebaseService) {
    this.restaurant = restaurant;
    this.firebaseService = firebaseService;
  }

  render() {
    return `
      <div class="restaurant-card" data-id="${this.restaurant.id}">
        <div class="restaurant-photo">
          ${this.renderPhoto()}
        </div>
        <div class="restaurant-info">
          <h3 class="restaurant-name">${this.escapeHtml(this.restaurant.name)}</h3>
          <div class="restaurant-rating" id="rating-${this.restaurant.id}">
            <!-- Rating display will be initialized here -->
          </div>
          <div class="restaurant-actions">
            <button
              class="rate-btn"
              data-restaurant-id="${this.restaurant.id}"
              data-restaurant-name="${this.escapeHtml(this.restaurant.name)}"
            >
              Avaliar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async initializeRatingDisplay() {
    const ratingContainer = document.getElementById(`rating-${this.restaurant.id}`);
    if (ratingContainer) {
      this.ratingDisplay = new RatingDisplay(
        ratingContainer,
        this.restaurant.id,
        this.firebaseService,
        {
          size: 'small',
          showTrend: false,
          showDetails: false,
          animated: true
        }
      );
    }
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('rate-btn')) {
        const restaurantId = e.target.dataset.restaurantId;
        const restaurantName = e.target.dataset.restaurantName;

        RatingForm.show(restaurantId, restaurantName, this.firebaseService);
      }
    });
  }

  // ... rest of existing methods ...
}
```

## Dependencies
- **Story 3.1**: User Identification System for tracking ratings
- **Story 3.2**: Rating Form & Interface for user input
- **Story 3.4**: Rating Calculation Logic for statistical data
- **Story 0.2**: Firebase Service for real-time data
- **Story 1.3**: Restaurant Card Display for integration

## Testing Checklist
- [ ] Star ratings display correctly for all values (0-5)
- [ ] Half stars display properly for decimal ratings
- [ ] Confidence indicators show appropriate colors and tooltips
- [ ] Trend indicators display correct icons and labels
- [ ] Detailed statistics show accurate distribution and metrics
- [ ] Real-time updates work when ratings change
- [ ] Hover effects and animations work smoothly
- [ ] Theme variations apply correctly
- [ ] Mobile responsiveness works on all screen sizes
- [ ] Accessibility features work with screen readers
- [ ] Performance is optimized with proper animations
- [ ] Component cleans up properly when destroyed

## Notes
- Esta história implementa a camada de apresentação visual das avaliações
- Interface é flexível e suporta múltiplos temas e tamanhos
- Animações suaves melhoram a experiência do usuário
- Sistema em tempo real mantém visualizações atualizadas
- Componente é acessível e responsivo
- Estatísticas detalhadas fornecem insights adicionais
- Sistema é otimizado para performance e usabilidade