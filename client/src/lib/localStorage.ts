// Local storage utilities for restaurant data
const STORAGE_KEYS = {
  RESTAURANTS: "esplanada_restaurants",
  REVIEWS: "esplanada_reviews",
  VERSION: "esplanada_version",
} as const;

// Version for data migration
const CURRENT_VERSION = "1.0.0";

export interface StoredRestaurant {
  id: string;
  name: string;
  createdAt: string;
}

export interface StoredReview {
  id: string;
  restaurantId: string;
  userName: string;
  price: number;
  quality: number;
  foodOptionsForAugusto: "many" | "some" | "few" | "none";
  bureaucracy: number;
  comment?: string;
  photos?: string[];
  createdAt: string;
}

export function getStoredRestaurants(): StoredRestaurant[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting stored restaurants:", error);
    return [];
  }
}

export function setStoredRestaurants(restaurants: StoredRestaurant[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
  } catch (error) {
    console.error("Error storing restaurants:", error);
  }
}

export function getStoredReviews(): StoredReview[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting stored reviews:", error);
    return [];
  }
}

export function setStoredReviews(reviews: StoredReview[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  } catch (error) {
    console.error("Error storing reviews:", error);
  }
}

export function addStoredRestaurant(restaurant: StoredRestaurant): { success: boolean; error?: string } {
  try {
    const storageCheck = checkStorageSpace();
    if (!storageCheck.available) {
      return { 
        success: false, 
        error: `Armazenamento quase cheio (${storageCheck.percentageUsed.toFixed(1)}%). Remova alguns restaurantes primeiro.` 
      };
    }
    
    const restaurants = getStoredRestaurants();
    restaurants.push(restaurant);
    setStoredRestaurants(restaurants);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao salvar restaurante. Tente novamente.' };
  }
}

export function addStoredReview(review: StoredReview): { success: boolean; error?: string } {
  try {
    // Validate photos if present
    if (review.photos && review.photos.length > 0) {
      const photoValidation = validatePhotoData(review.photos);
      if (!photoValidation.isValid) {
        return { success: false, error: photoValidation.error };
      }
    }
    
    const storageCheck = checkStorageSpace();
    if (!storageCheck.available) {
      return { 
        success: false, 
        error: `Armazenamento quase cheio (${storageCheck.percentageUsed.toFixed(1)}%). Remova algumas fotos primeiro.` 
      };
    }
    
    const reviews = getStoredReviews();
    reviews.push(review);
    setStoredReviews(reviews);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao salvar avaliação. Tente novamente.' };
  }
}

export function clearAllStoredData(): void {
  localStorage.removeItem(STORAGE_KEYS.RESTAURANTS);
  localStorage.removeItem(STORAGE_KEYS.REVIEWS);
  localStorage.removeItem(STORAGE_KEYS.VERSION);
}

// Validate localStorage quota and available space
export function checkStorageSpace(): {
  available: boolean;
  usedBytes: number;
  estimatedLimitBytes: number;
  percentageUsed: number;
} {
  try {
    const testKey = '__storage_test__';
    const testValue = 'x'.repeat(1024); // 1KB test
    
    // Test if we can write
    localStorage.setItem(testKey, testValue);
    localStorage.removeItem(testKey);
    
    // Estimate current usage
    let usedBytes = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        usedBytes += localStorage[key].length + key.length;
      }
    }
    
    // Most browsers have 5-10MB limit for localStorage
    const estimatedLimit = 5 * 1024 * 1024; // 5MB conservative estimate
    const percentageUsed = (usedBytes / estimatedLimit) * 100;
    
    return {
      available: percentageUsed < 90, // Consider full at 90%
      usedBytes,
      estimatedLimitBytes: estimatedLimit,
      percentageUsed
    };
  } catch (error) {
    return {
      available: false,
      usedBytes: 0,
      estimatedLimitBytes: 0,
      percentageUsed: 100
    };
  }
}

// Validate photo data before storage
export function validatePhotoData(photos: string[]): {
  isValid: boolean;
  error?: string;
  estimatedSizeBytes: number;
} {
  try {
    let totalSize = 0;
    
    for (const photo of photos) {
      if (!photo || typeof photo !== 'string') {
        return { isValid: false, error: 'Foto inválida encontrada', estimatedSizeBytes: 0 };
      }
      
      if (!photo.startsWith('data:image/')) {
        return { isValid: false, error: 'Formato de foto inválido', estimatedSizeBytes: 0 };
      }
      
      // Estimate size of base64 string
      const base64Data = photo.split(',')[1] || '';
      const sizeBytes = (base64Data.length * 3) / 4; // Base64 to bytes conversion
      totalSize += sizeBytes;
      
      // Check individual photo size (200KB limit)
      if (sizeBytes > 200 * 1024) {
        return { 
          isValid: false, 
          error: `Uma foto é muito grande (${(sizeBytes / 1024).toFixed(0)}KB). Máximo: 200KB`, 
          estimatedSizeBytes: totalSize 
        };
      }
    }
    
    // Check total size for this batch (1MB limit)
    if (totalSize > 1024 * 1024) {
      return { 
        isValid: false, 
        error: `Fotos muito grandes no total (${(totalSize / 1024 / 1024).toFixed(1)}MB). Máximo: 1MB por conjunto`, 
        estimatedSizeBytes: totalSize 
      };
    }
    
    return { isValid: true, estimatedSizeBytes: totalSize };
  } catch (error) {
    return { isValid: false, error: 'Erro ao validar fotos', estimatedSizeBytes: 0 };
  }
}

// Initialize storage with version check
export function initializeStorage(): boolean {
  try {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    
    if (!storedVersion || storedVersion !== CURRENT_VERSION) {
      // Migration or first time setup
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
      console.log('localStorage initialized with version', CURRENT_VERSION);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
}
