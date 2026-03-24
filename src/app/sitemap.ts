import { MetadataRoute } from 'next';
import { getMediaData } from '@/lib/tmdb';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { movies, shows, upcoming2025, upcoming2026, oscars, bra } = await getMediaData();
  const baseUrl = 'https://movies.unittap.com';

  const movieUrls = [...movies, ...upcoming2025, ...upcoming2026, ...oscars, ...bra].map((m) => ({
    url: `${baseUrl}/movie/${m.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const awardSlugs = ['oscars', 'black-reel', 'golden-globes', 'baftas', 'sag-awards', 'critics-choice', 'naacp-image', 'aafca', 'black-film-critics'];
  const awardUrls = awardSlugs.map(slug => ({
    url: `${baseUrl}/awards/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const showUrls = shows.map((s) => ({
    url: `${baseUrl}/show/${s.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...movieUrls,
    ...awardUrls,
    ...showUrls,
  ];
}
