'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, FolderOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ACCEPTED_FILE_TYPES } from '@/lib/constants';
import { isValidFileType } from '@/lib/mediaUtils';
import { Switch } from '@/components/ui/switch';

interface MediaUploaderProps {
  onFileSelect: (file: File) => void;
  onBatchSelect: (files: File[]) => void;
  onClear: () => void;
  currentFile: File | null;
  error: string | null;
}

export function MediaUploader({ onFileSelect, onBatchSelect, onClear, currentFile, error }: MediaUploaderProps) {
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        if (isBatchMode) {
          const validFiles = files.filter(file => isValidFileType(file));
          if (validFiles.length > 0) {
            onBatchSelect(validFiles);
          }
        } else {
          const file = files[0];
          if (isValidFileType(file)) {
            onFileSelect(file);
          }
        }
      }
    },
    [isBatchMode, onFileSelect, onBatchSelect]
  );
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);
  
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        if (isBatchMode) {
          const validFiles = files.filter(file => isValidFileType(file));
          if (validFiles.length > 0) {
            onBatchSelect(validFiles);
          }
        } else {
          const file = files[0];
          if (isValidFileType(file)) {
            onFileSelect(file);
          }
        }
      }
    },
    [isBatchMode, onFileSelect, onBatchSelect]
  );
  
  const processFile = (file: File) => {
    if (!isValidFileType(file)) {
      return;
    }
    onFileSelect(file);
  };
  
  const acceptedTypes = [...ACCEPTED_FILE_TYPES.image, ...ACCEPTED_FILE_TYPES.video].join(',');
  
  return (
    <div className="w-full">
      {!currentFile ? (
        <div className="space-y-4">
          {/* Upload Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-300" />
                <span className="text-sm text-gray-200">Single File</span>
              </div>
              <Switch
                checked={isBatchMode}
                onCheckedChange={setIsBatchMode}
                className="data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-600"
              />
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-gray-300" />
                <span className="text-sm text-gray-200">Batch Upload</span>
              </div>
            </div>
          </div>
          
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer group ${
              dragActive 
                ? 'border-white/50 bg-white/10' 
                : 'border-white/20 hover:border-white/30 bg-white/5'
            } backdrop-blur-sm`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept={acceptedTypes}
              multiple={isBatchMode}
              onChange={handleFileInput}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="mx-auto h-12 w-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all duration-200">
                {isBatchMode ? (
                  <FolderOpen className="h-6 w-6 text-white/60" />
                ) : (
                  <Upload className="h-6 w-6 text-white/60" />
                )}
              </div>
              <p className="text-sm font-medium text-white mb-1">
                {isBatchMode ? 'Drop multiple files here' : 'Drop your file here'}
              </p>
              <p className="text-xs text-gray-400">
                {isBatchMode ? 'or click to browse multiple files' : 'or click to browse'}
              </p>
              <div className="mt-4 text-xs text-gray-500">
                <p>PNG, JPG, MP4, MOV</p>
                <p className="mt-1">Expected: 4140×1080px</p>
                {isBatchMode && (
                  <p className="mt-1 text-blue-400">Batch mode: Select multiple files</p>
                )}
              </div>
            </label>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-black/50 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-900 rounded-lg">
                <Upload className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">{currentFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
