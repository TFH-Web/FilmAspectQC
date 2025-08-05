'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MediaMeta } from '@/types/media';
import { OverlayGrid } from './OverlayGrid';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface MediaPreviewProps {
  media: MediaMeta | null;
  showOverlay: boolean;
}

export function MediaPreview({ media, showOverlay }: MediaPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  
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
      <div className="w-full h-[400px] flex items-center justify-center bg-black/50 rounded-xl border border-gray-800">
        <p className="text-gray-500 text-sm">No media uploaded</p>
      </div>
    );
  }
  
  // Hide overlay when hovering over video to access controls
  const shouldShowOverlay = showOverlay && !(media.type === 'video' && isVideoHovered);
  
  return (
    <div className="w-full overflow-hidden bg-black rounded-xl border border-gray-800">
      <AspectRatio ratio={4140 / 1080} className="bg-black">
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
              style={{ 
                display: 'block',
                position: 'relative',
                zIndex: 1 
              }}
              onMouseEnter={() => setIsVideoHovered(true)}
              onMouseLeave={() => setIsVideoHovered(false)}
            >
              Your browser does not support the video tag.
            </video>
          )}
          
          <OverlayGrid
            media={media}
            containerWidth={containerDimensions.width}
            containerHeight={containerDimensions.height}
            showOverlay={shouldShowOverlay}
          />
          
          {/* Show hint when video is hovered */}
          {media.type === 'video' && isVideoHovered && showOverlay && (
            <div className="absolute top-4 right-4 bg-black/90 text-white text-xs px-3 py-2 rounded-lg border border-gray-800">
              Overlay hidden while hovering
            </div>
          )}
        </div>
      </AspectRatio>
    </div>
  );
}
