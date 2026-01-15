import React from 'react';
import { toRomanNumeral } from '../data/gameStats';

interface ComboDisplayProps {
  combo: number;
  streak: number;
}

const ComboDisplay: React.FC<ComboDisplayProps> = ({ combo, streak }) => {
  if (combo <= 1 && streak <= 1) return null;

  const getComboLabel = (c: number) => {
    if (c >= 6) return 'LEGENDARY';
    if (c >= 4) return 'SUBLIME';
    if (c >= 3) return 'MASTERFUL';
    return 'COMBO';
  };

  const getStreakEmoji = (s: number) => {
    if (s >= 7) return '🌟';
    if (s >= 5) return '⚡';
    if (s >= 3) return '🔥';
    return '✨';
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
      {combo > 1 && (
        <div 
          className="
            relative overflow-hidden
            bg-gradient-to-r from-[#7b341e] via-[#9c4222] to-[#7b341e] 
            px-4 py-2 rounded-sm shadow-lg border border-[#5c2a10]/50
          "
          style={{
            boxShadow: combo >= 4 
              ? '0 0 20px rgba(156, 66, 34, 0.5), 0 4px 12px rgba(0,0,0,0.3)' 
              : '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <div className="flex items-center gap-2 relative">
            <div className="flex flex-col items-start">
              <span className="text-[#f4ecd8]/70 text-[9px] uppercase tracking-[0.15em] font-bold">
                {getComboLabel(combo)}
              </span>
              <span 
                className={`
                  text-[#f4ecd8] font-serif font-bold italic leading-none
                  ${combo >= 4 ? 'text-2xl' : 'text-xl'}
                `}
              >
                {toRomanNumeral(combo)}
              </span>
            </div>
            <div className="text-xl">
              {combo >= 5 ? '💎' : combo >= 3 ? '✨' : '⚡'}
            </div>
          </div>
        </div>
      )}
      
      {streak > 1 && (
        <div 
          className="
            relative overflow-hidden
            bg-gradient-to-r from-[#44403c] via-[#57534e] to-[#44403c]
            px-4 py-2 rounded-sm shadow-lg border border-[#292524]/50
          "
          style={{
            boxShadow: streak >= 5 
              ? '0 0 15px rgba(245, 158, 11, 0.25), 0 4px 12px rgba(0,0,0,0.3)' 
              : '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <div className="flex items-center gap-2 relative">
            <div className="flex flex-col items-start">
              <span className="text-[#f4ecd8]/70 text-[9px] uppercase tracking-[0.15em] font-bold">
                Streak
              </span>
              <span className="text-[#f4ecd8] text-lg font-serif font-bold leading-none">
                {streak}×
              </span>
            </div>
            <div className="text-lg">
              {getStreakEmoji(streak)}
            </div>
          </div>
          {streak >= 3 && (
            <div 
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500"
              style={{ 
                width: `${Math.min(100, (streak / 10) * 100)}%`,
                transition: 'width 0.5s ease-out'
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ComboDisplay;
