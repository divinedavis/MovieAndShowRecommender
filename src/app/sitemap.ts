import { MetadataRoute } from 'next';
import { getMediaData, getMediaForSitemap } from '@/lib/tmdb';
import { TOP_COUNTRIES } from '@/lib/countries';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function fetchTMDBGenres(): Promise<Array<{ id: number; name: string }>> {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const res = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${apiKey}&language=en-US`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.genres || [];
  } catch {
    return [];
  }
}

function generateCalendarUrls(baseUrl: string): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  const start = new Date(2023, 0, 1); // Jan 2023
  const now = new Date();
  const current = new Date(start);

  while (current <= now) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    urls.push({
      url: `${baseUrl}/calendar/${year}/${month}`,
      lastModified: lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    });
    current.setMonth(current.getMonth() + 1);
  }

  return urls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date().toISOString();
  const { movies, top2025, top2026Month, localAwards } = await getMediaData();
  const expanded = await getMediaForSitemap();
  const tmdbGenres = await fetchTMDBGenres();
  const baseUrl = 'https://movies.unittap.com';

  const homepageMovies = [...movies, ...top2025, ...top2026Month, ...localAwards].map((m) => ({
    url: `${baseUrl}/movie/${m.id}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const expandedMovies = expanded.movies.map((m) => ({
    url: `${baseUrl}/movie/${m.id}`,
    lastModified: lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const expandedShows = expanded.shows.map((s) => ({
    url: `${baseUrl}/show/${s.id}`,
    lastModified: lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const langUrls = ['es', 'fr', 'de', 'hi', 'ko', 'zh', 'pt', 'ja'].map(lang => ({
    url: `${baseUrl}/${lang}`,
    lastModified: lastModified,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const awardUrls = TOP_COUNTRIES.map(c => ({
    url: `${baseUrl}/awards/${c.code.toLowerCase()}`,
    lastModified: lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // All TMDB genres from API
  const tmdbGenreUrls = tmdbGenres.map(g => ({
    url: `${baseUrl}/genre/${g.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  // Fallback static genre URLs (ensure these are always present)
  const staticGenreUrls = [
    'action', 'comedy', 'drama', 'horror', 'sci-fi', 'thriller',
    'documentary', 'animation', 'romance', 'crime', 'fantasy', 'adventure',
    'family', 'history', 'music', 'mystery', 'war', 'western'
  ].map(g => ({
    url: `${baseUrl}/genre/${g}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  // Deduplicate genre URLs
  const genreUrlSet = new Set<string>();
  const allGenreUrls: MetadataRoute.Sitemap = [];
  [...tmdbGenreUrls, ...staticGenreUrls].forEach(entry => {
    if (!genreUrlSet.has(entry.url)) {
      genreUrlSet.add(entry.url);
      allGenreUrls.push(entry);
    }
  });

  const platforms = ['netflix', 'max', 'disney', 'amazon', 'hulu', 'paramount', 'apple'];
  const genres = ['horror', 'action', 'comedy', 'sci-fi', 'drama', 'animation'];
  
  const bestUrls = platforms.flatMap(p => 
    genres.map(g => ({
      url: `${baseUrl}/best/${p}-${g}`,
      lastModified: lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  const streamingUrls = platforms.map(p => ({
    url: `${baseUrl}/streaming/new-on-${p}`,
    lastModified: lastModified,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // All calendar pages from Jan 2023 to current month
  const calendarUrls = generateCalendarUrls(baseUrl);

  return [
    { url: baseUrl, lastModified: lastModified, changeFrequency: 'daily', priority: 1 },
    ...homepageMovies,
    ...expandedMovies,
    ...expandedShows,
    ...langUrls,
    ...awardUrls,
    ...allGenreUrls,
    ...bestUrls,
    ...streamingUrls,
    ...calendarUrls,
  ];
}
