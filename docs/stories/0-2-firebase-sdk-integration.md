# Story 0.2: Firebase SDK Integration

**As a developer, I want to integrate Firebase SDK into the application, so that I can use cloud services for data operations.**

## Overview
This story implements the Firebase SDK integration that connects the web application to the cloud backend services, replacing the localStorage-based data management system.

## Acceptance Criteria

### AC 2.1: Firebase SDK CDN links added to HTML file
- [ ] Add Firebase App SDK CDN link to HTML head section
- [ ] Add Firestore SDK CDN link to HTML head section
- [ ] Add Firebase Storage SDK CDN link to HTML head section
- [ ] Ensure proper loading order and script attributes
- [ ] Verify SDK scripts load correctly in browser

### AC 2.2: Firebase initialization module created (firebase.js)
- [ ] Create firebase.js module for Firebase initialization
- [ ] Implement Firebase app initialization with configuration
- [ ] Initialize Firestore service with offline persistence
- [ ] Initialize Firebase Storage service
- [ ] Export Firebase services for use in other modules

### AC 2.3: Firestore database references configured
- [ ] Create restaurants collection reference
- [ ] Create reviews collection reference
- [ ] Configure real-time listeners setup functions
- [ ] Implement query builders for common operations
- [ ] Set up document reference helpers

### AC 2.4: Firebase Storage references configured
- [ ] Create storage reference for restaurant photos
- [ ] Configure upload paths and file naming conventions
- [ ] Implement download URL generation functions
- [ ] Set up file deletion helpers
- [ ] Configure storage metadata settings

### AC 2.5: Error handling for Firebase operations implemented
- [ ] Create comprehensive error handling system
- [ ] Implement Firebase-specific error code handling
- [ ] Create user-friendly error messages
- [ ] Set up error logging and debugging tools
- [ ] Implement retry logic for failed operations

## Technical Implementation Details

### HTML Integration
```html
<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-storage-compat.js"></script>
```

### Firebase Initialization Module
```javascript
// firebase.js
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services with offline persistence
const db = firebase.firestore();
db.enablePersistence()
  .catch((err) => {
    console.error('Firebase persistence error:', err);
  });

const storage = firebase.storage();

// Export services
export { db, storage, firebase };
```

### Database References
```javascript
// Database service helpers
export const restaurantsRef = db.collection('restaurants');
export const reviewsRef = db.collection('reviews');

// Real-time listener setup
export function setupRestaurantListener(callback) {
  return restaurantsRef.onSnapshot(callback, handleError);
}

// Query builders
export function getRestaurantsQuery(orderBy = 'averageQuality', limit = 50) {
  return restaurantsRef
    .orderBy(orderBy, 'desc')
    .limit(limit);
}
```

### Storage Configuration
```javascript
// Storage service helpers
export const storageRef = storage.ref();
export const photosRef = storageRef.child('restaurant-photos');

// Upload path generation
export function generatePhotoPath(restaurantId, fileName) {
  return `restaurant-photos/${restaurantId}/${fileName}`;
}

// Download URL generation
export async function getDownloadURL(filePath) {
  try {
    const ref = storage.ref(filePath);
    return await ref.getDownloadURL();
  } catch (error) {
    handleError(error);
    return null;
  }
}
```

### Error Handling System
```javascript
// Error handling utilities
export function handleError(error) {
  console.error('Firebase error:', error);

  const errorMessages = {
    'permission-denied': 'Você não tem permissão para realizar esta operação.',
    'unavailable': 'Serviço temporariamente indisponível. Tente novamente.',
    'network-request-failed': 'Erro de conexão. Verifique sua internet.',
    'default': 'Ocorreu um erro. Tente novamente.'
  };

  const message = errorMessages[error.code] || errorMessages.default;
  showUserError(message);

  // Implement retry logic for recoverable errors
  if (isRecoverable(error)) {
    setTimeout(() => retryOperation(error.operation), 2000);
  }
}
```

## Dependencies
- Story 0.1: Firebase Project Configuration (must be completed first)
- Firebase configuration file from Story 0.1
- Modern web browser with Firebase SDK support

## Success Metrics
- Firebase SDKs load successfully in web browser
- Firebase services initialize without errors
- Database and storage references are properly configured
- Error handling system captures and displays appropriate messages
- All Firebase operations are accessible through exported modules

## Testing Approach
1. **SDK Loading Test**: Verify all CDN links load correctly
2. **Initialization Test**: Confirm Firebase app initializes with provided config
3. **Connection Test**: Test connection to Firestore and Storage services
4. **Error Handling Test**: Simulate various error scenarios to verify error handling
5. **Integration Test**: Ensure Firebase services work together seamlessly

## Notes
- Uses Firebase Compat SDK v9.6.1 for compatibility with existing code structure
- Offline persistence enabled automatically for better user experience
- Error handling includes both technical logging and user-friendly messages
- Storage references organized by restaurant ID for logical file organization