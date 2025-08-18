# Church Media QC Tool

A modern quality control application for validating media content compatibility with multi-screen church display systems. Features a sleek glass-morphism UI design with unlimited file size support through local storage, batch upload capabilities, and intelligent navigation between files.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB-orange?style=flat-square)

## Overview

This tool validates media files against specific display requirements for a 5-screen stage configuration, ensuring content is properly formatted and positioned. Features local storage capabilities for handling files of any size without server uploads, plus advanced batch processing and navigation features.

### Display Configuration

```
| 360px | 360px |      2700px      | 360px | 360px |
|  P1   |  P2   |  Center Screen   |  P3   |  P4   |
```

- **Total Resolution:** 4140×1080px
- **Center Display:** 2700×1080px (main content area)
- **Pillar Displays:** 360×1080px (×4 vertical screens)
- **HD Guide:** 1920×1080px (standard content area within center)

## Features

### Core Functionality
- ✅ **Unlimited File Size** - No upload restrictions, files stored locally
- 🗄️ **Local Storage** - Uses IndexedDB for persistent file storage
- 🧹 **Storage Management** - Built-in cleanup and monitoring tools
- 🎨 **Glass UI Design** - Modern mirror/glass-morphism aesthetic
- 📏 **Real-time Preview** - View media with overlay zones
- 🎯 **Dimension Validation** - Automatic resolution checking
- 🎥 **Video Support** - Full playback controls for video files
- 📊 **Storage Monitoring** - Track local storage usage with visual indicators

### 🆕 **Batch Upload & Navigation System**
- **Dual Upload Modes** - Toggle between single file and batch upload
- **Multiple File Processing** - Upload and QC multiple files simultaneously
- **Batch Results Overview** - Comprehensive summary with pass/fail statistics
- **Smart Navigation** - Seamlessly move between batch overview and individual files
- **Keyboard Shortcuts** - Arrow keys for navigation, ESC to return
- **File Filtering** - Sort and filter batch results by status, name, or size
- **Contextual UI** - Interface adapts based on current view mode

### **Enhanced Overlay System**
- **Fixed Guidelines** - Overlay zones maintain correct 4140×1080 proportions
- **Consistent Display** - Guidelines never change size regardless of uploaded media dimensions
- **Visual Feedback** - Clear indicators for safe zones, pillar areas, and HD guidelines
- **Interactive Tooltips** - Hover for detailed information about each zone

### **🆕 Advanced Content Analysis**
- **Screen Reading Feature** - AI-powered text analysis to detect spelling mistakes and content issues
- **Content Validation** - Automatic detection of text problems in images and videos
- **Quality Assurance** - Comprehensive content review beyond just dimensions
- **Error Reporting** - Detailed feedback on content issues found

### **🆕 Interactive Stage Visualization**
- **3D Screen Replica** - Interactive 3D visualization of the stage layout
- **Spatial Understanding** - Better comprehension of how content maps to physical screens
- **Real-time Preview** - See content placement in 3D space
- **Stage Simulation** - Virtual representation of the actual church stage setup

### Storage Management Features
- **Auto-cleanup** - Automatically removes files older than 7 days
- **Manual cleanup** - Clear all storage with one click
- **Storage monitoring** - Visual progress bar showing usage
- **Warning system** - Alerts when storage reaches 80% capacity
- **File tracking** - Shows total files and combined size

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone repository
git clone https://github.com/TFH-Web/church-media-qc.git
cd church-media-qc

# Install dependencies
npm install

# Run development server
npm run dev
```

Access the application at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Usage

### Single File Upload
1. **Upload Media**
   - Drag and drop or click to select files
   - No file size limits
   - Files are stored locally in your browser

2. **Review Results**
   - Instant dimension validation
   - Pass/Fail status indicator
   - Detailed file information

3. **Preview with Overlays**
   - Toggle screen zone visualization
   - See how content maps to each display
   - HD guide shows standard 1920×1080 placement

### 🆕 **Batch Upload Workflow**
1. **Toggle to Batch Mode**
   - Switch between single file and batch upload modes
   - Visual indicators show current mode

2. **Select Multiple Files**
   - Drag & drop multiple files or browse to select
   - Support for mixed file types (images and videos)
   - Automatic validation and processing

3. **Review Batch Results**
   - Summary statistics (total, passed, failed)
   - Individual file results with status indicators
   - Filter and sort options for easy review

4. **Navigate Between Files**
   - Click "View" on any file to see individual preview
   - Use Previous/Next buttons or arrow keys to navigate
   - "Back to Batch" button returns to overview
   - ESC key provides quick return to batch view

5. **Batch Management**
   - Clear indication of which files pass/fail QC
   - Recommendations for common issues
   - Easy identification of problematic files

4. **Manage Storage**
   - Monitor storage usage in real-time
   - Clear all files when needed
   - Automatic cleanup of old files

## Project Structure

```
src/
├── app/              # Next.js app router
│   └── page.tsx     # Main application with batch support
├── components/       # React components
│   ├── MediaUploader.tsx      # Enhanced with batch mode toggle
│   ├── MediaPreview.tsx       # Media display component
│   ├── OverlayGrid.tsx        # Fixed scaling overlay system
│   ├── BatchQCResults.tsx     # 🆕 Batch results display
│   ├── StorageManager.tsx     # Storage management UI
│   └── ui/          # shadcn/ui components
├── lib/             # Utilities
│   ├── constants.ts
│   ├── mediaUtils.ts
│   └── storageUtils.ts        # IndexedDB implementation
└── types/           # TypeScript definitions
    └── media.ts     # 🆕 Enhanced with batch types
```

## Local Storage

The application uses IndexedDB for local file storage with intelligent management:

### Storage Features
- **No upload limits** - Store files of any size
- **Persistent storage** - Files remain after browser refresh
- **Auto-cleanup** - Removes files older than 7 days
- **Manual control** - Clear storage anytime
- **Browser-based** - No server infrastructure needed
- **Privacy-focused** - Files never leave your computer

### Storage API

```typescript
// Save media
await mediaStorage.saveMedia(file, dimensions)

// Retrieve media
await mediaStorage.getMedia(id)

// Get all stored media
await mediaStorage.getAllMedia()

// Delete specific file
await mediaStorage.deleteMedia(id)

// Clear all storage
await mediaStorage.clearAll()

// Check storage usage
await mediaStorage.getStorageInfo()

// Auto-cleanup old files (days to keep)
await autoCleanupOldFiles(7)
```

### Storage Limits

Browser storage quotas vary:
- **Chrome/Edge:** ~60% of free disk space
- **Firefox:** ~50% of free disk space  
- **Safari:** ~1GB initially, can request more

## Memory Management

The app efficiently manages memory through:

1. **IndexedDB Storage** - Files stored on disk, not RAM
2. **Object URL Cleanup** - Temporary URLs revoked after use
3. **Auto-cleanup** - Old files removed automatically
4. **Manual Control** - Clear storage when needed
5. **Visual Monitoring** - Track usage in real-time
6. **🆕 Batch Processing** - Efficient handling of multiple files

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 90+
- Safari 15+

**Note:** Requires browsers with IndexedDB support and modern JavaScript features.

## Configuration

### Display Dimensions
Modify in `src/lib/constants.ts`:

```typescript
export const SCREEN_DIMENSIONS = {
  totalWidth: 4140,
  totalHeight: 1080,
  centerScreen: { width: 2700, height: 1080 },
  pillar: { width: 360, height: 1080 }
}
```

### Auto-cleanup Settings
Adjust retention period in `src/app/page.tsx`:

```typescript
// Change the number of days to keep files
await autoCleanupOldFiles(7); // Currently 7 days
```

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check

# Local build
npm run build
```

## Deployment

Deployed on Vercel with automatic deployments from main branch.

Production URL: [https://filmqc.vercel.app](https://filmqc.vercel.app)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Known Limitations

- Storage quota varies by browser (typically 10-50% of available disk space)
- Very large video files may cause performance issues during processing
- Some older browsers may have reduced IndexedDB capabilities
- Batch processing performance depends on file sizes and system resources

## 🆕 **Recent Updates**

### **v2.0 - Batch Upload & Navigation System**
- **Fixed Overlay Scaling** - Guidelines now maintain correct proportions regardless of media dimensions
- **Batch Upload Mode** - Toggle between single and multiple file uploads
- **Smart Navigation** - Seamlessly move between batch overview and individual file views
- **Keyboard Shortcuts** - Arrow keys for navigation, ESC to return
- **Enhanced UI** - Contextual interface that adapts to current view mode
- **Batch QC Results** - Comprehensive overview with filtering and sorting options

### **v2.1 - Content Analysis & 3D Visualization** (Coming Soon)
- **Screen Reading Feature** - AI-powered text analysis for spelling and content validation
- **3D Screen Replica** - Interactive 3D stage visualization for better spatial understanding
- **Advanced QC** - Content quality assurance beyond dimension checking
- **Enhanced User Experience** - More intuitive stage layout comprehension

### **v1.0 - Core Features**
- Single file upload and validation
- Local storage with IndexedDB
- Overlay grid system for screen zones
- Storage management and monitoring

## Upcoming Features

- 🔍 **Search Function** - Find files by name, date, or dimensions
- 📊 **Advanced Analytics** - Detailed QC reports and statistics
- 🔄 **Batch Actions** - Bulk operations on multiple files
- 📖 **Screen Reading Feature** - AI-powered text analysis to detect spelling mistakes and content issues
- 🎭 **3D Screen Replica** - Interactive 3D visualization of the stage layout for better spatial understanding

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact the development team

---

Developed by [@Samppii](https://github.com/Samppii) for [TFH-Web](https://github.com/TFH-Web)
