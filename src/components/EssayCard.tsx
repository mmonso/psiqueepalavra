import React from 'react';
import { Essay, ReadingPreferences } from '../types';
import { getThemeClasses } from '../utils/themeHelpers';
import { Clock, Bookmark, ArrowUpRight, Heart, Eye } from 'lucide-react';

interface EssayCardProps {
  essay: Essay;
  preferences: ReadingPreferences;
  onSelect: (essayId: string) => void;
  onToggleFavorite?: (essayId: string, e: React.MouseEvent) => void;
  onSelectTag?: (tag: string, e: React.MouseEvent) => void;
}

export const EssayCard: React.FC<EssayCardProps> = ({
  essay,
  preferences,
  onSelect,
  onToggleFavorite,
  onSelectTag,
}) => {
  const theme = getThemeClasses(preferences.theme);

  return (
    <article 
      onClick={() => onSelect(essay.id)}
      className={`group cursor-pointer rounded-xl border ${theme.border} ${theme.cardBg} ${theme.cardHover} p-6 sm:p-8 transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden`}
    >
      <div>
        {/* Meta Header: Tags & Time */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {essay.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  if (onSelectTag) {
                    e.stopPropagation();
                    onSelectTag(tag, e);
                  }
                }}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase transition-colors ${theme.pillBg} ${theme.pillText} hover:opacity-80`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className={`flex items-center gap-3 text-xs font-medium ${theme.textMuted}`}>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {essay.readingTimeMinutes} min de leitura
            </span>
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(essay.id, e);
                }}
                className={`p-1.5 rounded-md transition-all hover:scale-110 ${
                  essay.isFavorite ? 'text-[#C5832B]' : `${theme.textMuted} hover:${theme.text}`
                }`}
                title={essay.isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
              >
                <Bookmark className="w-4 h-4" fill={essay.isFavorite ? "currentColor" : "none"} />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className={`font-["Playfair_Display",serif] text-xl sm:text-2xl font-bold leading-snug mb-3 ${theme.text} group-hover:underline decoration-1 underline-offset-4 transition-all`}>
          {essay.title}
        </h2>

        {/* Excerpt */}
        <p className={`text-sm sm:text-base leading-relaxed ${theme.textMuted} font-["Lora",serif] mb-6 line-clamp-3`}>
          {essay.excerpt}
        </p>
      </div>

      {/* Footer Meta */}
      <div className={`pt-4 border-t ${theme.border} flex items-center justify-between text-xs ${theme.textMuted}`}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-current">{essay.author}</span>
          <span>•</span>
          <span>{essay.date}</span>
        </div>

        <div className="flex items-center gap-3">
          {essay.views !== undefined && (
            <span className="flex items-center gap-1" title="Leituras">
              <Eye className="w-3.5 h-3.5" />
              {essay.views}
            </span>
          )}
          <span className={`flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform ${theme.text}`}>
            Ler Ensaio
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
};
