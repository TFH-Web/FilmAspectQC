'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, RotateCcw, Download, Grid3x3 } from 'lucide-react';
import { MediaMeta } from '@/types/media';

interface ControlsPanelProps {
  showOverlay: boolean;
  onToggleOverlay: (show: boolean) => void;
  onReset: () => void;
  media: MediaMeta | null;
}

export function ControlsPanel({ 
  showOverlay, 
  onToggleOverlay, 
  onReset, 
  media 
}: ControlsPanelProps) {
  
  const handleExportScreenshot = () => {
    // This is a placeholder for screenshot functionality
    // In a real implementation, you'd use html2canvas or similar
    alert('Screenshot export will be implemented in the next version');
  };
  
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Overlay Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Grid3x3 className="h-4 w-4 text-gray-500" />
            <Label htmlFor="overlay-toggle" className="text-sm font-medium">
              Show Screen Zones
            </Label>
          </div>
          <Switch
            id="overlay-toggle"
            checked={showOverlay}
            onCheckedChange={onToggleOverlay}
            disabled={!media}
          />
        </div>
        
        <Separator />
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => onToggleOverlay(!showOverlay)}
            disabled={!media}
          >
            {showOverlay ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Overlay
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show Overlay
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleExportScreenshot}
            disabled={!media}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Screenshot
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={onReset}
            disabled={!media}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset & Upload New
          </Button>
        </div>
        
        {/* Help Text */}
        <div className="pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Tip:</strong> The overlay shows where content will appear on each screen. 
            Red zones are pillars (avoid content here), green zone is the main display area.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
