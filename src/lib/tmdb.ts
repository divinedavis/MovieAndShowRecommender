const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

export interface MediaItem {
  id: number;
  title: string;
  type: 'movie' | 'show';
  category: 'box-office' | 'streaming' | 'upcoming';
  rating: number;
  year: number;
  image: string;
  description: string;
  genres?: string[];
  releaseDate?: string;
}

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY!);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB API error: ${res.statusText}`);
  return res.json();
}

export async function getMediaData(): Promise<{ movies: MediaItem[], shows: MediaItem[], upcoming: MediaItem[] }> {
  if (!API_KEY) throw new Error('TMDB_API_KEY is not set');

  const currentYear = new Date().getFullYear();

  const [boxOfficeData, trendingMoviesData, popularShowsData, trendingShowsData, upcomingData] = await Promise.all([
    fetchFromTMDB('/discover/movie', { primary_release_year: currentYear.toString(), sort_by: 'revenue.desc', 'vote_count.gte': '100' }),
    fetchFromTMDB('/trending/movie/week'),
    fetchFromTMDB('/tv/popular'),
    fetchFromTMDB('/trending/tv/week'),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2025', sort_by: 'popularity.desc' })
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
    upcoming: upcomingData.results.slice(0, 5).map((m: any) => mapItem(m, 'movie', 'upcoming'))
  };
}

export async function getMediaDetails(id: string, type: 'movie' | 'show') {
  const data = await fetchFromTMDB(`/${type === 'movie' ? 'movie' : 'tv'}/${id}`, { append_to_response: 'similar,credits' });
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
    cast: data.credits.cast.slice(0, 5).map((c: any) => ({ id: c.id, name: c.name, character: c.character, image: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null })),
    similar: data.similar.results.slice(0, 5).map((m: any) => ({
      id: m.id,
      title: m.title || m.name,
      image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      type
    }))
  };
}
