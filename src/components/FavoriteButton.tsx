'use client';

import { Bookmark } from 'lucide-react';
import { usePreferencias } from './PreferencesProvider';

interface Props {
  slug: string;
  titulo: string;
  /** Mostra o texto ao lado do ícone, em telas maiores. */
  comRotulo?: boolean;
  className?: string;
}

export function FavoriteButton({ slug, titulo, comRotulo = false, className = '' }: Props) {
  const { ehFavorito, alternarFavorito, pronto } = usePreferencias();
  const salvo = pronto && ehFavorito(slug);

  return (
    <button
      type="button"
      onClick={() => alternarFavorito(slug)}
      aria-pressed={salvo}
      aria-label={
        salvo ? `Remover "${titulo}" dos favoritos` : `Salvar "${titulo}" nos favoritos`
      }
      title={salvo ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      className={[
        'flex items-center gap-1.5 rounded-lg p-1.5 transition-colors',
        salvo ? 'text-accent' : 'text-muted hover:text-ink',
        className,
      ].join(' ')}
    >
      <Bookmark className="h-4 w-4" fill={salvo ? 'currentColor' : 'none'} aria-hidden="true" />
      {comRotulo && (
        <span className="hidden text-sm sm:inline">{salvo ? 'Salvo' : 'Favoritar'}</span>
      )}
    </button>
  );
}
