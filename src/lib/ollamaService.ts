interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  context?: number[];
  images?: string[];
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
}

interface ContentValidationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
  textTranscription?: string;
  contentAnalysis: {
    hasText: boolean;
    textReadability?: string;
    hasGraphics: boolean;
    colorContrast?: string;
    layoutIssues?: string[];
    spellingErrors?: string[];
    grammarIssues?: string[];
  };
}

class OllamaService {
  private baseUrl: string;
  private model: string;
  
  constructor(baseUrl = 'http://localhost:11434', model = 'llava:13b') {
    this.baseUrl = baseUrl;
    this.model = model;
  }
  
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama health check failed:', error);
      return false;
    }
  }
  
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      
      const data = await response.json();
      return data.models?.map((model: { name: string }) => model.name) || [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [];
    }
  }
  
  async generateResponse(prompt: string, context?: number[], images?: string[]): Promise<OllamaResponse> {
    const request: OllamaGenerateRequest = {
      model: this.model,
      prompt,
      stream: false,
      context,
      images,
      options: {
        temperature: 0.1,
        top_p: 0.9,
        top_k: 40,
        num_predict: 500,
        num_ctx: 4096,
      },
    };
    
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating Ollama response:', error);
      throw error;
    }
  }
  
  async validateScreenContent(
    imageBase64: string,
    screenType: 'center' | 'pillar' | 'full'
  ): Promise<ContentValidationResult> {
    const prompt = `Look at this image and transcribe ALL text you can see. Read everything from top to bottom, left to right.

Find and list EVERY word including:
- Large headings
- Small button text  
- Navigation items
- Descriptions and paragraphs
- Any other text no matter how small

Do not miss any text. Be thorough.

LOOK HARDER: Based on this church interface, you should typically find:
- Main headings and titles
- Navigation text like "Give Monthly", "Our Partners", "Impact Tips"
- Taglines like "We will live for the bigger picture, taking action locally and globally"
- Button labels and menu items
- QR code labels or descriptions
- App store links like "TFH APP", "TFH.ORG"
- Any calls to action or descriptive text

SEARCH TECHNIQUE:
1. Zoom into each quadrant of the image mentally
2. Look for text against different colored backgrounds
3. Check for text overlays on images
4. Look for small text that might be hard to see
5. Don't just look at obvious places - scan systematically

YOU ARE FAILING IF YOU MISS OBVIOUS TEXT. Be extremely thorough.

SCAN METHOD:
1. Look at the TOP of the image - any headers, titles, version numbers
2. Look at the LEFT side - any menu items, labels, buttons  
3. Look at the RIGHT side - any status text, values, indicators
4. Look at the BOTTOM - any footer text, credits, information
5. Look at the CENTER - main content, headings, body text
6. Look for ANY text overlays on graphics or backgrounds
7. Look for text in input fields, forms, or interface elements
8. Look for small text like file names, timestamps, coordinates
9. Look for text in tables, lists, or data displays
10. Look for text on buttons, even if partially visible

EXAMPLES of text you should find:
- Version numbers (v1.0, v2.1, etc.)
- Interface labels (Login, Settings, Help, etc.)  
- Status indicators (Online, Offline, Connected, etc.)
- File names or paths
- Time stamps or dates
- Any numbers or codes
- Form field labels
- Button text
- Menu items

TRANSCRIPTION REQUIREMENTS:
- Write down EVERY word you see, even if it's tiny
- Include punctuation and special characters
- If text is partially cut off, note what you can see
- Group related text logically but list everything

SPELL CHECK REQUIREMENTS:
- Check EVERY transcribed word for spelling errors
- Common errors to look for: typos, missing letters, wrong letters
- Return empty arrays [] only if spelling/grammar is perfect
- Be extremely thorough

YOU MUST RESPOND WITH ONLY VALID JSON IN THIS EXACT FORMAT:

{
  "isValid": true,
  "confidence": 0.95,
  "issues": [],
  "suggestions": [],
  "textTranscription": "ACTUAL TEXT YOU SEE - REPLACE THIS WITH REAL TEXT FROM IMAGE",
  "contentAnalysis": {
    "hasText": true,
    "textReadability": "good",
    "hasGraphics": true,
    "colorContrast": "good", 
    "layoutIssues": [],
    "spellingErrors": [],
    "grammarIssues": []
  }
}

CRITICAL: Replace "ACTUAL TEXT YOU SEE - REPLACE THIS WITH REAL TEXT FROM IMAGE" with the real text you find in the image. Do NOT return template text.`;

    try {
      // Check if we have a vision model
      const isVisionModel = this.model.toLowerCase().includes('llava') || 
                           this.model.toLowerCase().includes('vision');
      
      let response: OllamaResponse;
      if (isVisionModel) {
        // Use proper Ollama image format
        response = await this.generateResponse(prompt, undefined, [imageBase64]);
      } else {
        // Fallback for text-only models - analyze based on basic image properties
        const fallbackPrompt = `You are analyzing a church display screen image. Based on the image dimensions and type, provide content validation feedback. Since this is a text-only model, focus on general recommendations for ${screenType} screens.\n\n${prompt}`;
        response = await this.generateResponse(fallbackPrompt);
      }
      
      // Parse the LLM response
      console.log('Raw Ollama response:', response.response);
      
      // Try different JSON extraction methods
      let jsonStr = '';
      
      // Method 1: Look for ```json blocks
      const jsonBlockMatch = response.response.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonBlockMatch) {
        jsonStr = jsonBlockMatch[1];
      } else {
        // Method 2: Look for any JSON object
        const jsonMatch = response.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
      }
      
      console.log('Extracted JSON string:', jsonStr);
      
      if (jsonStr) {
        try {
          // Clean the JSON string
          let cleanJson = jsonStr
            .replace(/,\s*}/g, '}')  // Remove trailing commas
            .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
            .trim();
          
          console.log('Cleaned JSON string:', cleanJson);
          
          const result = JSON.parse(cleanJson);
          console.log('Parsed validation result:', result);
        
        // Handle textTranscription as array, object, or string
        if (Array.isArray(result.textTranscription)) {
          result.textTranscription = result.textTranscription.join(', ');
        } else if (typeof result.textTranscription === 'object' && result.textTranscription !== null) {
          // Handle structured objects like {mainHeading: "...", subHeadings: [...], etc}
          const textParts: string[] = [];
          const traverse = (obj: any): void => {
            for (const value of Object.values(obj)) {
              if (typeof value === 'string') {
                textParts.push(value);
              } else if (Array.isArray(value)) {
                textParts.push(...value.filter(v => typeof v === 'string'));
              } else if (typeof value === 'object' && value !== null) {
                traverse(value);
              }
            }
          };
          traverse(result.textTranscription);
          result.textTranscription = textParts.join(', ');
        }
        
        return result as ContentValidationResult;
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          console.log('Failed to parse JSON string:', jsonStr);
        }
      }
      
      // Fallback if JSON parsing fails
      return {
        isValid: false,
        confidence: 0,
        issues: isVisionModel ? ['Failed to parse LLM response'] : ['Vision model required for detailed analysis'],
        suggestions: isVisionModel ? ['Please try again or check Ollama configuration'] : ['Install llava model: ollama pull llava'],
        contentAnalysis: {
          hasText: false,
          hasGraphics: false,
        },
      };
    } catch (error) {
      console.error('Error validating screen content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        isValid: false,
        confidence: 0,
        issues: [`Failed to validate content with Ollama: ${errorMessage}`],
        suggestions: ['Ensure Ollama is running and accessible', 'For full screen reading, install: ollama pull llava'],
        contentAnalysis: {
          hasText: false,
          hasGraphics: false,
        },
      };
    }
  }
  
  setModel(model: string) {
    this.model = model;
  }
}

// Export singleton instance
export const ollamaService = new OllamaService();

// Export types
export type { ContentValidationResult, OllamaResponse };