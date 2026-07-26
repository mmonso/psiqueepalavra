import React from 'react';
import { ReadingPreferences } from '../types';
import { getThemeClasses } from '../utils/themeHelpers';
import { ArrowUp, Feather } from 'lucide-react';

interface FooterProps {
  preferences: ReadingPreferences;
}

export const Footer: React.FC<FooterProps> = ({ preferences }) => {
  const theme = getThemeClasses(preferences.theme);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (preferences.focusMode) return null;

  return (
    <footer className={`w-full border-t ${theme.border} ${theme.bg} py-12 px-4 sm:px-8 transition-colors duration-300 mt-auto`}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${theme.border} ${theme.cardBg}`}>
            <Feather className="w-4 h-4 text-[#8C7A6B]" />
          </div>
          <div>
            <p className="font-['Playfair_Display',serif] font-bold text-base tracking-tight">
              PSIQUE & PALAVRA
            </p>
            <p className={`text-xs ${theme.textMuted}`}>
              © {new Date().getFullYear()} Marcelo Monso. Todos os direitos reservados.
            </p>
          </div>
        </div>

        <div className={`text-xs ${theme.textMuted} max-w-sm font-['Lora',serif] italic`}>
          "Até você se tornar consciente do inconsciente, ele irá dirigir a sua vida e você vai chamá-lo de destino." — C. G. Jung
        </div>

        <button
          onClick={scrollToTop}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${theme.border} ${theme.cardBg} ${theme.cardHover} text-xs font-medium transition-colors`}
          title="Voltar ao topo da página"
        >
          <span>Ao Topo</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
