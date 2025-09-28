# Story 3.2: Rating Form & Interface

## User Story
Como usuário, eu quero acessar um formulário de avaliação intuitivo dentro do modal do restaurante para poder classificar a qualidade do estabelecimento de forma rápida e fácil.

## Acceptance Criteria
- [ ] Formulário de avaliação deve ser integrado ao modal de detalhes do restaurante
- [ ] Interface deve seguir o padrão visual estabelecido no sistema
- [ ] Formulário deve incluir campo de avaliação de qualidade (1-5 estrelas)
- [ ] Botão de envio deve ser claramente visível e acessível
- [ ] Formulário deve ser responsivo e funcionar em mobile
- [ ] Deve incluir indicador visual de estado (loading/sucesso/erro)
- [ ] Validação básica deve ser implementada no cliente
- [ ] Feedback visual deve ser fornecido ao usuário após envio

## Technical Implementation

### HTML Structure
```html
<!-- Rating form within restaurant modal -->
<div class="rating-form-container">
  <div class="rating-header">
    <h3>Avaliar este restaurante</h3>
    <p>Sua opinião ajuda outros usuários!</p>
  </div>

  <form id="rating-form" class="rating-form">
    <div class="form-group">
      <label for="quality-rating">Qualidade geral</label>
      <div class="star-rating" data-rating="0">
        <span class="star" data-value="1">★</span>
        <span class="star" data-value="2">★</span>
        <span class="star" data-value="3">★</span>
        <span class="star" data-value="4">★</span>
        <span class="star" data-value="5">★</span>
      </div>
      <input type="hidden" id="quality-rating" name="quality" required>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn-primary" id="submit-rating">
        <span class="btn-text">Enviar avaliação</span>
        <span class="btn-loading" style="display: none;">
          <span class="spinner"></span>
          Enviando...
        </span>
      </button>
    </div>

    <div class="form-feedback" style="display: none;"></div>
  </form>
</div>
```

### CSS Styling
```css
/* Rating Form Styles */
.rating-form-container {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1.5rem;
}

.rating-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.rating-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.rating-header p {
  color: #6b7280;
  font-size: 0.875rem;
}

.rating-form .form-group {
  margin-bottom: 1.5rem;
}

.rating-form label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.75rem;
}

.star-rating {
  display: flex;
  gap: 0.25rem;
  font-size: 2rem;
  justify-content: center;
  padding: 0.5rem 0;
}

.star {
  cursor: pointer;
  color: #d1d5db;
  transition: all 0.2s ease;
  user-select: none;
}

.star:hover,
.star.hover {
  color: #fbbf24;
  transform: scale(1.1);
}

.star.selected {
  color: #f59e0b;
}

.star-rating[data-rating="1"] .star[data-value="1"],
.star-rating[data-rating="2"] .star[data-value="1"],
.star-rating[data-rating="2"] .star[data-value="2"],
.star-rating[data-rating="3"] .star[data-value="1"],
.star-rating[data-rating="3"] .star[data-value="2"],
.star-rating[data-rating="3"] .star[data-value="3"],
.star-rating[data-rating="4"] .star[data-value="1"],
.star-rating[data-rating="4"] .star[data-value="2"],
.star-rating[data-rating="4"] .star[data-value="3"],
.star-rating[data-rating="4"] .star[data-value="4"],
.star-rating[data-rating="5"] .star[data-value="1"],
.star-rating[data-rating="5"] .star[data-value="2"],
.star-rating[data-rating="5"] .star[data-value="3"],
.star-rating[data-rating="5"] .star[data-value="4"],
.star-rating[data-rating="5"] .star[data-value="5"] {
  color: #f59e0b;
}

.form-actions {
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-feedback {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-feedback.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.form-feedback.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .rating-form-container {
    padding: 1rem;
  }

  .star-rating {
    font-size: 1.75rem;
  }

  .btn-primary {
    padding: 0.625rem 1.5rem;
    font-size: 0.875rem;
  }
}
```

### JavaScript Implementation
```javascript
// Rating Form Component
class RatingForm {
  constructor(container, restaurantId, onRatingSubmit) {
    this.container = container;
    this.restaurantId = restaurantId;
    this.onRatingSubmit = onRatingSubmit;
    this.currentRating = 0;

    this.init();
  }

  init() {
    this.setupStarRating();
    this.setupFormSubmission();
    this.loadUserExistingRating();
  }

  setupStarRating() {
    const stars = this.container.querySelectorAll('.star');
    const starRating = this.container.querySelector('.star-rating');
    const qualityInput = this.container.querySelector('#quality-rating');

    stars.forEach(star => {
      star.addEventListener('click', (e) => {
        const value = parseInt(e.target.dataset.value);
        this.setRating(value);
      });

      star.addEventListener('mouseenter', (e) => {
        const value = parseInt(e.target.dataset.value);
        this.highlightStars(value);
      });
    });

    starRating.addEventListener('mouseleave', () => {
      this.highlightStars(this.currentRating);
    });

    // Touch support for mobile
    stars.forEach(star => {
      star.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const value = parseInt(e.target.dataset.value);
        this.setRating(value);
      });
    });
  }

  setRating(value) {
    this.currentRating = value;
    this.container.querySelector('#quality-rating').value = value;
    this.highlightStars(value);
    this.container.querySelector('.star-rating').dataset.rating = value;
  }

  highlightStars(value) {
    const stars = this.container.querySelectorAll('.star');
    stars.forEach((star, index) => {
      if (index < value) {
        star.classList.add('selected');
      } else {
        star.classList.remove('selected');
      }
    });
  }

  setupFormSubmission() {
    const form = this.container.querySelector('#rating-form');
    const submitBtn = this.container.querySelector('#submit-rating');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const feedback = this.container.querySelector('.form-feedback');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (this.currentRating === 0) {
        this.showFeedback('Por favor, selecione uma avaliação', 'error');
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline-block';
      feedback.style.display = 'none';

      try {
        const rating = {
          restaurantId: this.restaurantId,
          quality: this.currentRating,
          timestamp: new Date().toISOString()
        };

        const result = await this.onRatingSubmit(rating);

        if (result.success) {
          this.showFeedback('Avaliação enviada com sucesso!', 'success');
          this.resetForm();
        } else {
          this.showFeedback(result.message || 'Erro ao enviar avaliação', 'error');
        }
      } catch (error) {
        console.error('Rating submission error:', error);
        this.showFeedback('Erro ao enviar avaliação. Tente novamente.', 'error');
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
      }
    });
  }

  async loadUserExistingRating() {
    try {
      const existingRating = await this.checkExistingRating();
      if (existingRating) {
        this.setRating(existingRating.quality);
        this.disableForm();
        this.showFeedback('Você já avaliou este restaurante', 'info');
      }
    } catch (error) {
      console.error('Error loading existing rating:', error);
    }
  }

  async checkExistingRating() {
    // This will be implemented with Firebase integration
    // For now, returns null (no existing rating)
    return null;
  }

  disableForm() {
    const form = this.container.querySelector('#rating-form');
    const stars = this.container.querySelectorAll('.star');
    const submitBtn = this.container.querySelector('#submit-rating');

    form.style.pointerEvents = 'none';
    form.style.opacity = '0.7';
    stars.forEach(star => {
      star.style.cursor = 'default';
    });
    submitBtn.disabled = true;
    submitBtn.textContent = 'Avaliação já enviada';
  }

  resetForm() {
    setTimeout(() => {
      this.currentRating = 0;
      this.container.querySelector('#quality-rating').value = '';
      this.highlightStars(0);
      this.container.querySelector('.star-rating').dataset.rating = '0';
      this.container.querySelector('.form-feedback').style.display = 'none';
    }, 3000);
  }

  showFeedback(message, type) {
    const feedback = this.container.querySelector('.form-feedback');
    feedback.textContent = message;
    feedback.className = `form-feedback ${type}`;
    feedback.style.display = 'block';

    if (type === 'success') {
      setTimeout(() => {
        feedback.style.display = 'none';
      }, 5000);
    }
  }
}

// Export for use in restaurant modal
window.RatingForm = RatingForm;
```

### Integration with Restaurant Modal
```javascript
// In restaurant-modal.js
class RestaurantModal {
  constructor() {
    // ... existing initialization code
    this.setupRatingForm();
  }

  setupRatingForm() {
    const ratingContainer = this.modal.querySelector('.rating-form-container');
    if (ratingContainer) {
      this.ratingForm = new RatingForm(
        ratingContainer,
        this.currentRestaurant.id,
        this.handleRatingSubmit.bind(this)
      );
    }
  }

  async handleRatingSubmit(ratingData) {
    try {
      // Add user identification from Story 3.1
      const userId = await this.getUserId();
      const fullRating = {
        ...ratingData,
        userId: userId,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      // This will be implemented with Firebase in Story 3.3
      console.log('Submitting rating:', fullRating);

      return { success: true };
    } catch (error) {
      console.error('Rating submission failed:', error);
      return {
        success: false,
        message: 'Não foi possível enviar sua avaliação'
      };
    }
  }

  async getUserId() {
    // Use user identification system from Story 3.1
    if (window.UserIdentifier) {
      const identifier = new UserIdentifier();
      return await identifier.getUserId();
    }
    return null;
  }
}
```

## Dependencies
- **Story 3.1**: User identification system for tracking who submitted ratings
- **Story 1.4**: Modal framework for displaying rating form
- **Story 2.3**: Restaurant detail modal structure

## Testing Checklist
- [ ] Star rating interaction works on desktop and mobile
- [ ] Form validation prevents submission without rating
- [ ] Loading states display correctly during submission
- [ ] Success/error feedback shows appropriately
- [ ] Form is disabled after successful submission
- [ ] Touch interactions work on mobile devices
- [ ] Form integrates properly with restaurant modal
- [ ] Existing ratings are detected and form is disabled

## Notes
- Esta história implementa o componente visual principal do sistema de avaliações
- O formulário é projetado para ser simples e intuitivo, focando apenas na avaliação de qualidade
- O design segue os padrões estabelecidos nos componentes existentes
- A integração com o Firebase será implementada na Story 3.3
- A detecção de avaliações duplicadas será implementada na Story 3.3