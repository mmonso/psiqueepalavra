import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function NaoEncontrado() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <BookOpen className="mb-6 h-12 w-12 text-muted" aria-hidden="true" />
      <h1 className="mb-3 font-display text-3xl font-bold tracking-tight">
        Esta página não existe
      </h1>
      <p className="mb-8 font-serif text-lg italic text-muted">
        O endereço pode ter mudado, ou o ensaio que você procura ainda não foi publicado.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-btn px-5 py-2.5 text-sm font-semibold text-btn-ink transition-opacity hover:opacity-90"
      >
        Ver todos os ensaios
      </Link>
    </main>
  );
}
