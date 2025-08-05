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
        <Card
          className="border-2 border-dashed border-gray-700 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-12 text-center hover:border-gray-500 hover:bg-gray-800/60 transition-all duration-300 cursor-pointer group"
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
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-purple-500/25 pulse">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <p className="text-xl font-semibold mb-2 text-white">Drop your media file here</p>
            <p className="text-sm text-gray-400 mb-4">
              or click to browse
            </p>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-gray-500">
                Supported: PNG, JPG, MP4, MOV (max 500MB)
              </p>
              <p className="text-xs text-purple-400 font-medium">
                Expected resolution: 4140×1080px
              </p>
            </div>
          </label>
        </Card>
      ) : (
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">{currentFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
