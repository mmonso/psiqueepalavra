'use client';

import { useRef, useState, type ReactNode } from 'react';
import { BookOpen, MessageSquare, Sparkles } from 'lucide-react';
import { NotesPanel } from './NotesPanel';
import { SocraticDialog } from './SocraticDialog';

type Aba = 'texto' | 'anotacoes' | 'dialogo';

const ABAS: { id: Aba; rotulo: string; icone: typeof BookOpen }[] = [
  { id: 'texto', rotulo: 'Texto do ensaio', icone: BookOpen },
  { id: 'anotacoes', rotulo: 'Minhas anotações', icone: MessageSquare },
  { id: 'dialogo', rotulo: 'Diálogo socrático', icone: Sparkles },
];

interface Props {
  slug: string;
  titulo: string;
  iaDisponivel: boolean;
  /** O texto do ensaio, já renderizado no servidor. */
  children: ReactNode;
}

export function EssayTabs({ slug, titulo, iaDisponivel, children }: Props) {
  const [ativa, setAtiva] = useState<Aba>('texto');
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Setas navegam entre as abas, como esperado num tablist.
  const aoTeclar = (evento: React.KeyboardEvent, indice: number) => {
    const passo = evento.key === 'ArrowRight' ? 1 : evento.key === 'ArrowLeft' ? -1 : 0;
    if (!passo) return;
    evento.preventDefault();
    const proximo = (indice + passo + ABAS.length) % ABAS.length;
    setAtiva(ABAS[proximo].id);
    refs.current[proximo]?.focus();
  };

  return (
    <>
      <div
        role="tablist"
        aria-label="Seções do ensaio"
        className="no-scrollbar mb-10 flex overflow-x-auto border-b border-line"
      >
        {ABAS.map((aba, indice) => {
          const Icone = aba.icone;
          const selecionada = ativa === aba.id;
          return (
            <button
              key={aba.id}
              ref={(el) => {
                refs.current[indice] = el;
              }}
              type="button"
              role="tab"
              id={`aba-${aba.id}`}
              aria-selected={selecionada}
              aria-controls={`painel-${aba.id}`}
              tabIndex={selecionada ? 0 : -1}
              onClick={() => setAtiva(aba.id)}
              onKeyDown={(e) => aoTeclar(e, indice)}
              className={[
                'flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3 text-sm transition-colors',
                selecionada
                  ? 'border-accent font-bold text-ink'
                  : 'border-transparent font-medium text-muted hover:text-ink',
              ].join(' ')}
            >
              <Icone className="h-4 w-4" aria-hidden="true" />
              {aba.rotulo}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id="painel-texto" aria-labelledby="aba-texto" hidden={ativa !== 'texto'}>
        {children}
      </div>

      {ativa === 'anotacoes' && (
        <div role="tabpanel" id="painel-anotacoes" aria-labelledby="aba-anotacoes">
          <NotesPanel slug={slug} />
        </div>
      )}

      {ativa === 'dialogo' && (
        <div role="tabpanel" id="painel-dialogo" aria-labelledby="aba-dialogo">
          <SocraticDialog slug={slug} titulo={titulo} disponivel={iaDisponivel} />
        </div>
      )}
    </>
  );
}
