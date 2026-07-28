import type { Metadata } from 'next';
import { Lora, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PreferencesProvider, scriptAntiFlash } from '@/components/PreferencesProvider';
import { site, siteUrl } from '@/lib/site';
import './globals.css';

/*
  As fontes são baixadas no build e servidas pelo próprio domínio. Além de
  carregar mais rápido, evita que o navegador do leitor faça requisição ao
  CDN do Google — que registra o IP de quem acessa.
*/
const lora = Lora({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-lora',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-playfair',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.nome} | ${site.autor}, Psicólogo`,
    template: `%s | ${site.nome}`,
  },
  description: site.descricao,
  authors: [{ name: site.autor }],
  creator: site.autor,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: siteUrl,
    siteName: site.nome,
    title: `${site.nome} | ${site.autor}`,
    description: site.descricao,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.nome} | ${site.autor}`,
    description: site.descricao,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-theme="papiro"
      data-font="serif"
      data-size="md"
      data-leading="relaxed"
      data-width="standard"
      className={`${lora.variable} ${playfair.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Aplica o tema salvo antes da primeira pintura, evitando o flash claro. */}
        <script dangerouslySetInnerHTML={{ __html: scriptAntiFlash }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <PreferencesProvider>
          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-btn focus:px-4 focus:py-2 focus:text-btn-ink"
          >
            Pular para o conteúdo
          </a>
          <Header />
          <div id="conteudo" className="flex flex-1 flex-col">
            {children}
          </div>
          <Footer />
        </PreferencesProvider>
      </body>
    </html>
  );
}
