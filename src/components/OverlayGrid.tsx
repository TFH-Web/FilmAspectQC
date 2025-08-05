'use client';

import React from 'react';
import { SCREEN_DIMENSIONS } from '@/lib/constants';
import { MediaMeta } from '@/types/media';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OverlayGridProps {
  media: MediaMeta | null;
  containerWidth: number;
  containerHeight: number;
  showOverlay: boolean;
}

export function OverlayGrid({ media, containerWidth, containerHeight, showOverlay }: OverlayGridProps) {
  if (!media || !showOverlay) return null;
  
  // Calculate scale factor to fit the media into the container
  const scaleX = containerWidth / media.width;
  const scaleY = containerHeight / media.height;
  const scale = Math.min(scaleX, scaleY);
  
  // Calculate actual display dimensions
  const displayWidth = media.width * scale;
  const displayHeight = media.height * scale;
  
  // Calculate scale for overlay zones relative to the expected dimensions
  const overlayScale = displayWidth / SCREEN_DIMENSIONS.totalWidth;
  
  return (
    <TooltipProvider>
      <div 
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        style={{
          width: containerWidth,
          height: containerHeight,
          zIndex: 10 // Ensure overlay is above video controls
        }}
      >
        <div 
          className="relative"
          style={{
            width: displayWidth,
            height: displayHeight
          }}
        >
          {/* Pillar zones */}
          {SCREEN_DIMENSIONS.pillars.map((pillar) => (
            <Tooltip key={pillar.id}>
              <TooltipTrigger asChild>
                <div
                  className="absolute top-0 pointer-events-auto cursor-help"
                  style={{
                    left: `${pillar.x * overlayScale}px`,
                    width: `${SCREEN_DIMENSIONS.pillar.width * overlayScale}px`,
                    height: `${displayHeight}px`,
                    backgroundColor: SCREEN_DIMENSIONS.pillar.color,
                    border: `2px solid ${SCREEN_DIMENSIONS.pillar.borderColor}`,
                    boxSizing: 'border-box'
                  }}
                >
                  <div className="flex items-center justify-center h-full pointer-events-none">
                    <span className="text-white text-xs font-medium bg-black/80 px-2 py-1 rounded border border-red-500/50">
                      {pillar.id}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{pillar.label}</p>
                <p className="text-xs text-gray-400">360×1080px</p>
                <p className="text-xs text-red-400 mt-1">Content should not appear here</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {/* Safe zone (center screen) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute top-0 cursor-help"
                style={{
                  left: `${SCREEN_DIMENSIONS.safeZone.x * overlayScale}px`,
                  width: `${SCREEN_DIMENSIONS.safeZone.width * overlayScale}px`,
                  height: `${displayHeight}px`,
                  backgroundColor: SCREEN_DIMENSIONS.centerScreen.color,
                  border: `2px solid ${SCREEN_DIMENSIONS.centerScreen.borderColor}`,
                  boxSizing: 'border-box',
                  pointerEvents: 'none'
                }}
              >
                <div className="flex items-center justify-center h-full pointer-events-none">
                  <span className="text-white text-sm font-medium bg-black/80 px-3 py-1.5 rounded-lg border border-green-500/50">
                    CENTER
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Main Content Area</p>
              <p className="text-xs text-gray-400">2700×1080px</p>
              <p className="text-xs text-green-400 mt-1">Primary content should be here</p>
            </TooltipContent>
          </Tooltip>
          
          {/* HD Guideline Box (1920x1080) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute top-0 cursor-help"
                style={{
                  left: `${SCREEN_DIMENSIONS.hdGuideline.x * overlayScale}px`,
                  width: `${SCREEN_DIMENSIONS.hdGuideline.width * overlayScale}px`,
                  height: `${displayHeight}px`,
                  backgroundColor: SCREEN_DIMENSIONS.hdGuideline.color,
                  border: `2px dashed ${SCREEN_DIMENSIONS.hdGuideline.borderColor}`,
                  boxSizing: 'border-box',
                  pointerEvents: 'none'
                }}
              >
                <div className="flex items-end justify-center h-full pb-4 pointer-events-none">
                  <span className="text-white text-xs font-medium bg-black/80 px-2 py-1 rounded border border-blue-500/50">
                    HD 1920×1080
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{SCREEN_DIMENSIONS.hdGuideline.label}</p>
              <p className="text-xs text-gray-400">Standard HD content area</p>
              <p className="text-xs text-blue-400 mt-1">Use this as a guide for HD content</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Grid lines for reference */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical lines at pillar boundaries */}
            {[360, 720, 3420, 3780].map((x, i) => (
              <div
                key={`vline-${i}`}
                className="absolute top-0 opacity-50"
                style={{
                  left: `${x * overlayScale}px`,
                  width: '1px',
                  height: '100%',
                  backgroundColor: 'white',
                  boxShadow: '0 0 2px rgba(0,0,0,0.5)'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
