'use client';

import React, { useState, useCallback } from 'react';
import { MediaUploader } from '@/components/MediaUploader';
import { MediaPreview } from '@/components/MediaPreview';
import { QCInfoPanel } from '@/components/QCInfoPanel';
import { ControlsPanel } from '@/components/ControlsPanel';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <div className="mb-8 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl -z-10" />
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl shadow-purple-500/25">
            <Monitor className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Church Media QC Tool
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Verify your media content is properly formatted for our 5-screen stage display system
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="outline" className="border-gray-700 text-gray-300 backdrop-blur-sm bg-white/5">
            4140×1080px Total
          </Badge>
          <Badge variant="outline" className="border-green-600/50 text-green-400 backdrop-blur-sm bg-green-500/10">
            2700×1080px Center
          </Badge>
          <Badge variant="outline" className="border-red-600/50 text-red-400 backdrop-blur-sm bg-red-500/10">
            360×1080px Pillars ×4
          </Badge>
        </div>
      </div>
      
      {/* Info Alert */}
      <div className="mb-6 p-4 border border-blue-500/20 bg-gradient-to-r from-blue-950/50 to-purple-950/50 backdrop-blur-sm rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
            <Info className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-300 text-sm leading-relaxed">
              <strong className="text-white">Stage Layout:</strong> Content in the center area (green) will display on the main screen. Content in pillar zones (red) will be split across 4 vertical displays. Ensure important content stays within the center safe zone.
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        {/* Top Section - Upload/Preview and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Upload & Preview */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700">
                <TabsTrigger 
                  value="upload" 
                  disabled={loading}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  Upload Media
                </TabsTrigger>
                <TabsTrigger 
                  value="preview" 
                  disabled={!media}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                {loading ? (
                  <Card className="border-gray-700 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-300">Processing media file...</p>
                    </div>
                  </Card>
                ) : (
                  <MediaUploader
                    onFileSelect={handleFileSelect}
                    onClear={handleReset}
                    currentFile={currentFile}
                    error={error}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="preview">
                <MediaPreview
                  media={media}
                  showOverlay={showOverlay}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column - Controls */}
          <div className="lg:col-span-1">
            <ControlsPanel
              showOverlay={showOverlay}
              onToggleOverlay={setShowOverlay}
              onReset={handleReset}
              media={media}
            />
          </div>
        </div>
        
        {/* Bottom Section - QC Results (Horizontal) */}
        {media && qcResult && (
          <QCInfoPanel
            media={media}
            qcResult={qcResult}
          />
        )}
        
        {/* Preview Section (always visible when media is loaded) */}
        {media && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-300">
              Media Preview
            </h2>
            <MediaPreview
              media={media}
              showOverlay={showOverlay}
            />
          </div>
        )}
      </div>
    </main>
  );
}
