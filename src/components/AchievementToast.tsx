import React, { useEffect, useRef, useState } from 'react';
import type { Achievement } from '../data/gameStats';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  const timerRef = useRef<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!achievement) {
      setIsVisible(false);
      setIsExiting(false);
      return;
    }
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    setIsExiting(false);
    
    const showTimer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    
    timerRef.current = window.setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 500);
    }, 4000);
    
    return () => {
      cancelAnimationFrame(showTimer);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div 
      className={`
        fixed bottom-8 left-1/2 z-50 
        transition-all duration-500 ease-out
        ${isVisible && !isExiting 
          ? 'opacity-100 -translate-x-1/2 translate-y-0' 
          : isExiting 
            ? 'opacity-0 -translate-x-1/2 -translate-y-4' 
            : 'opacity-0 -translate-x-1/2 translate-y-8'
        }
      `}
    >
      <div 
        className="relative overflow-hidden bg-gradient-to-br from-[#1a1510] via-[#2d241e] to-[#1a1510] 
          px-6 py-4 rounded-lg shadow-2xl border-2 border-[#7b341e]/60"
        style={{
          boxShadow: '0 0 30px rgba(123, 52, 30, 0.3), 0 8px 24px rgba(0,0,0,0.4)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#7b341e]/10 via-transparent to-[#7b341e]/5 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#d4a574]/60 to-transparent" />
        
        <div className="flex items-center gap-4 relative">
          <div 
            className={`
              text-4xl p-2 rounded-lg bg-gradient-to-br from-[#7b341e]/20 to-[#5c2a10]/20
              border border-[#7b341e]/30
              transition-transform duration-700 ease-out
              ${isVisible && !isExiting ? 'scale-100' : 'scale-75'}
            `}
          >
            {achievement.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[#d4a574] text-[10px] uppercase tracking-[0.2em] font-bold">
                Achievement Unlocked
              </span>
              <span className="text-sm">🏆</span>
            </div>
            <div className="text-[#f4ecd8] text-lg font-serif font-bold italic leading-tight">
              {achievement.name}
            </div>
            <div className="text-[#a89984] text-xs mt-0.5">
              {achievement.description}
            </div>
          </div>
          
          <button 
            onClick={() => {
              setIsExiting(true);
              setTimeout(onDismiss, 500);
            }}
            className="
              w-6 h-6 rounded-full flex-shrink-0
              flex items-center justify-center
              text-[#a89984] hover:text-[#f4ecd8] 
              hover:bg-[#7b341e]/30
              transition-colors duration-200
              text-base font-bold
            "
          >
            ×
          </button>
        </div>
        
        <div 
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#7b341e] via-[#d4a574] to-[#7b341e]"
          style={{
            width: isVisible && !isExiting ? '100%' : '0%',
            transition: isVisible && !isExiting ? 'width 4s linear' : 'none',
            ...(isVisible && !isExiting ? { animation: 'shrinkWidth 4s linear forwards' } : {})
          }}
        />
      </div>
      
      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default AchievementToast;
