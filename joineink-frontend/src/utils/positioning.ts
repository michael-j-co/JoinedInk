import { MediaItem, DrawingData } from '../types';

/**
 * Generates a position for a new media item that avoids overlapping with existing items
 */
export const generateNonOverlappingPosition = (
  existingItems: (MediaItem | DrawingData)[],
  containerWidth: number = 500,
  containerHeight: number = 300
): { x: number; y: number; zIndex: number } => {
  const itemSize = 80; // Approximate size for collision detection
  const margin = 15;
  
  // Try positions in a grid pattern
  for (let row = 0; row < Math.floor(containerHeight / (itemSize + margin)); row++) {
    for (let col = 0; col < Math.floor(containerWidth / (itemSize + margin)); col++) {
      const x = col * (itemSize + margin) + margin;
      const y = row * (itemSize + margin) + margin;
      
      // Check if this position overlaps with any existing item
      const overlaps = existingItems.some(item => {
        if (!item.position) return false;
        
        const distance = Math.sqrt(
          Math.pow(item.position.x - x, 2) + Math.pow(item.position.y - y, 2)
        );
        
        return distance < itemSize;
      });
      
      if (!overlaps) {
        return { x, y, zIndex: 1 };
      }
    }
  }
  
  // Fallback: random position if no non-overlapping position found
  return {
    x: Math.random() * (containerWidth - itemSize),
    y: Math.random() * (containerHeight - itemSize),
    zIndex: 1
  };
};

/**
 * Calculates the next available z-index for layering items
 */
export const getNextZIndex = (existingItems: (MediaItem | DrawingData)[]): number => {
  const maxZIndex = existingItems.reduce((max, item) => {
    return Math.max(max, item.position?.zIndex || 0);
  }, 0);
  
  return maxZIndex + 1;
}; 