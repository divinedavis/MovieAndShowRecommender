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
  awards: MediaItem[],
  awardYear: number
}> {
  if (!API_KEY) throw new Error('TMDB_API_KEY is not set');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed, 2 is March
  
  // Oscars usually happen in March. If it's before or during March, 
  // we might still want to show the nominees for the ceremony happening this year 
  // (which are movies from the previous year).
  // If it's late in the year, we show the ones from the ceremony that just happened.
  
  // Logical Award Year: The ceremony happening in 2026 honors 2025 movies.
  // 2024 Best Picture: Oppenheimer (Ceremony 2024)
  // 2025 Best Picture: Anora (Ceremony 2025 - current as of early 2026)
  const awardYear = currentMonth <= 3 ? currentYear - 1 : currentYear;

  const [boxOfficeData, trendingMoviesData, popularShowsData, trendingShowsData, data2025, data2026, oscarNominees] = await Promise.all([
    fetchFromTMDB('/discover/movie', { primary_release_year: currentYear.toString(), sort_by: 'revenue.desc', 'vote_count.gte': '100' }),
    fetchFromTMDB('/trending/movie/week'),
    fetchFromTMDB('/tv/popular'),
    fetchFromTMDB('/trending/tv/week'),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2025', sort_by: 'popularity.desc' }),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2026', sort_by: 'popularity.desc' }),
    // Fetching the top critically acclaimed movies of the award year to simulate the Nominees
    fetchFromTMDB('/discover/movie', { primary_release_year: awardYear.toString(), sort_by: 'vote_average.desc', 'vote_count.gte': '1000' })
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
    isWinner: false // Logic for winner badge can be added here
  });

  const awardItems = oscarNominees.results.slice(0, 5).map((m: any, index: number) => {
    const item = mapItem(m, 'movie', 'awards');
    if (index === 0) item.isWinner = true; // Mark top one as winner for UI
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
    awards: awardItems,
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
