'use client';

import React, { useState, useCallback } from 'react';
import { MediaUploader } from '@/components/MediaUploader';
import { MediaPreview } from '@/components/MediaPreview';
import { QCInfoPanel } from '@/components/QCInfoPanel';
import { ControlsPanel } from '@/components/ControlsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MediaMeta, QCResult } from '@/types/media';
import { getMediaDimensions, performQC, isValidFileType } from '@/lib/mediaUtils';
import { MAX_FILE_SIZE } from '@/lib/constants';
import { Monitor, Info } from 'lucide-react';

export default function Home() {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [media, setMedia] = useState<MediaMeta | null>(null);
  const [qcResult, setQcResult] = useState<QCResult | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setLoading(true);
    
    // Validate file
    if (!isValidFileType(file)) {
      setError('Invalid file type. Please upload PNG, JPG, MP4, or MOV files.');
      setLoading(false);
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 500MB.');
      setLoading(false);
      return;
    }
    
    try {
      // Create object URL for the file
      const url = URL.createObjectURL(file);
      
      // Get media dimensions
      const mediaMeta = await getMediaDimensions(file, url);
      
      // Perform QC check
      const qc = performQC(mediaMeta);
      
      setCurrentFile(file);
      setMedia(mediaMeta);
      setQcResult(qc);
      setShowOverlay(true);
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Failed to process media file. Please try again.');
      
      // Clean up
      if (currentFile) {
        const url = URL.createObjectURL(currentFile);
        URL.revokeObjectURL(url);
      }
    } finally {
      setLoading(false);
    }
  }, [currentFile]);
  
  const handleReset = useCallback(() => {
    // Clean up object URL
    if (media?.url) {
      URL.revokeObjectURL(media.url);
    }
    
    setCurrentFile(null);
    setMedia(null);
    setQcResult(null);
    setShowOverlay(true);
    setError(null);
  }, [media]);
  
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Monitor className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Church Media QC Tool
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Verify your media content is properly formatted for our 5-screen stage display system
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="outline">4140×1080px Total</Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            2700×1080px Center
          </Badge>
          <Badge variant="outline" className="text-red-600 border-red-600">
            360×1080px Pillars ×4
          </Badge>
        </div>
      </div>
      
      {/* Info Alert */}
      <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Stage Layout:</strong> Content in the center area (green) will display on the main screen. 
          Content in pillar zones (red) will be split across 4 vertical displays. 
          Ensure important content stays within the center safe zone.
        </AlertDescription>
      </Alert>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload & Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" disabled={loading}>
                Upload Media
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={!media}>
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <MediaUploader
                onFileSelect={handleFileSelect}
                onClear={handleReset}
                currentFile={currentFile}
                error={error}
              />
            </TabsContent>
            
            <TabsContent value="preview">
              <MediaPreview
                media={media}
                showOverlay={showOverlay}
              />
            </TabsContent>
          </Tabs>
          
          {/* Preview Section (always visible when media is loaded) */}
          {media && (
            <div className="block lg:hidden">
              <MediaPreview
                media={media}
                showOverlay={showOverlay}
              />
            </div>
          )}
        </div>
        
        {/* Right Column - Controls & Info */}
        <div className="space-y-6">
          <ControlsPanel
            showOverlay={showOverlay}
            onToggleOverlay={setShowOverlay}
            onReset={handleReset}
            media={media}
          />
          
          <QCInfoPanel
            media={media}
            qcResult={qcResult}
          />
        </div>
      </div>
      
      {/* Desktop Preview (always visible when media is loaded) */}
      {media && (
        <div className="hidden lg:block mt-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Media Preview
          </h2>
          <MediaPreview
            media={media}
            showOverlay={showOverlay}
          />
        </div>
      )}
    </main>
  );
}
