const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

export interface MediaItem {
  id: number;
  title: string;
  type: 'movie' | 'show';
  category: 'box-office' | 'streaming';
  rating: number;
  year: number;
  image: string;
  description: string;
}

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY!);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB API error: ${res.statusText}`);
  return res.json();
}

export async function getMediaData(): Promise<{ movies: MediaItem[], shows: MediaItem[] }> {
  if (!API_KEY) {
    throw new Error('TMDB_API_KEY is not set');
  }

  // 1. Top 5 Box Office Movies this year (2024/2025)
  const currentYear = new Date().getFullYear();
  const boxOfficeMoviesData = await fetchFromTMDB('/discover/movie', {
    primary_release_year: currentYear.toString(),
    sort_by: 'revenue.desc',
    'vote_count.gte': '100'
  });

  const boxOfficeMovies: MediaItem[] = boxOfficeMoviesData.results.slice(0, 5).map((m: any) => ({
    id: m.id,
    title: m.title,
    type: 'movie',
    category: 'box-office',
    rating: Number(m.vote_average.toFixed(1)),
    year: new Date(m.release_date).getFullYear(),
    image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
    description: m.overview
  }));

  // 2. Top 5 Streaming Movies this week
  const streamingMoviesData = await fetchFromTMDB('/trending/movie/week');
  const streamingMovies: MediaItem[] = streamingMoviesData.results.slice(0, 5).map((m: any) => ({
    id: m.id,
    title: m.title,
    type: 'movie',
    category: 'streaming',
    rating: Number(m.vote_average.toFixed(1)),
    year: new Date(m.release_date).getFullYear(),
    image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
    description: m.overview
  }));

  // 3. Top 5 Popular Shows
  const popularShowsData = await fetchFromTMDB('/tv/popular');
  const popularShows: MediaItem[] = popularShowsData.results.slice(0, 5).map((s: any) => ({
    id: s.id,
    title: s.name,
    type: 'show',
    category: 'box-office',
    rating: Number(s.vote_average.toFixed(1)),
    year: new Date(s.first_air_date).getFullYear(),
    image: `https://image.tmdb.org/t/p/w500${s.poster_path}`,
    description: s.overview
  }));

  // 4. Top 5 Streaming Shows this week
  const streamingShowsData = await fetchFromTMDB('/trending/tv/week');
  const streamingShows: MediaItem[] = streamingShowsData.results.slice(0, 5).map((s: any) => ({
    id: s.id,
    title: s.name,
    type: 'show',
    category: 'streaming',
    rating: Number(s.vote_average.toFixed(1)),
    year: new Date(s.first_air_date).getFullYear(),
    image: `https://image.tmdb.org/t/p/w500${s.poster_path}`,
    description: s.overview
  }));

  return {
    movies: [...boxOfficeMovies, ...streamingMovies],
    shows: [...popularShows, ...streamingShows]
  };
}
