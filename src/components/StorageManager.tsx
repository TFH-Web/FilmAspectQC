'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, HardDrive, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { mediaStorage } from '@/lib/storageUtils';
import { formatFileSize } from '@/lib/mediaUtils';

interface StorageManagerProps {
  onStorageCleared?: () => void;
}

export function StorageManager({ onStorageCleared }: StorageManagerProps) {
  const [storageInfo, setStorageInfo] = useState<{ used: number; quota: number } | null>(null);
  const [storedFiles, setStoredFiles] = useState<Array<{
    id: string;
    file: File;
    metadata: {
      fileName: string;
      fileSize: number;
      type: string;
      uploadDate: number;
      dimensions?: {
        width: number;
        height: number;
      };
    };
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const info = await mediaStorage.getStorageInfo();
      const files = await mediaStorage.getAllMedia();
      setStorageInfo(info);
      setStoredFiles(files);
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  const handleClearStorage = async () => {
    setLoading(true);
    try {
      await mediaStorage.clearAll();
      await loadStorageInfo();
      onStorageCleared?.();
      setShowConfirm(false);
    } catch (error) {
      console.error('Error clearing storage:', error);
    } finally {
      setLoading(false);
    }
  };

  // Removed unused handleDeleteFile function

  if (!storageInfo) return null;

  const usagePercentage = (storageInfo.used / storageInfo.quota) * 100;
  const isNearLimit = usagePercentage > 80;

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
      <h3 className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2">
        <HardDrive className="h-4 w-4" />
        Storage Management
      </h3>

      {/* Storage Usage */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Used: {formatFileSize(storageInfo.used)}</span>
          <span>Total: {formatFileSize(storageInfo.quota)}</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              isNearLimit ? 'bg-red-500' : 'bg-white/30'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        {isNearLimit && (
          <p className="text-xs text-red-400 mt-2">
            Storage is {usagePercentage.toFixed(0)}% full
          </p>
        )}
      </div>

      {/* Stored Files Count */}
      <div className="mb-4 p-3 bg-black/20 rounded-lg">
        <p className="text-sm text-gray-300">
          {storedFiles.length} file{storedFiles.length !== 1 ? 's' : ''} stored
        </p>
        {storedFiles.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Total size: {formatFileSize(storedFiles.reduce((acc, f) => acc + f.metadata.fileSize, 0))}
          </p>
        )}
      </div>

      {/* Clear Storage Button */}
      {showConfirm ? (
        <Alert className="mb-4 border-red-500/50 bg-red-950/30">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-gray-300">
            This will permanently delete all stored files. Are you sure?
          </AlertDescription>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleClearStorage}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Clearing...' : 'Yes, Clear All'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="border-gray-600 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </Alert>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(true)}
          disabled={storedFiles.length === 0}
          className="w-full border-gray-600 hover:bg-gray-800 text-gray-300"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All Storage
        </Button>
      )}

      {/* Auto-cleanup info */}
      <div className="mt-4 p-3 bg-blue-950/20 rounded-lg border border-blue-900/30">
        <p className="text-xs text-blue-300">
          <strong>Note:</strong> Files are stored locally in your browser. 
          Clearing browser data will also remove these files.
        </p>
      </div>
    </div>
  );
}

// Auto-cleanup utility function
export async function autoCleanupOldFiles(daysToKeep: number = 30) {
  try {
    const files = await mediaStorage.getAllMedia();
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    for (const file of files) {
      if (file.metadata.uploadDate < cutoffTime) {
        await mediaStorage.deleteMedia(file.id);
        console.log(`Cleaned up old file: ${file.metadata.fileName}`);
      }
    }
  } catch (error) {
    console.error('Error during auto-cleanup:', error);
  }
}
