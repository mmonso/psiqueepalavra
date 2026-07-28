'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Maximize2, Minimize2, Share2, Type } from 'lucide-react';
import { usePreferencias } from './PreferencesProvider';
import { FavoriteButton } from './FavoriteButton';
import { urlDoEnsaio } from '@/lib/site';
import type { Entrelinha, Fonte, Largura, Tamanho } from '@/lib/types';

const FONTES: { id: Fonte; nome: string }[] = [
  { id: 'serif', nome: 'Serifa (Lora)' },
  { id: 'sans', nome: 'Sem serifa (Jakarta)' },
  { id: 'display', nome: 'Clássica (Playfair)' },
];

const TAMANHOS: { id: Tamanho; nome: string }[] = [
  { id: 'sm', nome: 'A-' },
  { id: 'md', nome: 'A' },
  { id: 'lg', nome: 'A+' },
  { id: 'xl', nome: 'A++' },
];

const ENTRELINHAS: { id: Entrelinha; nome: string }[] = [
  { id: 'normal', nome: 'Padrão' },
  { id: 'relaxed', nome: 'Aconchegante' },
  { id: 'loose', nome: 'Espaçado' },
];

const LARGURAS: { id: Largura; nome: string }[] = [
  { id: 'compact', nome: 'Estreita' },
  { id: 'standard', nome: 'Normal' },
  { id: 'wide', nome: 'Larga' },
];

interface Props {
  slug: string;
  titulo: string;
}

export function ReadingToolbar({ slug, titulo }: Props) {
  const { prefs, atualizar } = usePreferencias();
  const [painelAberto, setPainelAberto] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const timerCopia = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let frame = 0;

    const medir = () => {
      frame = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgresso(total <= 0 ? 0 : Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
    };

    // O listener passivo não bloqueia a rolagem, e o rAF junta vários eventos
    // numa única medição por quadro — ler scrollHeight a cada evento força
    // recálculo de layout e trava a rolagem em textos longos.
    const aoRolar = () => {
      if (!frame) frame = requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRolar, { passive: true });
    return () => {
      window.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', aoRolar);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => () => {
    if (timerCopia.current) clearTimeout(timerCopia.current);
  }, []);

  const compartilhar = async () => {
    const url = urlDoEnsaio(slug);
    // Cada ensaio tem endereço próprio agora, então o link compartilhado
    // abre o texto — antes copiava sempre a raiz do site.
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch {
        // Compartilhamento cancelado pelo leitor: cai na cópia abaixo.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      timerCopia.current = setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Sem permissão de área de transferência: nada a fazer sem incomodar.
    }
  };

  const grupo = (ativo: boolean) =>
    [
      'rounded px-3 py-1.5 text-left text-xs font-medium transition-colors',
      ativo ? 'bg-btn text-btn-ink' : 'bg-pill text-pill-ink hover:opacity-75',
    ].join(' ');

  return (
    <>
      <div
        className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent"
        role="progressbar"
        aria-label="Progresso da leitura"
        aria-valuenow={Math.round(progresso)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-accent transition-[width] duration-150 ease-out"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <div className="sticky top-0 z-30 border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-card-hover"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            <span className="truncate text-xs font-medium text-muted sm:text-sm">{titulo}</span>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <FavoriteButton slug={slug} titulo={titulo} />

            <button
              type="button"
              onClick={compartilhar}
              title="Compartilhar este ensaio"
              aria-label="Compartilhar este ensaio"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-card hover:text-ink"
            >
              {copiado ? (
                <Check className="h-4 w-4 text-accent" aria-hidden="true" />
              ) : (
                <Share2 className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => atualizar({ modoFoco: !prefs.modoFoco })}
              aria-pressed={prefs.modoFoco}
              title="Modo foco: esconde a navegação para uma leitura sem distração"
              className={[
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                prefs.modoFoco ? 'bg-btn text-btn-ink' : 'bg-card hover:bg-card-hover',
              ].join(' ')}
            >
              {prefs.modoFoco ? (
                <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {prefs.modoFoco ? 'Sair do foco' : 'Modo foco'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPainelAberto((v) => !v)}
              aria-expanded={painelAberto}
              aria-controls="painel-tipografia"
              className={[
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                painelAberto ? 'bg-btn text-btn-ink' : 'bg-card hover:bg-card-hover',
              ].join(' ')}
            >
              <Type className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tipografia</span>
            </button>
          </div>
        </div>

        {painelAberto && (
          <div
            id="painel-tipografia"
            className="anim-surgir mx-auto mt-3 grid max-w-4xl grid-cols-1 gap-4 border-t border-line pt-3 sm:grid-cols-2 md:grid-cols-4"
          >
            <fieldset>
              <legend className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                Fonte
              </legend>
              <div className="flex flex-col gap-1">
                {FONTES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={prefs.fonte === f.id}
                    onClick={() => atualizar({ fonte: f.id })}
                    className={grupo(prefs.fonte === f.id)}
                  >
                    {f.nome}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                Tamanho
              </legend>
              <div className="grid grid-cols-4 gap-1">
                {TAMANHOS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={prefs.tamanho === t.id}
                    aria-label={`Tamanho ${t.nome}`}
                    onClick={() => atualizar({ tamanho: t.id })}
                    className={`${grupo(prefs.tamanho === t.id)} text-center font-bold`}
                  >
                    {t.nome}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                Entrelinha
              </legend>
              <div className="flex flex-col gap-1">
                {ENTRELINHAS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    aria-pressed={prefs.entrelinha === e.id}
                    onClick={() => atualizar({ entrelinha: e.id })}
                    className={grupo(prefs.entrelinha === e.id)}
                  >
                    {e.nome}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                Largura da coluna
              </legend>
              <div className="flex flex-col gap-1">
                {LARGURAS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    aria-pressed={prefs.largura === l.id}
                    onClick={() => atualizar({ largura: l.id })}
                    className={grupo(prefs.largura === l.id)}
                  >
                    {l.nome}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </div>
    </>
  );
}
