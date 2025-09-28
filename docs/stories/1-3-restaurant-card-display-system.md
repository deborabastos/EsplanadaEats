# Story 1.3: Restaurant Card Display System

**As a user, I want to see restaurants displayed in responsive cards, so that I can browse available options at a glance.**

## Overview
This story implements the restaurant card display system that shows restaurant information in a responsive grid layout, allowing users to browse and interact with restaurant listings.

## Acceptance Criteria

### AC 3.1: Restaurant cards display name, quality rating, and price range
- [ ] Create restaurant card component with proper layout
- [ ] Display restaurant name prominently on each card
- [ ] Show quality rating with star visualization
- [ ] Display price range with appropriate formatting
- [ ] Include additional information (vegetarian options, access)
- [ ] Add restaurant photos when available

### AC 3.2: Cards respond to screen size (4 desktop, 1 mobile) using responsive grid
- [ ] Implement responsive grid system for card layout
- [ ] Show 1 column on mobile devices (< 640px)
- [ ] Show 2 columns on tablets (640px - 1024px)
- [ ] Show 3 columns on small desktops (1024px - 1280px)
- [ ] Show 4 columns on large desktops (≥ 1280px)
- [ ] Ensure proper spacing and margins between cards

### AC 3.3: Empty state shows "Sem restaurantes cadastrados" when no restaurants exist
- [ ] Create empty state component with friendly message
- [ ] Display "Sem restaurantes cadastrados" message
- [ ] Include call-to-action button to add first restaurant
- [ ] Show empty state only when no restaurants exist
- [ ] Ensure empty state is responsive and visually appealing

### AC 3.4: Default ordering by highest average rating
- [ ] Implement sorting logic by average rating
- [ ] Sort restaurants in descending order (highest first)
- [ ] Handle restaurants with no ratings (show 0 stars)
- [ ] Update sorting automatically when ratings change
- [ ] Provide visual indication of sort order

### AC 3.5: Cards are clickable to open detail modal
- [ ] Add click event listeners to restaurant cards
- [ ] Implement restaurant detail modal functionality
- [ ] Pass restaurant data to modal when clicked
- [ ] Include hover effects and visual feedback
- [ ] Ensure cards are accessible with keyboard navigation

## Technical Implementation Details

### Restaurant Card Component

```javascript
// js/components/restaurant-card.js
export class RestaurantCard {
    constructor(restaurant) {
        this.restaurant = restaurant;
        this.element = null;
    }

    render() {
        const card = document.createElement('article');
        card.className = 'restaurant-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Ver detalhes de ${this.restaurant.name}`);

        card.innerHTML = `
            <div class="restaurant-card__image-container">
                ${this.renderRestaurantImage()}
            </div>
            <div class="restaurant-card__content">
                <h3 class="restaurant-card__name">${this.escapeHtml(this.restaurant.name)}</h3>
                <div class="restaurant-card__rating">
                    ${this.renderStarRating(this.restaurant.averageQuality)}
                    <span class="restaurant-card__rating-value">${this.restaurant.averageQuality.toFixed(1)}</span>
                </div>
                <div class="restaurant-card__details">
                    <div class="restaurant-card__price">
                        <span class="restaurant-card__price-label">Preço:</span>
                        <span class="restaurant-card__price-value">${this.formatPrice(this.restaurant.price)}</span>
                    </div>
                    ${this.renderVegetarianBadge()}
                    ${this.renderAccessInfo()}
                </div>
                ${this.renderHours()}
            </div>
        `;

        // Add event listeners
        card.addEventListener('click', () => this.handleClick());
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleClick();
            }
        });

        this.element = card;
        return card;
    }

    renderRestaurantImage() {
        if (this.restaurant.photoUrls && this.restaurant.photoUrls.length > 0) {
            return `<img src="${this.restaurant.photoUrls[0]}" alt="${this.escapeHtml(this.restaurant.name)}" class="restaurant-card__image">`;
        }
        return `<div class="restaurant-card__image-placeholder">🍽️</div>`;
    }

    renderStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);

        let stars = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="star star--full">★</span>';
        }

        // Half star
        if (hasHalfStar) {
            stars += '<span class="star star--half">★</span>';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span class="star star--empty">☆</span>';
        }

        return `<div class="restaurant-card__stars">${stars}</div>`;
    }

    renderVegetarianBadge() {
        if (this.restaurant.vegetarianOptions) {
            return '<span class="restaurant-card__badge restaurant-card__badge--vegetarian">🥬 Opções vegetarianas</span>';
        }
        return '';
    }

    renderAccessInfo() {
        if (this.restaurant.access) {
            return `<div class="restaurant-card__access">${this.escapeHtml(this.restaurant.access)}</div>`;
        }
        return '';
    }

    renderHours() {
        if (this.restaurant.hours) {
            return `<div class="restaurant-card__hours">⏰ ${this.escapeHtml(this.restaurant.hours)}</div>`;
        }
        return '';
    }

    formatPrice(price) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    handleClick() {
        // Dispatch custom event to open restaurant details
        window.dispatchEvent(new CustomEvent('restaurant-click', {
            detail: { restaurant: this.restaurant }
        }));
    }
}
```

### Restaurant Grid Component

```javascript
// js/components/restaurant-grid.js
import { RestaurantCard } from './restaurant-card.js';

export class RestaurantGrid {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.restaurants = [];
        this.emptyState = null;
        this.init();
    }

    init() {
        this.createEmptyState();
        this.setupContainer();
    }

    setupContainer() {
        this.container.className = 'restaurants-grid';
        this.container.setAttribute('role', 'list');
    }

    createEmptyState() {
        this.emptyState = document.createElement('div');
        this.emptyState.className = 'empty-state';
        this.emptyState.innerHTML = `
            <div class="empty-state__content">
                <div class="empty-state__icon">🍽️</div>
                <h3 class="empty-state__title">Sem restaurantes cadastrados</h3>
                <p class="empty-state__message">Seja o primeiro a adicionar um restaurante!</p>
                <button class="btn btn-primary empty-state__action" id="empty-state-add-btn">
                    + Adicionar Restaurante
                </button>
            </div>
        `;

        // Add event listener to empty state button
        const addBtn = this.emptyState.querySelector('#empty-state-add-btn');
        addBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('add-restaurant-click'));
        });
    }

    setRestaurants(restaurants) {
        this.restaurants = this.sortRestaurants(restaurants);
        this.render();
    }

    sortRestaurants(restaurants) {
        return [...restaurants].sort((a, b) => {
            // Sort by average quality (highest first)
            return b.averageQuality - a.averageQuality;
        });
    }

    render() {
        this.container.innerHTML = '';

        if (this.restaurants.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        this.renderRestaurantCards();
    }

    renderRestaurantCards() {
        this.restaurants.forEach((restaurant, index) => {
            const card = new RestaurantCard(restaurant);
            const cardElement = card.render();
            cardElement.setAttribute('data-index', index);
            this.container.appendChild(cardElement);
        });
    }

    showEmptyState() {
        this.container.appendChild(this.emptyState);
    }

    hideEmptyState() {
        if (this.emptyState.parentNode === this.container) {
            this.container.removeChild(this.emptyState);
        }
    }

    addRestaurant(restaurant) {
        this.restaurants.push(restaurant);
        this.restaurants = this.sortRestaurants(this.restaurants);
        this.render();
    }

    updateRestaurant(updatedRestaurant) {
        const index = this.restaurants.findIndex(r => r.id === updatedRestaurant.id);
        if (index !== -1) {
            this.restaurants[index] = updatedRestaurant;
            this.restaurants = this.sortRestaurants(this.restaurants);
            this.render();
        }
    }

    removeRestaurant(restaurantId) {
        this.restaurants = this.restaurants.filter(r => r.id !== restaurantId);
        this.render();
    }
}
```

### CSS Styles

```css
/* Restaurant card styles */
.restaurant-card {
    background-color: var(--surface-color);
    border-radius: 0.75rem;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
}

.restaurant-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-4px);
}

.restaurant-card:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

.restaurant-card__image-container {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
    background-color: var(--background-color);
}

.restaurant-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.restaurant-card:hover .restaurant-card__image {
    transform: scale(1.05);
}

.restaurant-card__image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 3rem;
    color: var(--text-secondary);
}

.restaurant-card__content {
    padding: 1.5rem;
}

.restaurant-card__name {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    line-height: 1.3;
}

.restaurant-card__rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.restaurant-card__stars {
    display: flex;
    gap: 0.125rem;
}

.star {
    font-size: 1rem;
    line-height: 1;
}

.star--full {
    color: #fbbf24;
}

.star--half {
    color: #fbbf24;
}

.star--empty {
    color: #d1d5db;
}

.restaurant-card__rating-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
}

.restaurant-card__details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.restaurant-card__price {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.restaurant-card__price-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.restaurant-card__price-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--primary-color);
}

.restaurant-card__badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    gap: 0.25rem;
}

.restaurant-card__badge--vegetarian {
    background-color: #dcfce7;
    color: #166534;
}

.restaurant-card__access {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.restaurant-card__hours {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
}

/* Empty state styles */
.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
    text-align: center;
}

.empty-state__content {
    max-width: 400px;
}

.empty-state__icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.empty-state__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.empty-state__message {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
}

.empty-state__action {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
}

/* Responsive grid adjustments */
@media (max-width: 639px) {
    .restaurant-card__image-container {
        height: 150px;
    }

    .restaurant-card__content {
        padding: 1rem;
    }

    .restaurant-card__name {
        font-size: 1.125rem;
    }
}

@media (min-width: 640px) {
    .restaurants-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .restaurants-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (min-width: 1280px) {
    .restaurants-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

### Integration with Main Application

```javascript
// js/services/ui-service.js
import { RestaurantGrid } from '../components/restaurant-grid.js';

export class UIService {
    constructor() {
        this.restaurantGrid = new RestaurantGrid('restaurants-grid');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for restaurant data updates
        window.addEventListener('restaurants-updated', (event) => {
            this.displayRestaurants(event.detail.restaurants);
        });

        // Listen for restaurant card clicks
        window.addEventListener('restaurant-click', (event) => {
            this.showRestaurantDetails(event.detail.restaurant);
        });

        // Listen for add restaurant clicks
        window.addEventListener('add-restaurant-click', () => {
            this.showAddRestaurantModal();
        });
    }

    displayRestaurants(restaurants) {
        this.restaurantGrid.setRestaurants(restaurants);
    }

    showRestaurantDetails(restaurant) {
        // Dispatch event to open modal
        window.dispatchEvent(new CustomEvent('open-restaurant-modal', {
            detail: { restaurant }
        }));
    }

    showAddRestaurantModal() {
        // Dispatch event to open add restaurant modal
        window.dispatchEvent(new CustomEvent('open-add-restaurant-modal'));
    }

    addRestaurant(restaurant) {
        this.restaurantGrid.addRestaurant(restaurant);
    }

    updateRestaurant(restaurant) {
        this.restaurantGrid.updateRestaurant(restaurant);
    }

    removeRestaurant(restaurantId) {
        this.restaurantGrid.removeRestaurant(restaurantId);
    }
}
```

## Dependencies
- Story 1.2: Data Models & Storage System (must be completed first)
- Restaurant data model from Story 1.2
- CSS grid system from Story 1.1

## Success Metrics
- Restaurant cards display all required information correctly
- Responsive grid works on all screen sizes
- Empty state shows when no restaurants exist
- Cards are clickable and open detail modal
- Star rating visualization is accurate and appealing
- Performance remains good with many restaurants

## Testing Approach
1. **Card Display Test**: Verify all restaurant information displays correctly
2. **Responsive Test**: Test grid layout on different screen sizes
3. **Empty State Test**: Verify empty state shows when appropriate
4. **Interaction Test**: Test card clicks and modal opening
5. **Performance Test**: Measure rendering performance with many cards

## Notes
- Uses semantic HTML elements for accessibility
- Includes proper keyboard navigation support
- Responsive design ensures good experience on all devices
- Performance optimized for large numbers of restaurants
- Includes smooth animations and transitions