import React, { useEffect, useRef } from 'react';
import type { Particle, Shape, GridCell, FeedbackText, GameStatus } from '../types';
import { GRID_SIZE, PAPER_COLOR } from '../constants';

interface GameCanvasProps {
  grid: (GridCell | null)[][];
  activeShape: Shape | null;
  dragPos: { x: number; y: number } | null;
  particles: Particle[];
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>;
  clearingCells: Set<string>;
  potentialLines: { rows: number[]; cols: number[] };
  feedbackTexts: FeedbackText[];
  setFeedbackTexts: React.Dispatch<React.SetStateAction<FeedbackText[]>>;
  stampingCells: Set<string>;
  clearingLines: { rows: number[]; cols: number[] };
  gameStatus: GameStatus;
}

// Animation state - kept outside React to avoid re-renders
const animationState = {
  clearingProgress: new Map<string, number>(),
  stampingProgress: new Map<string, number>(),
  flashProgress: 0,
  shake: 0,
  gameOverFade: 0,
  particleStartTime: 0
};

const drawBlock = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  color: string,
  symbol: string,
  opacity: number = 1,
  scale: number = 1,
  isInkBleeding: boolean = false,
  seed: number = 0
) => {
  const padding = cellSize * 0.1;
  const baseSize = cellSize - padding * 2;
  const size = baseSize * scale;

  ctx.save();
  ctx.translate(x + cellSize / 2, y + cellSize / 2);
  ctx.globalAlpha = opacity;

  // Ink halo effect for static blocks
  if (!isInkBleeding && opacity > 0.6) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity * 0.08;

    const hSize = size + 8;
    const hFuzz = (o: number) => Math.sin(seed * 33 + o) * 2.5;

    ctx.beginPath();
    ctx.moveTo(-hSize / 2 + hFuzz(1), -hSize / 2 + hFuzz(2));
    ctx.lineTo(hSize / 2 + hFuzz(3), -hSize / 2 + hFuzz(4));
    ctx.lineTo(hSize / 2 + hFuzz(5), hSize / 2 + hFuzz(6));
    ctx.lineTo(-hSize / 2 + hFuzz(7), hSize / 2 + hFuzz(8));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = color;
  ctx.beginPath();

  const getFuzz = (offset: number) => {
    const staticFuzz = Math.sin(seed + offset) * 1.5;
    if (isInkBleeding) {
      return staticFuzz + Math.sin(Date.now() / 20 + offset) * 4;
    }
    return staticFuzz;
  };

  ctx.moveTo(-size / 2 + getFuzz(1), -size / 2 + getFuzz(2));
  ctx.lineTo(size / 2 + getFuzz(3), -size / 2 + getFuzz(4));
  ctx.lineTo(size / 2 + getFuzz(5), size / 2 + getFuzz(6));
  ctx.lineTo(-size / 2 + getFuzz(7), size / 2 + getFuzz(8));
  ctx.closePath();
  ctx.fill();

  // Paper texture / holes
  ctx.globalCompositeOperation = 'destination-out';
  ctx.globalAlpha = isInkBleeding ? 0.6 : 0.12 * opacity;

  const holeCount = isInkBleeding ? 12 : 4;
  for (let i = 0; i < holeCount; i++) {
    const rAngle = (seed * i * 1.5) % (Math.PI * 2);
    const rDist = Math.abs(Math.sin(seed * i)) * (size / 2.5);
    const hx = Math.cos(rAngle) * rDist;
    const hy = Math.sin(rAngle) * rDist;
    const hRad = isInkBleeding ? Math.random() * 3 + 1 : Math.abs(Math.cos(seed * i * 2)) * 2 + 1;

    ctx.beginPath();
    ctx.arc(hx, hy, hRad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Symbol
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = PAPER_COLOR;
  ctx.font = `bold ${size * 0.45}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (!isInkBleeding || opacity > 0.4) {
    ctx.save();
    ctx.rotate(((seed % 10) - 5) * 0.02);
    ctx.fillText(symbol, 0, 0);
    ctx.restore();
  }

  ctx.restore();
};

const GameCanvas: React.FC<GameCanvasProps> = ({
  grid,
  activeShape,
  dragPos,
  setParticles,
  clearingCells,
  potentialLines,
  feedbackTexts,
  setFeedbackTexts,
  stampingCells,
  clearingLines,
  gameStatus
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  // Track stampingCells changes for shake effect
  const prevStampingSize = useRef<number>(0);

  useEffect(() => {
    if (stampingCells.size > 0 && prevStampingSize.current === 0) {
      animationState.shake = 1.0;
    }
    prevStampingSize.current = stampingCells.size;
  }, [stampingCells.size]);

  // Store refs to avoid recreating draw function
  const stateRef = useRef({
    grid,
    activeShape,
    dragPos,
    clearingCells,
    potentialLines,
    stampingCells,
    clearingLines,
    gameStatus,
    feedbackTexts
  });

  // Update refs in effect (not during render)
  useEffect(() => {
    stateRef.current = {
      grid,
      activeShape,
      dragPos,
      clearingCells,
      potentialLines,
      stampingCells,
      clearingLines,
      gameStatus,
      feedbackTexts
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / GRID_SIZE;

    // Particle and feedback updates are batched
    let lastBatchTime = 0;

    const draw = () => {
      const state = stateRef.current;

      ctx.clearRect(0, 0, width, height);
      ctx.save();

      // Update game over fade progress (but don't use expensive filters)
      if (state.gameStatus === 'GAMEOVER') {
        animationState.gameOverFade = Math.min(1, animationState.gameOverFade + 0.02);
      } else {
        animationState.gameOverFade = 0;
      }

      // Shake effect
      if (animationState.shake > 0) {
        const shakeAmt = animationState.shake * 4;
        ctx.translate((Math.random() - 0.5) * shakeAmt, (Math.random() - 0.5) * shakeAmt);
        animationState.shake -= 0.1;
      }

      // Draw grid lines
      ctx.strokeStyle = '#d4c9af';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(width, i * cellSize);
        ctx.stroke();
      }

      // Flash effect for clearing lines
      if (state.clearingLines.rows.length > 0 || state.clearingLines.cols.length > 0) {
        animationState.flashProgress = Math.min(1, animationState.flashProgress + 0.06);
        const totalLines = state.clearingLines.rows.length + state.clearingLines.cols.length;
        
        if (animationState.flashProgress < 0.03 && totalLines >= 2) {
          animationState.shake = Math.min(1, animationState.shake + 0.2 * totalLines);
        }
        
        const flashAlpha = Math.pow(1 - animationState.flashProgress, 2);
        if (flashAlpha > 0.01) {
          ctx.save();
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.6})`;
          state.clearingLines.rows.forEach(r => {
            ctx.fillRect(0, r * cellSize, width, cellSize);
          });
          state.clearingLines.cols.forEach(c => {
            ctx.fillRect(c * cellSize, 0, cellSize, height);
          });
          ctx.restore();
        }
      } else {
        animationState.flashProgress = 0;
      }

      // Potential line highlights - Simple and performant
      if (state.activeShape && (state.potentialLines.rows.length > 0 || state.potentialLines.cols.length > 0)) {
        ctx.save();
        
        // Simple warm highlight for rows that will clear
        ctx.fillStyle = 'rgba(139, 90, 43, 0.2)';
        state.potentialLines.rows.forEach(r => {
          ctx.fillRect(0, r * cellSize, width, cellSize);
        });
        state.potentialLines.cols.forEach(c => {
          ctx.fillRect(c * cellSize, 0, cellSize, height);
        });
        
        // Simple border
        ctx.strokeStyle = 'rgba(123, 52, 30, 0.5)';
        ctx.lineWidth = 2;
        state.potentialLines.rows.forEach(r => {
          ctx.strokeRect(1, r * cellSize + 1, width - 2, cellSize - 2);
        });
        state.potentialLines.cols.forEach(c => {
          ctx.strokeRect(c * cellSize + 1, 1, cellSize - 2, height - 2);
        });
        
        ctx.restore();
      }

      state.grid.forEach((row, r) => {
        row.forEach((cell, c) => {
          const key = `${r},${c}`;
          const seed = (r * GRID_SIZE + c) * 10;

          if (state.clearingCells.has(key)) {
            const progress = animationState.clearingProgress.get(key) || 0;
            if (progress < 1 && cell) {
              const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
              const easedProgress = easeOutQuart(progress);
              
              const scale = 1 + easedProgress * 0.25;
              const opacity = 1 - easedProgress;
              const rotation = easedProgress * 0.1;
              
              ctx.save();
              const cx = c * cellSize + cellSize / 2;
              const cy = r * cellSize + cellSize / 2;
              ctx.translate(cx, cy);
              ctx.rotate(rotation);
              ctx.translate(-cx, -cy);
              
              drawBlock(
                ctx,
                c * cellSize,
                r * cellSize,
                cellSize,
                cell.color,
                cell.symbol,
                opacity,
                scale,
                true,
                seed
              );
              
              ctx.restore();
              animationState.clearingProgress.set(key, progress + 0.045);
            }
          } else if (cell) {
            let scale = 1;
            let opacity = 1;

            if (state.stampingCells.has(key)) {
              const progress = animationState.stampingProgress.get(key) || 0;
              if (progress < 1) {
                scale = 1.3 - Math.sin(progress * Math.PI) * 0.3;
                opacity = Math.min(1, progress * 2);
                animationState.stampingProgress.set(key, progress + 0.1);
              }
            }

            drawBlock(ctx, c * cellSize, r * cellSize, cellSize, cell.color, cell.symbol, opacity, scale, false, seed);
          } else {
            animationState.clearingProgress.delete(key);
            animationState.stampingProgress.delete(key);
          }
        });
      });

      // Draw ghost/preview of active shape
      if (state.activeShape && state.dragPos && state.gameStatus === 'PLAYING') {
        const rect = canvas.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;
        const verticalOffset = rect.height * 0.18;
        const centerX = (state.dragPos.x - rect.left) * scaleX;
        const centerY = (state.dragPos.y - rect.top - verticalOffset) * scaleY;

        const col = Math.round((centerX - (state.activeShape.layout[0].length * cellSize) / 2) / cellSize);
        const row = Math.round((centerY - (state.activeShape.layout.length * cellSize) / 2) / cellSize);

        if (
          row >= 0 &&
          col >= 0 &&
          row + state.activeShape.layout.length <= GRID_SIZE &&
          col + state.activeShape.layout[0].length <= GRID_SIZE
        ) {
          let collision = false;
          for (let dr = 0; dr < state.activeShape.layout.length && !collision; dr++) {
            for (let dc = 0; dc < state.activeShape.layout[0].length && !collision; dc++) {
              if (state.activeShape.layout[dr][dc] && state.grid[row + dr][col + dc]) {
                collision = true;
              }
            }
          }

          // Draw simple ghost preview at snap position
          if (!collision) {
            state.activeShape.layout.forEach((sRow, dr) => {
              sRow.forEach((filled, dc) => {
                if (filled) {
                  const bx = (col + dc) * cellSize;
                  const by = (row + dr) * cellSize;
                  
                  // Simple transparent preview
                  ctx.save();
                  ctx.globalAlpha = 0.3;
                  ctx.fillStyle = state.activeShape!.color;
                  ctx.fillRect(bx + 4, by + 4, cellSize - 8, cellSize - 8);
                  ctx.restore();
                }
              });
            });
          }
        }

        // Draw dragged shape at cursor - same style as placed blocks
        state.activeShape.layout.forEach((sRow, dr) => {
          sRow.forEach((filled, dc) => {
            if (filled) {
              const dx = centerX + (dc - state.activeShape!.layout[0].length / 2) * cellSize;
              const dy = centerY + (dr - state.activeShape!.layout.length / 2) * cellSize;
              // Use stable seed based on position within shape
              const seed = (dr * 10 + dc) * 7;
              drawBlock(
                ctx,
                dx,
                dy,
                cellSize,
                state.activeShape!.color,
                state.activeShape!.symbol,
                0.9,
                1.0,
                false,
                seed
              );
            }
          });
        });
      }

      const now = performance.now();
      const shouldBatch = now - lastBatchTime > 50;
      if (!animationState.particleStartTime) {
        animationState.particleStartTime = now;
      }

      setParticles(prev => {
        const next: Particle[] = [];
        const deltaTime = 1;
        
        prev.forEach(p => {
          if (p.delay && p.delay > 0) {
            p.delay -= 16;
            next.push(p);
            return;
          }

          const friction = p.friction ?? 0.96;
          const gravity = p.gravity ?? 0.15;
          
          p.x += p.vx * deltaTime;
          p.y += p.vy * deltaTime;
          p.vx *= friction;
          p.vy *= friction;
          p.vy += gravity;
          
          if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
            p.rotation += p.rotationSpeed;
          }
          
          const lifeDecay = p.type === 'sparkle' ? 0.035 : p.type === 'burst' ? 0.04 : 0.03;
          p.life -= lifeDecay;

          if (p.life > 0) {
            ctx.save();
            
            const alpha = Math.min(1, p.life * 1.2);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            
            if (p.type === 'sparkle') {
              const size = p.size * (0.5 + p.life * 0.5);
              ctx.beginPath();
              ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.type === 'burst') {
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation || 0);
              const size = p.size * p.life;
              ctx.fillRect(-size, -size * 0.3, size * 2, size * 0.6);
            } else {
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation || 0);
              const size = p.size * (0.5 + p.life * 0.5);
              ctx.beginPath();
              ctx.moveTo(-size / 2, -size / 2);
              ctx.lineTo(size / 2, -size / 2);
              ctx.lineTo(size / 2, size / 2);
              ctx.lineTo(-size / 2, size / 2);
              ctx.closePath();
              ctx.fill();
            }
            
            ctx.restore();
            next.push(p);
          }
        });
        
        if (shouldBatch) {
          lastBatchTime = now;
          return next;
        }
        return prev.length !== next.length ? next : prev;
      });

      // Draw feedback texts - Smooth animation with easing (no state updates during draw)
      const feedbackNow = performance.now();
      const currentFeedbackTexts = state.feedbackTexts;
      let hasExpiredTexts = false;
      
      // Easing functions defined once
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easeOutBack = (t: number) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      };
      const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      
      currentFeedbackTexts.forEach(f => {
        const elapsed = feedbackNow - f.startTime;
        const progress = Math.min(1, elapsed / f.duration);
        
        if (progress >= 1) {
          hasExpiredTexts = true;
          return;
        }
        
        ctx.save();
        
        // Phase-based animation (entrance: 0-0.2, hold: 0.2-0.65, exit: 0.65-1.0)
        let alpha = 1;
        let scale = 1;
        let yOffset = 0;
        
        if (progress < 0.2) {
          // Entrance phase - smooth pop-in with overshoot
          const entranceProgress = progress / 0.2;
          alpha = easeOutCubic(entranceProgress);
          scale = easeOutBack(entranceProgress);
        } else if (progress < 0.65) {
          // Hold phase - fully visible with gentle floating
          alpha = 1;
          scale = 1;
          const floatProgress = (progress - 0.2) / 0.45;
          yOffset = Math.sin(floatProgress * Math.PI) * 4;
        } else {
          // Exit phase - smooth fade out and rise
          const exitProgress = (progress - 0.65) / 0.35;
          const easedExit = easeInOutQuad(exitProgress);
          alpha = 1 - easedExit;
          scale = 1 - easedExit * 0.15;
          yOffset = -easedExit * 50;
        }
        
        // Smooth continuous rise throughout
        const baseRise = easeOutCubic(progress) * 80;
        const finalY = f.y - baseRise + yOffset;
        
        ctx.translate(f.x, finalY);
        ctx.scale(scale, scale);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `italic bold 40px Georgia, serif`;
        
        // Soft outer glow (single pass)
        ctx.globalAlpha = alpha * 0.3;
        ctx.shadowColor = '#f4ecd8';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#f4ecd8';
        ctx.fillText(f.text, 0, 0);
        ctx.shadowBlur = 0;
        
        // Text shadow for depth
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = '#1a1510';
        ctx.fillText(f.text, 1.5, 1.5);
        
        // Main text
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#5c3d2e';
        ctx.fillText(f.text, 0, 0);
        
        ctx.restore();
      });
      
      // Only update state to remove expired texts (not every frame)
      if (hasExpiredTexts && shouldBatch) {
        lastBatchTime = feedbackNow;
        setFeedbackTexts(prev => prev.filter(f => {
          const elapsed = feedbackNow - f.startTime;
          return elapsed < f.duration;
        }));
      }

      // Game over overlay - use simple semi-transparent fill instead of gradient
      if (animationState.gameOverFade > 0) {
        ctx.save();
        ctx.globalAlpha = animationState.gameOverFade * 0.35;
        ctx.fillStyle = '#1d1713';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      ctx.restore();
      
      // Slow down animation loop after game over fade completes to save resources
      if (state.gameStatus === 'GAMEOVER' && animationState.gameOverFade >= 1) {
        // Run at reduced frame rate during game over
        setTimeout(() => {
          requestRef.current = requestAnimationFrame(draw);
        }, 100); // ~10fps instead of 60fps
      } else {
        requestRef.current = requestAnimationFrame(draw);
      }
    };

    requestRef.current = requestAnimationFrame(draw);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [setParticles, setFeedbackTexts]);

  return (
    <div className="relative w-full max-w-md aspect-square bg-[#f4ecd8] shadow-2xl border-2 border-[#d4c9af] rounded-sm overflow-hidden select-none touch-none">
      <canvas ref={canvasRef} width={600} height={600} className="w-full h-full cursor-none" />
    </div>
  );
};

export default GameCanvas;
