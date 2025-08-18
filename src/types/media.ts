export type MediaType = 'image' | 'video';

export interface MediaMeta {
  id?: string; // Storage ID for IndexedDB
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

// New types for batch upload support
export interface BatchMediaItem {
  file: File;
  media: MediaMeta;
  qcResult: QCResult;
  status: 'processing' | 'completed' | 'error';
  error?: string;
}

export interface BatchQCResult {
  totalFiles: number;
  passedFiles: number;
  failedFiles: number;
  items: BatchMediaItem[];
  summary: {
    allPassed: boolean;
    commonIssues: string[];
    recommendations: string[];
  };
}
