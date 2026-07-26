import React from 'react';
import { ReadingPreferences, FontFamily, FontSize, LineHeight, MaxWidth } from '../types';
import { getThemeClasses } from '../utils/themeHelpers';
import { Type, Minimize2, Maximize2, Sliders, Eye, ArrowLeft, Bookmark, Share2 } from 'lucide-react';

interface ReadingToolbarProps {
  preferences: ReadingPreferences;
  onUpdatePreferences: (prefs: Partial<ReadingPreferences>) => void;
  onBack: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  readingProgress: number; // 0 to 100
  essayTitle?: string;
}

export const ReadingToolbar: React.FC<ReadingToolbarProps> = ({
  preferences,
  onUpdatePreferences,
  onBack,
  isFavorite,
  onToggleFavorite,
  onShare,
  readingProgress,
  essayTitle,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const theme = getThemeClasses(preferences.theme);

  const fonts: { id: FontFamily; label: string }[] = [
    { id: 'serif', label: 'Serifa (Lora)' },
    { id: 'sans', label: 'Sem Serifa (Jakarta)' },
    { id: 'display', label: 'Clássica (Playfair)' },
  ];

  const sizes: { id: FontSize; label: string }[] = [
    { id: 'sm', label: 'A-' },
    { id: 'md', label: 'A' },
    { id: 'lg', label: 'A+' },
    { id: 'xl', label: 'A++' },
  ];

  const lineHeights: { id: LineHeight; label: string }[] = [
    { id: 'normal', label: 'Padrão' },
    { id: 'relaxed', label: 'Aconchegante' },
    { id: 'loose', label: 'Espaçado' },
  ];

  const widths: { id: MaxWidth; label: string }[] = [
    { id: 'compact', label: 'Estreito' },
    { id: 'standard', label: 'Normal' },
    { id: 'wide', label: 'Largo' },
  ];

  return (
    <>
      {/* Reading Progress Bar at top of viewport */}
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50 pointer-events-none">
        <div 
          className="h-full bg-[#8C7A6B] transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating or pinned controls bar */}
      <div className={`sticky top-0 z-30 ${theme.bg} border-b ${theme.border} py-3 px-4 sm:px-8 transition-colors duration-300 shadow-sm`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Back button & Title excerpt */}
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={onBack}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${theme.cardBg} ${theme.cardHover} ${theme.text} transition-colors`}
              title="Voltar para a lista"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            {essayTitle && (
              <span className={`text-xs sm:text-sm truncate font-medium ${theme.textMuted} max-w-xs md:max-w-md`}>
                {essayTitle}
              </span>
            )}
          </div>

          {/* Actions & Settings Toggle */}
          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite ? 'text-[#C5832B] bg-[#EAE3D9]/60 dark:bg-amber-950/40' : `${theme.textMuted} hover:${theme.text} hover:${theme.cardBg}`
                }`}
                title={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
              >
                <Bookmark className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
              </button>
            )}

            {onShare && (
              <button
                onClick={onShare}
                className={`p-2 rounded-lg ${theme.textMuted} hover:${theme.text} hover:${theme.cardBg} transition-colors`}
                title="Compartilhar ou copiar link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onUpdatePreferences({ focusMode: !preferences.focusMode })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                preferences.focusMode
                  ? `${theme.buttonBg} ${theme.buttonText}`
                  : `${theme.cardBg} ${theme.cardHover} ${theme.text}`
              }`}
              title="Modo Foco: ocultar navegação para leitura imersiva"
            >
              {preferences.focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{preferences.focusMode ? 'Sair do Foco' : 'Modo Foco'}</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isOpen
                  ? `${theme.buttonBg} ${theme.buttonText}`
                  : `${theme.cardBg} ${theme.cardHover} ${theme.text}`
              }`}
              title="Ajustar Tipografia e Conforto de Leitura"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Tipografia</span>
            </button>
          </div>
        </div>

        {/* Expanded Typography Panel */}
        {isOpen && (
          <div className={`mt-3 pt-3 border-t ${theme.border} max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs animate-in fade-in slide-in-from-top-2 duration-200`}>
            {/* Font Family */}
            <div>
              <label className={`block font-semibold mb-1.5 uppercase tracking-wider ${theme.textMuted}`}>
                Fonte de Leitura
              </label>
              <div className="flex flex-col gap-1">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onUpdatePreferences({ fontFamily: f.id })}
                    className={`px-3 py-1.5 rounded text-left transition-colors font-medium ${
                      preferences.fontFamily === f.id
                        ? `${theme.buttonBg} ${theme.buttonText}`
                        : `${theme.pillBg} ${theme.pillText} hover:opacity-80`
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className={`block font-semibold mb-1.5 uppercase tracking-wider ${theme.textMuted}`}>
                Tamanho da Fonte
              </label>
              <div className="grid grid-cols-4 gap-1">
                {sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onUpdatePreferences({ fontSize: s.id })}
                    className={`py-2 rounded font-bold text-center transition-colors ${
                      preferences.fontSize === s.id
                        ? `${theme.buttonBg} ${theme.buttonText}`
                        : `${theme.pillBg} ${theme.pillText} hover:opacity-80`
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height */}
            <div>
              <label className={`block font-semibold mb-1.5 uppercase tracking-wider ${theme.textMuted}`}>
                Espaçamento de Linha
              </label>
              <div className="flex flex-col gap-1">
                {lineHeights.map((lh) => (
                  <button
                    key={lh.id}
                    onClick={() => onUpdatePreferences({ lineHeight: lh.id })}
                    className={`px-3 py-1.5 rounded text-left transition-colors font-medium ${
                      preferences.lineHeight === lh.id
                        ? `${theme.buttonBg} ${theme.buttonText}`
                        : `${theme.pillBg} ${theme.pillText} hover:opacity-80`
                    }`}
                  >
                    {lh.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Width */}
            <div>
              <label className={`block font-semibold mb-1.5 uppercase tracking-wider ${theme.textMuted}`}>
                Largura da Coluna
              </label>
              <div className="flex flex-col gap-1">
                {widths.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => onUpdatePreferences({ maxWidth: w.id })}
                    className={`px-3 py-1.5 rounded text-left transition-colors font-medium ${
                      preferences.maxWidth === w.id
                        ? `${theme.buttonBg} ${theme.buttonText}`
                        : `${theme.pillBg} ${theme.pillText} hover:opacity-80`
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
