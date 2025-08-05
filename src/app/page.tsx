'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { MediaUploader } from '@/components/MediaUploader';
import { MediaPreview } from '@/components/MediaPreview';
import { StorageManager } from '@/components/StorageManager';
import { Switch } from '@/components/ui/switch';
import { MediaMeta, QCResult } from '@/types/media';
import { getMediaDimensions, performQC, isValidFileType, formatFileSize, formatDuration } from '@/lib/mediaUtils';
import { mediaStorage } from '@/lib/storageUtils';
import { autoCleanupOldFiles } from '@/components/StorageManager';
import { Monitor, X, Upload } from 'lucide-react';

export default function Home() {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [media, setMedia] = useState<MediaMeta | null>(null);
  const [qcResult, setQcResult] = useState<QCResult | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{ used: number; quota: number } | null>(null);
  
  // Load storage info on mount
  useEffect(() => {
    const loadStorageInfo = async () => {
      const info = await mediaStorage.getStorageInfo();
      setStorageInfo(info);
      
      // Auto-cleanup files older than 7 days
      await autoCleanupOldFiles(7);
    };
    loadStorageInfo();
  }, [media]); // Refresh after media changes
  
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setLoading(true);
    
    // Validate file
    if (!isValidFileType(file)) {
      setError('Invalid file type. Please upload PNG, JPG, MP4, or MOV files.');
      setLoading(false);
      return;
    }
    
    try {
      // Create object URL for the file
      const url = URL.createObjectURL(file);
      
      // Get media dimensions
      const mediaMeta = await getMediaDimensions(file, url);
      
      // Save to IndexedDB
      const storageId = await mediaStorage.saveMedia(file, {
        width: mediaMeta.width,
        height: mediaMeta.height
      });
      
      // Add storage ID to metadata
      mediaMeta.id = storageId;
      
      // Perform QC check
      const qc = performQC(mediaMeta);
      
      setCurrentFile(file);
      setMedia(mediaMeta);
      setQcResult(qc);
      setShowOverlay(true);
      
      // Log storage info
      const storageInfo = await mediaStorage.getStorageInfo();
      console.log('Storage used:', (storageInfo.used / 1024 / 1024).toFixed(2), 'MB');
      console.log('Storage quota:', (storageInfo.quota / 1024 / 1024).toFixed(2), 'MB');
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
  
  const handleReset = useCallback(async () => {
    // Clean up object URL
    if (media?.url) {
      URL.revokeObjectURL(media.url);
    }
    
    // Optionally delete from storage (or keep for history)
    if (media?.id) {
      // Uncomment to delete: await mediaStorage.deleteMedia(media.id);
      console.log('File stored with ID:', media.id);
    }
    
    setCurrentFile(null);
    setMedia(null);
    setQcResult(null);
    setShowOverlay(true);
    setError(null);
  }, [media]);
  
  return (
    <main className="min-h-screen bg-black p-6 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent" />
      
      <div className="mx-auto max-w-[1400px] relative z-10">
        {/* Header - Minimal */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Monitor className="h-6 w-6 text-white/80" />
            </div>
            <h1 className="text-2xl font-bold text-white">Media QC</h1>
          </div>
          <p className="text-sm text-gray-300">Verify media for 5-screen display system</p>
        </div>
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Upload Section - Large tile */}
          <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h2 className="text-sm font-medium text-gray-200 mb-4">Upload Media</h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="h-12 w-12 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                <p className="text-sm text-gray-300 mt-4">Processing...</p>
              </div>
            ) : currentFile ? (
              <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white/60" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{currentFile.name}</p>
                    <p className="text-xs text-gray-400">{(currentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <X className="h-4 w-4 text-gray-300" />
                </button>
              </div>
            ) : (
              <MediaUploader
                onFileSelect={handleFileSelect}
                onClear={handleReset}
                currentFile={currentFile}
                error={error}
              />
            )}
          </div>
          
          {/* Stats Grid - Small tiles */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
            {/* Resolution Tile */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
              <p className="text-xs text-gray-300 mb-1">Expected</p>
              <p className="text-lg font-medium text-white">4140×1080</p>
              <p className="text-xs text-gray-400 mt-2">Total Stage</p>
            </div>
            
            {/* Status Tile */}
            <div className={`backdrop-blur-xl rounded-2xl border p-4 shadow-xl ${
              media && qcResult?.dimensionsMatch 
                ? 'bg-green-500/10 border-green-500/30' 
                : media 
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-white/5 border-white/10'
            }`}>
              <p className="text-xs text-gray-300 mb-1">Status</p>
              <p className="text-lg font-medium">
                {media && qcResult ? (
                  qcResult.dimensionsMatch ? (
                    <span className="text-green-400">Pass</span>
                  ) : (
                    <span className="text-red-400">Fail</span>
                  )
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-2">QC Result</p>
            </div>
            
            {/* Overlay Control */}
            <div className="col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-white">Show Zones</p>
                  <p className="text-xs text-gray-400 mt-1">Display screen overlay</p>
                </div>
                <Switch
                  checked={showOverlay}
                  onCheckedChange={setShowOverlay}
                  disabled={!media}
                  className="data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-600"
                />
              </div>
              
              {/* Storage Info */}
              {storageInfo && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Local Storage</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white/30 transition-all duration-300"
                        style={{ width: `${Math.min((storageInfo.used / storageInfo.quota) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-300">
                      {((storageInfo.used / 1024 / 1024).toFixed(0))}MB
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Preview Section - Full width */}
          {media && (
            <div className="lg:col-span-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
              <h2 className="text-sm font-medium text-gray-200 mb-4">Preview</h2>
              <MediaPreview
                media={media}
                showOverlay={showOverlay}
              />
            </div>
          )}
          
          {/* Info Grid - Bottom section */}
          {media && qcResult && (
            <>
              {/* File Info */}
              <div className="lg:col-span-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 className="text-sm font-medium text-gray-200 mb-4">File Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="text-sm text-white truncate">{media.fileName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Size</p>
                    <p className="text-sm text-white">{formatFileSize(media.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Type</p>
                    <p className="text-sm text-white capitalize">{media.type}</p>
                  </div>
                  {media.duration && (
                    <div>
                      <p className="text-xs text-gray-400">Duration</p>
                      <p className="text-sm text-white">{formatDuration(media.duration)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Storage Manager */}
              <div className="lg:col-span-4">
                <StorageManager onStorageCleared={handleReset} />
              </div>
              
              {/* Dimensions */}
              <div className="lg:col-span-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 className="text-sm font-medium text-gray-200 mb-4">Dimensions</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Actual</p>
                    <p className={`text-2xl font-light ${
                      qcResult.dimensionsMatch ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {media.width} × {media.height}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400">{qcResult.details.message}</p>
                  </div>
                </div>
              </div>
              
              {/* Screen Layout */}
              <div className="lg:col-span-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 className="text-sm font-medium text-gray-200 mb-4">Screen Layout</h3>
                <div className="grid grid-cols-5 gap-1 h-20">
                  <div className="bg-red-500/20 backdrop-blur-sm rounded flex items-center justify-center border border-red-500/30">
                    <span className="text-[10px] text-red-300">P1</span>
                  </div>
                  <div className="bg-red-500/20 backdrop-blur-sm rounded flex items-center justify-center border border-red-500/30">
                    <span className="text-[10px] text-red-300">P2</span>
                  </div>
                  <div className="bg-green-500/20 backdrop-blur-sm rounded flex items-center justify-center border border-green-500/30">
                    <span className="text-[10px] text-green-300">Center</span>
                  </div>
                  <div className="bg-red-500/20 backdrop-blur-sm rounded flex items-center justify-center border border-red-500/30">
                    <span className="text-[10px] text-red-300">P3</span>
                  </div>
                  <div className="bg-red-500/20 backdrop-blur-sm rounded flex items-center justify-center border border-red-500/30">
                    <span className="text-[10px] text-red-300">P4</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  <p>Center: 2700×1080</p>
                  <p>Pillars: 360×1080 each</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
