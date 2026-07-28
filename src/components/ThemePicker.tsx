'use client';

import { usePreferencias } from './PreferencesProvider';
import type { Tema } from '@/lib/types';

const TEMAS: { id: Tema; nome: string; amostra: string; borda: string }[] = [
  { id: 'papiro', nome: 'Papiro', amostra: '#FBF9F5', borda: '#C0B8AD' },
  { id: 'creme', nome: 'Creme', amostra: '#F4EFE6', borda: '#C0B8AD' },
  { id: 'alba', nome: 'Branco', amostra: '#FFFFFF', borda: '#D0D0D0' },
  { id: 'noturno', nome: 'Noite', amostra: '#181A1B', borda: '#444444' },
];

export function ThemePicker() {
  const { prefs, atualizar, pronto } = usePreferencias();

  return (
    <div
      role="radiogroup"
      aria-label="Tema de leitura"
      className="flex items-center gap-1.5"
    >
      {TEMAS.map((tema) => {
        const ativo = pronto && prefs.tema === tema.id;
        return (
          <button
            key={tema.id}
            type="button"
            role="radio"
            aria-checked={ativo}
            aria-label={`Tema ${tema.nome}`}
            title={`Tema ${tema.nome}`}
            onClick={() => atualizar({ tema: tema.id })}
            style={{ backgroundColor: tema.amostra, borderColor: tema.borda }}
            className={[
              'h-5 w-5 rounded-full border transition-all',
              ativo
                ? 'scale-110 ring-2 ring-accent ring-offset-2 ring-offset-canvas'
                : 'opacity-70 hover:opacity-100',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}
