# Screen Reading Feature

## Overview
The screen reading feature uses local LLM (Ollama) to validate content readability and layout for the church's 5-screen display system.

## Setup

### 1. Install Ollama
Visit https://ollama.ai and install Ollama for your platform.

### 2. Pull the Vision Model
```bash
ollama pull llava
```

### 3. Start Ollama Service
```bash
ollama serve
```

## Usage

1. Upload a media file (image or video)
2. After the basic QC check, scroll down to find the "Screen Content Validation" section
3. Click "Validate Content" to analyze the media
4. The system will:
   - Check content readability for each screen region
   - Analyze text visibility and graphics quality
   - Detect spelling and grammar errors in any text
   - Identify layout issues
   - Provide suggestions for improvement

## Features

- **Multi-region Analysis**: Validates center screen and all pillar screens independently
- **Content Detection**: Identifies text, graphics, and layout issues
- **Readability Assessment**: Evaluates text size and contrast
- **Spelling & Grammar Check**: Detects and reports spelling mistakes and grammatical errors
- **Pillar-specific Checks**: Ensures content isn't cut off on narrow displays
- **Confidence Scoring**: Provides confidence levels for each validation

## Technical Details

### Components
- `ollamaService.ts` - Handles communication with Ollama API
- `screenCaptureUtils.ts` - Captures specific screen regions from media
- `screenValidationService.ts` - Orchestrates the validation process
- `ScreenValidation.tsx` - UI component for the validation feature

### Screen Regions
- Full Display: 4140×1080
- Center Screen: 2700×1080
- Pillars (1-4): 360×1080 each

## Troubleshooting

### Ollama Not Available
1. Ensure Ollama is installed and running
2. Check if the llava model is downloaded
3. Verify Ollama is accessible at http://localhost:11434

### Validation Fails
1. Check console for errors
2. Ensure the media file loaded correctly
3. Try re-validating after refreshing the page