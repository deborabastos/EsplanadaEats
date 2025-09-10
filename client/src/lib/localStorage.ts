// Local storage utilities for restaurant data
const STORAGE_KEYS = {
  RESTAURANTS: "esplanada_restaurants",
  REVIEWS: "esplanada_reviews",
} as const;

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

export function addStoredRestaurant(restaurant: StoredRestaurant): void {
  const restaurants = getStoredRestaurants();
  restaurants.push(restaurant);
  setStoredRestaurants(restaurants);
}

export function addStoredReview(review: StoredReview): void {
  const reviews = getStoredReviews();
  reviews.push(review);
  setStoredReviews(reviews);
}

export function clearAllStoredData(): void {
  localStorage.removeItem(STORAGE_KEYS.RESTAURANTS);
  localStorage.removeItem(STORAGE_KEYS.REVIEWS);
}
