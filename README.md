# Church Media QC Tool

A modern quality control application for validating media content compatibility with multi-screen church display systems. Features a sleek glass-morphism UI design with unlimited file size support through local storage.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB-orange?style=flat-square)

## Overview

This tool validates media files against specific display requirements for a 5-screen stage configuration, ensuring content is properly formatted and positioned. Features local storage capabilities for handling files of any size without server uploads.

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
- 🎨 **Glass UI Design** - Modern mirror/glass-morphism aesthetic
- 📏 **Real-time Preview** - View media with overlay zones
- 🎯 **Dimension Validation** - Automatic resolution checking
- 🎥 **Video Support** - Full playback controls for video files
- 📊 **Storage Monitoring** - Track local storage usage

### Technical Features
- **File Types:** PNG, JPG, MP4, MOV
- **Storage:** Browser IndexedDB (no server required)
- **Performance:** Optimized for large files
- **Overlay System:** Toggle screen zones visualization
- **Responsive:** Desktop-optimized interface

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

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
│   ├── MediaUploader.tsx
│   ├── MediaPreview.tsx
│   ├── OverlayGrid.tsx
│   └── ui/          # shadcn/ui components
├── lib/             # Utilities
│   ├── constants.ts
│   ├── mediaUtils.ts
│   └── storageUtils.ts  # IndexedDB implementation
└── types/           # TypeScript definitions
```

## Local Storage

The application uses IndexedDB for local file storage:

- **No upload limits** - Store files of any size
- **Persistent storage** - Files remain after browser refresh
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

// Check storage usage
await mediaStorage.getStorageInfo()
```

## Upcoming Features

### 🔄 File History Panel
Show and manage previously uploaded files with quick access to past QC results.

### 🧹 Storage Management
- Clear all stored files button
- Individual file deletion
- Storage usage statistics
- Quota warnings

### ⏰ Auto-cleanup
- Configurable retention periods
- Automatic removal of old files
- Smart storage optimization
- Keep recent or starred files

### 📦 Export/Import
- Backup stored files to disk
- Export QC reports
- Import media collections
- Share configurations

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 90+
- Safari 15+

**Note:** Requires browsers with IndexedDB support and modern JavaScript features.

## Configuration

Display dimensions can be modified in `src/lib/constants.ts`:

```typescript
export const SCREEN_DIMENSIONS = {
  totalWidth: 4140,
  totalHeight: 1080,
  centerScreen: { width: 2700, height: 1080 },
  pillar: { width: 360, height: 1080 }
}
```

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

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

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact the development team
- Check the [wiki](https://github.com/TFH-Web/church-media-qc/wiki) for guides

---

Developed by [@Samppii](https://github.com/Samppii) for [TFH-Web](https://github.com/TFH-Web)
