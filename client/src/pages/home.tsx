import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { UtensilsCrossed, Store, Star, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RestaurantCard from "@/components/restaurant-card";
import RestaurantModal from "@/components/restaurant-modal";
import AddRestaurantModal from "@/components/add-restaurant-modal";
import type { RestaurantWithStats } from "@shared/schema";

export default function Home() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantWithStats | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    minQuality: "",
    priceRange: "",
    foodOptions: "",
    bureaucracy: "",
  });

  const { data: restaurants = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/restaurants"],
  }) as { data: RestaurantWithStats[], isLoading: boolean, refetch: () => void };

  const filteredRestaurants = restaurants.filter((restaurant: RestaurantWithStats) => {
    if (filters.minQuality && filters.minQuality !== "all" && restaurant.averageQuality < parseFloat(filters.minQuality)) {
      return false;
    }
    
    if (filters.priceRange && filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split("-").map(p => parseFloat(p));
      if (max && (restaurant.averagePrice < min || restaurant.averagePrice > max)) {
        return false;
      } else if (!max && restaurant.averagePrice < min) {
        return false;
      }
    }
    
    if (filters.foodOptions && filters.foodOptions !== "all" && restaurant.mostCommonFoodOptions !== filters.foodOptions) {
      return false;
    }
    
    if (filters.bureaucracy && filters.bureaucracy !== "all" && restaurant.averageBureaucracy < parseFloat(filters.bureaucracy)) {
      return false;
    }
    
    return true;
  });

  const stats = {
    restaurantCount: restaurants.length,
    averageRating: restaurants.length > 0 
      ? (restaurants.reduce((sum: number, r: RestaurantWithStats) => sum + r.averageQuality, 0) / restaurants.length).toFixed(1)
      : "0.0",
    reviewCount: restaurants.reduce((sum: number, r: RestaurantWithStats) => sum + r.reviewCount, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <UtensilsCrossed className="text-primary text-2xl" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Restaurantes da Esplanada</h1>
                <p className="text-sm text-muted-foreground">Avaliações dos Ministérios</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-add-restaurant"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Restaurante
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Store className="text-primary text-2xl mr-3" />
                <div>
                  <p className="text-2xl font-bold" data-testid="text-restaurant-count">
                    {stats.restaurantCount}
                  </p>
                  <p className="text-muted-foreground">Restaurantes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="text-accent text-2xl mr-3" />
                <div>
                  <p className="text-2xl font-bold" data-testid="text-average-rating">
                    {stats.averageRating}
                  </p>
                  <p className="text-muted-foreground">Avaliação Média</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="text-secondary text-2xl mr-3" />
                <div>
                  <p className="text-2xl font-bold" data-testid="text-review-count">
                    {stats.reviewCount}
                  </p>
                  <p className="text-muted-foreground">Avaliações</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <Card className="border border-border mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Qualidade Mínima</label>
                <Select
                  value={filters.minQuality}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, minQuality: value }))}
                >
                  <SelectTrigger data-testid="select-min-quality">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="1">1+ estrelas</SelectItem>
                    <SelectItem value="2">2+ estrelas</SelectItem>
                    <SelectItem value="3">3+ estrelas</SelectItem>
                    <SelectItem value="4">4+ estrelas</SelectItem>
                    <SelectItem value="5">5 estrelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Faixa de Preço</label>
                <Select
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                >
                  <SelectTrigger data-testid="select-price-range">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="0-20">R$ 0 - R$ 20</SelectItem>
                    <SelectItem value="20-40">R$ 20 - R$ 40</SelectItem>
                    <SelectItem value="40-60">R$ 40 - R$ 60</SelectItem>
                    <SelectItem value="60">R$ 60+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Opções para Augusto</label>
                <Select
                  value={filters.foodOptions}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, foodOptions: value }))}
                >
                  <SelectTrigger data-testid="select-food-options">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="many">Muitas opções</SelectItem>
                    <SelectItem value="some">Algumas opções</SelectItem>
                    <SelectItem value="few">Poucas opções</SelectItem>
                    <SelectItem value="none">Nenhuma opção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Burocracia</label>
                <Select
                  value={filters.bureaucracy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, bureaucracy: value }))}
                >
                  <SelectTrigger data-testid="select-bureaucracy">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="1">Muito fácil (1★)</SelectItem>
                    <SelectItem value="2">Fácil (2★)</SelectItem>
                    <SelectItem value="3">Médio (3★)</SelectItem>
                    <SelectItem value="4">Difícil (4★)</SelectItem>
                    <SelectItem value="5">Muito difícil (5★)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                  <div className="h-3 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <UtensilsCrossed className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum restaurante encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {restaurants.length === 0 
                  ? "Ainda não há restaurantes cadastrados. Seja o primeiro a adicionar um!"
                  : "Tente ajustar os filtros para encontrar restaurantes."
                }
              </p>
              {restaurants.length === 0 && (
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Restaurante
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant: RestaurantWithStats) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={() => setSelectedRestaurant(restaurant)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedRestaurant && (
        <RestaurantModal
          restaurant={selectedRestaurant}
          isOpen={!!selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          onReviewAdded={() => {
            refetch();
            setSelectedRestaurant(null);
          }}
        />
      )}

      <AddRestaurantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onRestaurantAdded={() => {
          refetch();
          setShowAddModal(false);
        }}
      />
    </div>
  );
}
