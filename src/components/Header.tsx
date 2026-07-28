'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Bookmark, Feather } from 'lucide-react';
import { usePreferencias } from './PreferencesProvider';
import { ThemePicker } from './ThemePicker';
import { site } from '@/lib/site';

export function Header() {
  const pathname = usePathname();
  const { favoritos, prefs, pronto } = usePreferencias();

  const naLeitura = pathname?.startsWith('/ensaios/') ?? false;

  // O modo foco esconde o cabeçalho apenas durante a leitura, onde a barra do
  // leitor continua visível com o botão de sair. Antes ele sumia em todas as
  // telas e o leitor ficava sem nenhuma navegação, sem forma de desligar.
  if (prefs.modoFoco && naLeitura) return null;

  const linkClasse = (ativo: boolean) =>
    [
      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4',
      ativo
        ? 'bg-btn text-btn-ink'
        : 'text-muted hover:bg-card hover:text-ink',
    ].join(' ');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-8 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-card transition-transform group-hover:scale-105">
            <Feather className="h-5 w-5 text-accent" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-display text-xl font-bold tracking-tight sm:text-2xl">
              {site.nome}
            </span>
            <span className="block text-xs font-medium uppercase tracking-widest text-muted">
              {site.tagline} • {site.autor}
            </span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href="/" className={linkClasse(pathname === '/')}>
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Ensaios</span>
          </Link>

          <Link href="/favoritos" className={linkClasse(pathname === '/favoritos')}>
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            <span>Favoritos</span>
            {pronto && favoritos.length > 0 && (
              <span className="ml-1 rounded-full bg-pill px-1.5 py-0.5 text-[10px] font-bold text-pill-ink">
                {favoritos.length}
              </span>
            )}
          </Link>

          <div className="ml-1 border-l border-line pl-2 sm:pl-3">
            <ThemePicker />
          </div>
        </nav>
      </div>
    </header>
  );
}
