const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

export interface MediaItem {
  id: number;
  title: string;
  type: 'movie' | 'show';
  category: 'box-office' | 'streaming' | 'upcoming' | '2026' | 'awards';
  rating: number;
  year: number;
  image: string;
  description: string;
  genres?: string[];
  releaseDate?: string;
  streamingProviders?: string[];
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
  awards: MediaItem[]
}> {
  if (!API_KEY) throw new Error('TMDB_API_KEY is not set');

  const currentYear = new Date().getFullYear();

  // Fetch Oscar Best Picture Winners (using a list or specific filtering for award-winners if possible)
  // For now, we fetch highly rated movies that won awards or are critically acclaimed
  const [boxOfficeData, trendingMoviesData, popularShowsData, trendingShowsData, data2025, data2026, oscarData] = await Promise.all([
    fetchFromTMDB('/discover/movie', { primary_release_year: currentYear.toString(), sort_by: 'revenue.desc', 'vote_count.gte': '100' }),
    fetchFromTMDB('/trending/movie/week'),
    fetchFromTMDB('/tv/popular'),
    fetchFromTMDB('/trending/tv/week'),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2025', sort_by: 'popularity.desc' }),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2026', sort_by: 'popularity.desc' }),
    fetchFromTMDB('/discover/movie', { sort_by: 'vote_average.desc', 'vote_count.gte': '5000', with_genres: '18' }) // Drama winners often
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
    releaseDate: m.release_date || m.first_air_date
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
    awards: oscarData.results.slice(0, 5).map((m: any) => mapItem(m, 'movie', 'awards'))
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
