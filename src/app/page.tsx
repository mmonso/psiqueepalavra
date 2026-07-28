import type { Metadata } from 'next';
import { EssayList } from '@/components/EssayList';
import { listarEnsaios } from '@/lib/essays';
import { site, siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: `${site.nome} | Ensaios de psicologia por ${site.autor}`,
  description: site.descricao,
  alternates: { canonical: '/' },
};

export default function Home() {
  const ensaios = listarEnsaios();

  // Diz ao Google que este é um blog com autor identificado.
  const dadosEstruturados = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: site.nome,
    description: site.descricao,
    url: siteUrl,
    inLanguage: 'pt-BR',
    author: {
      '@type': 'Person',
      name: site.autor,
      jobTitle: site.autorCargo,
    },
    blogPost: ensaios.map((ensaio) => ({
      '@type': 'BlogPosting',
      headline: ensaio.titulo,
      description: ensaio.resumo,
      datePublished: ensaio.data,
      url: `${siteUrl}/ensaios/${ensaio.slug}`,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-8 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados) }}
      />

      <div className="mb-12 border-b border-line pb-12 sm:mb-16">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">
          Espaço de leitura &amp; escuta
        </p>
        <h1 className="mb-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          A psique se revela no tempo da palavra pausada.
        </h1>
        <p className="max-w-2xl font-serif text-lg italic leading-relaxed text-muted sm:text-xl">
          Ensaios e notas sobre psicanálise, hipervigilância moderna, angústia e a coragem de
          habitar nosso próprio silêncio sem filtros.
        </p>
      </div>

      <h2 className="mb-6 font-display text-2xl font-bold">Ensaios publicados</h2>

      {ensaios.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card py-20 text-center text-sm text-muted">
          Nenhum ensaio publicado ainda. Adicione um arquivo <code>.md</code> na pasta{' '}
          <code>essays/</code> para começar.
        </p>
      ) : (
        <EssayList ensaios={ensaios} />
      )}
    </main>
  );
}
