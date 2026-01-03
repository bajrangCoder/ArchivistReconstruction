import React, { useEffect, useRef } from 'react';
import type { Achievement } from '../data/gameStats';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if (!achievement) return;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Schedule auto-dismiss after 3.5 seconds
    timerRef.current = window.setTimeout(() => {
      onDismiss();
    }, 3500);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div 
      key={achievement.id}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-right duration-300"
    >
      <div className="bg-gradient-to-r from-[#7b341e] via-[#9c4222] to-[#7b341e] px-6 py-4 rounded-sm shadow-2xl border-2 border-[#5c2a10]">
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-bounce">{achievement.icon}</div>
          <div>
            <div className="text-[#f4ecd8] text-xs uppercase tracking-widest font-bold mb-1">
              Achievement Unlocked!
            </div>
            <div className="text-[#f4ecd8] text-lg font-serif font-bold italic">
              {achievement.name}
            </div>
            <div className="text-[#f4ecd8]/80 text-sm">
              {achievement.description}
            </div>
          </div>
          <button 
            onClick={onDismiss}
            className="ml-2 text-[#f4ecd8]/60 hover:text-[#f4ecd8] text-xl font-bold"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
