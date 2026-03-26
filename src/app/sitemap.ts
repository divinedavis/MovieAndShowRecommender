import { MetadataRoute } from 'next';
import { getMediaData, getMediaForSitemap } from '@/lib/tmdb';
import { TOP_COUNTRIES } from '@/lib/countries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { movies, top2025, top2026Month, localAwards } = await getMediaData();
  const expanded = await getMediaForSitemap();
  const baseUrl = 'https://movies.unittap.com';

  const homepageMovies = [...movies, ...top2025, ...top2026Month, ...localAwards].map((m) => ({
    url: `${baseUrl}/movie/${m.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const expandedMovies = expanded.movies.map((m) => ({
    url: `${baseUrl}/movie/${m.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const expandedShows = expanded.shows.map((s) => ({
    url: `${baseUrl}/show/${s.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const langUrls = ['es', 'fr', 'de', 'hi', 'ko', 'zh', 'pt', 'ja'].map(lang => ({
    url: `${baseUrl}/${lang}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const awardUrls = TOP_COUNTRIES.map(c => ({
    url: `${baseUrl}/awards/${c.code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const genreUrls = [
    { id: 28, name: 'action' },
    { id: 35, name: 'comedy' },
    { id: 18, name: 'drama' },
    { id: 27, name: 'horror' },
    { id: 878, name: 'sci-fi' },
    { id: 53, name: 'thriller' }
  ].map(g => ({
    url: `${baseUrl}/genre/${g.name}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const platforms = ['netflix', 'max', 'disney', 'amazon', 'hulu', 'paramount', 'apple'];
  const genres = ['horror', 'action', 'comedy', 'sci-fi', 'drama', 'animation'];
  
  const bestUrls = platforms.flatMap(p => 
    genres.map(g => ({
      url: `${baseUrl}/best/${p}-${g}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...homepageMovies,
    ...expandedMovies,
    ...expandedShows,
    ...langUrls,
    ...awardUrls,
    ...genreUrls,
    ...bestUrls
  ];
}
