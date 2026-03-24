import { MetadataRoute } from 'next';
import { getMediaData } from '@/lib/tmdb';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { movies, shows, upcoming } = await getMediaData();
  const baseUrl = 'https://movies.unittap.com';

  const movieUrls = [...movies, ...upcoming].map((m) => ({
    url: `${baseUrl}/movie/${m.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
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
    ...showUrls,
  ];
}
