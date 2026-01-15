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
  },
  {
    id: 'sakura',
    name: 'Sakura Bloom',
    colors: [
      '#97266d', // Deep Pink
      '#b83280', // Magenta
      '#d53f8c', // Rose
      '#ed64a6', // Pink
      '#702459', // Plum
      '#553c9a', // Purple
    ],
    symbols: ['❀', '✿', '❁', '✾', '❃', '✽', '❋', '✳', '❈', '✹', '❉', '✵']
  },
  {
    id: 'ember',
    name: 'Burning Ember',
    colors: [
      '#c53030', // Red
      '#9c4221', // Burnt Orange
      '#dd6b20', // Orange
      '#d69e2e', // Gold
      '#744210', // Brown
      '#7b341e', // Rust
    ],
    symbols: ['🔥', '✦', '★', '◆', '❖', '✧', '✹', '✵', '❋', '✳', '❈', '✽']
  },
  {
    id: 'arctic',
    name: 'Arctic Frost',
    colors: [
      '#2b6cb0', // Blue
      '#3182ce', // Sky Blue
      '#4299e1', // Light Blue
      '#63b3ed', // Pale Blue
      '#2c5282', // Deep Blue
      '#285e61', // Teal
    ],
    symbols: ['❄', '❆', '❅', '✧', '◇', '○', '◈', '⬡', '△', '☆', '✦', '◆']
  },
  {
    id: 'sunset',
    name: 'Golden Sunset',
    colors: [
      '#ed8936', // Orange
      '#dd6b20', // Dark Orange
      '#d69e2e', // Gold
      '#ecc94b', // Yellow
      '#c05621', // Burnt Orange
      '#9c4221', // Rust
    ],
    symbols: ['☀', '✦', '★', '◆', '❖', '✧', '✹', '✵', '◈', '⬡', '❋', '✳']
  },
  {
    id: 'vintage',
    name: 'Vintage Press',
    colors: [
      '#5d4e37', // Olive Brown
      '#6b705c', // Olive Gray
      '#8b7355', // Tan
      '#a98467', // Dusty Rose
      '#7c6f64', // Warm Gray
      '#6d4c41', // Coffee
    ],
    symbols: ['❧', '☙', '✤', '✥', '✦', '✧', '◆', '◇', '●', '○', '■', '□']
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    colors: [
      '#805ad5', // Purple
      '#d53f8c', // Pink
      '#38b2ac', // Teal
      '#4fd1c5', // Cyan
      '#ed64a6', // Hot Pink
      '#667eea', // Indigo
    ],
    symbols: ['◆', '◇', '★', '☆', '●', '○', '■', '□', '▲', '△', '✦', '✧']
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
