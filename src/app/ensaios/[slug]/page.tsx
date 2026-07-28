import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ArrowUpRight } from 'lucide-react';
import { ReadingToolbar } from '@/components/ReadingToolbar';
import { EssayTabs } from '@/components/EssayTabs';
import { FavoriteButton } from '@/components/FavoriteButton';
import { buscarEnsaio, ensaiosRelacionados, listarEnsaios } from '@/lib/essays';
import { site, siteUrl, urlDoEnsaio } from '@/lib/site';

interface Props {
  params: Promise<{ slug: string }>;
}

/** Gera uma página estática por ensaio no build. */
export function generateStaticParams() {
  return listarEnsaios().map((ensaio) => ({ slug: ensaio.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ensaio = buscarEnsaio(slug);
  if (!ensaio) return { title: 'Ensaio não encontrado' };

  const descricao = ensaio.resumo || ensaio.subtitulo;

  return {
    title: ensaio.titulo,
    description: descricao,
    keywords: ensaio.tags,
    authors: [{ name: ensaio.autor }],
    alternates: { canonical: `/ensaios/${ensaio.slug}` },
    openGraph: {
      type: 'article',
      locale: site.locale,
      url: urlDoEnsaio(ensaio.slug),
      siteName: site.nome,
      title: ensaio.titulo,
      description: descricao,
      publishedTime: ensaio.data,
      authors: [ensaio.autor],
      tags: ensaio.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: ensaio.titulo,
      description: descricao,
    },
  };
}

export default async function PaginaDoEnsaio({ params }: Props) {
  const { slug } = await params;
  const ensaio = buscarEnsaio(slug);
  if (!ensaio) notFound();

  const relacionados = ensaiosRelacionados(slug);
  const iaDisponivel = Boolean(process.env.GEMINI_API_KEY);

  const dadosEstruturados = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: ensaio.titulo,
    description: ensaio.resumo,
    datePublished: ensaio.data,
    dateModified: ensaio.data,
    inLanguage: 'pt-BR',
    keywords: ensaio.tags.join(', '),
    wordCount: ensaio.conteudo.trim().split(/\s+/).length,
    author: {
      '@type': 'Person',
      name: ensaio.autor,
      jobTitle: ensaio.autorCargo,
    },
    publisher: {
      '@type': 'Person',
      name: site.autor,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': urlDoEnsaio(ensaio.slug),
    },
    url: urlDoEnsaio(ensaio.slug),
  };

  return (
    <>
      <ReadingToolbar slug={ensaio.slug} titulo={ensaio.titulo} />

      <div className="coluna-leitura mx-auto w-full px-4 pb-24 pt-8 sm:px-6 sm:pt-16 md:px-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados) }}
        />

        <header className="mb-12 border-b border-line pb-10 sm:mb-16">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {ensaio.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-pill px-3 py-1 text-xs font-semibold uppercase tracking-wider text-pill-ink"
              >
                {tag}
              </span>
            ))}
            <span className="ml-auto text-xs text-muted">
              {ensaio.minutosLeitura} min de leitura •{' '}
              <time dateTime={ensaio.data}>{ensaio.dataFormatada}</time>
            </span>
          </div>

          <h1 className="mb-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            {ensaio.titulo}
          </h1>

          {ensaio.subtitulo && (
            <p className="mb-8 font-serif text-lg italic leading-relaxed text-muted sm:text-xl md:text-2xl">
              {ensaio.subtitulo}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-sm font-bold text-ink"
              >
                {ensaio.autor
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <span>
                <span className="block font-semibold text-ink">{ensaio.autor}</span>
                <span className="block text-xs">{ensaio.autorCargo}</span>
              </span>
            </div>

            <FavoriteButton
              slug={ensaio.slug}
              titulo={ensaio.titulo}
              comRotulo
              className="rounded-lg border border-line bg-card px-3 py-1.5 hover:bg-card-hover"
            />
          </div>
        </header>

        <EssayTabs slug={ensaio.slug} titulo={ensaio.titulo} iaDisponivel={iaDisponivel}>
          <article className="leitura markdown">
            <ReactMarkdown>{ensaio.conteudo}</ReactMarkdown>
          </article>

          <div className="my-16 flex items-center justify-center gap-3 text-muted" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
          </div>

          {relacionados.length > 0 && (
            <section aria-labelledby="relacionados">
              <h2 id="relacionados" className="mb-4 font-display text-xl font-bold">
                Continue lendo
              </h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {relacionados.map((outro) => (
                  <li key={outro.slug}>
                    <Link
                      href={`/ensaios/${outro.slug}`}
                      className="group flex h-full flex-col justify-between gap-3 rounded-xl border border-line bg-card p-5 transition-colors hover:bg-card-hover"
                    >
                      <span className="font-display text-base font-bold leading-snug group-hover:underline">
                        {outro.titulo}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        {outro.minutosLeitura} min de leitura
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </EssayTabs>
      </div>
    </>
  );
}
