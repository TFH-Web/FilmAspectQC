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
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border-gray-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Quality Control Results</CardTitle>
          <Badge 
            variant={getStatusVariant()}
            className={`${
              qcResult.dimensionsMatch 
                ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                : qcResult.aspectRatioMatch 
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                : 'bg-red-500/20 text-red-400 border-red-500/50'
            } font-semibold`}
          >
            {qcResult.dimensionsMatch ? 'PASS' : qcResult.aspectRatioMatch ? 'WARNING' : 'FAIL'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Alert */}
        <Alert className={`border ${
          qcResult.dimensionsMatch 
            ? 'border-green-500/50 bg-green-950/30' 
            : 'border-red-500/50 bg-red-950/30'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              qcResult.dimensionsMatch 
                ? 'bg-green-500/20' 
                : qcResult.aspectRatioMatch 
                ? 'bg-yellow-500/20'
                : 'bg-red-500/20'
            }`}>
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <AlertTitle className="text-sm font-medium text-white">
                {qcResult.details.message}
              </AlertTitle>
            </div>
          </div>
        </Alert>
        
        {/* Horizontal Layout Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* File Information */}
          <div className="space-y-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">File Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">File Name</span>
                <span className="font-medium text-gray-200 truncate max-w-[150px]">{media.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">File Size</span>
                <span className="font-medium text-gray-200">{formatFileSize(media.fileSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Type</span>
                <span className="font-medium text-gray-200 capitalize">{media.type}</span>
              </div>
              {media.duration && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Duration</span>
                  <span className="font-medium text-gray-200">{formatDuration(media.duration)}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Dimensions Analysis */}
          <div className="space-y-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Dimensions Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded-lg">
                <span className="text-sm text-gray-400">Expected</span>
                <span className="font-mono text-sm font-semibold text-green-400">
                  {qcResult.details.expectedWidth} × {qcResult.details.expectedHeight}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded-lg">
                <span className="text-sm text-gray-400">Actual</span>
                <span className={`font-mono text-sm font-semibold ${
                  qcResult.dimensionsMatch ? 'text-green-400' : 'text-red-400'
                }`}>
                  {qcResult.details.actualWidth} × {qcResult.details.actualHeight}
                </span>
              </div>
            </div>
          </div>
          
          {/* Screen Layout */}
          <div className="space-y-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Screen Layout</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-br from-red-950/50 to-red-900/30 rounded-lg border border-red-500/30 backdrop-blur-sm">
                <p className="font-semibold text-red-400">Pillars (×4)</p>
                <p className="text-red-300 opacity-80 text-[10px]">360×1080 each</p>
              </div>
              <div className="text-center p-2 bg-gradient-to-br from-green-950/50 to-green-900/30 rounded-lg border border-green-500/30 backdrop-blur-sm">
                <p className="font-semibold text-green-400">Center</p>
                <p className="text-green-300 opacity-80 text-[10px]">2700×1080</p>
              </div>
              <div className="text-center p-2 bg-gradient-to-br from-blue-950/50 to-blue-900/30 rounded-lg border border-blue-500/30 backdrop-blur-sm">
                <p className="font-semibold text-blue-400">HD Guide</p>
                <p className="text-blue-300 opacity-80 text-[10px]">1920×1080</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              HD guide shows standard content placement
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
