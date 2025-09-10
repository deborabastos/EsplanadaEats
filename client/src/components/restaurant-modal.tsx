import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Star, DollarSign, Utensils, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import StarRating from "./star-rating";
import { PhotoUpload } from "./photo-upload";
import { PhotoLightbox } from "./photo-lightbox";
import type { RestaurantWithStats, InsertReview } from "@shared/schema";
import { insertReviewSchema } from "@shared/schema";

interface RestaurantModalProps {
  restaurant: RestaurantWithStats;
  isOpen: boolean;
  onClose: () => void;
  onReviewAdded: () => void;
}

function getFoodOptionsLabel(options: string) {
  switch (options) {
    case "many": return "Muitas";
    case "some": return "Algumas";
    case "few": return "Poucas";
    case "none": return "Nenhuma";
    default: return "Não avaliado";
  }
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${
        i < Math.floor(rating) ? "text-accent fill-accent" : "text-muted-foreground"
      }`}
    />
  ));
}

function formatDate(date: Date | string) {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - dateObj.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 7) return `${days} dias atrás`;
  if (days < 30) return `${Math.floor(days / 7)} semanas atrás`;
  return `${Math.floor(days / 30)} meses atrás`;
}

export default function RestaurantModal({ 
  restaurant, 
  isOpen, 
  onClose, 
  onReviewAdded 
}: RestaurantModalProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { toast } = useToast();

  const form = useForm<InsertReview>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: {
      restaurantId: restaurant.id,
      userName: "",
      price: 0,
      quality: 0,
      foodOptionsForAugusto: "many",
      bureaucracy: 0,
      comment: "",
      photos: [],
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: InsertReview) => {
      const response = await apiRequest("POST", `/api/restaurants/${restaurant.id}/reviews`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Avaliação enviada!",
        description: "Sua avaliação foi adicionada com sucesso.",
      });
      form.reset();
      setShowReviewForm(false);
      onReviewAdded();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a avaliação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertReview) => {
    createReviewMutation.mutate(data);
  };

  const openLightbox = (photos: string[], index: number = 0) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Get restaurant images from uploaded photos or fallback to placeholders
  const getRestaurantImages = () => {
    const allPhotos: string[] = [];
    
    // First add photos from the system review (initial restaurant photos)
    const systemReview = restaurant.reviews.find(review => review.userName === "Sistema");
    if (systemReview && systemReview.photos) {
      allPhotos.push(...systemReview.photos);
    }
    
    // Then add photos from other reviews
    restaurant.reviews.forEach(review => {
      if (review.userName !== "Sistema" && review.photos) {
        allPhotos.push(...review.photos);
      }
    });
    
    // If we have uploaded photos, use them (limit to 4 for hero section)
    if (allPhotos.length > 0) {
      return allPhotos.slice(0, 4);
    }
    
    // Fallback to placeholder images if no photos uploaded
    return [
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    ];
  };
  
  const restaurantImages = getRestaurantImages();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-restaurant-details">
        <DialogHeader className="sticky top-0 bg-card border-b border-border pb-4">
          <DialogTitle className="text-2xl font-bold" data-testid="text-modal-restaurant-name">
            {restaurant.name}
          </DialogTitle>
          {restaurant.operatingHours && (
            <p className="text-sm text-muted-foreground" data-testid="text-operating-hours">
              <Clock className="inline h-4 w-4 mr-1" />
              {restaurant.operatingHours}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Restaurant Images */}
          <div className={`grid gap-4 ${
            restaurantImages.length === 1 
              ? "grid-cols-1" 
              : restaurantImages.length === 2 
              ? "grid-cols-1 md:grid-cols-2" 
              : restaurantImages.length === 3
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-2 md:grid-cols-2"
          }`}>
            {restaurantImages.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`${restaurant.name} - Imagem ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg"
              />
            ))}
          </div>

          {/* Restaurant Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-muted">
              <CardContent className="p-4 text-center">
                <Star className="text-accent text-xl mx-auto mb-2" />
                <p className="text-2xl font-bold" data-testid="text-modal-restaurant-quality">
                  {restaurant.averageQuality.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Qualidade</p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted">
              <CardContent className="p-4 text-center">
                <DollarSign className="text-primary text-xl mx-auto mb-2" />
                <p className="text-2xl font-bold" data-testid="text-modal-restaurant-price">
                  R$ {restaurant.averagePrice.toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">Preço médio</p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted">
              <CardContent className="p-4 text-center">
                <Utensils className="text-secondary text-xl mx-auto mb-2" />
                <p className="text-lg font-bold">{getFoodOptionsLabel(restaurant.mostCommonFoodOptions)}</p>
                <p className="text-sm text-muted-foreground">Opções Augusto</p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted">
              <CardContent className="p-4 text-center">
                <Clock className="text-accent text-xl mx-auto mb-2" />
                <div className="flex justify-center mb-1">
                  {renderStars(restaurant.averageBureaucracy)}
                </div>
                <p className="text-sm text-muted-foreground">Acesso</p>
              </CardContent>
            </Card>
          </div>

          {/* Add Review Section */}
          {!showReviewForm ? (
            <Card className="bg-muted">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">Adicionar Avaliação</h3>
                <p className="text-muted-foreground mb-4">
                  Compartilhe sua experiência neste restaurante
                </p>
                <Button 
                  onClick={() => setShowReviewForm(true)}
                  data-testid="button-add-review"
                >
                  Avaliar Restaurante
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Adicionar Avaliação</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                    data-testid="button-cancel-review"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="userName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seu nome *</FormLabel>
                            <FormControl>
                              <Input placeholder="Digite seu nome" {...field} data-testid="input-reviewer-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço pago (R$) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-review-price"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qualidade *</FormLabel>
                            <FormControl>
                              <StarRating
                                value={field.value}
                                onChange={field.onChange}
                                data-testid="rating-quality"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bureaucracy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Acesso (0 a 5 estrelas) *</FormLabel>
                            <FormControl>
                              <StarRating
                                value={field.value}
                                onChange={field.onChange}
                                data-testid="rating-bureaucracy"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="foodOptionsForAugusto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opções alimentares para Augusto *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-food-options-review">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="many">Muitas opções</SelectItem>
                              <SelectItem value="some">Algumas opções</SelectItem>
                              <SelectItem value="few">Poucas opções</SelectItem>
                              <SelectItem value="none">Nenhuma opção</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comentário (opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Conte sobre sua experiência..."
                              className="h-24 resize-none"
                              {...field}
                              data-testid="textarea-review-comment"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="photos"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <PhotoUpload
                              photos={field.value || []}
                              onPhotosChange={field.onChange}
                              maxPhotos={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createReviewMutation.isPending}
                      data-testid="button-submit-review"
                    >
                      {createReviewMutation.isPending ? "Enviando..." : "Enviar Avaliação"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4" data-testid="text-reviews-title">
              Avaliações ({restaurant.reviewCount})
            </h3>
            
            {restaurant.reviews.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Ainda não há avaliações para este restaurante.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {restaurant.reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold" data-testid={`text-review-author-${review.id}`}>
                            {review.userName}
                          </h4>
                          <span className="text-sm text-muted-foreground" data-testid={`text-review-date-${review.id}`}>
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Qualidade:</span>
                            <div className="flex items-center ml-1">
                              {renderStars(review.quality)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Preço:</span>
                            <span className="ml-1 font-medium" data-testid={`text-review-price-${review.id}`}>
                              R$ {review.price}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Augusto:</span>
                            <span className="ml-1 font-medium text-secondary">
                              {getFoodOptionsLabel(review.foodOptionsForAugusto)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Acesso:</span>
                            <div className="flex items-center ml-1">
                              {renderStars(review.bureaucracy)}
                            </div>
                          </div>
                        </div>
                        
                        {review.comment && (
                          <p className="text-muted-foreground mb-3" data-testid={`text-review-comment-${review.id}`}>
                            {review.comment}
                          </p>
                        )}
                        
                        {review.photos && review.photos.length > 0 && (
                          <div className="flex space-x-2">
                            {review.photos.slice(0, 3).map((photo, index) => (
                              <button
                                key={index}
                                onClick={() => openLightbox(review.photos || [], index)}
                                className="w-20 h-20 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                                data-testid={`review-photo-${review.id}-${index}`}
                              >
                                <img
                                  src={photo}
                                  alt={`Foto da avaliação ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                            {review.photos.length > 3 && (
                              <button
                                onClick={() => openLightbox(review.photos || [], 3)}
                                className="w-20 h-20 rounded-lg bg-black/20 flex items-center justify-center text-white text-sm font-medium hover:bg-black/30 transition-colors"
                                data-testid={`review-photos-more-${review.id}`}
                              >
                                +{review.photos.length - 3}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      
      <PhotoLightbox
        photos={lightboxPhotos}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />
    </Dialog>
  );
}
