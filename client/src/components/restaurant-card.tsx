import { Star, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RestaurantWithStats } from "@shared/schema";

interface RestaurantCardProps {
  restaurant: RestaurantWithStats;
  onClick: () => void;
}

function getFoodOptionsLabel(options: string) {
  switch (options) {
    case "many": return "Muitas opções";
    case "some": return "Algumas opções";
    case "few": return "Poucas opções";
    case "none": return "Nenhuma opção";
    default: return "Não avaliado";
  }
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-3 w-3 ${
        i < Math.floor(rating) ? "text-accent fill-accent" : "text-muted-foreground"
      }`}
    />
  ));
}

export default function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  // Get photo prioritizing restaurant photos, then review photos, then placeholders
  const getRestaurantImage = () => {
    // First try to find a photo from the restaurant's initial review (sistema review)
    const systemReview = restaurant.reviews.find(review => review.userName === "Sistema");
    if (systemReview && systemReview.photos && systemReview.photos.length > 0) {
      return systemReview.photos[0];
    }
    
    // Then try to find a photo from any other review with photos
    for (const review of restaurant.reviews) {
      if (review.userName !== "Sistema" && review.photos && review.photos.length > 0) {
        return review.photos[0];
      }
    }
    
    // Fall back to placeholder images if no photos uploaded
    const placeholderUrls = [
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
      "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
    ];
    
    const imageIndex = restaurant.name.length % placeholderUrls.length;
    return placeholderUrls[imageIndex];
  };

  const imageUrl = getRestaurantImage();

  return (
    <Card 
      className="overflow-hidden border border-border hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
      data-testid={`card-restaurant-${restaurant.id}`}
    >
      <img
        src={imageUrl}
        alt={restaurant.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold" data-testid={`text-restaurant-name-${restaurant.id}`}>
            {restaurant.name}
          </h3>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-accent fill-accent" />
            <span className="text-sm font-medium" data-testid={`text-restaurant-rating-${restaurant.id}`}>
              {restaurant.averageQuality.toFixed(1)}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Preço médio:</span>
            <span className="font-medium ml-1" data-testid={`text-restaurant-price-${restaurant.id}`}>
              R$ {restaurant.averagePrice.toFixed(0)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Burocracia:</span>
            <div className="flex items-center ml-1">
              {renderStars(restaurant.averageBureaucracy)}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <span className="text-sm text-muted-foreground">Opções p/ Augusto:</span>
          <span className="ml-1 text-sm font-medium text-secondary" data-testid={`text-restaurant-food-options-${restaurant.id}`}>
            {getFoodOptionsLabel(restaurant.mostCommonFoodOptions)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground" data-testid={`text-restaurant-review-count-${restaurant.id}`}>
            {restaurant.reviewCount} avaliações
          </span>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0">
            Ver detalhes <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
