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

function generateCalendarUrls(baseUrl: string, lastModified: string): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  const start = new Date(2023, 0, 1);
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

  const tmdbGenreUrls = tmdbGenres.map(g => ({
    url: `${baseUrl}/genre/${g.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

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

  const calendarUrls = generateCalendarUrls(baseUrl, lastModified);

  const TOP_GENRE_IDS = ['28', '35', '18', '27', '878', '53', '10749', '16'];
  const YEARS = ['2020', '2021', '2022', '2023', '2024', '2025'];
  const genreYearUrls = TOP_GENRE_IDS.flatMap(gId =>
    YEARS.map(yr => ({
      url: `${baseUrl}/genre/${gId}/year/${yr}`,
      lastModified: lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  const streamingGenreUrls = [
    { url: `${baseUrl}/streaming/new-on-netflix/genre/28`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/streaming/new-on-netflix/genre/18`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/streaming/new-on-netflix/genre/27`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/streaming/new-on-netflix/genre/35`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/streaming/new-on-max/genre/28`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/streaming/new-on-max/genre/18`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/streaming/new-on-max/genre/878`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/streaming/new-on-disney/genre/16`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/streaming/new-on-disney/genre/28`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/streaming/new-on-hulu/genre/35`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/streaming/new-on-hulu/genre/53`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/streaming/new-on-apple/genre/18`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/streaming/new-on-amazon/genre/28`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
    { url: `${baseUrl}/streaming/new-on-amazon/genre/878`, lastModified, changeFrequency: 'weekly' as const, priority: 0.75 },
  ];

  const decadeUrls = ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s'].map(d => ({
    url: `${baseUrl}/best/decade/${d}`,
    lastModified: lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const moodUrls = ['feel-good', 'mind-bending', 'intense-action', 'romantic', 'dark-comedy', 'scary', 'inspiring', 'adventure'].map(m => ({
    url: `${baseUrl}/recommendations/${m}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const newOnUrls: MetadataRoute.Sitemap = [];
  const now = new Date();
  const newOnPlatforms = ['netflix', 'max', 'disney', 'hulu', 'apple', 'prime'];
  for (let offset = 0; offset <= 2; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const yr = String(d.getFullYear());
    const mo = String(d.getMonth() + 1);
    for (const p of newOnPlatforms) {
      newOnUrls.push({
        url: `${baseUrl}/new-on/${p}/${yr}/${mo}`,
        lastModified: lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    }
  }

  const predictionUrls = [{
    url: `${baseUrl}/awards/predictions`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }];

  // Duration-based list pages
  const durationUrls = ['short-movies', 'long-movies', 'perfect-length'].map(s => ({
    url: `${baseUrl}/lists/${s}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Seasonal movie pages
  const seasonalUrls = ['christmas', 'summer', 'halloween', 'valentines', 'thanksgiving'].map(s => ({
    url: `${baseUrl}/lists/seasonal/${s}`,
    lastModified: lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Rating bracket pages
  const ratingUrls = ['masterpieces', 'hidden-gems', 'crowd-pleasers', 'cult-classics'].map(b => ({
    url: `${baseUrl}/lists/rated/${b}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Leaving platform soon pages
  const leavingUrls = ['netflix', 'max', 'disney', 'hulu', 'prime', 'apple'].map(p => ({
    url: `${baseUrl}/leaving/${p}`,
    lastModified: lastModified,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Country-specific trending pages
  const trendingCountryUrls = ['us', 'gb', 'fr', 'de', 'kr', 'jp', 'in', 'br', 'es', 'it', 'mx', 'au'].map(c => ({
    url: `${baseUrl}/trending/${c}`,
    lastModified: lastModified,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Year-in-review pages
  const yearReviewUrls = ['2020', '2021', '2022', '2023', '2024', '2025'].map(y => ({
    url: `${baseUrl}/year/${y}`,
    lastModified: lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Platform + Genre + Year triple combo pages
  const tripleComboUrls = ['netflix', 'max', 'disney'].flatMap(p =>
    ['28', '35', '18', '27', '878'].flatMap(g =>
      ['2024', '2025', '2026'].map(y => ({
        url: `${baseUrl}/streaming/best/${p}/${g}/${y}`,
        lastModified: lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.65,
      }))
    )
  );

  // Language pages
  const languageUrls = ['en', 'fr', 'es', 'ko', 'hi', 'ja', 'zh', 'de', 'it', 'pt'].map(l => ({
    url: `${baseUrl}/language/${l}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Box office pages
  const boxOfficeUrls = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'].map(y => ({
    url: `${baseUrl}/box-office/${y}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Studio + Genre combo pages
  const studioGenreUrls = ['2', '174', '33', '4', '34', '41077'].flatMap(s =>
    ['28', '35', '18', '27', '878', '53', '10749', '16'].map(g => ({
      url: `${baseUrl}/studio/${s}/genre/${g}`,
      lastModified: lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    }))
  );

  // Multi-genre combo pages
  const genreComboUrls = [
    { id1: '28', id2: '35' }, { id1: '27', id2: '35' }, { id1: '878', id2: '53' },
    { id1: '10749', id2: '35' }, { id1: '18', id2: '53' }, { id1: '28', id2: '878' },
  ].map(({ id1, id2 }) => ({
    url: `${baseUrl}/genre/combo/${id1}/${id2}`,
    lastModified: lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Curated list pages
  const curatedListUrls = [
    'true-story', 'all-time-greatest', 'polarizing', 'underrated', 'debut-films',
    'award-sweepers', 'critics-vs-audience', 'best-soundtracks', 'book-adaptations',
    'binge-worthy', 'mini-series', 'adult-animation', 'great-sequels', 'international-thrillers',
  ].map(s => ({
    url: `${baseUrl}/lists/${s}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Occasion pages
  const occasionUrls = ['date-night', 'guys-night', 'girls-night', 'family-night', 'solo-watch'].map(o => ({
    url: `${baseUrl}/lists/occasion/${o}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Tag pages
  const tagUrls = ['time-travel', 'superhero', 'zombie', 'heist', 'dystopia', 'space', 'serial-killer', 'revenge'].map(t => ({
    url: `${baseUrl}/tag/${t}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Standalone new pages
  const standaloneUrls = ['free', 'coming-soon', 'new-releases', 'weekend-watch'].map(p => ({
    url: `${baseUrl}/${p}`,
    lastModified: lastModified,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Streaming compare page
  const streamingCompareUrls = [{
    url: `${baseUrl}/streaming/compare`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }];

  // Cinema pages (now playing by country)
  const cinemaUrls = ['us', 'gb', 'fr', 'kr', 'jp', 'in', 'it', 'es', 'de', 'br', 'mx', 'se', 'dk'].map(c => ({
    url: `${baseUrl}/cinema/${c}`,
    lastModified: lastModified,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Quick-watch pages
  const quickWatchUrls = ['netflix', 'max', 'disney', 'hulu', 'prime', 'apple'].map(p => ({
    url: `${baseUrl}/quick-watch/${p}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Browse A-Z + 0-9 pages
  const browseLetters = 'abcdefghijklmnopqrstuvwxyz'.split('').map(l => ({
    url: `${baseUrl}/browse/${l}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));
  const browseUrls = [
    ...browseLetters,
    { url: `${baseUrl}/browse/0-9`, lastModified: lastModified, changeFrequency: 'weekly' as const, priority: 0.5 },
  ];

  // Guide pages
  const guideUrls = ['streaming-guide', 'movie-night', 'family-movies'].map(g => ({
    url: `${baseUrl}/guides/${g}`,
    lastModified: lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Universe / franchise pages
  const universeUrls = ['marvel', 'dc', 'star-wars', 'harry-potter', 'lord-of-the-rings', 'fast-furious'].map(u => ({
    url: `${baseUrl}/universe/${u}`,
    lastModified: lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Awards collection pages
  const awardsCollectionUrls = ['best-picture', 'best-director', 'best-animated', 'best-documentary', 'best-foreign'].map(a => ({
    url: `${baseUrl}/awards/collection/${a}`,
    lastModified: lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

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
    ...genreYearUrls,
    ...streamingGenreUrls,
    ...decadeUrls,
    ...moodUrls,
    ...newOnUrls,
    ...predictionUrls,
    ...durationUrls,
    ...seasonalUrls,
    ...ratingUrls,
    ...leavingUrls,
    ...trendingCountryUrls,
    ...yearReviewUrls,
    ...tripleComboUrls,
    ...languageUrls,
    ...boxOfficeUrls,
    ...studioGenreUrls,
    ...genreComboUrls,
    ...curatedListUrls,
    ...occasionUrls,
    ...tagUrls,
    ...standaloneUrls,
    ...streamingCompareUrls,
    ...cinemaUrls,
    ...quickWatchUrls,
    ...browseUrls,
    ...guideUrls,
    ...universeUrls,
    ...awardsCollectionUrls,
  ];
}
