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
  screenValidation?: ScreenValidationResult;
}

export interface ScreenValidationResult {
  validated: boolean;
  timestamp: Date;
  overallValid: boolean;
  confidence: number;
  regions: {
    full?: RegionValidation;
    center?: RegionValidation;
    pillar1?: RegionValidation;
    pillar2?: RegionValidation;
    pillar3?: RegionValidation;
    pillar4?: RegionValidation;
  };
  summary: {
    totalIssues: number;
    criticalIssues: string[];
    suggestions: string[];
  };
}

export interface RegionValidation {
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
  textTranscription?: string;
  contentAnalysis: {
    hasText: boolean;
    textReadability?: string;
    hasGraphics: boolean;
    colorContrast?: string;
    layoutIssues?: string[];
    spellingErrors?: string[];
    grammarIssues?: string[];
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
