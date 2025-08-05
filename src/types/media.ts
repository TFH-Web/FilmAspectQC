export type MediaType = 'image' | 'video';

export interface MediaMeta {
  url: string;
  type: MediaType;
  width: number;
  height: number;
  fileName: string;
  fileSize: number;
  duration?: number; // For videos
}

export interface QCResult {
  dimensionsMatch: boolean;
  aspectRatioMatch: boolean;
  hasContentInPillars?: boolean;
  details: {
    expectedWidth: number;
    expectedHeight: number;
    actualWidth: number;
    actualHeight: number;
    message: string;
  };
}
