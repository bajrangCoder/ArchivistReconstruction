import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Book, Play, Award, Info, Pause, Bookmark, BarChart3, Volume2, VolumeX, HelpCircle, RotateCcw, Palette, Share2, Home } from 'lucide-react';
import GameCanvas from './components/GameCanvas';
import AnimatedBackground from './components/AnimatedBackground';
import StatsPage from './components/StatsPage';
import ComboDisplay from './components/ComboDisplay';
import AchievementToast from './components/AchievementToast';
import ThemePicker from './components/ThemePicker';
import { soundManager } from './components/SoundManager';
import { GRID_SIZE, getRandomShape } from './constants';
import { checkCanPlaceAny, canPlaceShapeAt, calculatePotentialLines, createEmptyGrid, calculateGridPosition } from './utils/gameUtils';
import { getWisdomByScore, getRandomWisdom } from './data/wisdomMessages';
import { loadTheme, saveTheme } from './data/colorThemes';
import { 
  loadStats, saveStats, loadAchievements, checkAchievements, 
  type GameStats, type Achievement 
} from './data/gameStats';
import type { Shape, BlockColor, Particle, GameStatus, FeedbackText } from './types';

function App() {
  const [grid, setGrid] = useState<(BlockColor | null)[][]>(createEmptyGrid);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('archivist_puzzle_highscore_8x8');
    return saved ? parseInt(saved) : 0;
  });
  const [tray, setTray] = useState<(Shape | null)[]>([getRandomShape(), getRandomShape(), getRandomShape()]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('START');
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [activeShape, setActiveShape] = useState<Shape | null>(null);
  const [activeShapeIdx, setActiveShapeIdx] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [stampingCells, setStampingCells] = useState<Set<string>>(new Set());
  const [feedbackTexts, setFeedbackTexts] = useState<FeedbackText[]>([]);
  const [clearingLines, setClearingLines] = useState<{ rows: number[]; cols: number[] }>({ rows: [], cols: [] });
  const [wisdom, setWisdom] = useState("Seek the order within the scattered ink.");

  // New states for features
  const [combo, setCombo] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showStatsPage, setShowStatsPage] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(loadTheme);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameStats, setGameStats] = useState<GameStats>(loadStats);
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [blocksPlacedThisGame, setBlocksPlacedThisGame] = useState(0);
  const [linesClearedThisGame, setLinesClearedThisGame] = useState(0);
  const [screenTransition, setScreenTransition] = useState<'in' | 'out' | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const [boardRect, setBoardRect] = useState<DOMRect | null>(null);
  const lastClearTimeRef = useRef<number>(0);

  const triggerGameOver = useCallback(() => {
    soundManager.playGameOver();
    setGameStatus('GAMEOVER');
    
    // Update stats on game over
    setGameStats(prev => {
      const newStats: GameStats = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        totalScore: prev.totalScore + score,
        highScore: Math.max(prev.highScore, score),
        totalLinesCleared: prev.totalLinesCleared + linesClearedThisGame,
        totalBlocksPlaced: prev.totalBlocksPlaced + blocksPlacedThisGame,
        longestStreak: Math.max(prev.longestStreak, streak),
        bestCombo: Math.max(prev.bestCombo, combo),
        lastPlayed: new Date().toISOString()
      };
      saveStats(newStats);
      
      // Check for new achievements
      const updatedAchievements = checkAchievements(newStats, achievements);
      const newlyUnlocked = updatedAchievements.find(
        a => a.unlocked && !achievements.find(old => old.id === a.id)?.unlocked
      );
      if (newlyUnlocked) {
        setNewAchievement(newlyUnlocked);
      }
      setAchievements(updatedAchievements);
      
      return newStats;
    });
    
    setTimeout(() => {
      setShowGameOverModal(true);
    }, 1500);
  }, [score, linesClearedThisGame, blocksPlacedThisGame, streak, combo, achievements]);

  const potentialLines = useMemo(() => {
    if (!activeShape || !dragPos || !boardRect || gameStatus !== 'PLAYING') {
      return { rows: [], cols: [] };
    }

    const { row, col } = calculateGridPosition(dragPos, boardRect, activeShape);
    return calculatePotentialLines(grid, activeShape, row, col);
  }, [activeShape, dragPos, grid, gameStatus, boardRect]);

  const showFeedback = useCallback((text: string) => {
    setFeedbackTexts(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        text,
        x: 300,
        y: 320,
        life: 2.5
      }
    ]);
  }, []);

  const createLineParticles = useCallback((type: 'row' | 'col', index: number, color: string) => {
    const cellSize = 600 / GRID_SIZE;
    const newParticles: Particle[] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      const centerX = type === 'row' ? i * cellSize + cellSize / 2 : index * cellSize + cellSize / 2;
      const centerY = type === 'row' ? index * cellSize + cellSize / 2 : i * cellSize + cellSize / 2;
      for (let j = 0; j < 8; j++) {
        newParticles.push({
          x: centerX,
          y: centerY,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 1.5,
          color,
          size: Math.random() * 8 + 4
        });
      }
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const handleLineClears = useCallback(
    (currentGrid: (BlockColor | null)[][]) => {
      const rowsToClear: number[] = [];
      const colsToClear: number[] = [];

      for (let r = 0; r < GRID_SIZE; r++) {
        if (currentGrid[r].every(cell => cell !== null)) {
          rowsToClear.push(r);
        }
      }

      for (let c = 0; c < GRID_SIZE; c++) {
        let full = true;
        for (let r = 0; r < GRID_SIZE; r++) {
          if (currentGrid[r][c] === null) {
            full = false;
            break;
          }
        }
        if (full) {
          colsToClear.push(c);
        }
      }

      if (rowsToClear.length > 0 || colsToClear.length > 0) {
        const lines = rowsToClear.length + colsToClear.length;
        const now = Date.now();
        
        // Update combo (lines cleared in one placement)
        setCombo(lines);
        
        // Update streak (consecutive placements that clear lines)
        if (now - lastClearTimeRef.current < 5000) {
          setStreak(prev => prev + 1);
        } else {
          setStreak(1);
        }
        lastClearTimeRef.current = now;
        
        // Update lines cleared this game
        setLinesClearedThisGame(prev => prev + lines);

        // Calculate combo bonus
        const comboBonus = lines > 1 ? lines * 100 : 0;
        
        if (lines >= 3) {
          soundManager.playCombo();
          showFeedback('Sublime!');
        } else if (lines === 2) {
          soundManager.playCombo();
          showFeedback('Masterful!');
        } else {
          soundManager.playDestroy();
          showFeedback('Ink Purge!');
        }

        const newClearing = new Set<string>();
        rowsToClear.forEach(r => {
          for (let c = 0; c < GRID_SIZE; c++) {
            newClearing.add(`${r},${c}`);
          }
          createLineParticles('row', r, '#2d3748');
        });
        colsToClear.forEach(c => {
          for (let r = 0; r < GRID_SIZE; r++) {
            newClearing.add(`${r},${c}`);
          }
          createLineParticles('col', c, '#2d3748');
        });

        setClearingCells(newClearing);
        setClearingLines({ rows: rowsToClear, cols: colsToClear });

        setTimeout(() => {
          setGrid(prev => {
            const updated = prev.map(row => [...row]);
            rowsToClear.forEach(r => {
              for (let c = 0; c < GRID_SIZE; c++) {
                updated[r][c] = null;
              }
            });
            colsToClear.forEach(c => {
              for (let r = 0; r < GRID_SIZE; r++) {
                updated[r][c] = null;
              }
            });
            return updated;
          });
          setClearingCells(new Set());
          setClearingLines({ rows: [], cols: [] });

          setGrid(finalGrid => {
            setTray(currentTray => {
              if (!checkCanPlaceAny(finalGrid, currentTray)) {
                triggerGameOver();
              }
              return currentTray;
            });
            return finalGrid;
          });
        }, 550);

        const bonus = lines > 1 ? lines * 200 : 0;
        const points = lines * 100 + bonus + comboBonus;

        if (lines >= 2) {
          setWisdom(getWisdomByScore(score + points));
        }

        return { cleared: true, points };
      }

      // No lines cleared - reset streak after delay
      setTimeout(() => {
        if (Date.now() - lastClearTimeRef.current > 5000) {
          setStreak(0);
          setCombo(0);
        }
      }, 5000);

      return { cleared: false, points: 0 };
    },
    [showFeedback, createLineParticles, triggerGameOver, score]
  );

  const startDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent, shape: Shape, idx: number) => {
      if (gameStatus !== 'PLAYING') return;
      
      if (boardRef.current) {
        setBoardRect(boardRef.current.getBoundingClientRect());
      }
      
      setActiveShape(shape);
      setActiveShapeIdx(idx);
      
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setDragPos({ x: clientX, y: clientY });
    },
    [gameStatus]
  );

  const onDrag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!activeShape || gameStatus !== 'PLAYING') return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      setDragPos({ x: clientX, y: clientY });
    },
    [activeShape, gameStatus]
  );

  const onEndDrag = useCallback(() => {
    if (!activeShape || activeShapeIdx === null || !dragPos || gameStatus !== 'PLAYING') {
      setActiveShape(null);
      setActiveShapeIdx(null);
      setDragPos(null);
      return;
    }

    const board = boardRef.current;
    if (!board) {
      setActiveShape(null);
      setActiveShapeIdx(null);
      setDragPos(null);
      return;
    }
    
    const currentRect = board.getBoundingClientRect();
    const { row, col } = calculateGridPosition(dragPos, currentRect, activeShape);
    
    const margin = 2;
    const isWayOutside = 
      row < -margin ||
      col < -margin ||
      row > GRID_SIZE + margin ||
      col > GRID_SIZE + margin;
    
    if (isWayOutside) {
      setActiveShape(null);
      setActiveShapeIdx(null);
      setDragPos(null);
      return;
    }

    if (canPlaceShapeAt(grid, activeShape, row, col)) {
      soundManager.playPop();

      const newGrid = grid.map(r => [...r]);
      const newStamps = new Set<string>();
      let blocksInShape = 0;

      activeShape.layout.forEach((sRow, dr) => {
        sRow.forEach((filled, dc) => {
          if (filled) {
            newGrid[row + dr][col + dc] = activeShape.color;
            newStamps.add(`${row + dr},${col + dc}`);
            blocksInShape++;
          }
        });
      });

      setGrid(newGrid);
      setStampingCells(newStamps);
      setBlocksPlacedThisGame(prev => prev + blocksInShape);
      setTimeout(() => setStampingCells(new Set()), 500);

      const placementPoints = blocksInShape * 10;
      const { cleared: didClear, points: clearPoints } = handleLineClears(newGrid);

      const totalPoints = placementPoints + clearPoints;
      setScore(prev => {
        const next = prev + totalPoints;
        setHighScore(currMax => {
          if (next > currMax) {
            localStorage.setItem('archivist_puzzle_highscore_8x8', next.toString());
            return next;
          }
          return currMax;
        });
        return next;
      });

      const newTray = [...tray];
      newTray[activeShapeIdx] = null;

      if (newTray.every(s => s === null)) {
        soundManager.playRefill();
        const freshTray = [getRandomShape(), getRandomShape(), getRandomShape()];
        setTray(freshTray);
        if (!checkCanPlaceAny(newGrid, freshTray)) {
          triggerGameOver();
        }
      } else {
        setTray(newTray);
        if (!didClear && !checkCanPlaceAny(newGrid, newTray)) {
          triggerGameOver();
        }
      }
    } else {
      soundManager.playInvalid();
    }

    setActiveShape(null);
    setActiveShapeIdx(null);
    setDragPos(null);
  }, [activeShape, activeShapeIdx, dragPos, gameStatus, grid, tray, handleLineClears, triggerGameOver]);

  const onDragRef = useRef(onDrag);
  const onEndDragRef = useRef(onEndDrag);
  
  useEffect(() => {
    onDragRef.current = onDrag;
    onEndDragRef.current = onEndDrag;
  });

  useEffect(() => {
    if (activeShape && gameStatus === 'PLAYING') {
      const dragHandler = (e: MouseEvent | TouchEvent) => onDragRef.current(e);
      const endHandler = () => onEndDragRef.current();

      window.addEventListener('mousemove', dragHandler);
      window.addEventListener('mouseup', endHandler);
      window.addEventListener('touchmove', dragHandler, { passive: false });
      window.addEventListener('touchend', endHandler);

      return () => {
        window.removeEventListener('mousemove', dragHandler);
        window.removeEventListener('mouseup', endHandler);
        window.removeEventListener('touchmove', dragHandler);
        window.removeEventListener('touchend', endHandler);
      };
    }
  }, [activeShape, gameStatus]);

  const handleStart = useCallback(() => {
    setScreenTransition('out');
    setTimeout(() => {
      soundManager.init();
      soundManager.playStart();
      setGrid(createEmptyGrid());
      setTray([getRandomShape(currentTheme), getRandomShape(currentTheme), getRandomShape(currentTheme)]);
      setScore(0);
      setCombo(0);
      setStreak(0);
      setBlocksPlacedThisGame(0);
      setLinesClearedThisGame(0);
      setGameStatus('PLAYING');
      setShowGameOverModal(false);
      setClearingCells(new Set());
      setStampingCells(new Set());
      setWisdom(getRandomWisdom());
      setScreenTransition('in');
      setTimeout(() => setScreenTransition(null), 500);
    }, 300);
  }, [currentTheme]);

  const handleRestart = useCallback(() => {
    if (gameStatus !== 'PLAYING') return;
    setScreenTransition('out');
    setTimeout(() => {
      setGrid(createEmptyGrid());
      setTray([getRandomShape(currentTheme), getRandomShape(currentTheme), getRandomShape(currentTheme)]);
      setScore(0);
      setCombo(0);
      setStreak(0);
      setBlocksPlacedThisGame(0);
      setLinesClearedThisGame(0);
      setClearingCells(new Set());
      setStampingCells(new Set());
      setWisdom(getRandomWisdom());
      setScreenTransition('in');
      setTimeout(() => setScreenTransition(null), 500);
    }, 300);
  }, [gameStatus, currentTheme]);

  const handleBackToHome = useCallback(() => {
    setScreenTransition('out');
    setTimeout(() => {
      setShowGameOverModal(false);
      setGameStatus('START');
      setShowHowToPlay(false);
      setScreenTransition('in');
      setTimeout(() => setScreenTransition(null), 500);
    }, 300);
  }, []);

  const handleThemeChange = useCallback((themeId: string) => {
    setCurrentTheme(themeId);
    saveTheme(themeId);
    setShowThemePicker(false);
  }, []);

  const handleShareScore = useCallback(async () => {
    const text = `🏆 I scored ${score} points in The Archivist's Reconstruction!\n\nCan you beat my record?`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "The Archivist's Reconstruction",
          text: text,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(text);
        showFeedback('Copied!');
      } catch {
        // Clipboard failed
      }
    }
  }, [score, showFeedback]);

  return (
    <div className={`min-h-screen bg-[#f4ecd8] paper-texture flex flex-col items-center p-4 md:p-8 text-[#2d241e] overflow-hidden select-none touch-none transition-all duration-500 relative ${
      screenTransition === 'out' ? 'opacity-0 scale-95' : screenTransition === 'in' ? 'opacity-100 scale-100' : ''
    }`}>
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Combo/Streak Display */}
      <ComboDisplay combo={combo} streak={streak} />
      
      <header
        className={`w-full max-w-md flex flex-col items-center mb-4 transition-all duration-1000 z-10 ${
          gameStatus === 'GAMEOVER' ? 'opacity-30 blur-[1px]' : 'opacity-100'
        }`}
      >
        <div className="w-full flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <Book size={24} className="text-[#5c4a3c]" strokeWidth={1.5} />
            <h1 className="text-xl font-bold tracking-tighter uppercase font-['Special_Elite']">
              Reconstruction VIII
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Stats Button */}
            <button
              onClick={() => setShowStatsPage(true)}
              className="p-2 bg-[#efe7d3] border border-[#d4c9af] rounded-sm hover:bg-[#e6ddc4] transition-colors shadow-sm"
            >
              <BarChart3 size={18} className="text-[#5c4a3c]" />
            </button>
            <button
              onClick={handleBackToHome}
              className="p-2 bg-[#efe7d3] border border-[#d4c9af] rounded-sm hover:bg-[#e6ddc4] transition-colors shadow-sm"
              title="Home"
            >
              <Home size={18} className="text-[#5c4a3c]" />
            </button>
            {(gameStatus === 'PLAYING' || gameStatus === 'PAUSED') && (
              <>
                {/* Restart Button */}
                <button
                  onClick={handleRestart}
                  className="p-2 bg-[#efe7d3] border border-[#d4c9af] rounded-sm hover:bg-[#e6ddc4] transition-colors shadow-sm"
                  title="Restart"
                >
                  <RotateCcw size={18} className="text-[#5c4a3c]" />
                </button>
                {/* Pause Button */}
                <button
                  onClick={() => setGameStatus(s => (s === 'PLAYING' ? 'PAUSED' : 'PLAYING'))}
                  className="p-2 bg-[#efe7d3] border border-[#d4c9af] rounded-sm hover:bg-[#e6ddc4] transition-colors shadow-sm"
                >
                  {gameStatus === 'PAUSED' ? <Play size={18} /> : <Pause size={18} />}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="w-full flex justify-between items-end border-b-2 border-[#d4c9af] pb-1 font-serif">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Ink Tally</span>
            <span className="text-2xl font-bold tabular-nums">{score}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Best Record</span>
            <span className="text-xl font-bold opacity-80 tabular-nums">{highScore}</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-md flex flex-col items-center flex-grow relative z-10">
        <div ref={boardRef} className="w-full relative shadow-lg transition-all duration-1000">
          <GameCanvas
            grid={grid}
            activeShape={activeShape}
            dragPos={dragPos}
            particles={particles}
            setParticles={setParticles}
            clearingCells={clearingCells}
            potentialLines={potentialLines}
            feedbackTexts={feedbackTexts}
            setFeedbackTexts={setFeedbackTexts}
            stampingCells={stampingCells}
            clearingLines={clearingLines}
            gameStatus={gameStatus}
          />
          {gameStatus === 'PAUSED' && (
            <div className="absolute inset-0 bg-[#f4ecd8]/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              <Bookmark size={48} className="text-[#5c4a3c] mb-4" />
              <h2 className="text-2xl font-serif font-bold italic mb-2">Scribe at Rest</h2>
              <button
                onClick={() => setGameStatus('PLAYING')}
                className="px-8 py-3 bg-[#2d241e] text-[#f4ecd8] font-serif font-bold hover:bg-[#3d3129] transition-all shadow-md"
              >
                Resume preservation
              </button>
            </div>
          )}
        </div>

        <div
          className={`w-full mt-4 grid grid-cols-3 gap-2 h-28 items-center justify-items-center transition-all duration-1000 ${
            gameStatus !== 'PLAYING' ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {tray.map((shape, idx) => (
            <div
              key={idx}
              className={`relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-opacity ${
                !shape || activeShapeIdx === idx ? 'opacity-0' : 'opacity-100'
              }`}
              onMouseDown={e => shape && startDrag(e, shape, idx)}
              onTouchStart={e => shape && startDrag(e, shape, idx)}
            >
              {shape && (
                <div
                  className="flex flex-col items-center justify-center pointer-events-none"
                  style={{ transform: 'scale(0.42)' }}
                >
                  {shape.layout.map((row, r) => (
                    <div key={r} className="flex">
                      {row.map((cell, c) => (
                        <div
                          key={c}
                          className="w-10 h-10 m-[1px] rounded-[1px]"
                          style={{
                            backgroundColor: cell ? shape.color : 'transparent',
                            opacity: cell ? 0.8 : 0,
                            boxShadow: cell ? 'inset 0 0 5px rgba(0,0,0,0.15)' : 'none'
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          className={`w-full mt-auto mb-4 p-3 bg-[#efe7d3] border-l-4 border-[#5c4a3c] shadow-sm italic font-serif relative min-h-[64px] flex items-center justify-center text-sm transition-all duration-1000 ${
            gameStatus === 'GAMEOVER' ? 'opacity-20 blur-[2px]' : 'opacity-100'
          }`}
        >
          <p className="text-center text-[#5c4a3c] leading-tight px-4 font-medium italic">"{wisdom}"</p>
          <div className="absolute -top-2.5 -left-2.5 bg-[#f4ecd8] shadow-sm rounded-full">
            <Info size={16} className="text-[#5c4a3c]" />
          </div>
        </div>
      </main>

      {gameStatus === 'START' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="bg-[#f4ecd8] border-8 border-[#d4c9af] max-w-md w-full shadow-2xl relative flex flex-col max-h-[90vh]">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#7b341e] to-transparent z-10"></div>
            
            <div className="overflow-y-auto p-6">
              {/* Header with icon */}
              <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2d241e] rounded-sm mb-4">
                <Book size={32} className="text-[#f4ecd8]" />
              </div>
              <h1 className="text-3xl font-serif font-bold italic text-[#2d241e] mb-1">
                The Archivist's
              </h1>
              <h2 className="text-4xl font-serif font-bold text-[#7b341e]">
                Reconstruction
              </h2>
              <p className="text-sm text-[#5c4a3c] mt-2 font-serif">Volume VIII</p>
            </div>

            {/* High Score Display */}
            {gameStats.highScore > 0 && (
              <div className="bg-[#efe7d3] border border-[#d4c9af] p-3 mb-4 text-center">
                <span className="text-xs uppercase tracking-widest text-[#5c4a3c]/70 font-bold">Best Record</span>
                <p className="text-2xl font-bold text-[#2d241e]">{gameStats.highScore.toLocaleString()}</p>
              </div>
            )}

            {/* How to Play */}
            {showHowToPlay ? (
              <div className="bg-[#efe7d3] border border-[#d4c9af] p-4 mb-4 text-left">
                <h3 className="font-serif font-bold text-[#2d241e] mb-2 flex items-center gap-2">
                  <HelpCircle size={16} />
                  How to Preserve the Archive
                </h3>
                <ul className="text-sm text-[#5c4a3c] space-y-2 font-serif">
                  <li className="flex gap-2">
                    <span className="text-[#7b341e]">❧</span>
                    <span>Drag ink stamps from the tray onto the grid</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#7b341e]">❧</span>
                    <span>Fill complete rows or columns to clear them</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#7b341e]">❧</span>
                    <span>Clear multiple lines at once for bonus points</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#7b341e]">❧</span>
                    <span>The archive closes when no stamps can be placed</span>
                  </li>
                </ul>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="w-full mt-3 py-2 text-sm text-[#5c4a3c] hover:text-[#2d241e] transition-colors"
                >
                  ← Back
                </button>
              </div>
            ) : (
              <p className="font-serif italic opacity-80 leading-relaxed text-[#2d241e] text-center mb-4">
                Organize the scattered ink stamps. Fill rows or columns to clear the page.
              </p>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleStart}
                className="w-full py-4 bg-[#2d241e] text-[#f4ecd8] font-serif text-xl font-bold hover:bg-[#3d3129] transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <Play size={20} fill="currentColor" />
                <span>Begin Reconstruction</span>
              </button>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setShowStatsPage(true)}
                  className="py-3 bg-[#efe7d3] text-[#2d241e] font-serif font-bold hover:bg-[#e6ddc4] transition-all flex items-center justify-center space-x-1 border-2 border-[#d4c9af] text-sm"
                >
                  <BarChart3 size={14} />
                  <span>Records</span>
                </button>
                <button
                  onClick={() => setShowHowToPlay(true)}
                  className="py-3 bg-[#efe7d3] text-[#2d241e] font-serif font-bold hover:bg-[#e6ddc4] transition-all flex items-center justify-center space-x-1 border-2 border-[#d4c9af] text-sm"
                >
                  <HelpCircle size={14} />
                  <span>Guide</span>
                </button>
                <button
                  onClick={() => setShowThemePicker(true)}
                  className="py-3 bg-[#efe7d3] text-[#2d241e] font-serif font-bold hover:bg-[#e6ddc4] transition-all flex items-center justify-center space-x-1 border-2 border-[#d4c9af] text-sm"
                >
                  <Palette size={14} />
                  <span>Theme</span>
                </button>
              </div>
              
              {/* Sound Toggle */}
              <button
                onClick={() => {
                  setSoundEnabled(prev => {
                    soundManager.setMuted(!prev === false);
                    return !prev;
                  });
                }}
                className="w-full py-2 text-[#5c4a3c] hover:text-[#2d241e] transition-colors flex items-center justify-center space-x-2"
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span className="text-sm">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
              </button>
            </div>

            </div>
            {/* Decorative bottom border */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#7b341e] to-transparent z-10"></div>
          </div>
        </div>
      )}

      {showGameOverModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-1000">
          <div className="bg-[#f4ecd8] border-8 border-[#d4c9af] max-w-sm w-full shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7b341e] to-transparent z-10"></div>
            <div className="overflow-y-auto p-8 text-center space-y-6">
              <Award size={48} className="mx-auto text-[#7b341e]" />
            <h2 className="text-4xl font-serif font-bold italic text-[#2d241e]">The Final Chapter</h2>
            <p className="font-serif italic opacity-70 text-sm leading-tight">
              The ink has ceased its flow, and the reconstruction is complete. Your efforts remain etched in these
              pages.
            </p>
            <div className="py-4 border-y border-[#d4c9af]/60">
              <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold text-[#2d241e]">
                Preserved Knowledge
              </p>
              <p className="text-5xl font-bold tabular-nums text-[#2d241e]">{score}</p>
              {combo > 1 && (
                <p className="text-sm text-[#7b341e] mt-2">Best Combo: {combo}x</p>
              )}
              {streak > 1 && (
                <p className="text-sm text-[#5c4a3c]">Streak: {streak}x</p>
              )}
            </div>
            <div className="space-y-3">
              <button
                onClick={handleStart}
                className="w-full py-4 bg-[#2d241e] text-[#f4ecd8] font-serif text-xl font-bold hover:bg-[#3d3129] transition-all shadow-lg transform active:scale-95 duration-200"
              >
                Consult New Scroll
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShareScore}
                  className="py-3 bg-[#efe7d3] text-[#2d241e] font-serif font-bold hover:bg-[#e6ddc4] transition-all flex items-center justify-center space-x-2 border-2 border-[#d4c9af]"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleBackToHome}
                  className="py-3 bg-[#efe7d3] text-[#2d241e] font-serif font-bold hover:bg-[#e6ddc4] transition-all flex items-center justify-center space-x-2 border-2 border-[#d4c9af]"
                >
                  <Home size={16} />
                  <span>Home</span>
                </button>
              </div>
            </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7b341e] to-transparent z-10"></div>
          </div>
        </div>
      )}

      {/* Stats Page Modal */}
      {showStatsPage && (
        <StatsPage 
          stats={gameStats} 
          achievements={achievements} 
          onClose={() => setShowStatsPage(false)} 
        />
      )}

      {/* Achievement Toast */}
      <AchievementToast 
        achievement={newAchievement} 
        onDismiss={() => setNewAchievement(null)} 
      />

      {/* Theme Picker Modal */}
      {showThemePicker && (
        <ThemePicker
          currentTheme={currentTheme}
          onSelectTheme={handleThemeChange}
          onClose={() => setShowThemePicker(false)}
        />
      )}
    </div>
  );
}

export default App;
