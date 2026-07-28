import type { Metadata } from 'next';
import { EssayList } from '@/components/EssayList';
import { ExportButton } from '@/components/ExportButton';
import { listarEnsaios } from '@/lib/essays';

export const metadata: Metadata = {
  title: 'Seus favoritos',
  description: 'Os ensaios que você salvou para reler.',
  // Página pessoal e diferente para cada leitor: não faz sentido indexar.
  robots: { index: false, follow: true },
};

export default function Favoritos() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-8 sm:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Seus ensaios favoritos
          </h1>
          <p className="mt-2 text-sm text-muted">
            Guardados apenas neste navegador. Limpar os dados de navegação apaga a lista — use
            o botão ao lado para manter uma cópia.
          </p>
        </div>
        <ExportButton />
      </div>

      <EssayList ensaios={listarEnsaios()} apenasFavoritos />
    </main>
  );
}
