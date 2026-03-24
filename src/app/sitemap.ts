import { MetadataRoute } from 'next';
import { getMediaData } from '@/lib/tmdb';
import { TOP_COUNTRIES } from '@/lib/countries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { movies, top2025, top2026Month, localAwards } = await getMediaData();
  const baseUrl = 'https://movies.unittap.com';

  const movieUrls = [...movies, ...top2025, ...top2026Month, ...localAwards].map((m) => ({
    url: `${baseUrl}/movie/${m.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const langUrls = ['es', 'fr', 'de', 'hi', 'ko', 'zh', 'pt'].map(lang => ({
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

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...movieUrls,
    ...langUrls,
    ...awardUrls
  ];
}
