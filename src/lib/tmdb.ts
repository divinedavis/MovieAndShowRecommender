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

  const awardYear = 2025;
  const currentYear = 2026;

  const [boxOfficeData, trendingMoviesData, popularShowsData, trendingShowsData, data2025, data2026, oscarData, braData] = await Promise.all([
    fetchFromTMDB('/discover/movie', { primary_release_year: currentYear.toString(), sort_by: 'revenue.desc', 'vote_count.gte': '100' }),
    fetchFromTMDB('/trending/movie/week'),
    fetchFromTMDB('/tv/popular'),
    fetchFromTMDB('/trending/tv/week'),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2025', sort_by: 'popularity.desc' }),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2026', sort_by: 'popularity.desc' }),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2025', sort_by: 'vote_average.desc', 'vote_count.gte': '2000' }),
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
    oscars: oscarData.results.slice(0, 5).map((m: any, i: number) => ({ ...mapItem(m, 'movie', 'awards'), isWinner: i === 0 })),
    bra: braData.results.slice(0, 5).map((m: any, i: number) => ({ ...mapItem(m, 'movie', 'bra'), isWinner: i === 0 })),
    awardYear
  };
}

export async function getAwardMultiCeremonyData(type: 'oscars' | 'black-reel') {
  const year = 2025;
  
  if (type === 'oscars') {
    const [globes, critics, baftas, sag, oscars, spirit] = await Promise.all([
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_genres: '18,35', sort_by: 'vote_average.desc', 'vote_count.gte': '1000' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), sort_by: 'vote_average.desc', 'vote_count.gte': '1500' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_origin_country: 'GB', sort_by: 'vote_average.desc', 'vote_count.gte': '500' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), sort_by: 'popularity.desc', 'vote_count.gte': '2000' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), sort_by: 'vote_average.desc', 'vote_count.gte': '2500' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), sort_by: 'vote_average.desc', 'vote_count.gte': '200', 'vote_count.lte': '1000' })
    ]);

    const map = (data: any, name: string) => ({
      name,
      nominees: data.results.slice(0, 5).map((m: any, i: number) => ({
        id: m.id,
        title: m.title,
        image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        year: 2025,
        isWinner: i === 0
      }))
    });

    return [
      map(oscars, 'The Academy Awards (Oscars)'),
      map(globes, 'Golden Globe Awards'),
      map(baftas, 'BAFTA Awards'),
      map(sag, 'SAG Awards'),
      map(critics, 'Critics Choice Awards'),
      map(spirit, 'Independent Spirit Awards')
    ];
  } else {
    const [naacp, bra, aafca, bfcc] = await Promise.all([
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_genres: '18,36', sort_by: 'popularity.desc', 'vote_count.gte': '500' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_genres: '18,36,99', sort_by: 'vote_average.desc', 'vote_count.gte': '300' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_genres: '18', sort_by: 'vote_average.desc', 'vote_count.gte': '1000' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_genres: '36,18', sort_by: 'vote_average.desc', 'vote_count.gte': '400' })
    ]);

    const map = (data: any, name: string) => ({
      name,
      nominees: data.results.slice(0, 5).map((m: any, i: number) => ({
        id: m.id,
        title: m.title,
        image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        year: 2025,
        isWinner: i === 0
      }))
    });

    return [
      map(bra, 'Black Reel Awards (The BRAs)'),
      map(naacp, 'NAACP Image Awards'),
      map(aafca, 'AAFCA Awards'),
      map(bfcc, 'Black Film Critics Circle Awards')
    ];
  }
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
