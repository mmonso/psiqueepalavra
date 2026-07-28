'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  PREFERENCIAS_PADRAO,
  alternarFavorito as alternarNoStorage,
  gravarPreferencias,
  lerFavoritos,
  lerPreferencias,
} from '@/lib/reader-storage';
import type { Preferencias } from '@/lib/types';

interface Contexto {
  prefs: Preferencias;
  atualizar: (parcial: Partial<Preferencias>) => void;
  favoritos: string[];
  alternarFavorito: (slug: string) => void;
  ehFavorito: (slug: string) => boolean;
  /** Falso até o localStorage ser lido, para não renderizar estado errado no servidor. */
  pronto: boolean;
}

const PreferenciasContext = createContext<Contexto | null>(null);

/**
 * Roda antes da primeira pintura e aplica o tema salvo no <html>.
 * Sem isso o site apareceria no tema claro por um instante antes do React
 * assumir — o clássico "flash", especialmente incômodo no tema Noturno.
 */
export const scriptAntiFlash = `
(function () {
  try {
    var p = JSON.parse(localStorage.getItem('psique:prefs') || '{}');
    var d = document.documentElement;
    d.dataset.theme = p.tema || 'papiro';
    d.dataset.font = p.fonte || 'serif';
    d.dataset.size = p.tamanho || 'md';
    d.dataset.leading = p.entrelinha || 'relaxed';
    d.dataset.width = p.largura || 'standard';
  } catch (e) {
    document.documentElement.dataset.theme = 'papiro';
  }
})();
`;

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferencias>(PREFERENCIAS_PADRAO);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setPrefs(lerPreferencias());
    setFavoritos(lerFavoritos());
    setPronto(true);
  }, []);

  // Espelha as preferências no <html>, que é onde o CSS as lê.
  useEffect(() => {
    if (!pronto) return;
    const d = document.documentElement;
    d.dataset.theme = prefs.tema;
    d.dataset.font = prefs.fonte;
    d.dataset.size = prefs.tamanho;
    d.dataset.leading = prefs.entrelinha;
    d.dataset.width = prefs.largura;
  }, [prefs, pronto]);

  const atualizar = useCallback((parcial: Partial<Preferencias>) => {
    setPrefs((atual) => {
      const proximo = { ...atual, ...parcial };
      gravarPreferencias(proximo);
      return proximo;
    });
  }, []);

  const alternarFavorito = useCallback((slug: string) => {
    setFavoritos(alternarNoStorage(slug));
  }, []);

  const ehFavorito = useCallback((slug: string) => favoritos.includes(slug), [favoritos]);

  const valor = useMemo(
    () => ({ prefs, atualizar, favoritos, alternarFavorito, ehFavorito, pronto }),
    [prefs, atualizar, favoritos, alternarFavorito, ehFavorito, pronto],
  );

  return (
    <PreferenciasContext.Provider value={valor}>{children}</PreferenciasContext.Provider>
  );
}

export function usePreferencias(): Contexto {
  const ctx = useContext(PreferenciasContext);
  if (!ctx) {
    throw new Error('usePreferencias precisa estar dentro de <PreferencesProvider>.');
  }
  return ctx;
}
