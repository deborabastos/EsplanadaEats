// js/components/rating-display.js - Advanced Rating Display Component

/**
 * Rating Display Component - Flexible and responsive rating visualization
 */
export class RatingDisplay {
    constructor(options = {}) {
        this.options = {
            mode: 'compact', // 'compact', 'detailed', 'card', 'modal'
            showStars: true,
            showCount: true,
            showConfidence: false,
            showDistribution: false,
            showTrend: false,
            animated: true,
            responsive: true,
            accessible: true,
            ...options
        };

        this.element = null;
        this.currentRating = null;
        this.animationTimeout = null;

        console.log('RatingDisplay initialized with options:', this.options);
    }

    /**
     * Render rating display with specified data
     * @param {Object} ratingData - Rating data
     * @param {HTMLElement|string} container - Container element or selector
     * @returns {HTMLElement} The rendered element
     */
    render(ratingData, container = null) {
        try {
            console.log('🌟 RatingDisplay rendering:', ratingData);

            this.currentRating = this.normalizeRatingData(ratingData);

            const element = this.createElement();

            if (container) {
                const containerEl = typeof container === 'string' ?
                    document.querySelector(container) : container;
                if (containerEl) {
                    containerEl.innerHTML = '';
                    containerEl.appendChild(element);
                }
            }

            console.log('✅ RatingDisplay rendered successfully');
            return element;

        } catch (error) {
            console.error('❌ Error rendering RatingDisplay:', error);
            return this.createErrorDisplay(error.message);
        }
    }

    /**
     * Normalize rating data from different sources
     * @param {Object} data - Raw rating data
     * @returns {Object} Normalized data
     */
    normalizeRatingData(data) {
        // Safely extract and validate averageQuality
        let averageQuality = 0;
        if (typeof data.averageQuality === 'number' && !isNaN(data.averageQuality)) {
            averageQuality = Math.max(0, Math.min(5, data.averageQuality)); // Clamp between 0 and 5
        } else if (typeof data.averageOverall === 'number' && !isNaN(data.averageOverall)) {
            averageQuality = Math.max(0, Math.min(5, data.averageOverall));
        } else {
            // Try to parse string values
            const parsedQuality = parseFloat(data.averageQuality);
            const parsedOverall = parseFloat(data.averageOverall);
            if (!isNaN(parsedQuality)) {
                averageQuality = Math.max(0, Math.min(5, parsedQuality));
            } else if (!isNaN(parsedOverall)) {
                averageQuality = Math.max(0, Math.min(5, parsedOverall));
            }
        }

        // Safely extract and validate totalRatings
        let totalRatings = 0;
        if (typeof data.totalRatings === 'number' && !isNaN(data.totalRatings) && data.totalRatings >= 0) {
            totalRatings = Math.floor(data.totalRatings);
        } else if (typeof data.ratingCount === 'number' && !isNaN(data.ratingCount) && data.ratingCount >= 0) {
            totalRatings = Math.floor(data.ratingCount);
        } else {
            // Try to parse string values
            const parsedRatings = parseInt(data.totalRatings);
            const parsedCount = parseInt(data.ratingCount);
            if (!isNaN(parsedRatings) && parsedRatings >= 0) {
                totalRatings = parsedRatings;
            } else if (!isNaN(parsedCount) && parsedCount >= 0) {
                totalRatings = parsedCount;
            }
        }

        // Safely extract and validate confidenceScore
        let confidenceScore = 0;
        if (typeof data.confidenceScore === 'number' && !isNaN(data.confidenceScore)) {
            confidenceScore = Math.max(0, Math.min(1, data.confidenceScore)); // Clamp between 0 and 1
        } else {
            const parsedConfidence = parseFloat(data.confidenceScore);
            if (!isNaN(parsedConfidence)) {
                confidenceScore = Math.max(0, Math.min(1, parsedConfidence));
            }
        }

        return {
            averageQuality,
            totalRatings,
            confidenceScore,
            ratingDistribution: data.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            trend: data.trend || 'neutral',
            isOffline: data.isOffline || false,
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            ...data
        };
    }

    /**
     * Create main rating display element
     * @returns {HTMLElement}
     */
    createElement() {
        const element = document.createElement('div');
        element.className = `rating-display rating-display--${this.options.mode}`;

        // Add ARIA attributes for accessibility
        if (this.options.accessible) {
            element.setAttribute('role', 'img');
            element.setAttribute('aria-label', this.getAriaLabel());
        }

        // Build display based on mode
        switch (this.options.mode) {
            case 'compact':
                element.innerHTML = this.renderCompactDisplay();
                break;
            case 'detailed':
                element.innerHTML = this.renderDetailedDisplay();
                break;
            case 'card':
                element.innerHTML = this.renderCardDisplay();
                break;
            case 'modal':
                element.innerHTML = this.renderModalDisplay();
                break;
            default:
                element.innerHTML = this.renderCompactDisplay();
        }

        this.element = element;
        return element;
    }

    /**
     * Render compact display (for cards, lists)
     * @returns {string}
     */
    renderCompactDisplay() {
        const { averageQuality, totalRatings, isOffline } = this.currentRating;

        if (totalRatings === 0) {
            return `
                <div class="rating-display__no-rating">
                    <span class="rating-display__stars rating-display__stars--empty">
                        ${this.renderStars(0)}
                    </span>
                    <span class="rating-display__text">Sem avaliações</span>
                </div>
            `;
        }

        return `
            <div class="rating-display__compact ${this.options.animated ? 'rating-display__animated' : ''}">
                <div class="rating-display__stars-container">
                    ${this.options.showStars ? `
                        <span class="rating-display__stars rating-display__stars--compact">
                            ${this.renderStars(averageQuality)}
                        </span>
                    ` : ''}
                    <span class="rating-display__average">${averageQuality.toFixed(1)}</span>
                    ${isOffline ? '<span class="rating-display__offline" title="Dados offline">📴</span>' : ''}
                </div>
                ${this.options.showCount ? `
                    <span class="rating-display__count">(${totalRatings} ${this.getRatingCountText(totalRatings)})</span>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render detailed display (for modals, dedicated rating views)
     * @returns {string}
     */
    renderDetailedDisplay() {
        const { averageQuality, totalRatings, confidenceScore, ratingDistribution, isOffline } = this.currentRating;

        if (totalRatings === 0) {
            return `
                <div class="rating-display__no-rating-detailed">
                    <div class="rating-display__empty-stars">
                        ${this.renderStars(0, 'large')}
                    </div>
                    <div class="rating-display__empty-text">
                        <h4>Este restaurante ainda não foi avaliado</h4>
                        <p>Seja o primeiro a compartilhar sua experiência!</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="rating-display__detailed">
                <div class="rating-display__header">
                    <div class="rating-display__main-rating">
                        ${this.options.showStars ? `
                            <div class="rating-display__stars rating-display__stars--large">
                                ${this.renderStars(averageQuality, 'large')}
                            </div>
                        ` : ''}
                        <div class="rating-display__rating-info">
                            <span class="rating-display__average-large">${averageQuality.toFixed(1)}</span>
                            <span class="rating-display__count-large">baseado em ${totalRatings} ${this.getRatingCountText(totalRatings)}</span>
                            ${isOffline ? '<span class="rating-display__offline">📴 Dados offline</span>' : ''}
                        </div>
                    </div>
                    ${this.options.showConfidence ? this.renderConfidenceIndicator(confidenceScore) : ''}
                </div>

                ${this.options.showDistribution ? this.renderRatingDistribution(ratingDistribution) : ''}

                ${this.options.showTrend ? this.renderTrendIndicator(this.currentRating.trend) : ''}
            </div>
        `;
    }

    /**
     * Render card display (optimized for restaurant cards)
     * @returns {string}
     */
    renderCardDisplay() {
        const { averageQuality, totalRatings, isOffline } = this.currentRating;

        if (totalRatings === 0) {
            return `
                <div class="rating-display__card-empty">
                    <span class="rating-display__stars-small">${this.renderStars(0, 'small')}</span>
                    <span class="rating-display__text-small">Sem avaliações</span>
                </div>
            `;
        }

        return `
            <div class="rating-display__card">
                <div class="rating-display__card-stars">
                    ${this.options.showStars ? this.renderStars(averageQuality, 'small') : ''}
                </div>
                <div class="rating-display__card-info">
                    <span class="rating-display__average-small">${averageQuality.toFixed(1)}</span>
                    <span class="rating-display__count-small">(${totalRatings})</span>
                    ${isOffline ? '<span class="rating-display__offline-small">📴</span>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render modal display (enhanced for modal dialogs)
     * @returns {string}
     */
    renderModalDisplay() {
        return this.renderDetailedDisplay();
    }

    /**
     * Render star display with half-star support
     * @param {number} rating - Rating value (0-5)
     * @param {string} size - Star size ('small', 'normal', 'large')
     * @returns {string}
     */
    renderStars(rating, size = 'normal') {
        // Validate and clamp rating value
        const safeRating = (typeof rating === 'number' && !isNaN(rating))
            ? Math.max(0, Math.min(5, rating))
            : 0;

        const fullStars = Math.floor(safeRating);
        const hasHalfStar = safeRating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHtml = `<div class="rating-stars rating-stars--${size}" role="presentation">`;

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHtml += `<span class="star star--full" data-rating="${i + 1}">★</span>`;
        }

        // Half star
        if (hasHalfStar) {
            starsHtml += `<span class="star star--half" data-rating="${fullStars + 0.5}">☆</span>`;
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += `<span class="star star--empty" data-rating="${fullStars + (hasHalfStar ? 1 : 0) + i + 1}">☆</span>`;
        }

        starsHtml += '</div>';
        return starsHtml;
    }

    /**
     * Render confidence indicator
     * @param {number} confidenceScore - Confidence score (0-1)
     * @returns {string}
     */
    renderConfidenceIndicator(confidenceScore) {
        if (confidenceScore === 0) return '';

        const confidenceLevel = this.getConfidenceLevel(confidenceScore);
        const confidenceColor = this.getConfidenceColor(confidenceScore);

        return `
            <div class="rating-display__confidence">
                <span class="rating-display__confidence-indicator" style="color: ${confidenceColor};" title="Nível de confiança: ${confidenceLevel}">
                    ${this.getConfidenceIcon(confidenceScore)}
                </span>
                <span class="rating-display__confidence-text" title="Score de confiança: ${(confidenceScore * 100).toFixed(1)}%">
                    ${confidenceLevel}
                </span>
            </div>
        `;
    }

    /**
     * Render rating distribution chart
     * @param {Object} distribution - Rating distribution object
     * @returns {string}
     */
    renderRatingDistribution(distribution) {
        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        if (total === 0) return '';

        let distributionHtml = '<div class="rating-display__distribution">';
        distributionHtml += '<h5>Distribuição das Avaliações</h5>';

        for (let rating = 5; rating >= 1; rating--) {
            const count = distribution[rating] || 0;
            const percentage = (count / total) * 100;

            distributionHtml += `
                <div class="rating-display__distribution-row">
                    <span class="rating-display__distribution-label">${rating} ★</span>
                    <div class="rating-display__distribution-bar">
                        <div class="rating-display__distribution-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="rating-display__distribution-count">${count}</span>
                </div>
            `;
        }

        distributionHtml += '</div>';
        return distributionHtml;
    }

    /**
     * Render trend indicator
     * @param {string} trend - Trend direction ('up', 'down', 'neutral')
     * @returns {string}
     */
    renderTrendIndicator(trend) {
        const trendConfig = {
            up: { icon: '📈', text: 'Melhorando', class: 'trend--up' },
            down: { icon: '📉', text: 'Piorando', class: 'trend--down' },
            neutral: { icon: '➡️', text: 'Estável', class: 'trend--neutral' }
        };

        const config = trendConfig[trend] || trendConfig.neutral;

        return `
            <div class="rating-display__trend ${config.class}">
                <span class="rating-display__trend-icon">${config.icon}</span>
                <span class="rating-display__trend-text">${config.text}</span>
            </div>
        `;
    }

    /**
     * Get confidence level text
     * @param {number} score - Confidence score (0-1)
     * @returns {string}
     */
    getConfidenceLevel(score) {
        if (score >= 0.8) return 'Muito Alto';
        if (score >= 0.6) return 'Alto';
        if (score >= 0.4) return 'Médio';
        if (score >= 0.2) return 'Baixo';
        return 'Muito Baixo';
    }

    /**
     * Get confidence color
     * @param {number} score - Confidence score (0-1)
     * @returns {string}
     */
    getConfidenceColor(score) {
        if (score >= 0.8) return '#28a745';
        if (score >= 0.6) return '#17a2b8';
        if (score >= 0.4) return '#ffc107';
        if (score >= 0.2) return '#fd7e14';
        return '#dc3545';
    }

    /**
     * Get confidence icon
     * @param {number} score - Confidence score (0-1)
     * @returns {string}
     */
    getConfidenceIcon(score) {
        if (score >= 0.8) return '🟢';
        if (score >= 0.6) return '🔵';
        if (score >= 0.4) return '🟡';
        if (score >= 0.2) return '🟠';
        return '🔴';
    }

    /**
     * Get rating count text (singular/plural)
     * @param {number} count - Number of ratings
     * @returns {string}
     */
    getRatingCountText(count) {
        return count === 1 ? 'avaliação' : 'avaliações';
    }

    /**
     * Get ARIA label for accessibility
     * @returns {string}
     */
    getAriaLabel() {
        const { averageQuality, totalRatings } = this.currentRating;

        if (totalRatings === 0) {
            return 'Este restaurante ainda não possui avaliações';
        }

        const starsText = this.getStarsText(averageQuality);
        return `Avaliação: ${starsText}, ${averageQuality.toFixed(1)} de 5, baseado em ${totalRatings} ${this.getRatingCountText(totalRatings)}`;
    }

    /**
     * Get stars text for screen readers
     * @param {number} rating - Rating value
     * @returns {string}
     */
    getStarsText(rating) {
        // Validate and clamp rating value
        const safeRating = (typeof rating === 'number' && !isNaN(rating))
            ? Math.max(0, Math.min(5, rating))
            : 0;

        const fullStars = Math.floor(safeRating);
        const hasHalfStar = safeRating % 1 >= 0.5;

        let text = '';
        for (let i = 0; i < fullStars; i++) {
            text += 'estrela ';
        }
        if (hasHalfStar) {
            text += 'meia estrela ';
        }
        return text.trim() || 'nenhuma estrela';
    }

    /**
     * Create error display
     * @param {string} message - Error message
     * @returns {HTMLElement}
     */
    createErrorDisplay(message) {
        const element = document.createElement('div');
        element.className = 'rating-display rating-display--error';
        element.innerHTML = `
            <div class="rating-display__error">
                <span class="rating-display__error-icon">⚠️</span>
                <span class="rating-display__error-text">Erro ao carregar avaliações</span>
            </div>
        `;
        return element;
    }

    /**
     * Update rating data with animation
     * @param {Object} newRatingData - New rating data
     */
    update(newRatingData) {
        const newRating = this.normalizeRatingData(newRatingData);

        if (this.options.animated && this.element) {
            this.animateUpdate(newRating);
        } else {
            this.currentRating = newRating;
            if (this.element) {
                try {
                    const newElement = this.createElement();
                    this.element.replaceWith(newElement);
                    this.element = newElement;
                } catch (error) {
                    console.error('Error updating rating display:', error);
                    // Fallback to error display
                    const errorElement = this.createErrorDisplay('Falha ao atualizar avaliação');
                    this.element.replaceWith(errorElement);
                    this.element = errorElement;
                }
            }
        }
    }

    /**
     * Animate rating update
     * @param {Object} newRating - New rating data
     */
    animateUpdate(newRating) {
        if (!this.element) return;

        // Normalize the new rating data
        const normalizedNewRating = this.normalizeRatingData(newRating);

        const oldAverage = this.currentRating.averageQuality;
        const newAverage = normalizedNewRating.averageQuality;

        if (Math.abs(oldAverage - newAverage) > 0.1) {
            this.element.classList.add('rating-display--updating');

            setTimeout(() => {
                this.currentRating = normalizedNewRating;
                const newElement = this.createElement();
                this.element.replaceWith(newElement);
                this.element = newElement;

                setTimeout(() => {
                    if (this.element) {
                        this.element.classList.remove('rating-display--updating');
                    }
                }, 300);
            }, 150);
        } else {
            this.currentRating = normalizedNewRating;
            const newElement = this.createElement();
            this.element.replaceWith(newElement);
            this.element = newElement;
        }
    }

    /**
     * Destroy component and cleanup
     */
    destroy() {
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
        }
        this.element = null;
        this.currentRating = null;
    }

    /**
     * Static method for quick rendering
     * @param {Object} ratingData - Rating data
     * @param {Object} options - Display options
     * @param {HTMLElement|string} container - Container
     * @returns {HTMLElement}
     */
    static render(ratingData, options = {}, container = null) {
        const display = new RatingDisplay(options);
        return display.render(ratingData, container);
    }

    /**
     * Static method for compact display
     * @param {Object} ratingData - Rating data
     * @param {HTMLElement|string} container - Container
     * @returns {HTMLElement}
     */
    static renderCompact(ratingData, container = null) {
        return RatingDisplay.render(ratingData, { mode: 'compact' }, container);
    }

    /**
     * Static method for detailed display
     * @param {Object} ratingData - Rating data
     * @param {HTMLElement|string} container - Container
     * @returns {HTMLElement}
     */
    static renderDetailed(ratingData, container = null) {
        return RatingDisplay.render(ratingData, {
            mode: 'detailed',
            showConfidence: true,
            showDistribution: true
        }, container);
    }

    /**
     * Static method for card display
     * @param {Object} ratingData - Rating data
     * @param {HTMLElement|string} container - Container
     * @returns {HTMLElement}
     */
    static renderCard(ratingData, container = null) {
        return RatingDisplay.render(ratingData, { mode: 'card' }, container);
    }
}

export default RatingDisplay;