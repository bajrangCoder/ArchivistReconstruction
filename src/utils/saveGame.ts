import type { Shape, GridCell, GameStatus } from '../types';

const SAVE_KEY = 'archivist_saved_game';
const SAVE_VERSION = 1;

export interface SavedGameState {
  version: number;
  grid: (GridCell | null)[][];
  score: number;
  tray: (Shape | null)[];
  combo: number;
  streak: number;
  blocksPlacedThisGame: number;
  linesClearedThisGame: number;
  wisdom: string;
  currentTheme: string;
  savedAt: string;
  gameStatus: GameStatus;
}

export function saveGameState(state: Omit<SavedGameState, 'version' | 'savedAt'>): void {
  try {
    const saveData: SavedGameState = {
      ...state,
      version: SAVE_VERSION,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
}

export function loadGameState(): SavedGameState | null {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;
    
    const data = JSON.parse(saved) as SavedGameState;
    
    if (data.version !== SAVE_VERSION) {
      clearSavedGame();
      return null;
    }
    
    if (data.gameStatus === 'GAMEOVER') {
      clearSavedGame();
      return null;
    }
    
    return data;
  } catch (e) {
    console.error('Failed to load saved game:', e);
    return null;
  }
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    console.error('Failed to clear saved game:', e);
  }
}

export function hasSavedGame(): boolean {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return false;
    
    const data = JSON.parse(saved) as SavedGameState;
    return data.version === SAVE_VERSION && data.gameStatus !== 'GAMEOVER';
  } catch {
    return false;
  }
}
