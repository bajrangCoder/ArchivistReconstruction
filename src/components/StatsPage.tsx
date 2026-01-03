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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#f4ecd8] border-4 border-[#d4c9af] rounded-sm max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-[#f4ecd8] border-b-2 border-[#d4c9af] p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={24} className="text-[#5c4a3c]" />
            <h2 className="text-2xl font-serif font-bold italic text-[#2d241e]">Scribe's Records</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#e6ddc4] rounded-sm transition-colors"
          >
            <X size={20} className="text-[#5c4a3c]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Statistics */}
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#5c4a3c] flex items-center gap-2">
              <BarChart3 size={18} />
              Statistics
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="p-4 border-t-2 border-[#d4c9af] space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#5c4a3c] flex items-center gap-2">
              <Trophy size={18} />
              Achievements ({unlockedCount}/{achievements.length})
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
              {achievements.map(achievement => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
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
  <div className="bg-[#efe7d3] border border-[#d4c9af] p-3 rounded-sm">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">{icon}</span>
      <span className="text-xs uppercase tracking-wider text-[#5c4a3c]/70 font-bold">{label}</span>
    </div>
    <div className="text-2xl font-bold text-[#2d241e] tabular-nums">{value}</div>
  </div>
);

interface AchievementBadgeProps {
  achievement: Achievement;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => (
  <div 
    className={`flex items-center gap-3 p-3 rounded-sm border transition-all ${
      achievement.unlocked 
        ? 'bg-[#efe7d3] border-[#7b341e]/30' 
        : 'bg-[#e8e0cc] border-[#d4c9af] opacity-50'
    }`}
  >
    <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
      {achievement.icon}
    </div>
    <div className="flex-1">
      <div className={`font-bold text-sm ${achievement.unlocked ? 'text-[#2d241e]' : 'text-[#5c4a3c]'}`}>
        {achievement.name}
      </div>
      <div className="text-xs text-[#5c4a3c]/70">{achievement.description}</div>
    </div>
    {achievement.unlocked && (
      <div className="text-green-700">
        <Target size={16} />
      </div>
    )}
  </div>
);

export default StatsPage;
