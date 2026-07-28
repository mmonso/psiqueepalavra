import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { site } from './site';
import type { Ensaio } from './types';

const PASTA = path.join(process.cwd(), 'essays');
const PALAVRAS_POR_MINUTO = 200;

/**
 * O YAML converte `data: 2026-07-24` (sem aspas) num objeto Date, mas
 * `data: "2026-07-24"` continua string. Normaliza os dois para ISO.
 */
function normalizarData(valor: unknown, arquivo: string): string {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    return valor.toISOString().slice(0, 10);
  }
  if (typeof valor === 'string') {
    const data = new Date(valor);
    if (!Number.isNaN(data.getTime())) return data.toISOString().slice(0, 10);
  }
  console.warn(
    `[ensaios] "${arquivo}" tem data ausente ou inválida; usando a data de hoje.`,
  );
  return new Date().toISOString().slice(0, 10);
}

function formatarData(iso: string): string {
  // O sufixo fixa o fuso: sem ele, "2026-07-24" vira 23/07 em fusos negativos.
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function normalizarTags(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.map((t) => String(t).trim()).filter(Boolean);
  if (typeof valor === 'string') {
    return valor.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

export function calcularMinutosLeitura(texto: string): number {
  const palavras = texto.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(palavras / PALAVRAS_POR_MINUTO));
}

/** Primeiro parágrafo de texto corrido, usado quando não há `resumo`. */
function resumoAutomatico(conteudo: string): string {
  const paragrafo = conteudo
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith('#') && !p.startsWith('>') && !p.startsWith('*'));
  if (!paragrafo) return '';
  const limpo = paragrafo.replace(/[*_`#>]/g, '').replace(/\s+/g, ' ').trim();
  return limpo.length > 200 ? `${limpo.slice(0, 197)}...` : limpo;
}

function lerArquivo(nomeArquivo: string): Ensaio | null {
  const bruto = fs.readFileSync(path.join(PASTA, nomeArquivo), 'utf8');
  const { data: fm, content } = matter(bruto);
  const slug = nomeArquivo.replace(/\.mdx?$/i, '');

  // Rascunhos ficam no repositório mas não entram no site.
  if (fm.rascunho === true) return null;

  const titulo = typeof fm.titulo === 'string' ? fm.titulo.trim() : '';
  if (!titulo) {
    console.warn(`[ensaios] "${nomeArquivo}" não tem "titulo"; ignorando o arquivo.`);
    return null;
  }

  const conteudo = content.trim();
  if (!conteudo) {
    console.warn(`[ensaios] "${nomeArquivo}" não tem conteúdo; ignorando o arquivo.`);
    return null;
  }

  const data = normalizarData(fm.data, nomeArquivo);

  return {
    slug,
    titulo,
    subtitulo: typeof fm.subtitulo === 'string' ? fm.subtitulo.trim() : '',
    data,
    dataFormatada: formatarData(data),
    tags: normalizarTags(fm.tags),
    resumo:
      typeof fm.resumo === 'string' && fm.resumo.trim()
        ? fm.resumo.trim()
        : resumoAutomatico(conteudo),
    autor: typeof fm.autor === 'string' ? fm.autor.trim() : site.autor,
    autorCargo: typeof fm.autorCargo === 'string' ? fm.autorCargo.trim() : site.autorCargo,
    conteudo,
    minutosLeitura: calcularMinutosLeitura(conteudo),
  };
}

/**
 * Todos os ensaios publicados, do mais recente para o mais antigo.
 * Roda só no servidor, durante o build.
 */
export function listarEnsaios(): Ensaio[] {
  if (!fs.existsSync(PASTA)) {
    console.warn('[ensaios] pasta "essays/" não encontrada.');
    return [];
  }

  return fs
    .readdirSync(PASTA)
    .filter((nome) => /\.mdx?$/i.test(nome))
    .map(lerArquivo)
    .filter((e): e is Ensaio => e !== null)
    .sort((a, b) => b.data.localeCompare(a.data));
}

export function buscarEnsaio(slug: string): Ensaio | undefined {
  return listarEnsaios().find((e) => e.slug === slug);
}

/** Tags em uso, ordenadas pela quantidade de ensaios. */
export function listarTags(): { tag: string; total: number }[] {
  const contagem = new Map<string, number>();
  for (const ensaio of listarEnsaios()) {
    for (const tag of ensaio.tags) {
      contagem.set(tag, (contagem.get(tag) ?? 0) + 1);
    }
  }
  return [...contagem.entries()]
    .map(([tag, total]) => ({ tag, total }))
    .sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag, 'pt-BR'));
}

/** Ensaios relacionados por tags em comum, para o rodapé da leitura. */
export function ensaiosRelacionados(slug: string, limite = 2): Ensaio[] {
  const todos = listarEnsaios();
  const atual = todos.find((e) => e.slug === slug);
  if (!atual) return [];

  return todos
    .filter((e) => e.slug !== slug)
    .map((e) => ({
      ensaio: e,
      afinidade: e.tags.filter((t) => atual.tags.includes(t)).length,
    }))
    .sort((a, b) => b.afinidade - a.afinidade || b.ensaio.data.localeCompare(a.ensaio.data))
    .slice(0, limite)
    .map((r) => r.ensaio);
}
