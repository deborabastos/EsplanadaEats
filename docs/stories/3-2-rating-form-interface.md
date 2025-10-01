# Story 3.2: Rating Form & Interface

## Status
Draft

## Story
**As a** user,
**I want** an intuitive and responsive interface to rate restaurants,
**so that** I can give quality ratings (1-5) and submit my evaluations quickly and easily.

## Acceptance Criteria
1. Rating interface as modal overlay over restaurant list
2. Interactive star system for rating selection (1-5)
3. Real-time validation of star selection
4. Clearly visible and accessible submit button
5. Visual feedback during rating submission
6. Fully responsive interface (mobile-first)
7. Smooth animations for star interactions
8. Loading system during submission to prevent multiple submissions
9. Clear error messages for submission failures
10. Interface follows application design system

## Tasks / Subtasks
- [ ] Task 1: Create rating modal overlay interface (AC: 1, 6, 10)
  - [ ] Create rating modal overlay over restaurant list
  - [ ] Design fully responsive interface (mobile-first)
  - [ ] Ensure interface follows application design system
  - [ ] Implement proper modal positioning and sizing
  - [ ] Add accessibility features for screen readers
- [ ] Task 2: Implement interactive star rating system (AC: 2, 3, 7)
  - [ ] Create interactive star system for rating selection (1-5)
  - [ ] Implement real-time validation of star selection
  - [ ] Add smooth animations for star interactions
  - [ ] Include hover effects and visual feedback
  - [ ] Ensure stars work with keyboard navigation
- [ ] Task 3: Create submission functionality with feedback (AC: 4, 5, 8, 9)
  - [ ] Add clearly visible and accessible submit button
  - [ ] Implement visual feedback during rating submission
  - [ ] Add loading system during submission to prevent multiple submissions
  - [ ] Create clear error messages for submission failures
  - [ ] Include success confirmation after submission

## Dev Notes
This story implements an intuitive and responsive interface for restaurant rating, allowing users to give quality ratings (1-5) and submit evaluations quickly and easily.

### Technical Implementation Details

**Rating Form Component:**
```javascript
// components/RatingForm.js
class RatingForm {
  constructor(restaurantId, restaurantName, firebaseService) {
    this.restaurantId = restaurantId;
    this.restaurantName = restaurantName;
    this.firebaseService = firebaseService;
    this.rating = 0;
    this.isSubmitting = false;
    this.userFingerprint = null;

    this.init();
  }

  init() {
    this.generateUserFingerprint();
    this.setupEventListeners();
    this.loadExistingRating();
  }

  generateUserFingerprint() {
    // Simple fingerprint for rate limiting
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);

    this.userFingerprint = canvas.toDataURL();
  }

  render() {
    return `
      <div class="rating-modal" id="ratingModal">
        <div class="rating-modal-content">
          <div class="rating-header">
            <h2>Avaliar Restaurante</h2>
            <button class="rating-close-btn" data-action="close">×</button>
          </div>

          <div class="rating-restaurant-info">
            <h3 class="rating-restaurant-name">${this.escapeHtml(this.restaurantName)}</h3>
            <p class="rating-instruction">Selecione de 1 a 5 estrelas para avaliar a qualidade</p>
          </div>

          <div class="rating-stars-container">
            <div class="rating-stars" data-rating="0">
              ${this.renderStars()}
            </div>
            <div class="rating-feedback" id="ratingFeedback">
              <span class="rating-label"></span>
            </div>
          </div>

          <form class="rating-form" id="ratingForm">
            <input type="hidden" name="restaurantId" value="${this.restaurantId}">
            <input type="hidden" name="rating" id="ratingValue" value="0">
            <input type="hidden" name="userFingerprint" value="${this.userFingerprint}">

            <div class="rating-actions">
              <button type="button" class="rating-btn rating-btn-cancel" data-action="cancel">
                Cancelar
              </button>
              <button type="submit" class="rating-btn rating-btn-submit" id="submitBtn" disabled>
                Enviar Avaliação
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderStars() {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += `
        <button
          type="button"
          class="rating-star"
          data-rating="${i}"
          aria-label="Avaliar com ${i} estrela${i > 1 ? 's' : ''}"
        >
          <span class="star-icon">${i <= this.rating ? '★' : '☆'}</span>
        </button>
      `;
    }
    return stars;
  }

  setupEventListeners() {
    // Star rating interaction
    document.addEventListener('click', (e) => {
      if (e.target.closest('.rating-star')) {
        const star = e.target.closest('.rating-star');
        const rating = parseInt(star.dataset.rating);
        this.setRating(rating);
      }
    });

    // Star hover effects
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('.rating-star')) {
        const star = e.target.closest('.rating-star');
        const rating = parseInt(star.dataset.rating);
        this.highlightStars(rating);
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('.rating-stars')) {
        this.highlightStars(this.rating);
      }
    });

    // Form submission
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'ratingForm') {
        e.preventDefault();
        this.submitRating();
      }
    });

    // Modal actions
    document.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'close' || e.target.dataset.action === 'cancel') {
        this.closeModal();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('rating-modal')) {
        this.closeModal();
      }
    });
  }

  setRating(rating) {
    this.rating = rating;
    document.getElementById('ratingValue').value = rating;

    const starsContainer = document.querySelector('.rating-stars');
    starsContainer.dataset.rating = rating;

    this.updateStarDisplay();
    this.updateRatingFeedback();
    this.updateSubmitButton();
  }

  highlightStars(rating) {
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
      const starIcon = star.querySelector('.star-icon');
      if (index < rating) {
        starIcon.textContent = '★';
        star.classList.add('highlighted');
      } else {
        starIcon.textContent = '☆';
        star.classList.remove('highlighted');
      }
    });
  }

  updateStarDisplay() {
    this.highlightStars(this.rating);
  }

  updateRatingFeedback() {
    const feedback = document.getElementById('ratingFeedback');
    const label = feedback.querySelector('.rating-label');

    const feedbackTexts = {
      1: '😞 Ruim - Não recomendo',
      2: '😐 Regular - Poderia ser melhor',
      3: '😊 Bom - Satisfatório',
      4: '😄 Muito Bom - Recomendo',
      5: '🤩 Excelente - Excepcional!'
    };

    label.textContent = feedbackTexts[this.rating] || '';
    feedback.style.opacity = this.rating > 0 ? '1' : '0';
  }

  updateSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = this.rating === 0 || this.isSubmitting;

    if (this.isSubmitting) {
      submitBtn.textContent = 'Enviando...';
      submitBtn.classList.add('loading');
    } else {
      submitBtn.textContent = 'Enviar Avaliação';
      submitBtn.classList.remove('loading');
    }
  }

  async submitRating() {
    if (this.rating === 0 || this.isSubmitting) return;

    this.isSubmitting = true;
    this.updateSubmitButton();

    try {
      const ratingData = {
        restaurantId: this.restaurantId,
        rating: this.rating,
        userFingerprint: this.userFingerprint,
        timestamp: new Date().toISOString()
      };

      await this.firebaseService.submitRating(ratingData);

      this.showSuccessMessage();
      setTimeout(() => {
        this.closeModal();
        this.notifyRatingUpdate();
      }, 1500);

    } catch (error) {
      console.error('Error submitting rating:', error);
      this.showErrorMessage(error.message);
      this.isSubmitting = false;
      this.updateSubmitButton();
    }
  }

  showSuccessMessage() {
    const form = document.getElementById('ratingForm');
    const successMessage = document.createElement('div');
    successMessage.className = 'rating-success-message';
    successMessage.innerHTML = `
      <div class="success-icon">✓</div>
      <div class="success-text">Avaliação enviada com sucesso!</div>
    `;

    form.appendChild(successMessage);
  }

  showErrorMessage(error) {
    const form = document.getElementById('ratingForm');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'rating-error-message';
    errorMessage.innerHTML = `
      <div class="error-icon">⚠️</div>
      <div class="error-text">Erro ao enviar avaliação: ${error}</div>
    `;

    form.appendChild(errorMessage);

    setTimeout(() => {
      errorMessage.remove();
    }, 5000);
  }

  closeModal() {
    const modal = document.getElementById('ratingModal');
    if (modal) {
      modal.remove();
    }
  }

  notifyRatingUpdate() {
    // Dispatch custom event to update restaurant ratings
    const event = new CustomEvent('ratingUpdated', {
      detail: {
        restaurantId: this.restaurantId,
        rating: this.rating
      }
    });

    document.dispatchEvent(event);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Static method to show rating modal
  static show(restaurantId, restaurantName, firebaseService) {
    const existingModal = document.getElementById('ratingModal');
    if (existingModal) {
      existingModal.remove();
    }

    const ratingForm = new RatingForm(restaurantId, restaurantName, firebaseService);
    const modalHtml = ratingForm.render();

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Trigger animation
    setTimeout(() => {
      const modal = document.getElementById('ratingModal');
      if (modal) {
        modal.classList.add('active');
      }
    }, 10);
  }
}

// Export for use in other components
window.RatingForm = RatingForm;
```

**Rating Form Styles:**
```css
/* components/rating-form.css */
.rating-modal {
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
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.rating-modal.active {
  opacity: 1;
  visibility: visible;
}

.rating-modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.rating-modal.active .rating-modal-content {
  transform: scale(1);
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.rating-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
}

.rating-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.rating-close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.rating-restaurant-info {
  padding: 24px 24px 16px;
  text-align: center;
}

.rating-restaurant-name {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
}

.rating-instruction {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.rating-stars-container {
  padding: 16px 24px;
  text-align: center;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.rating-star {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #d1d5db;
  transition: all 0.2s ease;
  padding: 8px;
  border-radius: 8px;
}

.rating-star:hover {
  color: #fbbf24;
  transform: scale(1.1);
}

.rating-star.highlighted {
  color: #f59e0b;
}

.rating-feedback {
  min-height: 24px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.rating-label {
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

.rating-form {
  padding: 16px 24px 24px;
}

.rating-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.rating-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rating-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.rating-btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.rating-btn-cancel:hover:not(:disabled) {
  background: #e5e7eb;
}

.rating-btn-submit {
  background: #3b82f6;
  color: white;
}

.rating-btn-submit:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.rating-btn-submit.loading {
  background: #9ca3af;
  cursor: not-allowed;
}

.rating-success-message {
  background: #d1fae5;
  color: #065f46;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
  text-align: center;
  animation: slideIn 0.3s ease;
}

.rating-error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
  text-align: center;
  animation: slideIn 0.3s ease;
}

.success-icon, .error-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.success-text, .error-text {
  font-size: 14px;
  font-weight: 500;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .rating-modal-content {
    width: 95%;
    border-radius: 8px;
  }

  .rating-header {
    padding: 16px 16px 12px;
  }

  .rating-header h2 {
    font-size: 20px;
  }

  .rating-restaurant-info {
    padding: 16px 16px 12px;
  }

  .rating-restaurant-name {
    font-size: 18px;
  }

  .rating-stars-container {
    padding: 12px 16px;
  }

  .rating-star {
    font-size: 28px;
    padding: 6px;
  }

  .rating-form {
    padding: 12px 16px 16px;
  }

  .rating-actions {
    flex-direction: column;
  }

  .rating-btn {
    width: 100%;
  }
}
```

### Dependencies
- Story 3.1: User Identification System for fingerprint generation
- Story 0.2: Firebase Service for rating submission
- Story 1.3: Restaurant Card Display for integration
- Story 3.5: Rating Display System for showing results

### Testing
**Testing Checklist:**
- Rating modal opens correctly from restaurant cards
- Star selection works on click and hover
- Form validates rating selection before submission
- Submit button is disabled when no rating is selected
- Loading state shows during submission
- Success message appears after successful submission
- Error messages appear for failed submissions
- Modal closes on outside click or close button
- Mobile responsiveness works correctly
- Existing ratings are loaded and displayed
- Form prevents duplicate submissions during loading
- Custom event is dispatched after successful rating

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-30 | 1.0 | Initial story creation with BMad framework | Dev Agent |

## Dev Agent Record

### Agent Model Used
*To be populated by development agent*

### Debug Log References
*To be populated by development agent*

### Completion Notes List
*To be populated by development agent*

### File List
*To be populated by development agent*

## QA Results
*To be populated by QA agent*