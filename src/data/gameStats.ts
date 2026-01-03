/**
 * Game Statistics management
 */

export interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  highScore: number;
  totalLinesCleared: number;
  longestStreak: number;
  totalBlocksPlaced: number;
  bestCombo: number;
  lastPlayed: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: (stats: GameStats) => boolean;
}

const STATS_KEY = 'archivist_game_stats';
const ACHIEVEMENTS_KEY = 'archivist_achievements';

export const defaultStats: GameStats = {
  gamesPlayed: 0,
  totalScore: 0,
  highScore: 0,
  totalLinesCleared: 0,
  longestStreak: 0,
  totalBlocksPlaced: 0,
  bestCombo: 0,
  lastPlayed: ''
};

export const achievementDefinitions: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_scroll',
    name: 'First Scroll',
    description: 'Complete your first game',
    icon: '📜',
    requirement: (stats) => stats.gamesPlayed >= 1
  },
  {
    id: 'ink_apprentice',
    name: 'Ink Apprentice',
    description: 'Score 1,000 points in a single game',
    icon: '✒️',
    requirement: (stats) => stats.highScore >= 1000
  },
  {
    id: 'scribe_journeyman',
    name: 'Scribe Journeyman',
    description: 'Score 3,000 points in a single game',
    icon: '🖋️',
    requirement: (stats) => stats.highScore >= 3000
  },
  {
    id: 'master_calligrapher',
    name: 'Master Calligrapher',
    description: 'Score 5,000 points in a single game',
    icon: '🏆',
    requirement: (stats) => stats.highScore >= 5000
  },
  {
    id: 'line_purger',
    name: 'Line Purger',
    description: 'Clear 50 total lines',
    icon: '📏',
    requirement: (stats) => stats.totalLinesCleared >= 50
  },
  {
    id: 'ink_master',
    name: 'Ink Master',
    description: 'Clear 200 total lines',
    icon: '🎭',
    requirement: (stats) => stats.totalLinesCleared >= 200
  },
  {
    id: 'combo_initiate',
    name: 'Combo Initiate',
    description: 'Get a 2x combo',
    icon: '⚡',
    requirement: (stats) => stats.bestCombo >= 2
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Get a 5x combo',
    icon: '🔥',
    requirement: (stats) => stats.bestCombo >= 5
  },
  {
    id: 'streak_keeper',
    name: 'Streak Keeper',
    description: 'Maintain a 3x streak',
    icon: '💫',
    requirement: (stats) => stats.longestStreak >= 3
  },
  {
    id: 'dedicated_archivist',
    name: 'Dedicated Archivist',
    description: 'Play 10 games',
    icon: '📚',
    requirement: (stats) => stats.gamesPlayed >= 10
  },
  {
    id: 'block_placer',
    name: 'Block Placer',
    description: 'Place 100 blocks',
    icon: '🧱',
    requirement: (stats) => stats.totalBlocksPlaced >= 100
  },
  {
    id: 'prolific_scribe',
    name: 'Prolific Scribe',
    description: 'Place 500 blocks',
    icon: '📖',
    requirement: (stats) => stats.totalBlocksPlaced >= 500
  }
];

export const loadStats = (): GameStats => {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      return { ...defaultStats, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
  return { ...defaultStats };
};

export const saveStats = (stats: GameStats): void => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
};

export const loadAchievements = (): Achievement[] => {
  try {
    const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
    const unlockedMap: Record<string, { unlocked: boolean; unlockedAt?: string }> = saved 
      ? JSON.parse(saved) 
      : {};
    
    return achievementDefinitions.map(def => ({
      ...def,
      unlocked: unlockedMap[def.id]?.unlocked || false,
      unlockedAt: unlockedMap[def.id]?.unlockedAt
    }));
  } catch (e) {
    console.error('Failed to load achievements:', e);
  }
  return achievementDefinitions.map(def => ({ ...def, unlocked: false }));
};

export const saveAchievements = (achievements: Achievement[]): void => {
  try {
    const unlockedMap: Record<string, { unlocked: boolean; unlockedAt?: string }> = {};
    achievements.forEach(a => {
      unlockedMap[a.id] = { unlocked: a.unlocked, unlockedAt: a.unlockedAt };
    });
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedMap));
  } catch (e) {
    console.error('Failed to save achievements:', e);
  }
};

export const checkAchievements = (stats: GameStats, achievements: Achievement[]): Achievement[] => {
  const now = new Date().toISOString();
  let changed = false;
  
  const updated = achievements.map(achievement => {
    if (!achievement.unlocked && achievement.requirement(stats)) {
      changed = true;
      return { ...achievement, unlocked: true, unlockedAt: now };
    }
    return achievement;
  });
  
  if (changed) {
    saveAchievements(updated);
  }
  
  return updated;
};

export const toRomanNumeral = (num: number): string => {
  if (num <= 0) return '';
  const romanNumerals: [number, string][] = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  let remaining = num;
  for (const [value, symbol] of romanNumerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
};
