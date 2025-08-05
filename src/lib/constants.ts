export const SCREEN_DIMENSIONS = {
  // Individual screen dimensions
  centerScreen: {
    width: 2700,
    height: 1080,
    label: 'Center Screen',
    color: 'rgba(34, 197, 94, 0.3)', // green-500 with opacity
    borderColor: 'rgb(34, 197, 94)'
  },
  pillar: {
    width: 360,
    height: 1080,
    label: 'Pillar',
    color: 'rgba(239, 68, 68, 0.3)', // red-500 with opacity
    borderColor: 'rgb(239, 68, 68)'
  },
  
  // Total stage dimensions
  totalWidth: 4140,
  totalHeight: 1080,
  
  // Pillar positions (from left)
  pillars: [
    { id: 'P1', x: 0, label: 'Pillar 1 (Left)' },
    { id: 'P2', x: 360, label: 'Pillar 2 (Left)' },
    { id: 'P3', x: 3420, label: 'Pillar 3 (Right)' },  // 720 + 2700 = 3420
    { id: 'P4', x: 3780, label: 'Pillar 4 (Right)' }
  ],
  
  // Safe zone (center screen area)
  safeZone: {
    x: 720, // Two pillars width
    y: 0,
    width: 2700,
    height: 1080
  },
  
  // HD content guideline (1920x1080 centered in the 2700px center screen)
  hdGuideline: {
    width: 1920,
    height: 1080,
    x: 720 + (2700 - 1920) / 2, // Center it within the center screen
    y: 0,
    label: 'HD Content Guide (1920×1080)',
    color: 'rgba(59, 130, 246, 0.3)', // blue-500 with opacity
    borderColor: 'rgb(59, 130, 246)'
  }
} as const;

export const ACCEPTED_FILE_TYPES = {
  image: ['image/png', 'image/jpeg', 'image/jpg'],
  video: ['video/mp4', 'video/quicktime', 'video/x-m4v']
} as const;

export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
