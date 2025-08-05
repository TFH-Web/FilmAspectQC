'use client';

import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { isValidFileType } from '@/lib/mediaUtils';

interface MediaUploaderProps {
  onFileSelect: (file: File) => void;
  onClear: () => void;
  currentFile: File | null;
  error: string | null;
}

export function MediaUploader({ onFileSelect, onClear, currentFile, error }: MediaUploaderProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [onFileSelect]
  );
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [onFileSelect]
  );
  
  const processFile = (file: File) => {
    // Validate file type
    if (!isValidFileType(file)) {
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return;
    }
    
    onFileSelect(file);
  };
  
  const acceptedTypes = [...ACCEPTED_FILE_TYPES.image, ...ACCEPTED_FILE_TYPES.video].join(',');
  
  return (
    <div className="w-full">
      {!currentFile ? (
        <div
          className="border-2 border-dashed border-white/20 hover:border-white/30 bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center transition-all duration-200 cursor-pointer group"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept={acceptedTypes}
            onChange={handleFileInput}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="mx-auto h-12 w-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all duration-200">
              <Upload className="h-6 w-6 text-white/60" />
            </div>
            <p className="text-sm font-medium text-white mb-1">Drop your file here</p>
            <p className="text-xs text-gray-400">or click to browse</p>
            <div className="mt-4 text-xs text-gray-500">
              <p>PNG, JPG, MP4, MOV • Max 500MB</p>
              <p className="mt-1">4140×1080px</p>
            </div>
          </label>
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
