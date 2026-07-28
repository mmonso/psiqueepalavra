export type Tema = 'papiro' | 'creme' | 'alba' | 'noturno';
export type Fonte = 'serif' | 'sans' | 'display';
export type Tamanho = 'sm' | 'md' | 'lg' | 'xl';
export type Entrelinha = 'normal' | 'relaxed' | 'loose';
export type Largura = 'compact' | 'standard' | 'wide';

export interface Preferencias {
  tema: Tema;
  fonte: Fonte;
  tamanho: Tamanho;
  entrelinha: Entrelinha;
  largura: Largura;
  modoFoco: boolean;
}

/** Ensaio já lido do arquivo Markdown e normalizado. */
export interface Ensaio {
  slug: string;
  titulo: string;
  subtitulo: string;
  /** ISO (YYYY-MM-DD) — usado para ordenar e para o <time dateTime>. */
  data: string;
  /** Formatada em pt-BR para exibição. */
  dataFormatada: string;
  tags: string[];
  resumo: string;
  autor: string;
  autorCargo: string;
  conteudo: string;
  minutosLeitura: number;
}

/** Anotação pessoal do leitor — vive só no navegador dele. */
export interface Anotacao {
  id: string;
  slug: string;
  citacao: string;
  texto: string;
  criadaEm: string;
}
