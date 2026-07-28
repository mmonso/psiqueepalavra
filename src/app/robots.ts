import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Página pessoal do leitor e endpoints não têm o que indexar.
      disallow: ['/favoritos', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
