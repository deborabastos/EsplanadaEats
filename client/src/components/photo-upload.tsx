import { useState, useRef } from "react";
import { Upload, X, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { compressImages, validateImageFile, type CompressedImage } from "@/lib/imageUtils";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  maxSizeBytes?: number;
}

export function PhotoUpload({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 5, 
  maxSizeBytes = 10 * 1024 * 1024 // 10MB for processing, will be compressed to 200KB 
}: PhotoUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();


  const handleFiles = async (files: FileList) => {
    if (isProcessing) return;
    
    const fileArray = Array.from(files);
    
    // Check total count first
    if (photos.length + fileArray.length > maxPhotos) {
      toast({
        title: "Muitas fotos",
        description: `Máximo de ${maxPhotos} fotos permitidas. Você pode adicionar ${maxPhotos - photos.length} foto(s).`,
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Filter files that are too large before processing
      const validSizeFiles = fileArray.filter(file => {
        if (file.size > maxSizeBytes) {
          toast({
            title: "Arquivo muito grande",
            description: `${file.name} é muito grande (${(file.size / (1024 * 1024)).toFixed(1)}MB). Máximo: ${maxSizeBytes / (1024 * 1024)}MB`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });
      
      if (validSizeFiles.length === 0) {
        setIsProcessing(false);
        return;
      }
      
      // Compress images
      const { successful, failed } = await compressImages(validSizeFiles, {
        maxWidth: 800,
        maxHeight: 600,
        maxSizeKB: 200,
        quality: 0.8
      });
      
      // Show errors for failed compressions
      failed.forEach(({ file, error }) => {
        toast({
          title: "Erro ao processar imagem",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        });
      });
      
      // Add successful compressions
      if (successful.length > 0) {
        const newPhotos = successful.map(img => img.dataUrl);
        onPhotosChange([...photos, ...newPhotos]);
        
        toast({
          title: "Fotos adicionadas",
          description: `${successful.length} foto(s) processada(s) e adicionada(s) com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar as imagens. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Fotos (opcional)</label>
      
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removePhoto(index)}
                data-testid={`button-remove-photo-${index}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : isProcessing
              ? 'border-muted-foreground bg-muted'
              : 'border-input hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={isProcessing ? undefined : openFileDialog}
          data-testid="photo-upload-area"
        >
          {isProcessing ? (
            <Loader2 className="mx-auto h-10 w-10 text-muted-foreground mb-3 animate-spin" />
          ) : photos.length === 0 ? (
            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          ) : (
            <Image className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          )}
          <p className="text-muted-foreground mb-2">
            {isProcessing
              ? "Processando imagens..."
              : photos.length === 0 
              ? "Clique para adicionar fotos ou arraste aqui"
              : `Adicionar mais fotos (${photos.length}/${maxPhotos})`
            }
          </p>
          <p className="text-sm text-muted-foreground">
            {isProcessing
              ? "Comprimindo e redimensionando para melhor performance"
              : `PNG, JPG até ${maxSizeBytes / (1024 * 1024)}MB cada (serão comprimidas para 200KB)`
            }
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
            disabled={isProcessing}
            data-testid="photo-upload-input"
          />
        </div>
      )}
    </div>
  );
}