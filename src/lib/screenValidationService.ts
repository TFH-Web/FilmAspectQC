import { MediaMeta, ScreenValidationResult, RegionValidation } from '@/types/media';
import { ollamaService } from './ollamaService';
import { easyOCRService } from './easyOcrService';
import { captureScreenRegion, captureFullImage, SCREEN_REGIONS } from './screenCaptureUtils';

export class ScreenValidationService {
  private static instance: ScreenValidationService;
  
  static getInstance(): ScreenValidationService {
    if (!ScreenValidationService.instance) {
      ScreenValidationService.instance = new ScreenValidationService();
    }
    return ScreenValidationService.instance;
  }
  
  private constructor() {}
  
  async validateMediaFile(file: File, media: MediaMeta): Promise<ScreenValidationResult> {
    const result: ScreenValidationResult = {
      validated: false,
      timestamp: new Date(),
      overallValid: false, // Start as false, set to true only if all checks pass
      confidence: 0,
      regions: {},
      summary: {
        totalIssues: 0,
        criticalIssues: [],
        suggestions: [],
      },
    };
    
    
    try {
      // Check if Ollama is available
      const isHealthy = await ollamaService.checkHealth();
      if (!isHealthy) {
        throw new Error('Ollama service is not available');
      }
      
      // Validate each region
      const regionValidations: Array<{
        key: string;
        validation: RegionValidation;
      }> = [];
      
      // Always validate center and full screens
      const regionsToValidate = ['center', 'full'];
      
      // Add pillars if content extends to them
      if (media.width === 4140) {
        regionsToValidate.push('pillar1', 'pillar2', 'pillar3', 'pillar4');
      }
      
      for (const regionKey of regionsToValidate) {
        const region = SCREEN_REGIONS[regionKey];
        if (!region) continue;
        
        try {
          // Create a clean URL from the original file to avoid UI overlays
          const fileUrl = URL.createObjectURL(file);
          const base64Image = await captureFullImage(fileUrl);
          URL.revokeObjectURL(fileUrl);
          
          // Use Tesseract for accurate OCR
          const ocrResult = await easyOCRService.extractText(base64Image);
          
          // Create validation result from OCR
          const validationResult = {
            isValid: ocrResult.spellingErrors.length === 0 && ocrResult.grammarIssues.length === 0,
            confidence: ocrResult.confidence,
            issues: [...ocrResult.spellingErrors, ...ocrResult.grammarIssues],
            suggestions: ocrResult.spellingErrors.length > 0 ? ['Fix spelling errors'] : [],
            textTranscription: ocrResult.allText,
            contentAnalysis: {
              hasText: ocrResult.allText.length > 0,
              textReadability: 'good',
              hasGraphics: true,
              colorContrast: 'good',
              layoutIssues: [],
              spellingErrors: ocrResult.spellingErrors,
              grammarIssues: ocrResult.grammarIssues,
            }
          };
          
          const regionValidation: RegionValidation = {
            isValid: validationResult.isValid,
            confidence: validationResult.confidence,
            issues: validationResult.issues,
            suggestions: validationResult.suggestions,
            textTranscription: validationResult.textTranscription,
            contentAnalysis: validationResult.contentAnalysis,
          };
          
          result.regions[regionKey as keyof typeof result.regions] = regionValidation;
          regionValidations.push({ key: regionKey, validation: regionValidation });
          
          // Update overall validity
          if (!validationResult.isValid) {
            result.overallValid = false;
          }
          
          // Collect issues
          result.summary.totalIssues += validationResult.issues.length;
          
          // Mark critical issues
          if (regionKey === 'center' && !validationResult.isValid) {
            result.summary.criticalIssues.push(`Center screen validation failed: ${validationResult.issues.join(', ')}`);
          }
          
          // Check for spelling errors
          if (validationResult.contentAnalysis.spellingErrors && validationResult.contentAnalysis.spellingErrors.length > 0) {
            result.summary.criticalIssues.push(`Spelling errors in ${region.name}: ${validationResult.contentAnalysis.spellingErrors.join(', ')}`);
          }
          
          // Check for grammar issues
          if (validationResult.contentAnalysis.grammarIssues && validationResult.contentAnalysis.grammarIssues.length > 0) {
            result.summary.criticalIssues.push(`Grammar issues in ${region.name}: ${validationResult.contentAnalysis.grammarIssues.join(', ')}`);
          }
          
          if (regionKey.startsWith('pillar') && validationResult.issues.some(issue => 
            issue.toLowerCase().includes('cut off') || issue.toLowerCase().includes('truncated')
          )) {
            result.summary.criticalIssues.push(`Content cut off in ${region.name}`);
          }
          
        } catch (error) {
          console.error(`Failed to validate ${regionKey}:`, error);
          result.regions[regionKey as keyof typeof result.regions] = {
            isValid: false,
            confidence: 0,
            issues: [`Failed to validate ${region.name}`],
            suggestions: [],
            contentAnalysis: {
              hasText: false,
              hasGraphics: false,
            },
          };
          result.summary.totalIssues++;
        }
      }
      
      // Calculate overall confidence
      if (regionValidations.length > 0) {
        result.confidence = regionValidations.reduce((sum, rv) => sum + rv.validation.confidence, 0) / regionValidations.length;
      }
      
      // Determine overall validity - based only on content validation (spelling/grammar/layout)
      const allRegionsValid = regionValidations.every(rv => rv.validation.isValid);
      result.overallValid = allRegionsValid && result.summary.criticalIssues.length === 0;
      
      // Generate summary suggestions
      const uniqueSuggestions = new Set<string>();
      
      // Add existing suggestions from regions
      regionValidations.forEach(rv => {
        rv.validation.suggestions.forEach(suggestion => {
          uniqueSuggestions.add(suggestion);
        });
      });
      
      // Add any new suggestions from this method
      result.summary.suggestions.forEach(suggestion => {
        uniqueSuggestions.add(suggestion);
      });
      
      if (result.overallValid && result.summary.totalIssues === 0) {
        uniqueSuggestions.add('All content checks passed - no spelling or grammar errors found');
      }
      
      result.summary.suggestions = Array.from(uniqueSuggestions);
      result.validated = true;
      
    } catch (error) {
      console.error('Screen validation error:', error);
      result.summary.criticalIssues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.summary.suggestions.push('Ensure Ollama is running with a vision model (llava)');
    }
    
    return result;
  }
  
  async checkOllamaStatus(): Promise<{
    available: boolean;
    models: string[];
    currentModel: string;
    error?: string;
  }> {
    try {
      const isHealthy = await ollamaService.checkHealth();
      if (!isHealthy) {
        return {
          available: false,
          models: [],
          currentModel: '',
          error: 'Ollama service is not running',
        };
      }
      
      const models = await ollamaService.getAvailableModels();
      const visionModels = models.filter(model => 
        model.includes('llava') || model.includes('vision')
      );
      
      if (visionModels.length === 0) {
        return {
          available: true,
          models,
          currentModel: '',
          error: 'No vision models found. Please pull llava model: ollama pull llava',
        };
      }
      
      return {
        available: true,
        models: visionModels,
        currentModel: visionModels[0],
      };
      
    } catch (error) {
      return {
        available: false,
        models: [],
        currentModel: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const screenValidationService = ScreenValidationService.getInstance();