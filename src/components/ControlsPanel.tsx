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
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border-gray-700">
      <CardContent className="p-6 space-y-6">
        {/* Overlay Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Grid3x3 className="h-5 w-5 text-purple-400" />
            </div>
            <Label htmlFor="overlay-toggle" className="text-sm font-medium text-gray-200">
              Show Screen Zones
            </Label>
          </div>
          <Switch
            id="overlay-toggle"
            checked={showOverlay}
            onCheckedChange={onToggleOverlay}
            disabled={!media}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>
        
        <Separator className="bg-gray-700" />
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-gray-200 hover:text-white transition-all duration-200"
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
            className="w-full justify-start bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-gray-200 hover:text-white transition-all duration-200"
            onClick={handleExportScreenshot}
            disabled={!media}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Screenshot
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start bg-red-950/30 border-red-900/50 text-red-400 hover:bg-red-950/50 hover:text-red-300 hover:border-red-800 transition-all duration-200"
            onClick={onReset}
            disabled={!media}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset & Upload New
          </Button>
        </div>
        
        {/* Help Text */}
        <div className="pt-2 p-4 bg-blue-950/30 rounded-lg border border-blue-900/50">
          <p className="text-xs text-blue-300">
            <strong className="text-blue-200">Tip:</strong> The overlay shows where content will appear on each screen. 
            Red zones are pillars (avoid content here), green zone is the main display area.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
