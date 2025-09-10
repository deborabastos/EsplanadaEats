import { type Restaurant, type Review, type InsertRestaurant, type InsertReview, type RestaurantWithStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Restaurant methods
  getRestaurants(): Promise<RestaurantWithStats[]>;
  getRestaurant(id: string): Promise<RestaurantWithStats | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  
  // Review methods
  getReviewsForRestaurant(restaurantId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class MemStorage implements IStorage {
  private restaurants: Map<string, Restaurant>;
  private reviews: Map<string, Review>;

  constructor() {
    this.restaurants = new Map();
    this.reviews = new Map();
  }

  async getRestaurants(): Promise<RestaurantWithStats[]> {
    const restaurantList = Array.from(this.restaurants.values());
    const restaurantsWithStats: RestaurantWithStats[] = [];

    for (const restaurant of restaurantList) {
      const reviews = Array.from(this.reviews.values()).filter(
        review => review.restaurantId === restaurant.id
      );

      if (reviews.length === 0) {
        restaurantsWithStats.push({
          ...restaurant,
          averagePrice: 0,
          averageQuality: 0,
          averageBureaucracy: 0,
          mostCommonFoodOptions: "none",
          reviewCount: 0,
          reviews: [],
        });
        continue;
      }

      const averagePrice = reviews.reduce((sum, review) => sum + review.price, 0) / reviews.length;
      const averageQuality = reviews.reduce((sum, review) => sum + review.quality, 0) / reviews.length;
      const averageBureaucracy = reviews.reduce((sum, review) => sum + review.bureaucracy, 0) / reviews.length;

      // Find most common food options
      const foodOptionsCount = reviews.reduce((acc, review) => {
        acc[review.foodOptionsForAugusto] = (acc[review.foodOptionsForAugusto] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonFoodOptions = Object.entries(foodOptionsCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || "none";

      restaurantsWithStats.push({
        ...restaurant,
        averagePrice: Math.round(averagePrice * 100) / 100,
        averageQuality: Math.round(averageQuality * 10) / 10,
        averageBureaucracy: Math.round(averageBureaucracy * 10) / 10,
        mostCommonFoodOptions,
        reviewCount: reviews.length,
        reviews,
      });
    }

    return restaurantsWithStats.sort((a, b) => b.averageQuality - a.averageQuality);
  }

  async getRestaurant(id: string): Promise<RestaurantWithStats | undefined> {
    const restaurant = this.restaurants.get(id);
    if (!restaurant) return undefined;

    const reviews = Array.from(this.reviews.values()).filter(
      review => review.restaurantId === restaurant.id
    );

    if (reviews.length === 0) {
      return {
        ...restaurant,
        averagePrice: 0,
        averageQuality: 0,
        averageBureaucracy: 0,
        mostCommonFoodOptions: "none",
        reviewCount: 0,
        reviews: [],
      };
    }

    const averagePrice = reviews.reduce((sum, review) => sum + review.price, 0) / reviews.length;
    const averageQuality = reviews.reduce((sum, review) => sum + review.quality, 0) / reviews.length;
    const averageBureaucracy = reviews.reduce((sum, review) => sum + review.bureaucracy, 0) / reviews.length;

    // Find most common food options
    const foodOptionsCount = reviews.reduce((acc, review) => {
      acc[review.foodOptionsForAugusto] = (acc[review.foodOptionsForAugusto] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonFoodOptions = Object.entries(foodOptionsCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "none";

    return {
      ...restaurant,
      averagePrice: Math.round(averagePrice * 100) / 100,
      averageQuality: Math.round(averageQuality * 10) / 10,
      averageBureaucracy: Math.round(averageBureaucracy * 10) / 10,
      mostCommonFoodOptions,
      reviewCount: reviews.length,
      reviews: reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    };
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = randomUUID();
    const restaurant: Restaurant = {
      id,
      name: insertRestaurant.name,
      createdAt: new Date(),
    };
    
    this.restaurants.set(id, restaurant);

    // Create initial review with the provided data
    const initialReview: Review = {
      id: randomUUID(),
      restaurantId: id,
      userName: "Sistema",
      price: insertRestaurant.initialPrice,
      quality: insertRestaurant.initialQuality,
      foodOptionsForAugusto: insertRestaurant.initialFoodOptionsForAugusto,
      bureaucracy: insertRestaurant.initialBureaucracy,
      comment: "Avaliação inicial do restaurante",
      photos: insertRestaurant.photos || [],
      createdAt: new Date(),
    };

    this.reviews.set(initialReview.id, initialReview);

    return restaurant;
  }

  async getReviewsForRestaurant(restaurantId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.restaurantId === restaurantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    
    this.reviews.set(id, review);
    return review;
  }
}

export const storage = new MemStorage();
