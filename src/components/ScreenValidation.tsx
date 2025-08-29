import React, { useState, useCallback } from 'react';
import { MediaMeta, QCResult, ScreenValidationResult } from '@/types/media';
import { screenValidationService } from '@/lib/screenValidationService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Scan, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Monitor,
  Server,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ScreenValidationProps {
  media: MediaMeta;
  qcResult: QCResult;
  currentFile: File | null;
  onValidationComplete: (result: ScreenValidationResult) => void;
}

export function ScreenValidation({ media, qcResult, currentFile, onValidationComplete }: ScreenValidationProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<{
    checked: boolean;
    available: boolean;
    error?: string;
  }>({ checked: false, available: false });
  const [validationResult, setValidationResult] = useState<ScreenValidationResult | null>(
    qcResult.screenValidation || null
  );
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});
  
  const checkOllamaStatus = useCallback(async () => {
    const status = await screenValidationService.checkOllamaStatus();
    setOllamaStatus({
      checked: true,
      available: status.available,
      error: status.error,
    });
  }, []);
  
  const handleValidation = useCallback(async () => {
    if (!currentFile) {
      console.error('No file available for validation');
      return;
    }
    
    setIsValidating(true);
    
    try {
      const result = await screenValidationService.validateMediaFile(currentFile, media);
      setValidationResult(result);
      onValidationComplete(result);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [currentFile, media, onValidationComplete]);
  
  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => ({
      ...prev,
      [region]: !prev[region],
    }));
  };
  
  // Check Ollama status on mount
  React.useEffect(() => {
    checkOllamaStatus();
  }, [checkOllamaStatus]);
  
  const regionNames: Record<string, string> = {
    full: 'Full Display',
    center: 'Center Screen',
    pillar1: 'Pillar 1',
    pillar2: 'Pillar 2',
    pillar3: 'Pillar 3',
    pillar4: 'Pillar 4',
  };
  
  return (
    <div className="space-y-4">
      {/* Ollama Status Card */}
      <Card className="p-4 bg-white/5 border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-gray-400" />
            <div>
              <h3 className="text-sm font-medium text-white">Ollama Status</h3>
              <p className="text-xs text-gray-400">
                {!ollamaStatus.checked ? 'Checking...' :
                 ollamaStatus.available ? 'Connected to local LLM' :
                 ollamaStatus.error || 'Not available'}
              </p>
            </div>
          </div>
          <Badge variant={ollamaStatus.available ? "default" : "destructive"}>
            {ollamaStatus.available ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </Card>
      
      {/* Validation Action Card */}
      <Card className="p-6 bg-white/5 border-white/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scan className="h-6 w-6 text-white" />
              <div>
                <h3 className="text-lg font-medium text-white">Screen Content Validation</h3>
                <p className="text-sm text-gray-400">
                  Analyze content readability and layout using AI
                </p>
              </div>
            </div>
          </div>
          
          <Separator className="bg-white/10" />
          
          {!ollamaStatus.available && ollamaStatus.checked && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-sm text-yellow-200">
                Ollama is not available. Make sure it&apos;s running with:
              </p>
              <code className="block mt-2 text-xs bg-black/20 p-2 rounded">
                ollama run llava
              </code>
            </div>
          )}
          
          {validationResult && (
            <div className="bg-black/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {validationResult.overallValid ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className="text-sm font-medium text-white">
                    {validationResult.overallValid ? 'Content Validated' : 'Content Issues Found'}
                  </span>
                  <Badge 
                    variant={validationResult.overallValid ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {validationResult.summary.totalIssues} issues
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs">
                  Confidence: {(validationResult.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
              
              {validationResult.summary.criticalIssues.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-red-400 font-medium">Critical Issues:</p>
                  {validationResult.summary.criticalIssues.map((issue, idx) => (
                    <p key={idx} className="text-xs text-red-300 pl-4">• {issue}</p>
                  ))}
                </div>
              )}
              
              {validationResult.summary.suggestions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-blue-400 font-medium">Suggestions:</p>
                  {validationResult.summary.suggestions.map((suggestion, idx) => (
                    <p key={idx} className="text-xs text-blue-300 pl-4">• {suggestion}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <Button
            onClick={handleValidation}
            disabled={!ollamaStatus.available || isValidating}
            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating Content...
              </>
            ) : (
              <>
                <Scan className="h-4 w-4 mr-2" />
                {validationResult ? 'Re-validate Content' : 'Validate Content'}
              </>
            )}
          </Button>
        </div>
      </Card>
      
      {/* Region Results */}
      {validationResult && validationResult.validated && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Region Analysis</h4>
          
          {Object.entries(validationResult.regions).map(([key, region]) => {
            if (!region) return null;
            const isExpanded = expandedRegions[key];
            
            return (
              <Card 
                key={key} 
                className="bg-white/5 border-white/10 overflow-hidden cursor-pointer"
                onClick={() => toggleRegion(key)}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-white">
                        {regionNames[key] || key}
                      </span>
                      <Badge 
                        variant={region.isValid ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {region.isValid ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {region.issues.length} issues
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                      {/* Content Analysis */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Has Text:</span>
                          <span className="text-white">
                            {region.contentAnalysis.hasText ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Has Graphics:</span>
                          <span className="text-white">
                            {region.contentAnalysis.hasGraphics ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {region.contentAnalysis.textReadability && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Text Readability:</span>
                            <span className={`capitalize ${
                              region.contentAnalysis.textReadability === 'good' ? 'text-green-400' :
                              region.contentAnalysis.textReadability === 'fair' ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {region.contentAnalysis.textReadability}
                            </span>
                          </div>
                        )}
                        {region.contentAnalysis.colorContrast && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Color Contrast:</span>
                            <span className={`capitalize ${
                              region.contentAnalysis.colorContrast === 'good' ? 'text-green-400' :
                              region.contentAnalysis.colorContrast === 'fair' ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {region.contentAnalysis.colorContrast}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Text Transcription */}
                      {region.textTranscription && (
                        <div className="space-y-1">
                          <p className="text-xs text-blue-400 font-medium">Text Found:</p>
                          <p className="text-xs text-blue-200 pl-3 italic">"{region.textTranscription}"</p>
                        </div>
                      )}
                      
                      {/* Text Analysis Results */}
                      {region.contentAnalysis.hasText && (
                        <>
                          {/* Spelling Check */}
                          <div className="space-y-1">
                            <p className="text-xs font-medium flex items-center gap-2">
                              <span className="text-gray-400">Spelling:</span>
                              {region.contentAnalysis.spellingErrors && region.contentAnalysis.spellingErrors.length > 0 ? (
                                <Badge variant="destructive" className="text-[10px] h-4">
                                  {region.contentAnalysis.spellingErrors.length} errors
                                </Badge>
                              ) : (
                                <Badge variant="default" className="text-[10px] h-4">
                                  ✓ Correct
                                </Badge>
                              )}
                            </p>
                            {region.contentAnalysis.spellingErrors && region.contentAnalysis.spellingErrors.length > 0 && (
                              <div className="pl-3 space-y-1">
                                {region.contentAnalysis.spellingErrors.map((error, idx) => (
                                  <p key={idx} className="text-xs text-red-300">• {error}</p>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Grammar Check */}
                          <div className="space-y-1">
                            <p className="text-xs font-medium flex items-center gap-2">
                              <span className="text-gray-400">Grammar:</span>
                              {region.contentAnalysis.grammarIssues && region.contentAnalysis.grammarIssues.length > 0 ? (
                                <Badge variant="destructive" className="text-[10px] h-4">
                                  {region.contentAnalysis.grammarIssues.length} issues
                                </Badge>
                              ) : (
                                <Badge variant="default" className="text-[10px] h-4">
                                  ✓ Correct
                                </Badge>
                              )}
                            </p>
                            {region.contentAnalysis.grammarIssues && region.contentAnalysis.grammarIssues.length > 0 && (
                              <div className="pl-3 space-y-1">
                                {region.contentAnalysis.grammarIssues.map((issue, idx) => (
                                  <p key={idx} className="text-xs text-yellow-300">• {issue}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      
                      {/* Issues */}
                      {region.issues.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-red-400 font-medium">Other Issues:</p>
                          {region.issues.map((issue, idx) => (
                            <p key={idx} className="text-xs text-gray-300 pl-3">• {issue}</p>
                          ))}
                        </div>
                      )}
                      
                      {/* Suggestions */}
                      {region.suggestions.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-blue-400 font-medium">Suggestions:</p>
                          {region.suggestions.map((suggestion, idx) => (
                            <p key={idx} className="text-xs text-gray-300 pl-3">• {suggestion}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}