import type { Shape, BlockColor } from '../types';
import { GRID_SIZE } from '../constants';

/**
 * Check if any shape from the tray can be placed on the grid.
 * Optimized to exit early when a valid placement is found.
 */
export const checkCanPlaceAny = (
  currentGrid: (BlockColor | null)[][],
  currentTray: (Shape | null)[]
): boolean => {
  const shapes = currentTray.filter((s): s is Shape => s !== null);
  if (shapes.length === 0) return true;

  for (const shape of shapes) {
    if (canPlaceShape(currentGrid, shape)) {
      return true;
    }
  }
  return false;
};

/**
 * Check if a specific shape can be placed anywhere on the grid.
 */
export const canPlaceShape = (
  grid: (BlockColor | null)[][],
  shape: Shape
): boolean => {
  const rows = shape.layout.length;
  const cols = shape.layout[0].length;
  
  for (let r = 0; r <= GRID_SIZE - rows; r++) {
    for (let c = 0; c <= GRID_SIZE - cols; c++) {
      if (canPlaceShapeAt(grid, shape, r, c)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Check if a shape can be placed at a specific position.
 */
export const canPlaceShapeAt = (
  grid: (BlockColor | null)[][],
  shape: Shape,
  row: number,
  col: number
): boolean => {
  const rows = shape.layout.length;
  const cols = shape.layout[0].length;
  
  if (row < 0 || col < 0 || row + rows > GRID_SIZE || col + cols > GRID_SIZE) {
    return false;
  }
  
  for (let dr = 0; dr < rows; dr++) {
    for (let dc = 0; dc < cols; dc++) {
      if (shape.layout[dr][dc] && grid[row + dr][col + dc]) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Calculate which lines would be cleared if a shape is placed.
 */
export const calculatePotentialLines = (
  grid: (BlockColor | null)[][],
  shape: Shape,
  row: number,
  col: number
): { rows: number[]; cols: number[] } => {
  // First check if placement is valid
  if (!canPlaceShapeAt(grid, shape, row, col)) {
    return { rows: [], cols: [] };
  }

  // Create simulated grid with the shape placed
  const simGrid = grid.map(r => [...r]);
  shape.layout.forEach((sRow, dr) => {
    sRow.forEach((filled, dc) => {
      if (filled) {
        simGrid[row + dr][col + dc] = shape.color;
      }
    });
  });

  // Find complete lines
  const rowsToClear: number[] = [];
  const colsToClear: number[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    if (simGrid[r].every(cell => cell !== null)) {
      rowsToClear.push(r);
    }
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    let full = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (simGrid[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) {
      colsToClear.push(c);
    }
  }

  return { rows: rowsToClear, cols: colsToClear };
};

/**
 * Calculate grid position from drag coordinates.
 */
export const calculateGridPosition = (
  dragPos: { x: number; y: number },
  boardRect: DOMRect,
  shape: Shape,
  canvasSize: number = 600
): { row: number; col: number } => {
  const verticalOffset = boardRect.height * 0.18;
  const scaleX = canvasSize / boardRect.width;
  const scaleY = canvasSize / boardRect.height;
  const cellSize = canvasSize / GRID_SIZE;
  
  const col = Math.round(
    ((dragPos.x - boardRect.left) * scaleX - (shape.layout[0].length * cellSize) / 2) / cellSize
  );
  const row = Math.round(
    ((dragPos.y - boardRect.top - verticalOffset) * scaleY - (shape.layout.length * cellSize) / 2) / cellSize
  );
  
  return { row, col };
};

/**
 * Create an empty grid.
 */
export const createEmptyGrid = (): (BlockColor | null)[][] => {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
};
