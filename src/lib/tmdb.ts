const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

export interface MediaItem {
  id: number;
  title: string;
  type: 'movie' | 'show';
  category: 'box-office' | 'streaming' | 'upcoming' | '2026' | 'awards' | 'bra';
  rating: number;
  year: number;
  image: string;
  description: string;
  genres?: string[];
  releaseDate?: string;
  streamingProviders?: string[];
  isWinner?: boolean;
}

// REAL 2026 OSCAR NOMINEES (Movies released in 2025)
const OSCAR_2026_IDS = [
  { id: 1054867, isWinner: true }, // One Battle After Another
  { id: 701387, isWinner: false }, // Bugonia
  { id: 911430, isWinner: false }, // F1
  { id: 1062722, isWinner: false }, // Frankenstein
  { id: 858024, isWinner: false }, // Hamnet
  { id: 1317288, isWinner: false }, // Marty Supreme
  { id: 1233413, isWinner: false }, // Sinners
  { id: 1241983, isWinner: false }, // Train Dreams
  { id: 1124566, isWinner: false }, // Sentimental Value
  { id: 1220564, isWinner: false }, // The Secret Agent
];

// Manual Best Picture winners for other major countries
const MANUAL_WINNERS: Record<string, string> = {
  'FR': 'Emilia Pérez',
  'KR': 'The Past',
  'IN': 'Stree 2'
};

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}, lang: string = 'en-US') {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY!);
  url.searchParams.append('language', lang);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB API error: ${res.statusText}`);
  return res.json();
}

// Helper to ensure full locale string for toLocaleString
function getFullLocale(lang: string): string {
  const mapping: Record<string, string> = {
    'en': 'en-US',
    'fr': 'fr-FR',
    'es': 'es-ES',
    'ko': 'ko-KR',
    'hi': 'hi-IN',
    'zh': 'zh-CN',
    'ja': 'ja-JP',
    'de': 'de-DE'
  };
  const short = lang.split('-')[0];
  return mapping[short] || 'en-US';
}

export async function getMediaData(lang: string = 'en-US', countryCode: string = 'US') {
  if (!API_KEY) throw new Error('TMDB_API_KEY is not set');
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const fullLocale = getFullLocale(lang);
  
  let monthName;
  try {
    monthName = now.toLocaleString(fullLocale, { month: 'long' });
  } catch (e) {
    monthName = now.toLocaleString('en-US', { month: 'long' });
  }

  const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
  const endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`;

  const [boxOffice, trendingMovies, popularShows, trendingShows, data2025, data2026Month, localAwardsRaw] = await Promise.all([
    fetchFromTMDB('/discover/movie', { primary_release_year: currentYear.toString(), region: countryCode, sort_by: 'revenue.desc', 'vote_count.gte': '10' }, lang),
    fetchFromTMDB('/trending/movie/week', { region: countryCode }, lang),
    fetchFromTMDB('/tv/popular', { watch_region: countryCode }, lang),
    fetchFromTMDB('/trending/tv/week', { region: countryCode }, lang),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2025', sort_by: 'popularity.desc' }, lang),
    fetchFromTMDB('/discover/movie', { 'primary_release_date.gte': startDate, 'primary_release_date.lte': endDate, sort_by: 'popularity.desc' }, lang),
    countryCode === 'US' 
      ? Promise.all(OSCAR_2026_IDS.map(item => fetchFromTMDB(`/movie/${item.id}`, {}, lang)))
      : fetchFromTMDB('/discover/movie', { primary_release_year: '2025', with_origin_country: countryCode, sort_by: 'vote_average.desc', 'vote_count.gte': '100' }, lang).then(d => d.results)
  ]);

  const map = (m: any, type: 'movie' | 'show', cat: any): MediaItem => ({
    id: m.id, title: m.title || m.name, type, category: cat, rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : 0,
    year: new Date(m.release_date || m.first_air_date).getFullYear(),
    image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
    description: m.overview, releaseDate: m.release_date || m.first_air_date
  });

  const manualWinnerTitle = MANUAL_WINNERS[countryCode];
  
  let localAwards: MediaItem[] = [];
  if (countryCode === 'US') {
    localAwards = localAwardsRaw.slice(0, 5).map((m: any) => {
      const item = map(m, 'movie', 'awards');
      const nominee = OSCAR_2026_IDS.find(n => n.id === m.id);
      return { ...item, isWinner: nominee?.isWinner || false };
    });
  } else {
    localAwards = (localAwardsRaw as any[]).slice(0, 5).map((m: any, i: number) => {
      const item = map(m, 'movie', 'awards');
      const isWinner = manualWinnerTitle ? item.title === manualWinnerTitle : i === 0;
      return { ...item, isWinner };
    });
  }

  return {
    movies: [...boxOffice.results.slice(0, 5).map((m: any) => map(m, 'movie', 'box-office')), ...trendingMovies.results.slice(0, 5).map((m: any) => map(m, 'movie', 'streaming'))],
    shows: [...popularShows.results.slice(0, 5).map((m: any) => map(m, 'show', 'box-office')), ...trendingShows.results.slice(0, 5).map((m: any) => map(m, 'show', 'streaming'))],
    top2025: data2025.results.slice(0, 5).map((m: any) => map(m, 'movie', 'upcoming')),
    top2026Month: data2026Month.results.slice(0, 5).map((m: any) => map(m, 'movie', '2026')),
    localAwards,
    awardYear: 2025, currentMonthName: monthName
  };
}

export async function getAwardMultiCeremonyData(type: string, lang: string = 'en-US', countryCode: string = 'US') {
  if (countryCode === 'US' && type === 'oscars') {
    const movies = await Promise.all(OSCAR_2026_IDS.map(item => fetchFromTMDB(`/movie/${item.id}`, {}, lang)));
    return [{
      name: 'Best Picture',
      nominees: movies.map(m => {
        const nominee = OSCAR_2026_IDS.find(n => n.id === m.id);
        return { id: m.id, title: m.title, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, year: 2025, isWinner: nominee?.isWinner || false };
      })
    }];
  }

  const data = await fetchFromTMDB('/discover/movie', { primary_release_year: '2025', with_origin_country: countryCode, sort_by: 'vote_average.desc', 'vote_count.gte': '50' }, lang);
  const map = (items: any[], name: string) => ({ 
    name, 
    nominees: items.map((m: any, i: number) => ({ 
      id: m.id, title: m.title, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, year: 2025, isWinner: i === 0 
    })) 
  });
  return [map(data.results.slice(0, 10), `${type} Winners & Nominees`)];
}

export async function getMediaDetails(id: string, type: 'movie' | 'show', lang: string = 'en-US') {
  const data = await fetchFromTMDB(`/${type === 'movie' ? 'movie' : 'tv'}/${id}`, { append_to_response: 'similar,credits,watch/providers,videos' }, lang);
  const providers = data['watch/providers']?.results?.US?.flatrate?.map((p: any) => p.provider_name) || [];
  const watchLink = data['watch/providers']?.results?.US?.link || null;
  const video = data.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || data.videos?.results?.[0];
  const trailerKey = video?.key || null;

  return {
    id: data.id, title: data.title || data.name, description: data.overview,
    image: `https://image.tmdb.org/t/p/original${data.backdrop_path || data.poster_path}`,
    poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
    rating: data.vote_average || 0, year: new Date(data.release_date || data.first_air_date).getFullYear(),
    genres: data.genres.map((g: any) => g.name), runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null),
    streamingProviders: providers, watchLink, collection: data.belongs_to_collection, trailerKey, imdb_id: data.imdb_id,
    cast: data.credits.cast.slice(0, 10).map((c: any) => ({ id: c.id, name: c.name, character: c.character, image: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null })),
    similar: data.similar.results.slice(0, 10).map((m: any) => ({ id: m.id, title: m.title || m.name, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, type, rating: m.vote_average || 0, year: new Date(m.release_date || m.first_air_date).getFullYear() }))
  };
}

export async function getActorOnPlatform(personId: string, platformId: string) {
  const data = await fetchFromTMDB('/discover/movie', { with_cast: personId, with_watch_providers: platformId, watch_region: 'US', sort_by: 'popularity.desc' });
  const person = await fetchFromTMDB(`/person/${personId}`);
  return {
    name: person.name,
    movies: data.results.map((m: any) => ({
      id: m.id, title: m.title, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, year: new Date(m.release_date).getFullYear(), rating: m.vote_average || 0
    }))
  };
}

export async function getStudioDetails(id: string) {
  const data = await fetchFromTMDB(`/company/${id}`);
  const movies = await fetchFromTMDB('/discover/movie', { with_companies: id, sort_by: 'popularity.desc' });
  return {
    name: data.name,
    logo: data.logo_path ? `https://image.tmdb.org/t/p/w500${data.logo_path}` : null,
    description: data.description,
    movies: movies.results.slice(0, 20).map((m: any) => ({
      id: m.id, title: m.title, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, year: new Date(m.release_date).getFullYear(), rating: m.vote_average || 0
    }))
  };
}

export async function getCollectionDetails(id: string) {
  const data = await fetchFromTMDB(`/collection/${id}`);
  const partsWithRuntime = await Promise.all(data.parts.map(async (p: any) => {
    const details = await fetchFromTMDB(`/movie/${p.id}`);
    return { ...p, runtime: details.runtime || 0 };
  }));
  const totalMinutes = partsWithRuntime.reduce((acc, p) => acc + p.runtime, 0);
  return {
    name: data.name, description: data.overview, image: `https://image.tmdb.org/t/p/original${data.backdrop_path}`,
    bingeTime: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
    parts: partsWithRuntime.sort((a: any, b: any) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()).map((m: any) => ({
      id: m.id, title: m.title, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, year: new Date(m.release_date).getFullYear(), rating: m.vote_average || 0, description: m.overview, runtime: m.runtime
    }))
  };
}

export async function getPlatformGenreData(platformId: string, genreId: string) {
  const data = await fetchFromTMDB('/discover/movie', { with_watch_providers: platformId, watch_region: 'US', with_genres: genreId, sort_by: 'popularity.desc' });
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id, title: m.title, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, year: new Date(m.release_date).getFullYear(), rating: m.vote_average || 0
  }));
}

export async function getMonthlyReleases(year: string, month: string) {
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = `${year}-${month.padStart(2, '0')}-31`;
  const data = await fetchFromTMDB('/discover/movie', { 'primary_release_date.gte': startDate, 'primary_release_date.lte': endDate, sort_by: 'popularity.desc' });
  return data.results.map((m: any) => ({
    id: m.id, title: m.title, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, 
    year: new Date(m.release_date).getFullYear(), rating: m.vote_average || 0, releaseDate: m.release_date
  })).sort((a: any, b: any) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()).slice(0, 20);
}

export async function getPersonBest(id: string) {
  const data = await fetchFromTMDB(`/person/${id}`, { append_to_response: 'combined_credits' });
  const best = data.combined_credits.cast.filter((m: any) => m.vote_count > 100).sort((a: any, b: any) => b.vote_average - a.vote_average).slice(0, 20).map((m: any) => ({
    id: m.id, title: m.title || m.name, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, type: m.media_type, year: new Date(m.release_date || m.first_air_date).getFullYear(), rating: m.vote_average || 0
  }));
  return { name: data.name, best };
}

export async function getPersonDetails(id: string) {
  const data = await fetchFromTMDB(`/person/${id}`, { append_to_response: 'combined_credits' });
  const credits = data.combined_credits.cast.sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0)).slice(0, 15).map((m: any) => ({
    id: m.id, title: m.title || m.name, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, type: m.media_type, year: new Date(m.release_date || m.first_air_date).getFullYear(), rating: m.vote_average || 0
  }));
  return { id: data.id, name: data.name, biography: data.biography, birthday: data.birthday, place_of_birth: data.place_of_birth, image: `https://image.tmdb.org/t/p/h632${data.profile_path}`, known_for: data.known_for_department, credits };
}

export async function getMediaByGenre(genreId: string, type: 'movie' | 'show') {
  const data = await fetchFromTMDB(`/discover/${type === 'movie' ? 'movie' : 'tv'}`, { with_genres: genreId, sort_by: 'popularity.desc', 'vote_count.gte': '100' });
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id, title: m.title || m.name, type, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, year: new Date(m.release_date || m.first_air_date).getFullYear(), rating: m.vote_average || 0, description: m.overview
  }));
}
