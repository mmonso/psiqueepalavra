import type { MetadataRoute } from 'next';
import { listarEnsaios } from '@/lib/essays';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const ensaios = listarEnsaios();

  return [
    {
      url: siteUrl,
      lastModified: ensaios[0] ? new Date(ensaios[0].data) : new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...ensaios.map((ensaio) => ({
      url: `${siteUrl}/ensaios/${ensaio.slug}`,
      lastModified: new Date(ensaio.data),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: `${siteUrl}/privacidade`,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    },
  ];
}
