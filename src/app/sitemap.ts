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

  const showUrls = shows.map((s) => ({
    url: `${baseUrl}/show/${s.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // New Traffic Engines
  const platformGenreUrls = ['netflix-horror', 'max-drama', 'disney-animation', 'amazon-action'].map(slug => ({
    url: `${baseUrl}/best/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const calendarUrls = ['2026/03', '2026/04', '2026/05', '2026/06'].map(path => ({
    url: `${baseUrl}/calendar/${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...movieUrls,
    ...awardUrls,
    ...genreUrls,
    ...showUrls,
    ...platformGenreUrls,
    ...calendarUrls
  ];
}
