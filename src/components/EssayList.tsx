'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Search, X } from 'lucide-react';
import { EssayCard } from './EssayCard';
import { usePreferencias } from './PreferencesProvider';
import type { Ensaio } from '@/lib/types';

interface Props {
  ensaios: Ensaio[];
  /** Na página de favoritos, mostra só o que o leitor salvou. */
  apenasFavoritos?: boolean;
}

function normalizar(texto: string): string {
  // Sem isso, buscar por "psicanalise" não encontraria "Psicanálise".
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function EssayList({ ensaios, apenasFavoritos = false }: Props) {
  const [busca, setBusca] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const { favoritos, pronto } = usePreferencias();

  const tagsDisponiveis = useMemo(() => {
    const contagem = new Map<string, number>();
    for (const ensaio of ensaios) {
      for (const t of ensaio.tags) contagem.set(t, (contagem.get(t) ?? 0) + 1);
    }
    return [...contagem.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
      .map(([nome]) => nome);
  }, [ensaios]);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());

    return ensaios.filter((ensaio) => {
      if (apenasFavoritos && !favoritos.includes(ensaio.slug)) return false;
      if (tag && !ensaio.tags.includes(tag)) return false;
      if (!termo) return true;

      const alvo = normalizar(
        [ensaio.titulo, ensaio.subtitulo, ensaio.resumo, ensaio.conteudo, ensaio.tags.join(' ')].join(
          ' ',
        ),
      );
      return alvo.includes(termo);
    });
  }, [ensaios, busca, tag, apenasFavoritos, favoritos]);

  const temFiltro = Boolean(busca.trim() || tag);
  const limpar = () => {
    setBusca('');
    setTag(null);
  };

  // Na página de favoritos o conteúdo depende do localStorage; até a leitura
  // terminar, mostrar "nenhum encontrado" seria mentira momentânea.
  if (apenasFavoritos && !pronto) {
    return <p className="py-20 text-center text-sm text-muted">Carregando seus favoritos…</p>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, tema ou palavra no texto…"
            aria-label="Buscar ensaios"
            className="w-full rounded-xl border border-line bg-card py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {tagsDisponiveis.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {tagsDisponiveis.map((nome) => {
              const ativa = tag === nome;
              return (
                <button
                  key={nome}
                  type="button"
                  aria-pressed={ativa}
                  onClick={() => setTag(ativa ? null : nome)}
                  className={[
                    'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors',
                    ativa
                      ? 'bg-btn text-btn-ink'
                      : 'bg-pill text-pill-ink hover:opacity-75',
                  ].join(' ')}
                >
                  {nome}
                </button>
              );
            })}

            {/*
              Botão sempre presente enquanto há filtro. Antes ele só aparecia
              na tela de "nada encontrado": filtrando por uma tag com
              resultados, não havia como voltar para a lista completa.
            */}
            {temFiltro && (
              <button
                type="button"
                onClick={limpar}
                className="flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted transition-colors hover:text-ink"
              >
                <X className="h-3 w-3" aria-hidden="true" />
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <p className="mb-6 text-xs text-muted" role="status" aria-live="polite">
        {filtrados.length} {filtrados.length === 1 ? 'ensaio' : 'ensaios'}
        {tag ? ` em "${tag}"` : ''}
        {busca.trim() ? ` para "${busca.trim()}"` : ''}
      </p>

      {filtrados.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card py-20 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted" aria-hidden="true" />
          <h3 className="mb-2 font-display text-xl font-bold">Nenhum ensaio encontrado</h3>
          <p className="mx-auto max-w-md text-sm text-muted">
            {apenasFavoritos && !temFiltro
              ? 'Você ainda não salvou nenhum ensaio. Use o ícone de marcador nos cartões ou durante a leitura para guardar os que quiser reler.'
              : 'Nenhum texto corresponde à sua busca ou ao filtro atual.'}
          </p>
          {temFiltro && (
            <button
              type="button"
              onClick={limpar}
              className="mt-6 rounded-lg px-4 py-2 text-xs font-semibold underline decoration-1 underline-offset-4 hover:text-accent"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 sm:gap-8">
          {filtrados.map((ensaio) => (
            <EssayCard key={ensaio.slug} ensaio={ensaio} aoEscolherTag={setTag} />
          ))}
        </div>
      )}
    </div>
  );
}
