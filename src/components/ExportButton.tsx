'use client';

import { Download } from 'lucide-react';
import { exportarDadosDoLeitor } from '@/lib/reader-storage';

export function ExportButton() {
  return (
    <button
      type="button"
      onClick={exportarDadosDoLeitor}
      className="flex items-center gap-2 rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-card-hover"
    >
      <Download className="h-4 w-4 text-accent" aria-hidden="true" />
      Baixar meus favoritos e anotações
    </button>
  );
}
