import type { BlockColor, Shape } from './types';
import { getThemeById, loadTheme } from './data/colorThemes';

export const GRID_SIZE = 8;
export const PAPER_COLOR = '#f4ecd8';
export const INK_COLOR = '#2d241e';

// Default colors (will be overridden by theme)
export const COLORS: BlockColor[] = [
  '#1a365d', // Ink Blue
  '#742a2a', // Oxblood
  '#22543d', // Forest
  '#2d3748', // Charcoal
  '#7b341e'  // Sienna
];

export const SYMBOLS = ['◆', '▲', '●', '■', '✚'];

export const SHAPE_LIBRARY: number[][][] = [
  // Single blocks
  [[1]], 
  
  // Lines (horizontal and vertical)
  [[1, 1]], 
  [[1, 1, 1]], 
  [[1, 1, 1, 1]], 
  [[1, 1, 1, 1, 1]], // 5-long line
  [[1], [1]], 
  [[1], [1], [1]], 
  [[1], [1], [1], [1]], 
  [[1], [1], [1], [1], [1]], // 5-tall line
  
  // Squares
  [[1, 1], [1, 1]], 
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]], 
  
  // L-shapes (all rotations)
  [[1, 0], [1, 1]], 
  [[0, 1], [1, 1]], 
  [[1, 1], [1, 0]], 
  [[1, 1], [0, 1]], 
  [[1, 1, 1], [1, 0, 0]], 
  [[1, 1, 1], [0, 0, 1]], 
  [[1, 0], [1, 0], [1, 1]], 
  [[0, 1], [0, 1], [1, 1]], 
  
  // T-shapes
  [[1, 1, 1], [0, 1, 0]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0], [1, 1], [1, 0]],
  [[0, 1], [1, 1], [0, 1]],
  
  // S/Z-shapes
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 0], [1, 1], [0, 1]],
  [[0, 1], [1, 1], [1, 0]],
  
  // Plus/Cross shape
  [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
  
  // J-shapes  
  [[0, 1], [0, 1], [1, 1]],
  [[1, 0], [1, 0], [1, 1]],
  [[1, 1], [0, 1], [0, 1]],
  [[1, 1], [1, 0], [1, 0]],
  
  // 2x3 rectangles
  [[1, 1, 1], [1, 1, 1]],
  [[1, 1], [1, 1], [1, 1]],
];

export const getRandomShape = (themeId?: string): Shape => {
  const theme = getThemeById(themeId || loadTheme());
  const layout = SHAPE_LIBRARY[Math.floor(Math.random() * SHAPE_LIBRARY.length)];
  const colorIdx = Math.floor(Math.random() * theme.colors.length);
  const symbolIdx = Math.floor(Math.random() * theme.symbols.length);
  return {
    id: Math.random().toString(36).substr(2, 9),
    layout,
    color: theme.colors[colorIdx] as BlockColor,
    symbol: theme.symbols[symbolIdx]
  };
};
