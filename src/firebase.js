// Firebase SDK Integration
// Story 0.2: Firebase SDK Integration

// Import configuration
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Initialize services with offline persistence
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// Enable offline persistence for Firestore
db.enablePersistence({ synchronizeTabs: true })
  .then(() => {
    console.log('✅ Firestore offline persistence enabled');
  })
  .catch((err) => {
    console.error('❌ Firestore persistence error:', err);
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Multiple tabs open, persistence only works in one tab');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Browser does not support persistence');
    }
  });

// Database collection references
export const restaurantsRef = db.collection('restaurants');
export const reviewsRef = db.collection('reviews');

// Storage references
export const storageRef = storage.ref();
export const photosRef = storageRef.child('restaurant-photos');

// Real-time listener setup functions
export function setupRestaurantListener(callback) {
  return restaurantsRef.onSnapshot(
    (snapshot) => {
      const restaurants = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(restaurants);
    },
    handleError
  );
}

export function setupReviewsListener(restaurantId, callback) {
  return reviewsRef
    .where('restaurantId', '==', restaurantId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        const reviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(reviews);
      },
      handleError
    );
}

// Query builders for common operations
export function getRestaurantsQuery(orderBy = 'averageQuality', limit = 50) {
  return restaurantsRef
    .orderBy(orderBy, 'desc')
    .limit(limit);
}

export function getRestaurantReviewsQuery(restaurantId, limit = 20) {
  return reviewsRef
    .where('restaurantId', '==', restaurantId)
    .orderBy('createdAt', 'desc')
    .limit(limit);
}

export function getUserReviewsQuery(userFingerprint, limit = 10) {
  return reviewsRef
    .where('userFingerprint', '==', userFingerprint)
    .orderBy('createdAt', 'desc')
    .limit(limit);
}

// Document reference helpers
export function getRestaurantRef(restaurantId) {
  return restaurantsRef.doc(restaurantId);
}

export function getReviewRef(reviewId) {
  return reviewsRef.doc(reviewId);
}

// Storage helper functions
export function generatePhotoPath(restaurantId, fileName) {
  return `restaurant-photos/${restaurantId}/${Date.now()}_${fileName}`;
}

export function generateReviewPhotoPath(reviewId, fileName) {
  return `review-photos/${reviewId}/${Date.now()}_${fileName}`;
}

export async function getDownloadURL(filePath) {
  try {
    const ref = storage.ref(filePath);
    return await ref.getDownloadURL();
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function uploadFile(file, path, metadata = {}) {
  try {
    const ref = storage.ref(path);
    const uploadTask = ref.put(file, {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        ...metadata
      }
    });

    // Return promise that resolves with download URL
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Progress monitoring can be added here
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress.toFixed(1)}%`);
        },
        (error) => {
          handleError(error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
            resolve(downloadURL);
          } catch (error) {
            handleError(error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function deleteFile(filePath) {
  try {
    const ref = storage.ref(filePath);
    await ref.delete();
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

// Error handling system
export function handleError(error) {
  console.error('🔥 Firebase Error:', error);

  const errorMessages = {
    'permission-denied': 'Você não tem permissão para realizar esta operação.',
    'unavailable': 'Serviço temporariamente indisponível. Tente novamente.',
    'network-request-failed': 'Erro de conexão. Verifique sua internet.',
    'unauthenticated': 'Você precisa estar autenticado para realizar esta operação.',
    'invalid-argument': 'Argumento inválido. Verifique os dados informados.',
    'not-found': 'Recurso não encontrado.',
    'already-exists': 'Este recurso já existe.',
    'deadline-exceeded': 'Operação excedeu o tempo limite.',
    'resource-exhausted': 'Cota do Firebase excedida. Tente novamente mais tarde.',
    'cancelled': 'Operação cancelada.',
    'unknown': 'Erro desconhecido. Tente novamente.',
    'default': 'Ocorreu um erro inesperado. Tente novamente.'
  };

  const message = errorMessages[error.code] || errorMessages.default;

  // Show user-friendly error message
  showUserError(message);

  // Log technical details for debugging
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  // Implement retry logic for recoverable errors
  if (isRecoverable(error)) {
    console.log('🔄 Recoverable error, scheduling retry...');
    setTimeout(() => {
      if (error.operation) {
        retryOperation(error.operation);
      }
    }, 2000);
  }

  return error;
}

// User error display function
function showUserError(message) {
  // Create or update error display element
  let errorDiv = document.getElementById('firebase-error-display');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'firebase-error-display';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #e74c3c;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(errorDiv);
  }

  errorDiv.textContent = message;
  errorDiv.style.display = 'block';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorDiv.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 300);
  }, 5000);
}

// Helper functions for error handling
function isRecoverable(error) {
  const recoverableCodes = [
    'network-request-failed',
    'unavailable',
    'deadline-exceeded',
    'resource-exhausted'
  ];
  return recoverableCodes.includes(error.code);
}

function retryOperation(operation) {
  if (typeof operation === 'function') {
    try {
      operation();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  }
}

// Connection state monitoring
export function setupConnectionMonitoring() {
  const connectionIndicator = document.getElementById('connection-status');
  const statusText = document.getElementById('status-text') || {};

  // Monitor Firestore connection state
  db.onSnapshotsInSync(() => {
    updateConnectionStatus(true);
  });

  // Monitor online/offline status
  window.addEventListener('online', () => {
    updateConnectionStatus(true);
  });

  window.addEventListener('offline', () => {
    updateConnectionStatus(false);
  });

  function updateConnectionStatus(isOnline) {
    if (connectionIndicator) {
      if (isOnline) {
        connectionIndicator.className = 'alert alert-success text-center';
        if (statusText.textContent) {
          statusText.textContent = '✅ Conectado ao Firebase';
        }
      } else {
        connectionIndicator.className = 'alert alert-warning text-center';
        if (statusText.textContent) {
          statusText.textContent = '⚠️ Offline - Modo offline ativado';
        }
      }
    }
  }

  // Initial status check
  updateConnectionStatus(navigator.onLine);
}

// Batch operations for better performance
export async function batchUpdateRestaurants(updates) {
  const batch = db.batch();

  updates.forEach(({ restaurantId, data }) => {
    const ref = getRestaurantRef(restaurantId);
    batch.update(ref, {
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  });

  try {
    await batch.commit();
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

// Export all services and utilities
export { db, storage, auth, firebase };

// Add CSS animations for error messages
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize connection monitoring when module loads
document.addEventListener('DOMContentLoaded', () => {
  setupConnectionMonitoring();
});