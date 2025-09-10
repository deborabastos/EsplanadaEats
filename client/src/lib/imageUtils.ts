/**
 * Image utility functions for compression and validation
 */

export interface CompressedImage {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeKB?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 800,
  maxHeight: 600,
  maxSizeKB: 200, // 200KB max for localStorage compatibility
  quality: 0.8,
};

/**
 * Compresses an image file to meet size and dimension constraints
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImage> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context não está disponível'));
      return;
    }
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      const { width: newWidth, height: newHeight } = calculateDimensions(
        img.width,
        img.height,
        config.maxWidth,
        config.maxHeight
      );
      
      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Draw and compress image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Try different quality levels to meet size requirement
      let quality = config.quality;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      let attempts = 0;
      const maxAttempts = 5;
      
      // Reduce quality until we meet size requirement or hit minimum
      while (getDataUrlSizeKB(dataUrl) > config.maxSizeKB && attempts < maxAttempts && quality > 0.1) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        attempts++;
      }
      
      const finalSizeKB = getDataUrlSizeKB(dataUrl);
      
      // If still too large, reject
      if (finalSizeKB > config.maxSizeKB) {
        reject(new Error(`Não foi possível comprimir a imagem para menos de ${config.maxSizeKB}KB. Tamanho final: ${finalSizeKB}KB`));
        return;
      }
      
      resolve({
        dataUrl,
        originalSize: file.size,
        compressedSize: finalSizeKB * 1024,
        width: newWidth,
        height: newHeight,
      });
    };
    
    img.onerror = () => {
      reject(new Error('Erro ao carregar a imagem'));
    };
    
    // Load the image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      }
    };
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Calculates new dimensions maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight };
  
  // Scale down if larger than max dimensions
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Gets the size of a data URL in KB
 */
function getDataUrlSizeKB(dataUrl: string): number {
  // Base64 encoding adds ~33% overhead, but data URL has additional prefix
  // More accurate calculation: remove data URL prefix and calculate actual base64 size
  const base64String = dataUrl.split(',')[1] || '';
  const bytes = (base64String.length * 3) / 4;
  return bytes / 1024;
}

/**
 * Validates if a file is a valid image
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Arquivo deve ser uma imagem válida (PNG, JPG, JPEG, etc.)' };
  }
  
  // Check file size (max 10MB for processing)
  const maxSizeMB = 10;
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { isValid: false, error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB` };
  }
  
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    return { isValid: false, error: 'Formato não suportado. Use: JPG, PNG, GIF, WebP ou BMP' };
  }
  
  return { isValid: true };
}

/**
 * Batch compress multiple images
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<{ 
  successful: CompressedImage[]; 
  failed: Array<{ file: File; error: string }> 
}> {
  const successful: CompressedImage[] = [];
  const failed: Array<{ file: File; error: string }> = [];
  
  for (const file of files) {
    try {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        failed.push({ file, error: validation.error || 'Arquivo inválido' });
        continue;
      }
      
      const compressed = await compressImage(file, options);
      successful.push(compressed);
    } catch (error) {
      failed.push({ 
        file, 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao processar imagem' 
      });
    }
  }
  
  return { successful, failed };
}