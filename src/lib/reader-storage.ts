'use client';

import type { Anotacao, Preferencias } from './types';

/*
  Dados que pertencem ao leitor, não ao site: preferências de leitura,
  favoritos e anotações. Ficam no navegador dele de propósito — nada disso
  é enviado para servidor nenhum, o que também evita tratar dado pessoal.
*/

const CHAVE_PREFS = 'psique:prefs';
const CHAVE_FAVS = 'psique:favoritos';
const CHAVE_NOTAS = 'psique:anotacoes';

export const PREFERENCIAS_PADRAO: Preferencias = {
  tema: 'papiro',
  fonte: 'serif',
  tamanho: 'md',
  entrelinha: 'relaxed',
  largura: 'standard',
  modoFoco: false,
};

const temStorage = () => typeof window !== 'undefined' && !!window.localStorage;

function ler<T>(chave: string, padrao: T): T {
  if (!temStorage()) return padrao;
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown): void {
  if (!temStorage()) return;
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Modo privativo ou cota cheia: preferir seguir sem persistir a quebrar.
  }
}

/* ---------------------------------------------------------- preferências -- */

export function lerPreferencias(): Preferencias {
  return { ...PREFERENCIAS_PADRAO, ...ler(CHAVE_PREFS, {}) };
}

export function gravarPreferencias(prefs: Preferencias): void {
  gravar(CHAVE_PREFS, prefs);
}

/* ------------------------------------------------------------- favoritos -- */

export function lerFavoritos(): string[] {
  const valor = ler<unknown>(CHAVE_FAVS, []);
  return Array.isArray(valor) ? valor.filter((v): v is string => typeof v === 'string') : [];
}

/** Alterna o favorito e devolve a lista resultante. */
export function alternarFavorito(slug: string): string[] {
  const atuais = lerFavoritos();
  const proximos = atuais.includes(slug)
    ? atuais.filter((s) => s !== slug)
    : [...atuais, slug];
  gravar(CHAVE_FAVS, proximos);
  return proximos;
}

/* ------------------------------------------------------------ anotações -- */

export function lerAnotacoes(slug?: string): Anotacao[] {
  const todas = ler<Anotacao[]>(CHAVE_NOTAS, []);
  if (!Array.isArray(todas)) return [];
  return slug ? todas.filter((n) => n.slug === slug) : todas;
}

export function criarAnotacao(entrada: Omit<Anotacao, 'id' | 'criadaEm'>): Anotacao {
  const anotacao: Anotacao = {
    ...entrada,
    id: `nota_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    criadaEm: new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  };
  gravar(CHAVE_NOTAS, [anotacao, ...lerAnotacoes()]);
  return anotacao;
}

export function removerAnotacao(id: string): void {
  gravar(
    CHAVE_NOTAS,
    lerAnotacoes().filter((n) => n.id !== id),
  );
}

/** Baixa um arquivo com tudo que o leitor guardou, para ele não ficar refém do navegador. */
export function exportarDadosDoLeitor(): void {
  const conteudo = JSON.stringify(
    {
      preferencias: lerPreferencias(),
      favoritos: lerFavoritos(),
      anotacoes: lerAnotacoes(),
      exportadoEm: new Date().toISOString(),
    },
    null,
    2,
  );
  const url = URL.createObjectURL(new Blob([conteudo], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `psique-e-palavra-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
