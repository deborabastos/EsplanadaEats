import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import StarRating from "./star-rating";
import { PhotoUpload } from "@/components/photo-upload";
import type { InsertRestaurant } from "@shared/schema";
import { insertRestaurantSchema } from "@shared/schema";

interface AddRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestaurantAdded: () => void;
}

export default function AddRestaurantModal({ 
  isOpen, 
  onClose, 
  onRestaurantAdded 
}: AddRestaurantModalProps) {
  const { toast } = useToast();

  const form = useForm<InsertRestaurant>({
    resolver: zodResolver(insertRestaurantSchema),
    defaultValues: {
      name: "",
      initialPrice: 0,
      initialQuality: 0,
      initialFoodOptionsForAugusto: "many",
      initialBureaucracy: 0,
      photos: [],
    },
  });

  const createRestaurantMutation = useMutation({
    mutationFn: async (data: InsertRestaurant) => {
      const response = await apiRequest("POST", "/api/restaurants", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Restaurante adicionado!",
        description: "O restaurante foi cadastrado com sucesso.",
      });
      form.reset();
      onClose();
      onRestaurantAdded();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o restaurante. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertRestaurant) => {
    createRestaurantMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-add-restaurant">
        <DialogHeader className="sticky top-0 bg-card border-b border-border pb-4">
          <DialogTitle className="text-2xl font-bold">Adicionar Novo Restaurante</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Restaurante *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Pizzaria do João" 
                      {...field} 
                      data-testid="input-restaurant-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initialPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço médio (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-restaurant-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualidade *</FormLabel>
                    <FormControl>
                      <div className="py-2">
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                          data-testid="rating-new-quality"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initialFoodOptionsForAugusto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opções alimentares para Augusto *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-food-options-new">
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
                name="initialBureaucracy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Burocracia para entrar *</FormLabel>
                    <FormControl>
                      <div className="py-2">
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                          data-testid="rating-new-bureaucracy"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="photos"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PhotoUpload
                      photos={field.value || []}
                      onPhotosChange={field.onChange}
                      maxPhotos={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={handleClose}
                data-testid="button-cancel-add-restaurant"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createRestaurantMutation.isPending}
                data-testid="button-submit-add-restaurant"
              >
                {createRestaurantMutation.isPending ? "Adicionando..." : "Adicionar Restaurante"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
