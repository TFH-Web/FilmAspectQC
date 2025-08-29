import { MediaMeta } from '@/types/media';

interface ScreenRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
}

export const SCREEN_REGIONS: Record<string, ScreenRegion> = {
  full: { x: 0, y: 0, width: 4140, height: 1080, name: 'Full Display' },
  center: { x: 720, y: 0, width: 2700, height: 1080, name: 'Center Screen' },
  pillar1: { x: 0, y: 0, width: 360, height: 1080, name: 'Pillar 1' },
  pillar2: { x: 360, y: 0, width: 360, height: 1080, name: 'Pillar 2' },
  pillar3: { x: 3420, y: 0, width: 360, height: 1080, name: 'Pillar 3' },
  pillar4: { x: 3780, y: 0, width: 360, height: 1080, name: 'Pillar 4' },
};

export async function captureScreenRegion(
  file: File,
  region: ScreenRegion
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = region.width;
    canvas.height = region.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to create canvas context'));
      return;
    }
    
    // Create a fresh URL from the original file to avoid UI overlays
    const url = URL.createObjectURL(file);
    
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Draw the entire image to canvas (no scaling needed for direct capture)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              resolve(base64.split(',')[1]); // Remove data:image/png;base64, prefix
            };
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png');
        
        // Clean up
        URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
      
    } else if (media.type === 'video') {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      
      video.onloadeddata = () => {
        video.currentTime = 1; // Capture at 1 second
      };
      
      video.onseeked = () => {
        // Calculate scaling to fit the media to 4140x1080
        const scaleX = 4140 / media.width;
        const scaleY = 1080 / media.height;
        
        // Draw the specific region
        ctx.drawImage(
          video,
          region.x / scaleX,
          region.y / scaleY,
          region.width / scaleX,
          region.height / scaleY,
          0,
          0,
          region.width,
          region.height
        );
        
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              resolve(base64.split(',')[1]); // Remove data:image/png;base64, prefix
            };
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png');
        
        // Clean up
        video.remove();
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video'));
      };
      
      video.src = media.url;
      
    } else {
      reject(new Error('Unsupported media type'));
    }
  });
}

export async function captureFullScreen(media: MediaMeta): Promise<string> {
  return captureScreenRegion(media, SCREEN_REGIONS.full);
}

export async function captureAllRegions(media: MediaMeta): Promise<Record<string, string>> {
  const captures: Record<string, string> = {};
  
  for (const [key, region] of Object.entries(SCREEN_REGIONS)) {
    try {
      captures[key] = await captureScreenRegion(media, region);
    } catch (error) {
      console.error(`Failed to capture ${key} region:`, error);
      captures[key] = '';
    }
  }
  
  return captures;
}

export async function captureFullImage(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      // Optimize: Resize large images to max 1920x1080 for faster processing
      const maxWidth = 1920;
      const maxHeight = 1080;
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }
      
      // Draw the resized image
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // Remove data:image/png;base64, prefix
          };
          reader.readAsDataURL(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/jpeg', 0.8); // Use JPEG with 80% quality for smaller file size
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

export function createPreviewCanvas(
  media: MediaMeta,
  scale = 0.2
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 4140 * scale;
  canvas.height = 1080 * scale;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }
  
  if (media.type === 'image') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    
    img.src = media.url;
  } else if (media.type === 'video') {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    
    video.onloadeddata = () => {
      video.currentTime = 1;
    };
    
    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      video.remove();
    };
    
    video.src = media.url;
  }
  
  return canvas;
}