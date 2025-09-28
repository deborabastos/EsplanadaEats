# Story 3.5: Rating Photos & Comments

## User Story
Como usuário, eu quero poder adicionar fotos e comentários opcionais às minhas avaliações para compartilhar minha experiência de forma mais completa e ajudar outros usuários com informações visuais e detalhadas.

## Acceptance Criteria
- [ ] Formulário de avaliação deve incluir campo opcional para comentários
- [ ] Usuários devem poder fazer upload de até 2 fotos por avaliação
- [ ] Fotos devem ser otimizadas automaticamente antes do upload
- [ ] Preview de fotos deve ser mostrado antes do envio
- [ ] Comentários devem ter limite de 500 caracteres
- [ ] Interface deve permanecer simples mesmo com funcionalidades adicionais
- [ ] Fotos e comentários devem ser exibidos no modal do restaurante
- [ ] Sistema deve lidar com erros de upload de forma graciosa

## Technical Implementation

### Enhanced Rating Form HTML
```html
<!-- Enhanced rating form within restaurant modal -->
<div class="rating-form-container">
  <div class="rating-header">
    <h3>Avaliar este restaurante</h3>
    <p>Compartilhe sua experiência com outros usuários!</p>
  </div>

  <form id="rating-form" class="rating-form">
    <!-- Quality Rating (existing) -->
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

    <!-- Comment Field -->
    <div class="form-group">
      <label for="rating-comment">Comentário (opcional)</label>
      <textarea
        id="rating-comment"
        name="comment"
        class="rating-comment"
        placeholder="Conte um pouco sobre sua experiência..."
        maxlength="500"
        rows="4"
      ></textarea>
      <div class="char-counter">
        <span id="char-count">0</span>/500 caracteres
      </div>
    </div>

    <!-- Photo Upload -->
    <div class="form-group">
      <label>Fotos (opcional - máximo 2)</label>
      <div class="photo-upload-container">
        <div class="photo-upload-area" id="photo-upload-area">
          <div class="upload-icon">📷</div>
          <div class="upload-text">Clique para adicionar fotos</div>
          <div class="upload-subtext">ou arraste e solte aqui</div>
          <input
            type="file"
            id="rating-photos"
            name="photos"
            accept="image/*"
            multiple
            class="photo-input"
          >
        </div>
        <div class="photo-preview-container" id="photo-preview-container"></div>
      </div>
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

### Enhanced CSS for Photos & Comments
```css
/* Enhanced Rating Form Styles */
.rating-comment {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.rating-comment:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.char-counter {
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.char-counter.warning {
  color: #f59e0b;
}

.char-counter.error {
  color: #ef4444;
}

/* Photo Upload Styles */
.photo-upload-container {
  margin-top: 0.5rem;
}

.photo-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: #f9fafb;
}

.photo-upload-area:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.photo-upload-area.drag-over {
  border-color: #3b82f6;
  background: #dbeafe;
  transform: scale(1.02);
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.upload-text {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.upload-subtext {
  font-size: 0.75rem;
  color: #6b7280;
}

.photo-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.photo-preview-container {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.photo-preview {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-preview .remove-photo {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: background 0.2s ease;
}

.photo-preview .remove-photo:hover {
  background: #ef4444;
}

.photo-upload-limit {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
  text-align: center;
}
```

### Enhanced Rating Form JavaScript
```javascript
// Enhanced RatingForm with photos and comments
class RatingForm {
  constructor(container, restaurantId, onRatingSubmit) {
    this.container = container;
    this.restaurantId = restaurantId;
    this.onRatingSubmit = onRatingSubmit;
    this.currentRating = 0;
    this.duplicateService = null;
    this.userId = null;
    this.selectedPhotos = [];
    this.maxPhotos = 2;

    this.init();
  }

  async init() {
    await this.initializeServices();
    this.setupStarRating();
    this.setupCommentField();
    this.setupPhotoUpload();
    this.setupFormSubmission();
    await this.checkExistingRating();
  }

  setupCommentField() {
    const commentField = this.container.querySelector('#rating-comment');
    const charCount = this.container.querySelector('#char-count');

    commentField.addEventListener('input', () => {
      const length = commentField.value.length;
      charCount.textContent = length;

      // Update counter color based on length
      charCount.parentElement.classList.remove('warning', 'error');
      if (length > 450) {
        charCount.parentElement.classList.add('error');
      } else if (length > 400) {
        charCount.parentElement.classList.add('warning');
      }
    });
  }

  setupPhotoUpload() {
    const uploadArea = this.container.querySelector('#photo-upload-area');
    const photoInput = this.container.querySelector('#rating-photos');
    const previewContainer = this.container.querySelector('#photo-preview-container');

    // Click to upload
    uploadArea.addEventListener('click', () => {
      photoInput.click();
    });

    // File selection
    photoInput.addEventListener('change', (e) => {
      this.handlePhotoSelection(e.target.files);
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      this.handlePhotoSelection(e.dataTransfer.files);
    });
  }

  async handlePhotoSelection(files) {
    const photoArray = Array.from(files);

    if (this.selectedPhotos.length + photoArray.length > this.maxPhotos) {
      this.showFeedback(`Você pode selecionar no máximo ${this.maxPhotos} fotos`, 'error');
      return;
    }

    for (const file of photoArray) {
      if (!file.type.startsWith('image/')) {
        this.showFeedback('Por favor, selecione apenas imagens', 'error');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.showFeedback('Cada foto deve ter no máximo 5MB', 'error');
        continue;
      }

      try {
        const optimizedPhoto = await this.optimizePhoto(file);
        this.selectedPhotos.push(optimizedPhoto);
        this.renderPhotoPreview(optimizedPhoto);
      } catch (error) {
        console.error('Error optimizing photo:', error);
        this.showFeedback('Erro ao processar foto', 'error');
      }
    }

    this.updateUploadArea();
  }

  async optimizePhoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions (max 800px width/height)
          let width = img.width;
          let height = img.height;
          const maxSize = 800;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve({
              file: blob,
              url: URL.createObjectURL(blob),
              name: file.name,
              size: blob.size
            });
          }, 'image/jpeg', 0.8); // 80% quality
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  renderPhotoPreview(photo) {
    const previewContainer = this.container.querySelector('#photo-preview-container');
    const previewElement = document.createElement('div');
    previewElement.className = 'photo-preview';
    previewElement.innerHTML = `
      <img src="${photo.url}" alt="Preview">
      <button type="button" class="remove-photo" data-photo-url="${photo.url}">×</button>
    `;

    // Remove photo handler
    const removeBtn = previewElement.querySelector('.remove-photo');
    removeBtn.addEventListener('click', () => {
      this.removePhoto(photo.url);
      previewElement.remove();
    });

    previewContainer.appendChild(previewElement);
  }

  removePhoto(photoUrl) {
    this.selectedPhotos = this.selectedPhotos.filter(photo => photo.url !== photoUrl);
    URL.revokeObjectURL(photoUrl); // Clean up memory
    this.updateUploadArea();
  }

  updateUploadArea() {
    const uploadArea = this.container.querySelector('#photo-upload-area');
    const photoInput = this.container.querySelector('#rating-photos');
    const uploadText = uploadArea.querySelector('.upload-text');
    const uploadSubtext = uploadArea.querySelector('.upload-subtext');

    if (this.selectedPhotos.length >= this.maxPhotos) {
      uploadArea.style.display = 'none';
    } else {
      uploadArea.style.display = 'block';
      const remaining = this.maxPhotos - this.selectedPhotos.length;
      uploadText.textContent = `Clique para adicionar ${remaining} foto${remaining > 1 ? 's' : ''}`;
      uploadSubtext.textContent = `${this.selectedPhotos.length}/${this.maxPhotos} fotos selecionadas`;
    }
  }

  async handleFormSubmit(ratingData) {
    if (!this.duplicateService || !this.userId) {
      return {
        success: false,
        message: 'Serviço de avaliação não disponível'
      };
    }

    // Upload photos first
    const photoUrls = await this.uploadPhotos();
    if (photoUrls.error) {
      return {
        success: false,
        message: photoUrls.error
      };
    }

    // Add additional data to rating
    const completeRatingData = {
      ...ratingData,
      userId: this.userId,
      comment: this.container.querySelector('#rating-comment').value.trim(),
      photoUrls: photoUrls.urls,
      hasPhotos: photoUrls.urls.length > 0,
      hasComment: !!this.container.querySelector('#rating-comment').value.trim()
    };

    // Submit with duplicate prevention
    return await this.duplicateService.submitRating(completeRatingData);
  }

  async uploadPhotos() {
    if (this.selectedPhotos.length === 0) {
      return { urls: [] };
    }

    try {
      const storage = firebase.storage();
      const storageRef = storage.ref();
      const photoUrls = [];

      for (let i = 0; i < this.selectedPhotos.length; i++) {
        const photo = this.selectedPhotos[i];
        const photoRef = storageRef.child(
          `ratings/${this.restaurantId}/${this.userId}/${Date.now()}_${i}.jpg`
        );

        await photoRef.put(photo.file);
        const url = await photoRef.getDownloadURL();
        photoUrls.push(url);
      }

      return { urls: photoUrls };

    } catch (error) {
      console.error('Error uploading photos:', error);
      return {
        error: 'Erro ao fazer upload das fotos. Tente novamente.'
      };
    }
  }

  // ... rest of the existing RatingForm methods ...
}
```

### Enhanced Firebase Data Model
```javascript
// Enhanced rating data structure
{
  id: string,                    // Auto-generated by Firestore
  restaurantId: string,           // Reference to restaurant
  userId: string,                 // User fingerprint
  quality: number,                // Rating 1-5
  comment?: string,               // Optional comment (max 500 chars)
  photoUrls?: string[],           // Optional photo URLs (max 2)
  hasComment: boolean,            // Flag for filtering
  hasPhotos: boolean,             // Flag for filtering
  userAgent: string,              // Browser user agent
  timestamp: timestamp,           // Firestore timestamp
  ipAddress: string,              // IP address
  deviceId?: string,              // Device identifier
  session?: string                // Session identifier
}
```

### Display Photos & Comments in Restaurant Modal
```javascript
// Enhanced restaurant modal to show ratings with photos and comments
class RestaurantModal {
  // ... existing code ...

  renderRatingsSection() {
    return `
      <div class="ratings-section">
        <h3>Avaliações dos usuários</h3>
        <div id="ratings-container" class="ratings-container">
          ${this.renderLoadingRatings()}
        </div>
      </div>
    `;
  }

  renderLoadingRatings() {
    return '<div class="loading-ratings">Carregando avaliações...</div>';
  }

  async loadRatings() {
    try {
      const ratingsRef = firebase.firestore().collection('ratings');
      const query = ratingsRef
        .where('restaurantId', '==', this.currentRestaurant.id)
        .orderBy('timestamp', 'desc')
        .limit(10);

      const snapshot = await query.get();
      const ratings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.renderRatings(ratings);

    } catch (error) {
      console.error('Error loading ratings:', error);
      this.renderRatingsError();
    }
  }

  renderRatings(ratings) {
    const container = document.getElementById('ratings-container');

    if (ratings.length === 0) {
      container.innerHTML = '<div class="no-ratings">Ainda não há avaliações para este restaurante.</div>';
      return;
    }

    container.innerHTML = ratings.map(rating => this.renderRatingItem(rating)).join('');
  }

  renderRatingItem(rating) {
    const timeAgo = this.getTimeAgo(rating.timestamp.toDate());

    return `
      <div class="rating-item">
        <div class="rating-header">
          <div class="rating-stars">${this.renderStars(rating.quality)}</div>
          <div class="rating-time">${timeAgo}</div>
        </div>

        ${rating.comment ? `
          <div class="rating-comment">${this.escapeHtml(rating.comment)}</div>
        ` : ''}

        ${rating.photoUrls && rating.photoUrls.length > 0 ? `
          <div class="rating-photos">
            ${rating.photoUrls.map(url => `
              <img src="${url}" alt="Foto da avaliação" class="rating-photo" loading="lazy">
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = '';

    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<span class="star full">★</span>';
    }

    if (hasHalfStar) {
      starsHtml += '<span class="star half">★</span>';
    }

    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<span class="star empty">★</span>';
    }

    return starsHtml;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  }

  renderRatingsError() {
    const container = document.getElementById('ratings-container');
    container.innerHTML = '<div class="ratings-error">Erro ao carregar avaliações.</div>';
  }

  // ... rest of the existing modal code ...
}
```

### Additional CSS for Rating Display
```css
/* Ratings Display Styles */
.ratings-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.ratings-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.ratings-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rating-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.rating-stars {
  display: flex;
  gap: 0.125rem;
  font-size: 0.875rem;
}

.rating-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.rating-comment {
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-top: 0.5rem;
}

.rating-photos {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.rating-photo {
  width: 80px;
  height: 80px;
  border-radius: 0.375rem;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.rating-photo:hover {
  transform: scale(1.05);
}

.loading-ratings,
.no-ratings,
.ratings-error {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
}

.ratings-error {
  color: #ef4444;
}
```

## Dependencies
- **Story 3.2**: Rating form interface for base functionality
- **Story 3.3**: Duplicate prevention logic for data integrity
- **Story 2.2**: Image upload optimization for photo handling
- **Story 0.2**: Firebase SDK integration for storage

## Testing Checklist
- [ ] Comment field accepts up to 500 characters
- [ ] Character counter updates correctly and changes color
- [ ] Photo upload works with click and drag-and-drop
- [ ] Photo optimization works correctly
- [ ] Maximum 2 photos can be uploaded
- [ ] Photo preview shows correctly
- [ ] Remove photo functionality works
- [ ] Photos upload to Firebase Storage successfully
- [ ] Comments display correctly in restaurant modal
- [ ] Photos display correctly in restaurant modal
- [ ] Error handling works for failed uploads
- [ ] Mobile responsiveness works properly

## Notes
- Esta história adiciona recursos ricos de mídia ao sistema de avaliação
- A interface permanece simples mesmo com funcionalidades adicionais
- O sistema de otimização de fotos garante bom desempenho
- A experiência do usuário é aprimorada com feedback visual claro
- A implementação inclui tratamento robusto de erros
- Os recursos são opcionais, mantendo a simplicidade para usuários básicos