/**
 * Color themes for the game
 */

export interface ColorTheme {
  id: string;
  name: string;
  colors: string[];
  symbols: string[];
}

export const colorThemes: ColorTheme[] = [
  {
    id: 'classic',
    name: 'Classic Ink',
    colors: [
      '#2d3748', // Charcoal
      '#744210', // Sepia
      '#7b341e', // Rust
      '#285e61', // Teal
      '#553c9a', // Purple
      '#1a365d', // Navy
    ],
    symbols: ['✦', '✧', '◆', '◇', '★', '☆', '●', '○', '■', '□', '▲', '△']
  },
  {
    id: 'autumn',
    name: 'Autumn Leaves',
    colors: [
      '#9c4221', // Burnt Orange
      '#744210', // Brown
      '#c05621', // Orange
      '#7b341e', // Rust
      '#975a16', // Gold
      '#6b4226', // Chestnut
    ],
    symbols: ['🍂', '🍁', '✿', '❀', '✾', '❁', '❃', '✽', '❋', '✳', '❈', '✹']
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    colors: [
      '#1a365d', // Navy
      '#2c5282', // Blue
      '#285e61', // Teal
      '#234e52', // Dark Teal
      '#2a4365', // Deep Blue
      '#2b6cb0', // Azure
    ],
    symbols: ['◈', '◇', '◆', '⬡', '⬢', '▽', '△', '○', '●', '◐', '◑', '◒']
  },
  {
    id: 'royal',
    name: 'Royal Court',
    colors: [
      '#553c9a', // Purple
      '#6b46c1', // Violet
      '#44337a', // Dark Purple
      '#322659', // Deep Violet
      '#702459', // Magenta
      '#7b341e', // Maroon
    ],
    symbols: ['♛', '♚', '♕', '♔', '⚜', '✦', '★', '◆', '❖', '✧', '✹', '✵']
  },
  {
    id: 'forest',
    name: 'Enchanted Forest',
    colors: [
      '#276749', // Forest Green
      '#2f855a', // Green
      '#285e61', // Dark Teal
      '#234e52', // Pine
      '#1c4532', // Deep Green
      '#744210', // Brown
    ],
    symbols: ['❧', '☘', '✿', '❀', '✾', '❁', '♣', '✤', '✥', '❋', '✳', '❈']
  },
  {
    id: 'midnight',
    name: 'Midnight Study',
    colors: [
      '#1a202c', // Almost Black
      '#2d3748', // Charcoal
      '#4a5568', // Gray
      '#1a365d', // Navy
      '#2d3748', // Dark Gray
      '#322659', // Dark Purple
    ],
    symbols: ['✦', '✧', '★', '☆', '◐', '◑', '●', '○', '◆', '◇', '■', '□']
  }
];

export const getThemeById = (id: string): ColorTheme => {
  return colorThemes.find(t => t.id === id) || colorThemes[0];
};

export const loadTheme = (): string => {
  try {
    return localStorage.getItem('archivist_color_theme') || 'classic';
  } catch {
    return 'classic';
  }
};

export const saveTheme = (themeId: string): void => {
  try {
    localStorage.setItem('archivist_color_theme', themeId);
  } catch (e) {
    console.error('Failed to save theme:', e);
  }
};
