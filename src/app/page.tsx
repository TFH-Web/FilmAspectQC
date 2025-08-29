'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { MediaUploader } from '@/components/MediaUploader';
import { MediaPreview } from '@/components/MediaPreview';
import { StorageManager } from '@/components/StorageManager';
import { BatchQCResults } from '@/components/BatchQCResults';
import { ScreenValidation } from '@/components/ScreenValidation';
import { Switch } from '@/components/ui/switch';
import { MediaMeta, QCResult, BatchQCResult, BatchMediaItem, ScreenValidationResult } from '@/types/media';
import { getMediaDimensions, performQC, isValidFileType, formatFileSize, formatDuration } from '@/lib/mediaUtils';
import { mediaStorage } from '@/lib/storageUtils';
import { autoCleanupOldFiles } from '@/components/StorageManager';
import { Monitor, X, Upload, FolderOpen, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [media, setMedia] = useState<MediaMeta | null>(null);
  const [qcResult, setQcResult] = useState<QCResult | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{ used: number; quota: number } | null>(null);
  
  // Batch upload state
  const [, setIsBatchMode] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchQCResult | null>(null);
  const [batchProcessing, setBatchProcessing] = useState(false);
  
  // Navigation state for batch mode
  const [viewingBatchFile, setViewingBatchFile] = useState<BatchMediaItem | null>(null);
  
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
    setIsBatchMode(false);
    setViewingBatchFile(null);
    
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
      setBatchResult(null);
      
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
  
  const handleBatchSelect = useCallback(async (files: File[]) => {
    setError(null);
    setBatchProcessing(true);
    setIsBatchMode(true);
    setCurrentFile(null);
    setMedia(null);
    setQcResult(null);
    setBatchResult(null);
    setViewingBatchFile(null);
    
    try {
      const batchItems: BatchMediaItem[] = [];
      let passedFiles = 0;
      let failedFiles = 0;
      
      // Process each file
      for (const file of files) {
        try {
          // Validate file type
          if (!isValidFileType(file)) {
            batchItems.push({
              file,
              media: {} as MediaMeta, // Placeholder
              qcResult: {} as QCResult, // Placeholder
              status: 'error',
              error: 'Invalid file type'
            });
            continue;
          }
          
          // Create object URL
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
          
          if (qc.dimensionsMatch) {
            passedFiles++;
          } else {
            failedFiles++;
          }
          
          batchItems.push({
            file,
            media: mediaMeta,
            qcResult: qc,
            status: 'completed'
          });
          
        } catch (err) {
          console.error(`Error processing file ${file.name}:`, err);
          batchItems.push({
            file,
            media: {} as MediaMeta,
            qcResult: {} as QCResult,
            status: 'error',
            error: 'Failed to process file'
          });
        }
      }
      
      // Generate batch summary
      const allPassed = failedFiles === 0;
      const commonIssues: string[] = [];
      const recommendations: string[] = [];
      
      if (failedFiles > 0) {
        const dimensionMismatches = batchItems.filter(item => 
          item.status === 'completed' && !item.qcResult.dimensionsMatch
        );
        
        if (dimensionMismatches.length > 0) {
          commonIssues.push(`${dimensionMismatches.length} files have incorrect dimensions`);
          recommendations.push('Resize files to 4140×1080 pixels for optimal display');
        }
        
        if (failedFiles > passedFiles) {
          recommendations.push('Most files failed QC - check your media specifications');
        }
      }
      
      if (allPassed) {
        recommendations.push('All files passed QC - ready for production use');
      }
      
      const batchQCResult: BatchQCResult = {
        totalFiles: files.length,
        passedFiles,
        failedFiles,
        items: batchItems,
        summary: {
          allPassed,
          commonIssues,
          recommendations
        }
      };
      
      setBatchResult(batchQCResult);
      
      // Log storage info
      const storageInfo = await mediaStorage.getStorageInfo();
      console.log('Storage used:', (storageInfo.used / 1024 / 1024).toFixed(2), 'MB');
      console.log('Storage quota:', (storageInfo.quota / 1024 / 1024).toFixed(2), 'MB');
      
    } catch (err) {
      console.error('Error processing batch:', err);
      setError('Failed to process batch upload. Please try again.');
    } finally {
      setBatchProcessing(false);
    }
  }, []);
  
  // New function to view a specific file from batch results
  const handleViewBatchFile = useCallback((batchItem: BatchMediaItem) => {
    if (batchItem.status === 'completed' && batchItem.media && batchItem.qcResult) {
      setViewingBatchFile(batchItem);
      setCurrentFile(batchItem.file);
      setMedia(batchItem.media);
      setQcResult(batchItem.qcResult);
      setShowOverlay(true);
    }
  }, []);
  
  // Function to go back to batch results
  const handleBackToBatch = useCallback(() => {
    setViewingBatchFile(null);
    setCurrentFile(null);
    setMedia(null);
    setQcResult(null);
    setShowOverlay(true);
  }, []);
  
  // Navigation functions for batch files
  const handlePreviousFile = useCallback(() => {
    if (viewingBatchFile && batchResult) {
      const currentIndex = batchResult.items.findIndex(item => item.file.name === viewingBatchFile.file.name);
      if (currentIndex > 0) {
        const previousItem = batchResult.items[currentIndex - 1];
        if (previousItem.status === 'completed' && previousItem.media && previousItem.qcResult) {
          handleViewBatchFile(previousItem);
        }
      }
    }
  }, [viewingBatchFile, batchResult, handleViewBatchFile]);
  
  const handleNextFile = useCallback(() => {
    if (viewingBatchFile && batchResult) {
      const currentIndex = batchResult.items.findIndex(item => item.file.name === viewingBatchFile.file.name);
      if (currentIndex < batchResult.items.length - 1) {
        const nextItem = batchResult.items[currentIndex + 1];
        if (nextItem.status === 'completed' && nextItem.media && nextItem.qcResult) {
          handleViewBatchFile(nextItem);
        }
      }
    }
  }, [viewingBatchFile, batchResult, handleViewBatchFile]);
  
  const handleScreenValidation = useCallback((result: ScreenValidationResult) => {
    if (qcResult) {
      const updatedQcResult: QCResult = {
        ...qcResult,
        screenValidation: result,
      };
      setQcResult(updatedQcResult);
    }
  }, [qcResult]);
  
  const handleReset = useCallback(async (preserveBatchResults = false) => {
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
    
    // Only clear batch-related state if not preserving batch results
    if (!preserveBatchResults) {
      // Clean up all batch files from storage when closing batch results
      if (batchResult) {
        for (const item of batchResult.items) {
          if (item.status === 'completed' && item.media?.id) {
            try {
              await mediaStorage.deleteMedia(item.media.id);
              console.log(`Deleted batch file: ${item.file.name}`);
            } catch (error) {
              console.error(`Error deleting batch file ${item.file.name}:`, error);
            }
          }
          // Clean up object URLs
          if (item.media?.url) {
            URL.revokeObjectURL(item.media.url);
          }
        }
        
        // Update storage info after cleanup
        const updatedInfo = await mediaStorage.getStorageInfo();
        setStorageInfo(updatedInfo);
      }
      
      setIsBatchMode(false);
      setBatchResult(null);
      setViewingBatchFile(null);
    } else if (viewingBatchFile) {
      // If we're viewing a batch file, go back to batch results
      setViewingBatchFile(null);
    }
  }, [media, viewingBatchFile, batchResult]);
  
  // Keyboard navigation for batch files
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewingBatchFile && batchResult) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePreviousFile();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNextFile();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleBackToBatch();
        }
      }
    };
    
    if (viewingBatchFile) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [viewingBatchFile, batchResult, handlePreviousFile, handleNextFile, handleBackToBatch]);
  
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
            {loading || batchProcessing ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="h-12 w-12 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                <p className="text-sm text-gray-300 mt-4">
                  {batchProcessing ? 'Processing batch...' : 'Processing...'}
                </p>
                {batchProcessing && (
                  <p className="text-xs text-gray-400 mt-2">This may take a moment</p>
                )}
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
                    {viewingBatchFile && (
                      <p className="text-xs text-blue-400 mt-1">From batch upload</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Back to batch button */}
                  {viewingBatchFile && (
                    <button
                      onClick={handleBackToBatch}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-200 border border-blue-500/30"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="text-sm">Back to Batch</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleReset()}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <X className="h-4 w-4 text-gray-300" />
                  </button>
                </div>
              </div>
            ) : (
              <MediaUploader
                onFileSelect={handleFileSelect}
                onBatchSelect={handleBatchSelect}
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
                : batchResult
                ? batchResult.summary.allPassed
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-yellow-500/10 border-yellow-500/30'
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
                ) : batchResult ? (
                  batchResult.summary.allPassed ? (
                    <span className="text-green-400">Pass</span>
                  ) : (
                    <span className="text-yellow-400">Review</span>
                  )
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {viewingBatchFile ? 'Batch File View' : batchResult ? 'Batch QC' : 'QC Result'}
              </p>
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
          
          {/* Preview Section - Full width (show for single file OR when viewing batch file) */}
          {media && (qcResult || viewingBatchFile) && (
            <div className="lg:col-span-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-medium text-gray-200">
                    {viewingBatchFile ? `Preview: ${viewingBatchFile.file.name}` : 'Preview'}
                  </h2>
                  {viewingBatchFile && batchResult && (
                    <Badge variant="outline" className="text-xs">
                      File {batchResult.items.findIndex(item => item.file.name === viewingBatchFile.file.name) + 1} of {batchResult.totalFiles}
                    </Badge>
                  )}
                </div>
                {viewingBatchFile && (
                  <div className="flex items-center gap-2">
                    <Badge variant={viewingBatchFile.qcResult.dimensionsMatch ? "default" : "destructive"}>
                      {viewingBatchFile.qcResult.dimensionsMatch ? 'Pass' : 'Fail'}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {viewingBatchFile.media.width} × {viewingBatchFile.media.height}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Navigation buttons for batch files */}
              {viewingBatchFile && batchResult && (
                <div className="flex flex-col items-center gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePreviousFile}
                      disabled={batchResult.items.findIndex(item => item.file.name === viewingBatchFile.file.name) === 0}
                      className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-500 text-white rounded-lg transition-all duration-200 border border-white/20 disabled:border-white/10"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="text-sm">Previous</span>
                    </button>
                    
                    <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/20">
                      <span className="text-xs text-gray-400">Current:</span>
                      <Badge 
                        variant={viewingBatchFile.qcResult.dimensionsMatch ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {viewingBatchFile.qcResult.dimensionsMatch ? 'PASS' : 'FAIL'}
                      </Badge>
                    </div>
                    
                    <button
                      onClick={handleNextFile}
                      disabled={batchResult.items.findIndex(item => item.file.name === viewingBatchFile.file.name) === batchResult.items.length - 1}
                      className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-500 text-white rounded-lg transition-all duration-200 border border-white/20 disabled:border-white/10"
                    >
                      <span className="text-sm">Next</span>
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    Use ← → arrow keys to navigate • ESC to return to batch
                  </p>
                </div>
              )}
              
              <MediaPreview
                media={media}
                showOverlay={showOverlay}
              />
            </div>
          )}
          
          {/* Batch Results Section - Full width (only show when not viewing individual file) */}
          {batchResult && !viewingBatchFile && (
            <>
              <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <FolderOpen className="h-5 w-5 text-gray-300" />
                  <h2 className="text-sm font-medium text-gray-200">Batch QC Results</h2>
                  <button
                    onClick={() => handleReset()}
                    className="ml-auto p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <X className="h-4 w-4 text-gray-300" />
                  </button>
                </div>
                <BatchQCResults
                  batchResult={batchResult}
                  onFileSelect={handleViewBatchFile}
                />
              </div>
              
              {/* Storage Manager for Batch Mode */}
              <div className="lg:col-span-4">
                <StorageManager onStorageCleared={() => handleReset(true)} />
              </div>
            </>
          )}
          
          {/* Info Grid - Bottom section when viewing individual batch file */}
          {viewingBatchFile && media && qcResult && (
            <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* File Info */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
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
              <StorageManager onStorageCleared={() => handleReset(true)} />
              
              {/* Dimensions */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
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
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
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
            </div>
          )}
          
          {/* Screen Content Validation for batch viewing */}
          {viewingBatchFile && media && qcResult && (
            <div className="lg:col-span-12">
              <ScreenValidation 
                media={media}
                qcResult={qcResult}
                currentFile={currentFile}
                onValidationComplete={handleScreenValidation}
              />
            </div>
          )}
          
          {/* Info Grid - Bottom section (only show for single file, not batch files) */}
          {media && qcResult && !batchResult && !viewingBatchFile && (
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
                <StorageManager onStorageCleared={() => handleReset(true)} />
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
          
          {/* Screen Content Validation - Full width */}
          {media && qcResult && !batchResult && !viewingBatchFile && (
            <div className="lg:col-span-12">
              <ScreenValidation 
                media={media}
                qcResult={qcResult}
                currentFile={currentFile}
                onValidationComplete={handleScreenValidation}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
