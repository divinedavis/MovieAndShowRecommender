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

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY!);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB API error: ${res.statusText}`);
  return res.json();
}

export async function getMediaData(): Promise<{ 
  movies: MediaItem[], 
  shows: MediaItem[], 
  upcoming2025: MediaItem[],
  upcoming2026: MediaItem[],
  oscars: MediaItem[],
  bra: MediaItem[],
  awardYear: number
}> {
  if (!API_KEY) throw new Error('TMDB_API_KEY is not set');

  const awardYear = 2025; // Ceremony 2026 honors 2025 movies
  const currentYear = 2026;

  const [boxOfficeData, trendingMoviesData, popularShowsData, trendingShowsData, data2025, data2026, oscarData, braData] = await Promise.all([
    fetchFromTMDB('/discover/movie', { primary_release_year: currentYear.toString(), sort_by: 'revenue.desc', 'vote_count.gte': '100' }),
    fetchFromTMDB('/trending/movie/week'),
    fetchFromTMDB('/tv/popular'),
    fetchFromTMDB('/trending/tv/week'),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2025', sort_by: 'popularity.desc' }),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2026', sort_by: 'popularity.desc' }),
    // Oscars 2026 (2025 movies)
    fetchFromTMDB('/discover/movie', { primary_release_year: '2025', sort_by: 'vote_average.desc', 'vote_count.gte': '2000' }),
    // BRA 2026 (Simulated high-rated drama/history for Black Reel)
    fetchFromTMDB('/discover/movie', { primary_release_year: '2025', with_genres: '18,36', sort_by: 'vote_average.desc', 'vote_count.gte': '500' })
  ]);

  const mapItem = (m: any, type: 'movie' | 'show', category: any): MediaItem => ({
    id: m.id,
    title: m.title || m.name,
    type,
    category,
    rating: Number(m.vote_average.toFixed(1)),
    year: new Date(m.release_date || m.first_air_date).getFullYear(),
    image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
    description: m.overview,
    releaseDate: m.release_date || m.first_air_date,
    isWinner: false
  });

  const oscarItems = oscarData.results.slice(0, 5).map((m: any, i: number) => {
    const item = mapItem(m, 'movie', 'awards');
    if (i === 0) item.isWinner = true;
    return item;
  });

  const braItems = braData.results.slice(0, 5).map((m: any, i: number) => {
    const item = mapItem(m, 'movie', 'bra');
    if (i === 0) item.isWinner = true;
    return item;
  });

  return {
    movies: [
      ...boxOfficeData.results.slice(0, 5).map((m: any) => mapItem(m, 'movie', 'box-office')),
      ...trendingMoviesData.results.slice(0, 5).map((m: any) => mapItem(m, 'movie', 'streaming'))
    ],
    shows: [
      ...popularShowsData.results.slice(0, 5).map((m: any) => mapItem(m, 'show', 'box-office')),
      ...trendingShowsData.results.slice(0, 5).map((m: any) => mapItem(m, 'show', 'streaming'))
    ],
    upcoming2025: data2025.results.slice(0, 5).map((m: any) => mapItem(m, 'movie', 'upcoming')),
    upcoming2026: data2026.results.slice(0, 5).map((m: any) => mapItem(m, 'movie', '2026')),
    oscars: oscarItems,
    bra: braItems,
    awardYear
  };
}

export async function getMediaDetails(id: string, type: 'movie' | 'show') {
  const data = await fetchFromTMDB(`/${type === 'movie' ? 'movie' : 'tv'}/${id}`, { 
    append_to_response: 'similar,credits,watch/providers' 
  });
  
  const providers = data['watch/providers']?.results?.US?.flatrate?.map((p: any) => p.provider_name) || [];

  return {
    id: data.id,
    title: data.title || data.name,
    description: data.overview,
    image: `https://image.tmdb.org/t/p/original${data.backdrop_path || data.poster_path}`,
    poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
    rating: data.vote_average,
    year: new Date(data.release_date || data.first_air_date).getFullYear(),
    genres: data.genres.map((g: any) => g.name),
    runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null),
    streamingProviders: providers,
    cast: data.credits.cast.slice(0, 5).map((c: any) => ({ 
      id: c.id, 
      name: c.name, 
      character: c.character, 
      image: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null 
    })),
    similar: data.similar.results.slice(0, 5).map((m: any) => ({
      id: m.id,
      title: m.title || m.name,
      image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      type
    }))
  };
}

export async function getAwardCeremonyData(slug: string) {
  // Mocking award specific nominees based on slug
  const year = 2025;
  const data = await fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), sort_by: 'vote_average.desc', 'vote_count.gte': 500 });
  
  return {
    name: slug.toUpperCase().replace(/-/g, ' '),
    year: 2026,
    nominees: data.results.slice(0, 10).map((m: any, i: number) => ({
      id: m.id,
      title: m.title,
      image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      rating: m.vote_average,
      year: 2025,
      isWinner: i === 0,
      description: m.overview
    }))
  };
}
