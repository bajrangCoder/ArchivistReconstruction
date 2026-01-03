import React from 'react';
import { X, BarChart3, Target, Trophy, BookOpen } from 'lucide-react';
import type { GameStats, Achievement } from '../data/gameStats';

interface StatsPageProps {
  stats: GameStats;
  achievements: Achievement[];
  onClose: () => void;
}

const StatsPage: React.FC<StatsPageProps> = ({ stats, achievements, onClose }) => {
  const averageScore = stats.gamesPlayed > 0 
    ? Math.round(stats.totalScore / stats.gamesPlayed) 
    : 0;
  
  const efficiency = stats.totalBlocksPlaced > 0
    ? Math.round((stats.totalLinesCleared * 100) / stats.totalBlocksPlaced)
    : 0;

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-[#f4ecd8] border-2 sm:border-4 border-[#d4c9af] rounded-sm max-w-lg w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#f4ecd8] border-b-2 border-[#d4c9af] p-2 sm:p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BookOpen size={20} className="text-[#5c4a3c] sm:w-6 sm:h-6" />
            <h2 className="text-lg sm:text-2xl font-serif font-bold italic text-[#2d241e]">Scribe's Records</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-[#e6ddc4] rounded-sm transition-colors"
          >
            <X size={18} className="text-[#5c4a3c] sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Statistics */}
        <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#5c4a3c] flex items-center gap-1.5 sm:gap-2">
            <BarChart3 size={16} className="sm:w-[18px] sm:h-[18px]" />
            Statistics
          </h3>
          
          <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
            <StatBox label="Games Played" value={stats.gamesPlayed} icon="📜" />
            <StatBox label="High Score" value={stats.highScore.toLocaleString()} icon="👑" />
            <StatBox label="Average Score" value={averageScore.toLocaleString()} icon="📊" />
            <StatBox label="Lines Cleared" value={stats.totalLinesCleared} icon="📏" />
            <StatBox label="Longest Streak" value={stats.longestStreak} icon="🔥" />
            <StatBox label="Best Combo" value={`${stats.bestCombo}x`} icon="⚡" />
            <StatBox label="Blocks Placed" value={stats.totalBlocksPlaced} icon="🧱" />
            <StatBox label="Efficiency" value={`${efficiency}%`} icon="🎯" />
          </div>
        </div>

        {/* Achievements */}
        <div className="p-2 sm:p-4 border-t-2 border-[#d4c9af] space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#5c4a3c] flex items-center gap-1.5 sm:gap-2">
            <Trophy size={16} className="sm:w-[18px] sm:h-[18px]" />
            Achievements ({unlockedCount}/{achievements.length})
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 sm:gap-2">
            {achievements.map(achievement => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatBoxProps {
  label: string;
  value: string | number;
  icon: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, icon }) => (
  <div className="bg-[#efe7d3] border border-[#d4c9af] p-1.5 sm:p-3 rounded-sm">
    <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
      <span className="text-sm sm:text-lg">{icon}</span>
      <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#5c4a3c]/70 font-bold truncate">{label}</span>
    </div>
    <div className="text-lg sm:text-2xl font-bold text-[#2d241e] tabular-nums">{value}</div>
  </div>
);

interface AchievementBadgeProps {
  achievement: Achievement;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => (
  <div 
    className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-sm border transition-all ${
      achievement.unlocked 
        ? 'bg-[#efe7d3] border-[#7b341e]/30' 
        : 'bg-[#e8e0cc] border-[#d4c9af] opacity-60'
    }`}
  >
    <div className={`text-base sm:text-xl flex-shrink-0 ${achievement.unlocked ? '' : 'grayscale'}`}>
      {achievement.icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className={`font-bold text-[11px] sm:text-xs leading-tight ${achievement.unlocked ? 'text-[#2d241e]' : 'text-[#5c4a3c]'} truncate`}>
        {achievement.name}
      </div>
      <div className="hidden sm:block text-[10px] text-[#5c4a3c]/70 truncate">{achievement.description}</div>
    </div>
    {achievement.unlocked && (
      <div className="text-green-700 flex-shrink-0">
        <Target size={12} className="sm:w-3.5 sm:h-3.5" />
      </div>
    )}
  </div>
);

export default StatsPage;
