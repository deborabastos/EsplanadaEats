import { z } from "zod";

export const restaurants = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
});

export const reviews = z.object({
  id: z.string(),
  restaurantId: z.string(),
  userName: z.string(),
  price: z.number(),
  quality: z.number().min(0).max(5),
  foodOptionsForAugusto: z.enum(["many", "some", "few", "none"]),
  bureaucracy: z.number().min(0).max(5),
  comment: z.string().optional(),
  photos: z.array(z.string()).optional(),
  createdAt: z.date(),
});

export const insertRestaurantSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  initialPrice: z.number().min(0, "Preço deve ser positivo"),
  initialQuality: z.number().min(0).max(5),
  initialFoodOptionsForAugusto: z.enum(["many", "some", "few", "none"]),
  initialBureaucracy: z.number().min(0).max(5),
  photos: z.array(z.string()).optional(),
});

export const insertReviewSchema = z.object({
  restaurantId: z.string(),
  userName: z.string().min(1, "Nome é obrigatório"),
  price: z.number().min(0, "Preço deve ser positivo"),
  quality: z.number().min(0).max(5),
  foodOptionsForAugusto: z.enum(["many", "some", "few", "none"]),
  bureaucracy: z.number().min(0).max(5),
  comment: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export type Restaurant = z.infer<typeof restaurants>;
export type Review = z.infer<typeof reviews>;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export interface RestaurantWithStats extends Restaurant {
  averagePrice: number;
  averageQuality: number;
  averageBureaucracy: number;
  mostCommonFoodOptions: string;
  reviewCount: number;
  reviews: Review[];
}
