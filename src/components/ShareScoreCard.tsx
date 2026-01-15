import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ShareScoreCardProps {
  score: number;
  highScore: number;
  linesCleared: number;
  blocksPlaced: number;
  bestCombo: number;
  streak: number;
  onImageGenerated?: (blob: Blob) => void;
}

const CARD_WIDTH = 600;
const CARD_HEIGHT = 800;

const ShareScoreCard: React.FC<ShareScoreCardProps> = ({
  score,
  highScore,
  linesCleared,
  blocksPlaced,
  bestCombo,
  streak,
  onImageGenerated
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    const gradient = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
    gradient.addColorStop(0, '#f4ecd8');
    gradient.addColorStop(0.5, '#efe7d3');
    gradient.addColorStop(1, '#e8dcc4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    ctx.save();
    ctx.globalAlpha = 0.15;
    const patternSize = 40;
    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x < CARD_WIDTH; x += patternSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CARD_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CARD_HEIGHT; y += patternSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CARD_WIDTH, y);
      ctx.stroke();
    }
    ctx.restore();

    const drawOrnament = (x: number, y: number, size: number, rotation: number = 0) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.strokeStyle = '#7b341e';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
        ctx.moveTo(Math.cos(angle) * size * 0.3, Math.sin(angle) * size * 0.3);
        ctx.arc(0, 0, size * 0.3, angle, angle + Math.PI / 2);
      }
      ctx.stroke();
      ctx.restore();
    };

    drawOrnament(60, 60, 30, Math.PI / 4);
    drawOrnament(CARD_WIDTH - 60, 60, 30, Math.PI / 4);
    drawOrnament(60, CARD_HEIGHT - 60, 30, Math.PI / 4);
    drawOrnament(CARD_WIDTH - 60, CARD_HEIGHT - 60, 30, Math.PI / 4);

    const borderGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
    borderGradient.addColorStop(0, 'transparent');
    borderGradient.addColorStop(0.3, '#7b341e');
    borderGradient.addColorStop(0.7, '#7b341e');
    borderGradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = '#d4c9af';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, CARD_WIDTH - 40, CARD_HEIGHT - 40);
    
    ctx.strokeStyle = '#5c4a3c';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, CARD_WIDTH - 60, CARD_HEIGHT - 60);

    ctx.fillStyle = borderGradient;
    ctx.fillRect(100, 38, CARD_WIDTH - 200, 4);
    ctx.fillRect(100, CARD_HEIGHT - 42, CARD_WIDTH - 200, 4);

    ctx.fillStyle = '#2d241e';
    ctx.font = 'italic 28px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText("The Archivist's", CARD_WIDTH / 2, 120);
    
    ctx.fillStyle = '#7b341e';
    ctx.font = 'bold 44px "Crimson Pro", Georgia, serif';
    ctx.fillText('Reconstruction', CARD_WIDTH / 2, 170);
    
    ctx.fillStyle = '#5c4a3c';
    ctx.font = '16px "Crimson Pro", Georgia, serif';
    ctx.fillText('Volume VIII', CARD_WIDTH / 2, 200);

    ctx.strokeStyle = '#d4c9af';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 230);
    ctx.lineTo(CARD_WIDTH - 100, 230);
    ctx.stroke();

    ctx.fillStyle = '#5c4a3c';
    ctx.font = 'small-caps 14px "Crimson Pro", Georgia, serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('PRESERVED KNOWLEDGE', CARD_WIDTH / 2, 290);

    const scoreGradient = ctx.createLinearGradient(CARD_WIDTH / 2 - 100, 310, CARD_WIDTH / 2 + 100, 390);
    scoreGradient.addColorStop(0, '#2d241e');
    scoreGradient.addColorStop(0.5, '#7b341e');
    scoreGradient.addColorStop(1, '#2d241e');
    
    ctx.save();
    ctx.shadowColor = 'rgba(123, 52, 30, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = scoreGradient;
    ctx.font = 'bold 96px "Crimson Pro", Georgia, serif';
    ctx.fillText(score.toLocaleString(), CARD_WIDTH / 2, 380);
    ctx.restore();
    
    ctx.fillStyle = '#5c4a3c';
    ctx.font = 'italic 18px "Crimson Pro", Georgia, serif';
    ctx.fillText('points', CARD_WIDTH / 2, 410);

    if (score >= highScore && highScore > 0) {
      ctx.save();
      ctx.fillStyle = '#7b341e';
      ctx.font = 'bold 20px "Crimson Pro", Georgia, serif';
      
      const gradient2 = ctx.createLinearGradient(CARD_WIDTH / 2 - 80, 440, CARD_WIDTH / 2 + 80, 440);
      gradient2.addColorStop(0, '#dd6b20');
      gradient2.addColorStop(0.5, '#7b341e');
      gradient2.addColorStop(1, '#dd6b20');
      ctx.fillStyle = gradient2;
      ctx.fillText('★ NEW RECORD! ★', CARD_WIDTH / 2, 440);
      ctx.restore();
    }

    ctx.strokeStyle = '#d4c9af';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 470);
    ctx.lineTo(CARD_WIDTH - 100, 470);
    ctx.stroke();

    const stats = [
      { label: 'Lines Purged', value: linesCleared.toString(), icon: '📏' },
      { label: 'Blocks Placed', value: blocksPlaced.toString(), icon: '✒️' },
      { label: 'Best Combo', value: bestCombo > 0 ? `${bestCombo}x` : '-', icon: '⚡' },
      { label: 'Streak', value: streak > 0 ? `${streak}x` : '-', icon: '🔥' },
    ];

    const statStartY = 510;
    const statHeight = 45;
    const statsPerRow = 2;
    const statWidth = (CARD_WIDTH - 120) / statsPerRow;

    stats.forEach((stat, index) => {
      const row = Math.floor(index / statsPerRow);
      const col = index % statsPerRow;
      const x = 60 + col * statWidth + statWidth / 2;
      const y = statStartY + row * statHeight;

      ctx.fillStyle = '#5c4a3c';
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.fillText(stat.icon, x - 60, y + 8);

      ctx.fillStyle = '#8b7355';
      ctx.font = '12px "Crimson Pro", Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(stat.label.toUpperCase(), x - 40, y);

      ctx.fillStyle = '#2d241e';
      ctx.font = 'bold 22px "Crimson Pro", Georgia, serif';
      ctx.fillText(stat.value, x - 40, y + 28);
    });

    ctx.strokeStyle = '#d4c9af';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 630);
    ctx.lineTo(CARD_WIDTH - 100, 630);
    ctx.stroke();

    ctx.fillStyle = '#5c4a3c';
    ctx.font = 'italic 16px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('"Seek the order within the scattered ink."', CARD_WIDTH / 2, 675);

    ctx.fillStyle = '#2d241e';
    ctx.font = 'bold 14px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎮 Can you beat my score?', CARD_WIDTH / 2, 720);
    
    ctx.fillStyle = '#7b341e';
    ctx.font = '14px "Crimson Pro", Georgia, serif';
    ctx.fillText('archivist-reconstruction.vercel.app', CARD_WIDTH / 2, 745);

    const url = canvas.toDataURL('image/png');
    setImageUrl(url);

    canvas.toBlob((blob) => {
      if (blob && onImageGenerated) {
        onImageGenerated(blob);
      }
    }, 'image/png');
  }, [score, highScore, linesCleared, blocksPlaced, bestCombo, streak, onImageGenerated]);

  useEffect(() => {
    setGenerating(true);
    const timer = setTimeout(() => {
      drawCard();
      setGenerating(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [drawCard]);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.download = `archivist-score-${score}.png`;
    link.href = imageUrl;
    link.click();
  }, [imageUrl, score]);

  const handleShare = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current?.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      });

      const file = new File([blob], `archivist-score-${score}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "The Archivist's Reconstruction - My Score",
          text: `🏆 I scored ${score} points in The Archivist's Reconstruction! Can you beat my record?`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch (error) {
      console.error('Share failed:', error);
      handleDownload();
    }
  }, [score, handleDownload]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-sm overflow-hidden shadow-2xl border-2 border-[#d4c9af]">
        {generating && (
          <div className="absolute inset-0 bg-[#f4ecd8]/80 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-[#7b341e] animate-spin" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          className="max-w-full h-auto"
          style={{ maxHeight: '50vh' }}
        />
      </div>
      
      <div className="flex gap-3 w-full max-w-[300px]">
        <button
          onClick={handleDownload}
          disabled={generating || !imageUrl}
          className="flex-1 py-3 px-4 bg-[#2d241e] text-[#f4ecd8] rounded-sm font-bold flex items-center justify-center gap-2 hover:bg-[#3d3129] transition-colors disabled:opacity-50"
        >
          <Download size={18} />
          Save
        </button>
        <button
          onClick={handleShare}
          disabled={generating || !imageUrl}
          className="flex-1 py-3 px-4 bg-[#7b341e] text-white rounded-sm font-bold flex items-center justify-center gap-2 hover:bg-[#5c2815] transition-colors disabled:opacity-50"
        >
          <ImageIcon size={18} />
          Share Image
        </button>
      </div>
    </div>
  );
};

export default ShareScoreCard;
