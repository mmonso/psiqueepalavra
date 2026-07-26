import React from 'react';
import { ViewMode, ReadingPreferences, ReadingTheme } from '../types';
import { getThemeClasses } from '../utils/themeHelpers';
import { BookOpen, Bookmark, Feather, Upload } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  preferences: ReadingPreferences;
  onUpdatePreferences: (prefs: Partial<ReadingPreferences>) => void;
  favoriteCount: number;
  onOpenUpload: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  preferences,
  onUpdatePreferences,
  favoriteCount,
  onOpenUpload,
}) => {
  const theme = getThemeClasses(preferences.theme);

  const themes: { id: ReadingTheme; label: string; color: string }[] = [
    { id: 'papiro', label: 'Papiro', color: '#FBF9F5' },
    { id: 'creme', label: 'Creme', color: '#F4EFE6' },
    { id: 'alba', label: 'Branco', color: '#FFFFFF' },
    { id: 'noturno', label: 'Noite', color: '#181A1B' },
  ];

  if (preferences.focusMode && currentView === 'reader') {
    return null;
  }

  return (
    <header className={`w-full border-b ${theme.border} ${theme.bg} sticky top-0 z-40 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Title */}
        <div 
          onClick={() => onNavigate('home')}
          className="cursor-pointer group flex items-center gap-3"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${theme.border} ${theme.cardBg} group-hover:scale-105 transition-transform`}>
            <Feather className={`w-5 h-5 ${theme.text}`} />
          </div>
          <div>
            <h1 className={`font-["Playfair_Display",serif] text-xl sm:text-2xl font-bold tracking-tight ${theme.text}`}>
              PSIQUE & PALAVRA
            </h1>
            <p className={`text-xs uppercase tracking-widest font-medium ${theme.textMuted}`}>
              Ensaios de Psicologia • Marcelo Monso
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Theme Dots */}
        <nav className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentView === 'home'
                ? `${theme.buttonBg} ${theme.buttonText}`
                : `${theme.textMuted} hover:${theme.text} hover:${theme.cardBg}`
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Ensaios</span>
          </button>

          <button
            onClick={() => onNavigate('favorites')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentView === 'favorites'
                ? `${theme.buttonBg} ${theme.buttonText}`
                : `${theme.textMuted} hover:${theme.text} hover:${theme.cardBg}`
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Favoritos</span>
            {favoriteCount > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${currentView === 'favorites' ? 'bg-white/20 text-white' : 'bg-[#EAE3D9] text-[#2C2A29]'}`}>
                {favoriteCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenUpload}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium border ${theme.border} ${theme.cardBg} hover:opacity-80 transition-all shadow-sm`}
            title="Subir arquivo de texto (.md, .txt) ou colar ensaio"
          >
            <Upload className="w-4 h-4 text-[#8C7A6B]" />
            <span>Subir Texto</span>
          </button>

          {/* Discreet Theme Dots in Header */}
          <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-current border-opacity-20 ml-1" title="Tema de Leitura">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => onUpdatePreferences({ theme: t.id })}
                className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
                  preferences.theme === t.id
                    ? 'ring-2 ring-offset-2 ring-[#8C7A6B] scale-110'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: t.color, borderColor: t.id === 'alba' ? '#D0D0D0' : t.id === 'noturno' ? '#444' : '#C0B8AD' }}
                aria-label={`Mudar tema para ${t.label}`}
              />
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};
