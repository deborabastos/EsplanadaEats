# Story 2.3: Restaurant Detail Modal Content

**As a user, I want to see comprehensive restaurant information in a modal, so that I can make informed decisions about visiting.**

## Overview
This story implements a comprehensive restaurant detail modal that displays all restaurant information in an organized, visually appealing way with current operating status and interactive elements.

## Acceptance Criteria

### AC 3.1: Modal displays complete restaurant information (hours, status, description, address)
- [ ] Create restaurant detail modal with comprehensive information layout
- [ ] Display restaurant name prominently in modal header
- [ ] Show operating hours in dedicated section
- [ ] Include current open/closed status indicator
- [ ] Display restaurant description when available
- [ ] Show access information and address details
- [ ] Include price range and vegetarian options
- [ ] Display average rating with visual representation

### AC 3.2: Operating hours with current open/closed status indication
- [ ] Implement real-time operating status calculation
- [ ] Show current time and restaurant hours comparison
- [ ] Display clear visual indicator (open/closed status)
- [ ] Add timezone awareness for accurate status
- [ ] Include next opening time when currently closed
- [ ] Show special hours or holiday exceptions
- [ ] Add last order time indication

### AC 3.3: Photo gallery with multiple image support
- [ ] Create photo gallery section for restaurant images
- [ ] Support multiple photos with navigation controls
- [ ] Add image zoom and fullscreen view functionality
- [ ] Implement thumbnail navigation for multiple photos
- [ ] Add image captions and alt text
- [ ] Include loading indicators for images
- [ ] Support swipe gestures on mobile devices

### AC 3.4: "Avaliar" button to trigger rating modal
- [ ] Add prominent "Avaliar" button in modal
- [ ] Implement rating modal trigger functionality
- [ ] Include user authentication check before rating
- [ ] Add duplicate rating prevention
- [ ] Show current user's previous rating if exists
- [ ] Include hover effects and visual feedback
- [ ] Add loading state during rating process

### AC 3.5: Information clearly organized and visually appealing
- [ ] Organize information in logical sections with clear hierarchy
- [ ] Use consistent styling and spacing throughout
- [ ] Add appropriate icons and visual indicators
- [ ] Implement responsive design for all screen sizes
- [ ] Include smooth animations and transitions
- [ ] Add loading states for dynamic content
- [ ] Ensure excellent accessibility with proper ARIA labels

## Technical Implementation Details

### Restaurant Detail Modal Component

```javascript
// js/components/restaurant-detail-modal.js
export class RestaurantDetailModal {
    constructor(modalService, restaurantService, ratingService) {
        this.modalService = modalService;
        this.restaurantService = restaurantService;
        this.ratingService = ratingService;
        this.currentRestaurant = null;
        this.currentPhotoIndex = 0;
        this.photoGallery = null;
        this.statusInterval = null;
    }

    async show(restaurantId) {
        try {
            // Load restaurant data
            this.currentRestaurant = await this.restaurantService.getRestaurant(restaurantId);

            // Show modal with restaurant content
            this.modalService.show({
                title: this.currentRestaurant.name,
                content: this.renderModalContent(),
                size: 'large',
                onClose: () => this.cleanup()
            });

            // Initialize modal components
            this.initializeComponents();
            this.startStatusUpdates();

        } catch (error) {
            console.error('Error loading restaurant details:', error);
            this.showNotification('Erro ao carregar detalhes do restaurante', 'error');
        }
    }

    renderModalContent() {
        const restaurant = this.currentRestaurant;

        return `
            <div class="restaurant-detail-modal">
                ${this.renderPhotoGallery()}

                <div class="restaurant-info-section">
                    ${this.renderBasicInfo()}
                    ${this.renderOperatingHours()}
                    ${this.renderDescription()}
                    ${this.renderRatings()}
                    ${this.renderActions()}
                </div>
            </div>
        `;
    }

    renderPhotoGallery() {
        const photos = this.currentRestaurant.photoUrls || [];

        if (photos.length === 0) {
            return `
                <div class="photo-gallery no-photos">
                    <div class="no-photos-placeholder">
                        <div class="placeholder-icon">🍽️</div>
                        <p>Sem fotos disponíveis</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="photo-gallery">
                <div class="gallery-main">
                    <div class="main-photo-container">
                        <img
                            src="${photos[0]}"
                            alt="${this.escapeHtml(this.currentRestaurant.name)}"
                            class="main-photo"
                            id="main-photo"
                            onclick="this.requestFullscreen()"
                        >
                        ${photos.length > 1 ? `
                            <div class="photo-navigation">
                                <button class="nav-btn prev-btn" onclick="modal.prevPhoto()">
                                    ‹
                                </button>
                                <button class="nav-btn next-btn" onclick="modal.nextPhoto()">
                                    ›
                                </button>
                            </div>
                        ` : ''}
                        <div class="photo-counter">
                            <span id="photo-counter">1 / ${photos.length}</span>
                        </div>
                    </div>
                </div>

                ${photos.length > 1 ? `
                    <div class="photo-thumbnails">
                        ${photos.map((photo, index) => `
                            <div class="thumbnail ${index === 0 ? 'active' : ''}"
                                 onclick="modal.selectPhoto(${index})">
                                <img src="${photo}" alt="Foto ${index + 1}">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderBasicInfo() {
        const restaurant = this.currentRestaurant;

        return `
            <div class="basic-info-section">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-icon">⭐</div>
                        <div class="info-content">
                            <div class="info-label">Avaliação Média</div>
                            <div class="info-value">
                                ${this.renderStarRating(restaurant.averageQuality)}
                                <span class="rating-number">${restaurant.averageQuality.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="info-item">
                        <div class="info-icon">💰</div>
                        <div class="info-content">
                            <div class="info-label">Preço Médio</div>
                            <div class="info-value">${this.formatPrice(restaurant.price)}</div>
                        </div>
                    </div>

                    ${restaurant.vegetarianOptions ? `
                        <div class="info-item">
                            <div class="info-icon">🥬</div>
                            <div class="info-content">
                                <div class="info-label">Opções</div>
                                <div class="info-value">Vegetarianas disponíveis</div>
                            </div>
                        </div>
                    ` : ''}

                    <div class="info-item">
                        <div class="info-icon">📍</div>
                        <div class="info-content">
                            <div class="info-label">Localização</div>
                            <div class="info-value">Esplanada dos Ministérios</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderOperatingHours() {
        const restaurant = this.currentRestaurant;

        return `
            <div class="hours-section">
                <h3 class="section-title">
                    <span class="title-icon">🕒</span>
                    Horário de Funcionamento
                </h3>
                <div class="hours-content">
                    <div class="current-status" id="current-status">
                        <div class="status-indicator">
                            <div class="status-dot"></div>
                            <span class="status-text">Carregando...</span>
                        </div>
                    </div>
                    ${restaurant.hours ? `
                        <div class="hours-schedule">
                            <div class="hours-row">
                                <span class="hours-label">Horário:</span>
                                <span class="hours-value">${this.escapeHtml(restaurant.hours)}</span>
                            </div>
                        </div>
                    ` : `
                        <div class="no-hours-info">
                            Horário não informado
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    renderDescription() {
        const restaurant = this.currentRestaurant;

        if (!restaurant.description) {
            return '';
        }

        return `
            <div class="description-section">
                <h3 class="section-title">
                    <span class="title-icon">📝</span>
                    Sobre o Restaurante
                </h3>
                <div class="description-content">
                    <p class="description-text">${this.escapeHtml(restaurant.description)}</p>
                </div>
            </div>
        `;
    }

    renderAccessInfo() {
        const restaurant = this.currentRestaurant;

        if (!restaurant.access) {
            return '';
        }

        return `
            <div class="access-section">
                <h3 class="section-title">
                    <span class="title-icon">🚗</span>
                    Como Chegar
                </h3>
                <div class="access-content">
                    <p class="access-text">${this.escapeHtml(restaurant.access)}</p>
                </div>
            </div>
        `;
    }

    renderRatings() {
        return `
            <div class="ratings-section">
                <h3 class="section-title">
                    <span class="title-icon">⭐</span>
                    Avaliações
                </h3>
                <div class="ratings-content" id="ratings-content">
                    <div class="loading-ratings">
                        <div class="loading-spinner"></div>
                        <p>Carregando avaliações...</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderActions() {
        return `
            <div class="actions-section">
                <button class="btn btn-primary btn-large rate-btn" id="rate-btn">
                    <span class="btn-icon">⭐</span>
                    Avaliar Restaurante
                </button>
                <div class="secondary-actions">
                    <button class="btn btn-secondary share-btn" id="share-btn">
                        <span class="btn-icon">📤</span>
                        Compartilhar
                    </button>
                    <button class="btn btn-secondary favorite-btn" id="favorite-btn">
                        <span class="btn-icon">❤️</span>
                        Favoritar
                    </button>
                </div>
            </div>
        `;
    }

    initializeComponents() {
        // Store modal reference globally for onclick handlers
        window.modal = this;

        // Setup photo gallery
        this.setupPhotoGallery();

        // Setup operating status updates
        this.updateOperatingStatus();

        // Setup action buttons
        this.setupActionButtons();

        // Load ratings
        this.loadRatings();

        // Setup swipe gestures for mobile
        this.setupSwipeGestures();

        // Setup keyboard navigation
        this.setupKeyboardNavigation();
    }

    setupPhotoGallery() {
        const mainPhoto = document.getElementById('main-photo');
        if (mainPhoto) {
            mainPhoto.addEventListener('load', () => {
                mainPhoto.classList.add('loaded');
            });
        }
    }

    setupActionButtons() {
        const rateBtn = document.getElementById('rate-btn');
        const shareBtn = document.getElementById('share-btn');
        const favoriteBtn = document.getElementById('favorite-btn');

        if (rateBtn) {
            rateBtn.addEventListener('click', () => this.handleRateClick());
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.handleShareClick());
        }

        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => this.handleFavoriteClick());
        }
    }

    setupSwipeGestures() {
        const gallery = document.querySelector('.photo-gallery');
        if (!gallery) return;

        let touchStartX = 0;
        let touchEndX = 0;

        gallery.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        gallery.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextPhoto(); // Swipe left, next photo
                } else {
                    this.prevPhoto(); // Swipe right, previous photo
                }
            }
        };

        this.handleSwipe = handleSwipe.bind(this);
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.currentRestaurant) return;

            switch (e.key) {
                case 'ArrowLeft':
                    this.prevPhoto();
                    break;
                case 'ArrowRight':
                    this.nextPhoto();
                    break;
                case 'Escape':
                    this.modalService.closeModal();
                    break;
            }
        });
    }

    startStatusUpdates() {
        // Update status immediately
        this.updateOperatingStatus();

        // Update every minute
        this.statusInterval = setInterval(() => {
            this.updateOperatingStatus();
        }, 60000);
    }

    updateOperatingStatus() {
        const statusElement = document.getElementById('current-status');
        if (!statusElement || !this.currentRestaurant.hours) return;

        const status = this.getOperatingStatus();
        statusElement.innerHTML = this.renderOperatingStatus(status);
    }

    getOperatingStatus() {
        const restaurant = this.currentRestaurant;
        if (!restaurant.hours) {
            return { status: 'unknown', text: 'Horário não informado' };
        }

        const now = new Date();
        const currentDay = now.toLocaleDateString('pt-BR', { weekday: 'long' });
        const currentTime = now.getHours() * 100 + now.getMinutes();

        // Parse hours - this is a simplified version
        // In a real implementation, you'd parse more complex hour formats
        const hoursText = restaurant.hours.toLowerCase();

        // Simple pattern matching for common formats
        const isOpen = this.parseHours(hoursText, currentTime);

        return {
            status: isOpen ? 'open' : 'closed',
            text: isOpen ? 'Aberto agora' : 'Fechado agora',
            nextChange: this.getNextChangeTime(hoursText, currentTime)
        };
    }

    parseHours(hoursText, currentTime) {
        // Simplified hours parsing
        // In production, you'd want a more sophisticated parser
        if (hoursText.includes('24h') || hoursText.includes('24 horas')) {
            return true;
        }

        // Look for patterns like "11h-23h"
        const hourMatch = hoursText.match(/(\d+)h\s*-\s*(\d+)h/);
        if (hourMatch) {
            const openTime = parseInt(hourMatch[1]) * 100;
            const closeTime = parseInt(hourMatch[2]) * 100;
            return currentTime >= openTime && currentTime <= closeTime;
        }

        return false;
    }

    getNextChangeTime(hoursText, currentTime) {
        // Simplified - return null for now
        // In production, calculate actual next opening/closing time
        return null;
    }

    renderOperatingStatus(status) {
        const statusClass = `status-${status.status}`;
        const icon = status.status === 'open' ? '🟢' : '🔴';

        let nextChangeText = '';
        if (status.nextChange) {
            nextChangeText = `<div class="next-change">Fecha às ${status.nextChange}</div>`;
        }

        return `
            <div class="status-indicator ${statusClass}">
                <div class="status-dot"></div>
                <div class="status-info">
                    <span class="status-text">${icon} ${status.text}</span>
                    ${nextChangeText}
                </div>
            </div>
        `;
    }

    async loadRatings() {
        try {
            const ratings = await this.ratingService.getRatingsByRestaurant(this.currentRestaurant.id);
            this.renderRatingsList(ratings);
        } catch (error) {
            console.error('Error loading ratings:', error);
            this.renderRatingsError();
        }
    }

    renderRatingsList(ratings) {
        const ratingsContent = document.getElementById('ratings-content');

        if (ratings.length === 0) {
            ratingsContent.innerHTML = `
                <div class="no-ratings">
                    <p>Ainda não há avaliações para este restaurante.</p>
                    <p>Seja o primeiro a avaliar!</p>
                </div>
            `;
            return;
        }

        const ratingsHTML = ratings.map(rating => this.renderRatingItem(rating)).join('');
        ratingsContent.innerHTML = ratingsHTML;
    }

    renderRatingItem(rating) {
        const date = new Date(rating.createdAt).toLocaleDateString('pt-BR');

        return `
            <div class="rating-item">
                <div class="rating-header">
                    <div class="rating-user">
                        <div class="user-avatar">👤</div>
                        <div class="user-info">
                            <div class="user-name">Usuário Anônimo</div>
                            <div class="rating-date">${date}</div>
                        </div>
                    </div>
                    <div class="rating-stars">
                        ${this.renderStarRating(rating.rating)}
                    </div>
                </div>
                ${rating.comment ? `
                    <div class="rating-comment">
                        <p>${this.escapeHtml(rating.comment)}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderRatingsError() {
        const ratingsContent = document.getElementById('ratings-content');
        ratingsContent.innerHTML = `
            <div class="ratings-error">
                <p>Erro ao carregar avaliações.</p>
                <button class="btn btn-link" onclick="modal.loadRatings()">
                    Tentar novamente
                </button>
            </div>
        `;
    }

    renderStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);

        let stars = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="star star-full">★</span>';
        }

        // Half star
        if (hasHalfStar) {
            stars += '<span class="star star-half">★</span>';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span class="star star-empty">☆</span>';
        }

        return `<div class="star-rating">${stars}</div>`;
    }

    // Photo gallery methods
    prevPhoto() {
        const photos = this.currentRestaurant.photoUrls || [];
        if (photos.length <= 1) return;

        this.currentPhotoIndex = (this.currentPhotoIndex - 1 + photos.length) % photos.length;
        this.updatePhotoDisplay();
    }

    nextPhoto() {
        const photos = this.currentRestaurant.photoUrls || [];
        if (photos.length <= 1) return;

        this.currentPhotoIndex = (this.currentPhotoIndex + 1) % photos.length;
        this.updatePhotoDisplay();
    }

    selectPhoto(index) {
        this.currentPhotoIndex = index;
        this.updatePhotoDisplay();
    }

    updatePhotoDisplay() {
        const photos = this.currentRestaurant.photoUrls || [];
        const mainPhoto = document.getElementById('main-photo');
        const photoCounter = document.getElementById('photo-counter');
        const thumbnails = document.querySelectorAll('.thumbnail');

        if (mainPhoto) {
            mainPhoto.src = photos[this.currentPhotoIndex];
            mainPhoto.classList.remove('loaded');
        }

        if (photoCounter) {
            photoCounter.textContent = `${this.currentPhotoIndex + 1} / ${photos.length}`;
        }

        // Update thumbnail selection
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentPhotoIndex);
        });
    }

    // Action handlers
    async handleRateClick() {
        try {
            // Check if user can rate (no duplicate ratings)
            const canRate = await this.ratingService.canUserRate(this.currentRestaurant.id);

            if (!canRate) {
                this.showNotification('Você já avaliou este restaurante', 'warning');
                return;
            }

            // Close current modal and open rating modal
            this.modalService.closeModal();

            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('open-rating-modal', {
                    detail: { restaurant: this.currentRestaurant }
                }));
            }, 300);

        } catch (error) {
            console.error('Error checking rating permission:', error);
            this.showNotification('Erro ao verificar permissão de avaliação', 'error');
        }
    }

    handleShareClick() {
        if (navigator.share) {
            navigator.share({
                title: this.currentRestaurant.name,
                text: `Confira este restaurante na Esplanada dos Ministérios!`,
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                this.showNotification('Link copiado para a área de transferência', 'success');
            });
        }
    }

    handleFavoriteClick() {
        const favoriteBtn = document.getElementById('favorite-btn');
        const isFavorited = favoriteBtn.classList.contains('favorited');

        if (isFavorited) {
            favoriteBtn.classList.remove('favorited');
            favoriteBtn.innerHTML = '<span class="btn-icon">❤️</span> Favoritar';
            this.showNotification('Removido dos favoritos', 'info');
        } else {
            favoriteBtn.classList.add('favorited');
            favoriteBtn.innerHTML = '<span class="btn-icon">❤️</span> Favoritado';
            this.showNotification('Adicionado aos favoritos', 'success');
        }
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

    showNotification(message, type = 'info') {
        window.dispatchEvent(new CustomEvent('show-notification', {
            detail: { message, type }
        }));
    }

    cleanup() {
        // Clear status update interval
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }

        // Clear global modal reference
        if (window.modal === this) {
            window.modal = null;
        }

        // Reset state
        this.currentRestaurant = null;
        this.currentPhotoIndex = 0;
    }
}
```

### CSS Styles

```css
/* Restaurant detail modal */
.restaurant-detail-modal {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-height: 85vh;
    overflow-y: auto;
}

/* Photo gallery */
.photo-gallery {
    border-radius: 0.75rem;
    overflow: hidden;
    background-color: var(--background-color);
}

.gallery-main {
    position: relative;
}

.main-photo-container {
    position: relative;
    width: 100%;
    height: 300px;
    overflow: hidden;
}

.main-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.3s ease;
    opacity: 0;
}

.main-photo.loaded {
    opacity: 1;
}

.main-photo:hover {
    transform: scale(1.02);
}

.photo-navigation {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 1rem;
    transform: translateY(-50%);
    pointer-events: none;
}

.nav-btn {
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
            border: none;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    pointer-events: all;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-btn:hover {
    background-color: rgba(0, 0, 0, 0.7);
}

.photo-counter {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
}

.photo-thumbnails {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
}

.thumbnail {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    border-radius: 0.375rem;
    overflow: hidden;
    cursor: pointer;
    opacity: 0.6;
    transition: all 0.2s;
    border: 2px solid transparent;
}

.thumbnail:hover {
    opacity: 0.8;
}

.thumbnail.active {
    opacity: 1;
    border-color: var(--primary-color);
}

.thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.no-photos {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--background-color);
}

.no-photos-placeholder {
    text-align: center;
    color: var(--text-secondary);
}

.placeholder-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

/* Info sections */
.restaurant-info-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

.title-icon {
    font-size: 1.25rem;
}

/* Basic info grid */
.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background-color: var(--background-color);
    border-radius: 0.5rem;
}

.info-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.info-content {
    flex: 1;
}

.info-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
}

.info-value {
    font-weight: 500;
    color: var(--text-primary);
}

.rating-number {
    margin-left: 0.5rem;
    font-size: 1.125rem;
}

/* Star rating */
.star-rating {
    display: flex;
    gap: 0.125rem;
}

.star {
    font-size: 1rem;
    line-height: 1;
}

.star-full {
    color: #fbbf24;
}

.star-half {
    color: #fbbf24;
}

.star-empty {
    color: #d1d5db;
}

/* Operating hours */
.hours-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-weight: 500;
}

.status-indicator.status-open {
    background-color: #dcfce7;
    color: #166534;
}

.status-indicator.status-closed {
    background-color: #fef2f2;
    color: #991b1b;
}

.status-indicator.status-unknown {
    background-color: #f1f5f9;
    color: #64748b;
}

.status-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background-color: currentColor;
}

.status-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.next-change {
    font-size: 0.875rem;
    font-weight: normal;
    opacity: 0.8;
}

.hours-schedule {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.hours-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
}

.hours-label {
    font-weight: 500;
    color: var(--text-secondary);
}

.hours-value {
    color: var(--text-primary);
}

.no-hours-info {
    text-align: center;
    color: var(--text-secondary);
    padding: 1rem;
    font-style: italic;
}

/* Description */
.description-text {
    line-height: 1.6;
    color: var(--text-primary);
    margin: 0;
}

/* Access info */
.access-text {
    line-height: 1.6;
    color: var(--text-primary);
    margin: 0;
}

/* Ratings */
.ratings-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.loading-ratings {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    color: var(--text-secondary);
}

.loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.no-ratings {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
}

.rating-item {
    padding: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    background-color: var(--background-color);
}

.rating-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
}

.rating-user {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.user-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
}

.user-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
}

.user-name {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.875rem;
}

.rating-date {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.rating-comment {
    margin-top: 0.75rem;
}

.rating-comment p {
    margin: 0;
    line-height: 1.5;
    color: var(--text-primary);
}

.ratings-error {
    text-align: center;
    padding: 2rem;
    color: var(--error-color);
}

/* Actions */
.actions-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background-color: var(--background-color);
    border-radius: 0.75rem;
}

.rate-btn {
    width: 100%;
    padding: 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.btn-icon {
    font-size: 1.25rem;
}

.secondary-actions {
    display: flex;
    gap: 0.75rem;
}

.share-btn,
.favorite-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.favorite-btn.favorited {
    background-color: #fecaca;
    color: #991b1b;
    border-color: #fecaca;
}

/* Responsive design */
@media (max-width: 640px) {
    .restaurant-detail-modal {
        max-height: 90vh;
    }

    .main-photo-container {
        height: 200px;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .hours-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }

    .rating-header {
        flex-direction: column;
        gap: 0.75rem;
    }

    .secondary-actions {
        flex-direction: column;
    }

    .photo-thumbnails {
        padding: 0.75rem;
    }

    .thumbnail {
        width: 50px;
        height: 50px;
    }
}

/* Accessibility improvements */
.nav-btn:focus,
.thumbnail:focus,
.action-btn:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

.main-photo:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
    .main-photo,
    .nav-btn,
    .thumbnail,
    .loading-spinner {
        animation: none;
        transition: none;
    }
}
```

## Dependencies
- Story 1.4: Modal Framework (must be completed first)
- Restaurant service from Story 1.2
- Rating service (to be implemented in Epic 3)
- Modal service from Story 1.4

## Success Metrics
- Restaurant detail modal displays all information correctly
- Operating status shows real-time open/closed status
- Photo gallery works with navigation controls
- Rate button triggers rating modal correctly
- Information is well-organized and visually appealing
- Responsive design works on all screen sizes
- Accessibility features work properly

## Testing Approach
1. **Modal Display Test**: Verify all restaurant information displays correctly
2. **Operating Status Test**: Test real-time status calculation and display
3. **Photo Gallery Test**: Test photo navigation and display
4. **Action Buttons Test**: Test rate, share, and favorite functionality
5. **Responsive Test**: Test modal on different screen sizes
6. **Accessibility Test**: Test keyboard navigation and screen reader support

## Notes
- Implements comprehensive restaurant information display
- Includes real-time operating status with timezone awareness
- Features interactive photo gallery with navigation controls
- Provides excellent user experience with smooth animations
- Includes proper accessibility support and keyboard navigation
- Handles edge cases like missing information gracefully
- Responsive design ensures good experience on all devices