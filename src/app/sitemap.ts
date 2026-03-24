import { MetadataRoute } from 'next';
import { getMediaData } from '@/lib/tmdb';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { movies, shows, top2025, top2026Month, oscars, bra } = await getMediaData();
  const baseUrl = 'https://movies.unittap.com';

  const movieUrls = [...movies, ...top2025, ...top2026Month, ...oscars, ...bra].map((m) => ({
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

  const genreSlugs = ['horror', 'action', 'sci-fi', 'comedy', 'drama', 'documentary', 'animation'];
  const genreUrls = genreSlugs.map(slug => ({
    url: `${baseUrl}/genre/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const platformSlugs = ['netflix', 'max', 'disney', 'amazon', 'apple'];
  const platformUrls = platformSlugs.map(p => ({
    url: `${baseUrl}/best/${p}/03`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...movieUrls,
    ...awardUrls,
    ...genreUrls,
    ...platformUrls
  ];
}
