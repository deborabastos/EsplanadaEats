# Story 3.4: Rating Calculation & Display

## User Story
Como usuário, eu quero ver a média de qualidade de cada restaurante exibida de forma clara e visualmente atraente nos cards de restaurante para poder fazer escolhas informadas sobre onde comer.

## Acceptance Criteria
- [ ] Média de qualidade deve ser calculada automaticamente após cada avaliação
- [ ] Display visual deve ser intuitivo e fácil de entender
- [ ] Sistema deve mostrar número total de avaliações
- [ ] Interface deve atualizar em tempo real quando novas avaliações são adicionadas
- [ ] Design deve ser consistente com o estilo visual do aplicativo
- [ ] Display deve ser responsivo e funcionar em mobile
- [ ] Restaurantes sem avaliações devem mostrar estado apropriado
- [ ] Formato deve ser acessível e seguir boas práticas de UI

## Technical Implementation

### Restaurant Card Enhancement
```javascript
// components/restaurant-card.js
class RestaurantCard {
  constructor(restaurant) {
    this.restaurant = restaurant;
    this.ratingDisplay = null;
  }

  render() {
    return `
      <div class="restaurant-card" data-id="${this.restaurant.id}">
        <div class="restaurant-photo">
          ${this.renderPhoto()}
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

  renderPhoto() {
    if (this.restaurant.photoUrls && this.restaurant.photoUrls.length > 0) {
      return `<img src="${this.restaurant.photoUrls[0]}" alt="${this.escapeHtml(this.restaurant.name)}" loading="lazy">`;
    }
    return `<div class="photo-placeholder">🍽️</div>`;
  }

  renderRatingDisplay() {
    const { averageQuality, totalRatings } = this.restaurant;

    if (!totalRatings || totalRatings === 0) {
      return this.renderNoRatingState();
    }

    return `
      <div class="rating-display">
        <div class="rating-stars">
          ${this.renderStars(averageQuality)}
        </div>
        <div class="rating-info">
          <span class="rating-average">${this.formatRating(averageQuality)}</span>
          <span class="rating-count">(${totalRatings})</span>
        </div>
      </div>
    `;
  }

  renderNoRatingState() {
    return `
      <div class="no-rating-display">
        <span class="no-rating-text">Sem avaliações</span>
        <span class="be-first-text">Seja o primeiro a avaliar!</span>
      </div>
    `;
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<span class="star full">★</span>';
    }

    // Half star
    if (hasHalfStar) {
      starsHtml += '<span class="star half">★</span>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<span class="star empty">★</span>';
    }

    return starsHtml;
  }

  formatRating(rating) {
    return rating.toFixed(1).replace('.', ',');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  updateRating(newAverageQuality, newTotalRatings) {
    this.restaurant.averageQuality = newAverageQuality;
    this.restaurant.totalRatings = newTotalRatings;

    const cardElement = document.querySelector(`.restaurant-card[data-id="${this.restaurant.id}"]`);
    if (cardElement) {
      const ratingContainer = cardElement.querySelector('.restaurant-rating');
      if (ratingContainer) {
        ratingContainer.innerHTML = this.renderRatingDisplay();
      }
    }
  }
}
```

### Enhanced CSS for Rating Display
```css
/* Rating Display Styles */
.restaurant-rating {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rating-stars {
  display: flex;
  gap: 0.125rem;
  font-size: 1rem;
  line-height: 1;
}

.star {
  color: #d1d5db;
  transition: color 0.2s ease;
}

.star.full {
  color: #f59e0b;
}

.star.half {
  color: #fbbf24;
  position: relative;
}

.star.half::before {
  content: '★';
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  overflow: hidden;
  color: #f59e0b;
}

.star.empty {
  color: #d1d5db;
}

.rating-info {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.rating-average {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.rating-count {
  color: #6b7280;
  font-size: 0.75rem;
}

.no-rating-display {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.no-rating-text {
  color: #6b7280;
  font-size: 0.875rem;
  font-style: italic;
}

.be-first-text {
  color: #9ca3af;
  font-size: 0.75rem;
}

/* Animation for rating updates */
@keyframes ratingUpdate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.rating-display.updated {
  animation: ratingUpdate 0.3s ease;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .rating-stars {
    font-size: 0.875rem;
  }

  .rating-average {
    font-size: 0.8rem;
  }

  .rating-count {
    font-size: 0.7rem;
  }
}
```

### Real-time Rating Updates
```javascript
// services/RatingUpdateService.js
class RatingUpdateService {
  constructor(firestore) {
    this.firestore = firestore;
    this.subscribers = new Map();
  }

  /**
   * Subscribe to rating updates for a specific restaurant
   * @param {string} restaurantId
   * @param {Function} callback
   */
  subscribeToRatingUpdates(restaurantId, callback) {
    const unsubscribe = this.firestore
      .collection('restaurants')
      .doc(restaurantId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          callback({
            averageQuality: data.averageQuality || 0,
            totalRatings: data.totalRatings || 0
          });
        }
      });

    this.subscribers.set(restaurantId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Unsubscribe from rating updates
   * @param {string} restaurantId
   */
  unsubscribeFromRatingUpdates(restaurantId) {
    const unsubscribe = this.subscribers.get(restaurantId);
    if (unsubscribe) {
      unsubscribe();
      this.subscribers.delete(restaurantId);
    }
  }

  /**
   * Subscribe to all restaurant rating updates
   * @param {Function} callback
   */
  subscribeToAllRatingUpdates(callback) {
    return this.firestore
      .collection('restaurants')
      .onSnapshot((snapshot) => {
        const updates = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          updates[doc.id] = {
            averageQuality: data.averageQuality || 0,
            totalRatings: data.totalRatings || 0
          };
        });
        callback(updates);
      });
  }

  /**
   * Unsubscribe from all updates
   */
  unsubscribeAll() {
    this.subscribers.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.subscribers.clear();
  }
}

// Export for use in application
window.RatingUpdateService = RatingUpdateService;
```

### Integration with Restaurant List
```javascript
// components/restaurant-list.js
class RestaurantList {
  constructor(container, restaurants) {
    this.container = container;
    this.restaurants = restaurants;
    this.ratingUpdateService = null;
    this.cards = new Map();

    this.init();
  }

  async init() {
    await this.initializeServices();
    this.render();
    this.setupRealTimeUpdates();
  }

  async initializeServices() {
    if (window.firebase && window.firebase.firestore) {
      const firestore = firebase.firestore();
      this.ratingUpdateService = new RatingUpdateService(firestore);
    }
  }

  render() {
    this.container.innerHTML = '';

    this.restaurants.forEach((restaurant) => {
      const card = new RestaurantCard(restaurant);
      this.cards.set(restaurant.id, card);

      const cardElement = document.createElement('div');
      cardElement.innerHTML = card.render();
      this.container.appendChild(cardElement.firstElementChild);

      // Add click handler for modal
      this.addCardClickHandler(cardElement.firstElementChild, restaurant);
    });
  }

  setupRealTimeUpdates() {
    if (!this.ratingUpdateService) return;

    // Subscribe to updates for all restaurants
    this.unsubscribeAllUpdates = this.ratingUpdateService.subscribeToAllRatingUpdates(
      (updates) => {
        Object.entries(updates).forEach(([restaurantId, ratingData]) => {
          this.updateRestaurantRating(restaurantId, ratingData);
        });
      }
    );
  }

  updateRestaurantRating(restaurantId, { averageQuality, totalRatings }) {
    const card = this.cards.get(restaurantId);
    if (card) {
      card.updateRating(averageQuality, totalRatings);

      // Add visual feedback for the update
      const cardElement = document.querySelector(`.restaurant-card[data-id="${restaurantId}"]`);
      if (cardElement) {
        const ratingDisplay = cardElement.querySelector('.rating-display');
        if (ratingDisplay) {
          ratingDisplay.classList.add('updated');
          setTimeout(() => {
            ratingDisplay.classList.remove('updated');
          }, 300);
        }
      }
    }
  }

  addCardClickHandler(cardElement, restaurant) {
    cardElement.addEventListener('click', () => {
      // Trigger modal opening
      if (window.RestaurantModal) {
        const modal = new RestaurantModal();
        modal.open(restaurant);
      }
    });
  }

  destroy() {
    if (this.unsubscribeAllUpdates) {
      this.unsubscribeAllUpdates();
    }

    if (this.ratingUpdateService) {
      this.ratingUpdateService.unsubscribeAll();
    }
  }
}
```

### Rating Calculation Service
```javascript
// services/RatingCalculationService.js
class RatingCalculationService {
  constructor(firestore) {
    this.firestore = firestore;
  }

  /**
   * Calculate average rating for a restaurant
   * @param {string} restaurantId
   * @returns {Promise<{averageQuality: number, totalRatings: number}>}
   */
  async calculateRestaurantRating(restaurantId) {
    try {
      const ratingsRef = this.firestore.collection('ratings');
      const query = ratingsRef.where('restaurantId', '==', restaurantId);

      const snapshot = await query.get();

      if (snapshot.empty) {
        return {
          averageQuality: 0,
          totalRatings: 0
        };
      }

      const ratings = snapshot.docs.map(doc => doc.data());
      const totalRatings = ratings.length;
      const sumQuality = ratings.reduce((sum, rating) => sum + rating.quality, 0);
      const averageQuality = sumQuality / totalRatings;

      return {
        averageQuality: Math.round(averageQuality * 100) / 100, // Round to 2 decimal places
        totalRatings: totalRatings
      };

    } catch (error) {
      console.error('Error calculating restaurant rating:', error);
      return {
        averageQuality: 0,
        totalRatings: 0
      };
    }
  }

  /**
   * Batch calculate ratings for multiple restaurants
   * @param {string[]} restaurantIds
   * @returns {Promise<Object>} Map of restaurantId to rating data
   */
  async batchCalculateRatings(restaurantIds) {
    const results = {};

    for (const restaurantId of restaurantIds) {
      results[restaurantId] = await this.calculateRestaurantRating(restaurantId);
    }

    return results;
  }

  /**
   * Get rating distribution for a restaurant
   * @param {string} restaurantId
   * @returns {Promise<{distribution: number[], totalRatings: number}>}
   */
  async getRatingDistribution(restaurantId) {
    try {
      const ratingsRef = this.firestore.collection('ratings');
      const query = ratingsRef.where('restaurantId', '==', restaurantId);

      const snapshot = await query.get();

      if (snapshot.empty) {
        return {
          distribution: [0, 0, 0, 0, 0],
          totalRatings: 0
        };
      }

      const ratings = snapshot.docs.map(doc => doc.data());
      const distribution = [0, 0, 0, 0, 0];

      ratings.forEach(rating => {
        if (rating.quality >= 1 && rating.quality <= 5) {
          distribution[rating.quality - 1]++;
        }
      });

      return {
        distribution,
        totalRatings: ratings.length
      };

    } catch (error) {
      console.error('Error getting rating distribution:', error);
      return {
        distribution: [0, 0, 0, 0, 0],
        totalRatings: 0
      };
    }
  }
}

// Export for use in application
window.RatingCalculationService = RatingCalculationService;
```

### Firebase Cloud Function for Rating Calculation
```javascript
// functions/src/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function to update restaurant rating when new rating is added
 */
exports.updateRestaurantRating = functions.firestore
  .document('ratings/{ratingId}')
  .onCreate(async (snap, context) => {
    const newRating = snap.data();
    const restaurantId = newRating.restaurantId;

    try {
      // Get all ratings for this restaurant
      const ratingsRef = admin.firestore().collection('ratings');
      const snapshot = await ratingsRef
        .where('restaurantId', '==', restaurantId)
        .get();

      const ratings = snapshot.docs.map(doc => doc.data());
      const totalRatings = ratings.length;
      const averageQuality = ratings.reduce((sum, rating) => sum + rating.quality, 0) / totalRatings;

      // Update restaurant document
      await admin.firestore().collection('restaurants').doc(restaurantId).update({
        averageQuality: Math.round(averageQuality * 100) / 100,
        totalRatings: totalRatings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Restaurant ${restaurantId} rating updated successfully`);
      return null;

    } catch (error) {
      console.error('Error updating restaurant rating:', error);
      return null;
    }
  });

/**
 * Cloud Function to recalculate all restaurant ratings
 */
exports.recalculateAllRatings = functions.https.onRequest(async (req, res) => {
  try {
    const restaurantsRef = admin.firestore().collection('restaurants');
    const restaurantsSnapshot = await restaurantsRef.get();

    const updatePromises = restaurantsSnapshot.docs.map(async (doc) => {
      const restaurantId = doc.id;

      // Get all ratings for this restaurant
      const ratingsRef = admin.firestore().collection('ratings');
      const ratingsSnapshot = await ratingsRef
        .where('restaurantId', '==', restaurantId)
        .get();

      const ratings = ratingsSnapshot.docs.map(ratingDoc => ratingDoc.data());
      const totalRatings = ratings.length;
      const averageQuality = totalRatings > 0
        ? ratings.reduce((sum, rating) => sum + rating.quality, 0) / totalRatings
        : 0;

      // Update restaurant document
      await doc.ref.update({
        averageQuality: Math.round(averageQuality * 100) / 100,
        totalRatings: totalRatings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { restaurantId, success: true };
    });

    const results = await Promise.all(updatePromises);

    res.status(200).json({
      message: 'All restaurant ratings recalculated successfully',
      results: results
    });

  } catch (error) {
    console.error('Error recalculating ratings:', error);
    res.status(500).json({ error: 'Failed to recalculate ratings' });
  }
});
```

## Dependencies
- **Story 3.3**: Duplicate prevention logic for data integrity
- **Story 1.3**: Restaurant card display system
- **Story 0.3**: Real-time data synchronization
- **Story 0.2**: Firebase SDK integration

## Testing Checklist
- [ ] Star display shows correct number of filled/empty stars
- [ ] Half stars display properly for decimal ratings
- [ ] Rating numbers format correctly (e.g., "4,5" instead of "4.5")
- [ ] Real-time updates work when new ratings are added
- [ ] Animation plays when ratings are updated
- [ ] "No ratings" state displays correctly
- [ ] Mobile responsiveness works properly
- [ ] Performance is good even with many restaurants
- [ ] Accessibility features are in place
- [ ] Error handling is robust

## Notes
- Esta história completa o sistema de avaliação com display visual atraente
- A interface é intuitiva e segue padrões estabelecidos pelo mercado
- Atualizações em tempo real melhoram a experiência do usuário
- O sistema é escalável e performático
- O design é consistente com o restante da aplicação
- A implementação inclui tratamento robusto de erros