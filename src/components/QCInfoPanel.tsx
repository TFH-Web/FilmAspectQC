'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { MediaMeta, QCResult } from '@/types/media';
import { formatFileSize, formatDuration } from '@/lib/mediaUtils';
import { SCREEN_DIMENSIONS } from '@/lib/constants';

interface QCInfoPanelProps {
  media: MediaMeta | null;
  qcResult: QCResult | null;
}

export function QCInfoPanel({ media, qcResult }: QCInfoPanelProps) {
  if (!media || !qcResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quality Control Results</CardTitle>
          <CardDescription>Upload media to see QC analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No media loaded</AlertTitle>
            <AlertDescription>
              Upload an image or video to check if it matches the stage display requirements.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  const getStatusIcon = () => {
    if (qcResult.dimensionsMatch) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    } else if (qcResult.aspectRatioMatch) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };
  
  const getStatusVariant = (): "default" | "destructive" | "outline" | "secondary" => {
    if (qcResult.dimensionsMatch) return "default";
    if (qcResult.aspectRatioMatch) return "secondary";
    return "destructive";
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quality Control Results</CardTitle>
          <Badge variant={getStatusVariant()}>
            {qcResult.dimensionsMatch ? 'PASS' : qcResult.aspectRatioMatch ? 'WARNING' : 'FAIL'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Alert */}
        <Alert variant={qcResult.dimensionsMatch ? "default" : "destructive"}>
          <div className="flex items-start space-x-2">
            {getStatusIcon()}
            <div className="flex-1">
              <AlertTitle className="text-sm font-medium">
                {qcResult.details.message}
              </AlertTitle>
            </div>
          </div>
        </Alert>
        
        {/* File Information */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">File Information</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">File Name</p>
              <p className="font-medium truncate">{media.fileName}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">File Size</p>
              <p className="font-medium">{formatFileSize(media.fileSize)}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Type</p>
              <p className="font-medium capitalize">{media.type}</p>
            </div>
            {media.duration && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Duration</p>
                <p className="font-medium">{formatDuration(media.duration)}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Dimensions Comparison */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dimensions Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm text-gray-600 dark:text-gray-400">Expected</span>
              <span className="font-mono text-sm font-medium">
                {qcResult.details.expectedWidth} × {qcResult.details.expectedHeight}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm text-gray-600 dark:text-gray-400">Actual</span>
              <span className="font-mono text-sm font-medium">
                {qcResult.details.actualWidth} × {qcResult.details.actualHeight}
              </span>
            </div>
          </div>
        </div>
        
        {/* Screen Layout Reference */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Screen Layout</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
              <p className="font-semibold text-red-700 dark:text-red-400">Pillars (×4)</p>
              <p className="text-red-600 dark:text-red-500">360×1080 each</p>
            </div>
            <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-700 dark:text-green-400">Center</p>
              <p className="text-green-600 dark:text-green-500">2700×1080</p>
            </div>
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-blue-700 dark:text-blue-400">Total</p>
              <p className="text-blue-600 dark:text-blue-500">4140×1080</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
