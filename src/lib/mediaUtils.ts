import { MediaMeta, MediaType, QCResult } from '@/types/media';
import { SCREEN_DIMENSIONS, ACCEPTED_FILE_TYPES } from './constants';

export function isValidFileType(file: File): boolean {
  const allTypes = [...ACCEPTED_FILE_TYPES.image, ...ACCEPTED_FILE_TYPES.video];
  return allTypes.some(type => type === file.type);
}

export function getMediaType(file: File): MediaType | null {
  if (ACCEPTED_FILE_TYPES.image.some(type => type === file.type)) return 'image';
  if (ACCEPTED_FILE_TYPES.video.some(type => type === file.type)) return 'video';
  return null;
}

export async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
}

export async function getVideoDimensions(url: string): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration
      });
    };
    video.onerror = reject;
    video.src = url;
  });
}

export async function getMediaDimensions(file: File, url: string): Promise<MediaMeta> {
  const type = getMediaType(file);
  
  if (!type) {
    throw new Error('Invalid file type');
  }
  
  let dimensions: { width: number; height: number; duration?: number };
  
  if (type === 'image') {
    dimensions = await getImageDimensions(url);
  } else {
    dimensions = await getVideoDimensions(url);
  }
  
  return {
    url,
    type,
    width: dimensions.width,
    height: dimensions.height,
    fileName: file.name,
    fileSize: file.size,
    duration: dimensions.duration
  };
}

export function performQC(media: MediaMeta): QCResult {
  const expectedWidth = SCREEN_DIMENSIONS.totalWidth;
  const expectedHeight = SCREEN_DIMENSIONS.totalHeight;
  
  const dimensionsMatch = media.width === expectedWidth && media.height === expectedHeight;
  const expectedAspectRatio = expectedWidth / expectedHeight;
  const actualAspectRatio = media.width / media.height;
  const aspectRatioMatch = Math.abs(expectedAspectRatio - actualAspectRatio) < 0.01;
  
  let message = '';
  
  if (dimensionsMatch) {
    message = '✅ Perfect! Dimensions match exactly.';
  } else if (aspectRatioMatch) {
    message = `⚠️ Aspect ratio is correct but resolution differs. Expected ${expectedWidth}x${expectedHeight}, got ${media.width}x${media.height}`;
  } else {
    message = `❌ Dimensions mismatch. Expected ${expectedWidth}x${expectedHeight}, got ${media.width}x${media.height}`;
  }
  
  return {
    dimensionsMatch,
    aspectRatioMatch,
    details: {
      expectedWidth,
      expectedHeight,
      actualWidth: media.width,
      actualHeight: media.height,
      message
    }
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
