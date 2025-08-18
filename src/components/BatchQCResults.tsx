'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, FileText, Filter } from 'lucide-react';
import { BatchQCResult, BatchMediaItem } from '@/types/media';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatFileSize, formatDuration } from '@/lib/mediaUtils';

interface BatchQCResultsProps {
  batchResult: BatchQCResult;
  onFileSelect: (batchItem: BatchMediaItem) => void;
}

export function BatchQCResults({ batchResult, onFileSelect }: BatchQCResultsProps) {
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'status'>('name');
  
  const filteredItems = batchResult.items.filter(item => {
    if (filter === 'passed') return item.qcResult.dimensionsMatch;
    if (filter === 'failed') return !item.qcResult.dimensionsMatch;
    return true;
  });
  
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.file.name.localeCompare(b.file.name);
      case 'size':
        return b.file.size - a.file.size;
      case 'status':
        return a.qcResult.dimensionsMatch === b.qcResult.dimensionsMatch ? 0 : 
               a.qcResult.dimensionsMatch ? -1 : 1;
      default:
        return 0;
    }
  });
  
  const getStatusIcon = (item: BatchMediaItem) => {
    if (item.status === 'error') return <AlertCircle className="h-4 w-4 text-red-400" />;
    if (item.qcResult.dimensionsMatch) return <CheckCircle className="h-4 w-4 text-green-400" />;
    return <XCircle className="h-4 w-4 text-red-400" />;
  };
  
  const getStatusColor = (item: BatchMediaItem) => {
    if (item.status === 'error') return 'bg-red-500/10 border-red-500/30';
    if (item.qcResult.dimensionsMatch) return 'bg-green-500/10 border-green-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };
  
  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
          <p className="text-xs text-gray-300 mb-1">Total Files</p>
          <p className="text-2xl font-medium text-white">{batchResult.totalFiles}</p>
        </div>
        
        <div className="bg-green-500/10 backdrop-blur-xl rounded-2xl border border-green-500/30 p-4 shadow-xl">
          <p className="text-xs text-gray-300 mb-1">Passed</p>
          <p className="text-2xl font-medium text-green-400">{batchResult.passedFiles}</p>
        </div>
        
        <div className="bg-red-500/10 backdrop-blur-xl rounded-2xl border border-red-500/30 p-4 shadow-xl">
          <p className="text-xs text-gray-300 mb-1">Failed</p>
          <p className="text-2xl font-medium text-red-400">{batchResult.failedFiles}</p>
        </div>
        
        <div className={`backdrop-blur-xl rounded-2xl border p-4 shadow-xl ${
          batchResult.summary.allPassed 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-yellow-500/10 border-yellow-500/30'
        }`}>
          <p className="text-xs text-gray-300 mb-1">Overall</p>
          <p className="text-2xl font-medium">
            {batchResult.summary.allPassed ? (
              <span className="text-green-400">Pass</span>
            ) : (
              <span className="text-yellow-400">Review</span>
            )}
          </p>
        </div>
      </div>
      
      {/* Filters and Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-300" />
          <span className="text-sm text-gray-200">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'passed' | 'failed')}
            className="bg-black/20 border border-white/20 rounded-lg px-3 py-1 text-sm text-white"
          >
            <option value="all">All Files</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-200">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'size' | 'status')}
            className="bg-black/20 border border-white/20 rounded-lg px-3 py-1 text-sm text-white"
          >
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="status">Status</option>
          </select>
        </div>
        
        <Badge variant="secondary" className="ml-auto">
          {filteredItems.length} of {batchResult.totalFiles} files
        </Badge>
      </div>
      
      {/* File Results List */}
      <div className="space-y-3">
        {sortedItems.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:bg-white/5 cursor-pointer ${getStatusColor(item)}`}
            onClick={() => onFileSelect(item)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getStatusIcon(item)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium text-white truncate">{item.file.name}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{formatFileSize(item.file.size)}</span>
                    <span>{item.media.width} × {item.media.height}</span>
                    {item.media.duration && (
                      <span>{formatDuration(item.media.duration)}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={item.qcResult.dimensionsMatch ? "default" : "destructive"}>
                  {item.qcResult.dimensionsMatch ? 'Pass' : 'Fail'}
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  View
                </Button>
              </div>
            </div>
            
            {/* Error message if any */}
            {item.error && (
              <div className="mt-2 p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                <p className="text-xs text-red-300">{item.error}</p>
              </div>
            )}
            
            {/* QC Details */}
            {!item.qcResult.dimensionsMatch && (
              <div className="mt-2 p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <p className="text-xs text-yellow-300">
                  Expected: 4140×1080, Got: {item.media.width}×{item.media.height}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Recommendations */}
      {batchResult.summary.recommendations.length > 0 && (
        <div className="p-4 bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-500/30">
          <h4 className="text-sm font-medium text-blue-200 mb-2">Recommendations</h4>
          <ul className="space-y-1">
            {batchResult.summary.recommendations.map((rec, index) => (
              <li key={index} className="text-xs text-blue-300 flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
