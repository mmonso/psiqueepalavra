/**
 * Dados fixos do site. Editar aqui muda o rodapé, o cabeçalho e as tags de SEO
 * de uma vez só — não há esses textos espalhados pelos componentes.
 */
export const site = {
  nome: 'Psique & Palavra',
  tagline: 'Ensaios de Psicologia',
  descricao:
    'Ensaios e notas sobre psicanálise, hipervigilância moderna, angústia e a coragem de habitar o próprio silêncio. Por Marcelo Monso, psicólogo clínico.',
  autor: 'Marcelo Monso',
  autorCargo: 'Psicólogo Clínico & Ensaísta',
  /**
   * Registro profissional. O Código de Ética do psicólogo exige identificação
   * em comunicação profissional — preencha antes de divulgar o site.
   */
  crp: '',
  locale: 'pt_BR',
} as const;

/**
 * URL pública do site, usada em sitemap, Open Graph e links canônicos.
 * Definida por NEXT_PUBLIC_SITE_URL nas variáveis de ambiente da Vercel.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/$/, '');

export const urlDoEnsaio = (slug: string) => `${siteUrl}/ensaios/${slug}`;
