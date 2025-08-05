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
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer"
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
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-semibold mb-2">Drop your media file here</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              or click to browse
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Supported: PNG, JPG, MP4, MOV (max 500MB)
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Expected resolution: 4140×1080px
            </p>
          </label>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm">{currentFile.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
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
