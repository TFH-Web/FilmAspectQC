# Church Media QC Tool

A quality control application for validating media content compatibility with multi-screen display systems.

## Overview

This tool validates media files against specific display requirements for a 5-screen stage configuration, ensuring content is properly formatted and positioned.

### Display Configuration

```
| 360px | 360px |      2700px      | 360px | 360px |
|  P1   |  P2   |  Center Screen   |  P3   |  P4   |
```

- **Total Resolution:** 4140×1080px
- **Center Display:** 2700×1080px
- **Pillar Displays:** 360×1080px (×4)

## Features

- Media upload support (PNG, JPG, MP4, MOV)
- Real-time preview with overlay zones
- Automatic dimension validation
- File information and QC status reporting
- Video playback controls

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

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
├── lib/             # Utilities and constants
└── types/           # TypeScript definitions
```

## Usage

1. Upload media files via drag-and-drop or file selection
2. Review overlay visualization showing screen zones
3. Check QC status for dimension compliance
4. Toggle overlay visibility as needed

### QC Status Indicators

- **Pass:** Exact dimension match (4140×1080px)
- **Warning:** Correct aspect ratio, different resolution
- **Fail:** Incorrect dimensions or aspect ratio

## Technical Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components

## Configuration

Display dimensions are defined in `src/lib/constants.ts` and can be modified as needed.

## Contributing

Please submit pull requests for any enhancements or bug fixes. Follow the existing code style and include appropriate documentation.

## License

MIT License

## Contact

Developed by [@Samppii](https://github.com/Samppii) for [TFH-Web](https://github.com/TFH-Web)
