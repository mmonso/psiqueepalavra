'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Feather } from 'lucide-react';
import { usePreferencias } from './PreferencesProvider';
import { site } from '@/lib/site';

export function Footer() {
  const pathname = usePathname();
  const { prefs } = usePreferencias();

  if (prefs.modoFoco && pathname?.startsWith('/ensaios/')) return null;

  return (
    <footer className="mt-auto w-full border-t border-line px-4 py-12 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 text-center sm:text-left">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-card">
              <Feather className="h-4 w-4 text-accent" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-base font-bold tracking-tight">{site.nome}</p>
              <p className="text-xs text-muted">
                © {new Date().getFullYear()} {site.autor}
                {site.crp ? ` — CRP ${site.crp}` : ''}. Todos os direitos reservados.
              </p>
            </div>
          </div>

          <p className="max-w-sm font-serif text-xs italic text-muted">
            &ldquo;Até você se tornar consciente do inconsciente, ele irá dirigir a sua vida e
            você vai chamá-lo de destino.&rdquo; — C. G. Jung
          </p>
        </div>

        <div className="border-t border-line pt-6">
          <p className="mx-auto max-w-3xl text-xs leading-relaxed text-muted">
            Os textos deste site têm caráter reflexivo e educativo. Não constituem
            atendimento psicológico, diagnóstico ou orientação clínica individual, e não
            substituem acompanhamento profissional. Se você está em sofrimento, procure um
            psicólogo ou psiquiatra. Em situações de crise, o{' '}
            <a
              href="https://www.cvv.org.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2"
            >
              CVV
            </a>{' '}
            atende gratuitamente pelo telefone 188, 24 horas por dia.
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-xs text-muted">
            <Link href="/privacidade" className="underline underline-offset-2 hover:text-ink">
              Privacidade e uso de dados
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
