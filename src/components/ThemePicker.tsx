import React from 'react';
import { X, Palette, Check } from 'lucide-react';
import { colorThemes, type ColorTheme } from '../data/colorThemes';

interface ThemePickerProps {
  currentTheme: string;
  onSelectTheme: (themeId: string) => void;
  onClose: () => void;
}

const ThemePicker: React.FC<ThemePickerProps> = ({ currentTheme, onSelectTheme, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#f4ecd8] border-4 border-[#d4c9af] rounded-sm max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#f4ecd8] border-b-2 border-[#d4c9af] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={24} className="text-[#5c4a3c]" />
            <h2 className="text-xl font-serif font-bold italic text-[#2d241e]">Ink Palettes</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#e6ddc4] rounded-sm transition-colors"
          >
            <X size={20} className="text-[#5c4a3c]" />
          </button>
        </div>

        {/* Theme Options */}
        <div className="p-4 space-y-3">
          {colorThemes.map(theme => (
            <ThemeOption 
              key={theme.id} 
              theme={theme} 
              isSelected={currentTheme === theme.id}
              onSelect={() => onSelectTheme(theme.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface ThemeOptionProps {
  theme: ColorTheme;
  isSelected: boolean;
  onSelect: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ theme, isSelected, onSelect }) => (
  <button
    onClick={onSelect}
    className={`w-full p-3 rounded-sm border-2 transition-all flex items-center gap-3 ${
      isSelected 
        ? 'border-[#7b341e] bg-[#efe7d3]' 
        : 'border-[#d4c9af] bg-[#f4ecd8] hover:bg-[#efe7d3]'
    }`}
  >
    {/* Color Preview */}
    <div className="flex gap-1">
      {theme.colors.slice(0, 4).map((color, i) => (
        <div 
          key={i}
          className="w-6 h-6 rounded-sm"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
    
    {/* Theme Name */}
    <div className="flex-1 text-left">
      <div className="font-serif font-bold text-[#2d241e]">{theme.name}</div>
    </div>
    
    {/* Selected Indicator */}
    {isSelected && (
      <div className="text-[#7b341e]">
        <Check size={20} />
      </div>
    )}
  </button>
);

export default ThemePicker;
