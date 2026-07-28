'use client';

import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';
import type { Ensaio } from '@/lib/types';

interface Props {
  ensaio: Ensaio;
  /** Filtra a lista pela tag clicada. Ausente, as tags viram apenas rótulos. */
  aoEscolherTag?: (tag: string) => void;
}

export function EssayCard({ ensaio, aoEscolherTag }: Props) {
  return (
    /*
      O card inteiro é clicável, mas quem carrega o link é o título: o
      pseudo-elemento depois dele cobre o card. Assim o cartão continua sendo
      um único destino no teclado e nos leitores de tela, em vez do
      <article onClick> antigo, que o teclado não alcançava.
    */
    <article className="group relative flex h-full flex-col justify-between rounded-xl border border-line bg-card p-6 transition-colors hover:bg-card-hover focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-canvas sm:p-8">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {ensaio.tags.slice(0, 2).map((tag) =>
              aoEscolherTag ? (
                <button
                  key={tag}
                  type="button"
                  onClick={() => aoEscolherTag(tag)}
                  className="relative z-10 rounded-full bg-pill px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-pill-ink transition-opacity hover:opacity-75"
                >
                  {tag}
                </button>
              ) : (
                <span
                  key={tag}
                  className="rounded-full bg-pill px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-pill-ink"
                >
                  {tag}
                </span>
              ),
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {ensaio.minutosLeitura} min
            </span>
            <FavoriteButton slug={ensaio.slug} titulo={ensaio.titulo} className="relative z-10" />
          </div>
        </div>

        <h2 className="mb-3 font-display text-xl font-bold leading-snug tracking-tight sm:text-2xl">
          <Link
            href={`/ensaios/${ensaio.slug}`}
            className="after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4"
          >
            {ensaio.titulo}
          </Link>
        </h2>

        <p className="mb-6 font-serif text-sm leading-relaxed text-muted sm:text-base">
          {ensaio.resumo}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
        <div className="flex items-center gap-2">
          <span className="font-medium">{ensaio.autor}</span>
          <span aria-hidden="true">•</span>
          <time dateTime={ensaio.data}>{ensaio.dataFormatada}</time>
        </div>

        <span className="flex items-center gap-1 font-semibold text-ink transition-transform group-hover:translate-x-0.5">
          Ler ensaio
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
