import React from 'react';
import { toRomanNumeral } from '../data/gameStats';

interface ComboDisplayProps {
  combo: number;
  streak: number;
}

const ComboDisplay: React.FC<ComboDisplayProps> = ({ combo, streak }) => {
  if (combo <= 1 && streak <= 1) return null;

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
      {/* Combo Display */}
      {combo > 1 && (
        <div className="animate-in slide-in-from-right duration-300 bg-gradient-to-r from-[#7b341e] to-[#9c4222] px-4 py-2 rounded-sm shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-[#f4ecd8] text-xs uppercase tracking-widest font-bold">Combo</span>
            <span className="text-[#f4ecd8] text-2xl font-serif font-bold italic">
              {toRomanNumeral(combo)}
            </span>
          </div>
        </div>
      )}
      
      {/* Streak Display */}
      {streak > 1 && (
        <div className="animate-in slide-in-from-right duration-300 delay-100 bg-gradient-to-r from-[#5c4a3c] to-[#7b6b5c] px-4 py-2 rounded-sm shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-[#f4ecd8] text-xs uppercase tracking-widest font-bold">Streak</span>
            <span className="text-[#f4ecd8] text-xl font-serif font-bold">
              {streak}x
            </span>
            {streak >= 3 && <span className="text-lg">🔥</span>}
            {streak >= 5 && <span className="text-lg">⚡</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboDisplay;
