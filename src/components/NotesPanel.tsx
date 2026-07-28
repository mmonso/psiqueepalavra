'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Plus, Quote, Trash2 } from 'lucide-react';
import { criarAnotacao, lerAnotacoes, removerAnotacao } from '@/lib/reader-storage';
import type { Anotacao } from '@/lib/types';

export function NotesPanel({ slug }: { slug: string }) {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [pronto, setPronto] = useState(false);
  const [escrevendo, setEscrevendo] = useState(false);
  const [citacao, setCitacao] = useState('');
  const [texto, setTexto] = useState('');

  useEffect(() => {
    setAnotacoes(lerAnotacoes(slug));
    setPronto(true);
  }, [slug]);

  const salvar = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!texto.trim()) return;
    const nova = criarAnotacao({ slug, citacao: citacao.trim(), texto: texto.trim() });
    setAnotacoes((atuais) => [nova, ...atuais]);
    setCitacao('');
    setTexto('');
    setEscrevendo(false);
  };

  const excluir = (id: string) => {
    removerAnotacao(id);
    setAnotacoes((atuais) => atuais.filter((n) => n.id !== id));
  };

  return (
    <section className="anim-aparecer">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mb-1 font-display text-2xl font-bold">Suas anotações de leitura</h2>
          <p className="text-sm text-muted">
            Citações e reflexões ficam salvas apenas neste navegador. Não são enviadas a
            servidor nenhum, e ninguém além de você as vê.
          </p>
        </div>
        {!escrevendo && (
          <button
            type="button"
            onClick={() => setEscrevendo(true)}
            className="flex items-center gap-2 rounded-lg bg-btn px-4 py-2 text-sm font-medium text-btn-ink transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova anotação
          </button>
        )}
      </div>

      {escrevendo && (
        <form
          onSubmit={salvar}
          className="anim-surgir mb-8 space-y-4 rounded-xl border border-line bg-card p-6"
        >
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Quote className="h-4 w-4 text-accent" aria-hidden="true" />
            Registrar citação ou reflexão
          </h3>

          <div>
            <label
              htmlFor="citacao"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Citação do ensaio (opcional)
            </label>
            <input
              id="citacao"
              type="text"
              value={citacao}
              onChange={(e) => setCitacao(e.target.value)}
              placeholder="Ex.: “O descanso não é o prêmio que recebemos…”"
              className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label
              htmlFor="anotacao"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Sua anotação <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="anotacao"
              rows={4}
              required
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="O que este trecho me fez pensar…"
              className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEscrevendo(false)}
              className="px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-btn px-5 py-2 text-sm font-medium text-btn-ink transition-opacity hover:opacity-90"
            >
              Salvar anotação
            </button>
          </div>
        </form>
      )}

      {!pronto ? (
        <p className="py-12 text-center text-sm text-muted">Carregando suas anotações…</p>
      ) : anotacoes.length === 0 ? (
        <div className="rounded-xl border border-line bg-card py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden="true" />
          <p className="font-medium">Você ainda não fez anotações neste ensaio.</p>
          <p className="mt-1 text-xs text-muted">
            Use &ldquo;Nova anotação&rdquo; para guardar ideias e voltar a elas depois.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {anotacoes.map((nota) => (
            <li key={nota.id} className="rounded-xl border border-line bg-card p-6">
              {nota.citacao && (
                <blockquote className="mb-3 border-l-2 border-accent pl-4 font-serif text-sm italic text-muted">
                  &ldquo;{nota.citacao}&rdquo;
                </blockquote>
              )}
              <p className="whitespace-pre-wrap text-base leading-relaxed">{nota.texto}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
                <span>Registrado em {nota.criadaEm}</span>
                <button
                  type="button"
                  onClick={() => excluir(nota.id)}
                  aria-label="Excluir esta anotação"
                  title="Excluir anotação"
                  className="rounded p-1 transition-colors hover:text-ink"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
