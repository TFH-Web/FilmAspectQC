'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MediaMeta } from '@/types/media';
import { OverlayGrid } from './OverlayGrid';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card } from '@/components/ui/card';

interface MediaPreviewProps {
  media: MediaMeta | null;
  showOverlay: boolean;
}

export function MediaPreview({ media, showOverlay }: MediaPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [media]);
  
  if (!media) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-400">No media uploaded yet</p>
      </Card>
    );
  }
  
  return (
    <Card className="w-full overflow-hidden bg-black">
      <AspectRatio ratio={4140 / 1080} className="bg-gray-900">
        <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              style={{ display: 'block' }}
            />
          ) : (
            <video
              src={media.url}
              controls
              className="max-w-full max-h-full object-contain"
              style={{ display: 'block' }}
            >
              Your browser does not support the video tag.
            </video>
          )}
          
          <OverlayGrid
            media={media}
            containerWidth={containerDimensions.width}
            containerHeight={containerDimensions.height}
            showOverlay={showOverlay}
          />
        </div>
      </AspectRatio>
    </Card>
  );
}
