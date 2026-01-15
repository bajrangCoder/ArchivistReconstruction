import React, { useCallback, useState } from 'react';
import { X, Copy, Check, Share2, Image as ImageIcon, Type } from 'lucide-react';
import { siFacebook, siTelegram, siWhatsapp, siX } from 'simple-icons';
import ShareScoreCard from './ShareScoreCard';

interface ShareModalProps {
  score: number;
  highScore: number;
  linesCleared: number;
  blocksPlaced: number;
  bestCombo: number;
  streak: number;
  isOpen: boolean;
  onClose: () => void;
  onFeedback: (message: string) => void;
}

type ShareTab = 'text' | 'image';

const ShareModal: React.FC<ShareModalProps> = ({ 
  score, 
  highScore,
  linesCleared,
  blocksPlaced,
  bestCombo,
  streak,
  isOpen, 
  onClose, 
  onFeedback 
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<ShareTab>('image');
  
  const gameUrl = 'https://archivist-reconstruction.vercel.app';
  const shareText = `🏆 I scored ${score.toLocaleString()} points in The Archivist's Reconstruction! Can you beat my record?`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(gameUrl);

  const handleCopy = useCallback(async () => {
    const fullText = `${shareText}\n\n🎮 Play now: ${gameUrl}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      onFeedback('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        onFeedback('Copied!');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        onFeedback('Copy failed');
      }
      document.body.removeChild(textArea);
    }
  }, [shareText, gameUrl, onFeedback]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "The Archivist's Reconstruction",
          text: shareText,
          url: gameUrl,
        });
        onClose();
      } catch {
        // User cancelled
      }
    }
  }, [shareText, gameUrl, onClose]);

  if (!isOpen) return null;

  const renderIcon = (icon: { path: string }) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d={icon.path} />
    </svg>
  );

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: renderIcon(siWhatsapp),
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      color: 'bg-[#25D366]',
    },
    {
      name: 'X / Twitter',
      icon: renderIcon(siX),
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'bg-black',
    },
    {
      name: 'Telegram',
      icon: renderIcon(siTelegram),
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      color: 'bg-[#0088cc]',
    },
    {
      name: 'Facebook',
      icon: renderIcon(siFacebook),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      color: 'bg-[#1877F2]',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#f4ecd8] border-4 border-[#d4c9af] rounded-sm max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#2d241e] text-[#f4ecd8] p-4 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-serif font-bold flex items-center gap-2">
            <Share2 size={20} />
            Share Your Score
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#d4c9af] shrink-0">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-3 px-4 font-serif font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'image'
                ? 'bg-[#efe7d3] text-[#7b341e] border-b-2 border-[#7b341e]'
                : 'text-[#5c4a3c] hover:bg-[#efe7d3]/50'
            }`}
          >
            <ImageIcon size={18} />
            Share as Image
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 px-4 font-serif font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'text'
                ? 'bg-[#efe7d3] text-[#7b341e] border-b-2 border-[#7b341e]'
                : 'text-[#5c4a3c] hover:bg-[#efe7d3]/50'
            }`}
          >
            <Type size={18} />
            Share as Text
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1">
          {activeTab === 'image' ? (
            <div className="p-4">
              <ShareScoreCard
                score={score}
                highScore={highScore}
                linesCleared={linesCleared}
                blocksPlaced={blocksPlaced}
                bestCombo={bestCombo}
                streak={streak}
              />
            </div>
          ) : (
            <>
              {/* Score Display */}
              <div className="p-4 text-center border-b border-[#d4c9af]">
                <p className="text-sm text-[#5c4a3c] mb-1">Your Score</p>
                <p className="text-4xl font-bold text-[#2d241e]">{score.toLocaleString()}</p>
              </div>

              {/* Share Options */}
              <div className="p-4 space-y-3">
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className={`w-full py-3 px-4 rounded-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-[#efe7d3] text-[#2d241e] border-2 border-[#d4c9af] hover:bg-[#e6ddc4]'
                  }`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>

                {/* Native Share (if available) */}
                {'share' in navigator && (
                  <button
                    onClick={handleNativeShare}
                    className="w-full py-3 px-4 bg-[#7b341e] text-white rounded-sm font-bold flex items-center justify-center gap-2 hover:bg-[#5c2815] transition-colors"
                  >
                    <Share2 size={18} />
                    Share via Device
                  </button>
                )}

                {/* Social Links */}
                <div className="pt-2">
                  <p className="text-xs text-[#5c4a3c] text-center mb-3">Or share directly</p>
                  <div className="grid grid-cols-4 gap-2">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${social.color} text-white p-3 rounded-sm flex items-center justify-center hover:opacity-80 transition-opacity`}
                        title={social.name}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
