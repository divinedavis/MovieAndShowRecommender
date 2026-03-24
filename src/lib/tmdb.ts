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

export async function getMediaData() {
  if (!API_KEY) throw new Error('TMDB_API_KEY is not set');
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthName = now.toLocaleString('default', { month: 'long' });
  const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
  const endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`;

  const [boxOffice, trendingMovies, popularShows, trendingShows, data2025, data2026Month, oscarData, braData] = await Promise.all([
    fetchFromTMDB('/discover/movie', { primary_release_year: currentYear.toString(), sort_by: 'revenue.desc', 'vote_count.gte': '50' }),
    fetchFromTMDB('/trending/movie/week'),
    fetchFromTMDB('/tv/popular'),
    fetchFromTMDB('/trending/tv/week'),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2025', sort_by: 'popularity.desc' }),
    fetchFromTMDB('/discover/movie', { 'primary_release_date.gte': startDate, 'primary_release_date.lte': endDate, sort_by: 'popularity.desc' }),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2025', sort_by: 'vote_average.desc', 'vote_count.gte': '2000' }),
    fetchFromTMDB('/discover/movie', { primary_release_year: '2025', with_genres: '18,36', sort_by: 'vote_average.desc', 'vote_count.gte': '500' })
  ]);

  const map = (m: any, type: 'movie' | 'show', cat: any): MediaItem => ({
    id: m.id, title: m.title || m.name, type, category: cat, rating: Number(m.vote_average.toFixed(1)),
    year: new Date(m.release_date || m.first_air_date).getFullYear(),
    image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
    description: m.overview, releaseDate: m.release_date || m.first_air_date
  });

  return {
    movies: [...boxOffice.results.slice(0, 5).map((m: any) => map(m, 'movie', 'box-office')), ...trendingMovies.results.slice(0, 5).map((m: any) => map(m, 'movie', 'streaming'))],
    shows: [...popularShows.results.slice(0, 5).map((m: any) => map(m, 'show', 'box-office')), ...trendingShows.results.slice(0, 5).map((m: any) => map(m, 'show', 'streaming'))],
    top2025: data2025.results.slice(0, 5).map((m: any) => map(m, 'movie', 'upcoming')),
    top2026Month: data2026Month.results.slice(0, 5).map((m: any) => map(m, 'movie', '2026')),
    oscars: oscarData.results.slice(0, 5).map((m: any, i: number) => ({ ...map(m, 'movie', 'awards'), isWinner: i === 0 })),
    bra: braData.results.slice(0, 5).map((m: any, i: number) => ({ ...map(m, 'movie', 'bra'), isWinner: i === 0 })),
    awardYear: 2025, currentMonthName: monthName
  };
}

export async function getAwardMultiCeremonyData(type: 'oscars' | 'black-reel') {
  const year = 2025;
  if (type === 'oscars') {
    const [oscars, globes, sag, critics, dga, pga, wga, bafta, spirits, sundance, mtv] = await Promise.all([
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), sort_by: 'vote_average.desc', 'vote_count.gte': '2500' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_genres: '18,35', sort_by: 'vote_average.desc', 'vote_count.gte': '1000' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), sort_by: 'popularity.desc', 'vote_count.gte': '2000' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), sort_by: 'vote_average.desc', 'vote_count.gte': '1500' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_genres: '18', sort_by: 'vote_average.desc', 'vote_count.gte': '1200' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), sort_by: 'revenue.desc', 'vote_count.gte': '1000' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_genres: '18,80', sort_by: 'vote_average.desc', 'vote_count.gte': '800' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_origin_country: 'GB', sort_by: 'vote_average.desc', 'vote_count.gte': '500' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), sort_by: 'vote_average.desc', 'vote_count.gte': '200', 'vote_count.lte': '1000' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_genres: '18,99', sort_by: 'vote_average.desc', 'vote_count.gte': '100' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), sort_by: 'popularity.desc', 'vote_count.gte': '3000' })
    ]);
    const map = (data: any, name: string) => ({ name, nominees: data.results.slice(0, 5).map((m: any, i: number) => ({ id: m.id, title: m.title, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, year: 2025, isWinner: i === 0 })) });
    return [map(oscars, 'The Academy Awards (Oscars)'), map(globes, 'Golden Globe Awards'), map(sag, 'SAG Awards'), map(critics, 'Critics Choice Awards'), map(dga, 'Directors Guild (DGA) Awards'), map(pga, 'Producers Guild (PGA) Awards'), map(wga, 'Writers Guild (WGA) Awards'), map(bafta, 'BAFTA Awards (UK)'), map(sundance, 'Sundance Film Festival'), map(spirits, 'Independent Spirit Awards'), map(mtv, 'MTV Movie & TV Awards')];
  } else {
    const [naacp, bra, aafca, bfcc] = await Promise.all([
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_genres: '18,36', sort_by: 'popularity.desc', 'vote_count.gte': '500' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_genres: '18,36,99', sort_by: 'vote_average.desc', 'vote_count.gte': '300' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_genres: '18', sort_by: 'vote_average.desc', 'vote_count.gte': '1000' }),
      fetchFromTMDB('/discover/movie', { primary_release_year: year.toString(), with_genres: '36,18', sort_by: 'vote_average.desc', 'vote_count.gte': '400' })
    ]);
    const map = (data: any, name: string) => ({ name, nominees: data.results.slice(0, 5).map((m: any, i: number) => ({ id: m.id, title: m.title, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, year: 2025, isWinner: i === 0 })) });
    return [map(bra, 'Black Reel Awards (The BRAs)'), map(naacp, 'NAACP Image Awards'), map(aafca, 'AAFCA Awards'), map(bfcc, 'Black Film Critics Circle Awards')];
  }
}

export async function getMediaDetails(id: string, type: 'movie' | 'show') {
  const data = await fetchFromTMDB(`/${type === 'movie' ? 'movie' : 'tv'}/${id}`, { append_to_response: 'similar,credits,watch/providers' });
  const providers = data['watch/providers']?.results?.US?.flatrate?.map((p: any) => p.provider_name) || [];
  return {
    id: data.id, title: data.title || data.name, description: data.overview,
    image: `https://image.tmdb.org/t/p/original${data.backdrop_path || data.poster_path}`,
    poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
    rating: data.vote_average, year: new Date(data.release_date || data.first_air_date).getFullYear(),
    genres: data.genres.map((g: any) => g.name), runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null),
    streamingProviders: providers, collection: data.belongs_to_collection,
    cast: data.credits.cast.slice(0, 10).map((c: any) => ({ id: c.id, name: c.name, character: c.character, image: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null })),
    similar: data.similar.results.slice(0, 10).map((m: any) => ({ id: m.id, title: m.title || m.name, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, type, rating: m.vote_average, year: new Date(m.release_date || m.first_air_date).getFullYear() }))
  };
}

export async function getCollectionDetails(id: string) {
  const data = await fetchFromTMDB(`/collection/${id}`);
  const partsWithRuntime = await Promise.all(data.parts.map(async (p: any) => {
    const details = await fetchFromTMDB(`/movie/${p.id}`);
    return { ...p, runtime: details.runtime || 0 };
  }));
  const totalMinutes = partsWithRuntime.reduce((acc, p) => acc + p.runtime, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return {
    name: data.name, description: data.overview, image: `https://image.tmdb.org/t/p/original${data.backdrop_path}`,
    bingeTime: `${hours}h ${mins}m`,
    parts: partsWithRuntime.sort((a: any, b: any) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()).map((m: any) => ({
      id: m.id, title: m.title, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, year: new Date(m.release_date).getFullYear(), rating: m.vote_average, description: m.overview, runtime: m.runtime
    }))
  };
}

export async function getPlatformGenreData(platformId: string, genreId: string) {
  const data = await fetchFromTMDB('/discover/movie', { with_watch_providers: platformId, watch_region: 'US', with_genres: genreId, sort_by: 'popularity.desc' });
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id, title: m.title, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, year: new Date(m.release_date).getFullYear(), rating: m.vote_average
  }));
}

export async function getMonthlyReleases(year: string, month: string) {
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = `${year}-${month.padStart(2, '0')}-31`;
  const data = await fetchFromTMDB('/discover/movie', { 'primary_release_date.gte': startDate, 'primary_release_date.lte': endDate, sort_by: 'popularity.desc' });
  return data.results
    .map((m: any) => ({
      id: m.id, title: m.title, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, 
      year: new Date(m.release_date).getFullYear(), rating: m.vote_average, releaseDate: m.release_date
    }))
    .sort((a: any, b: any) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime())
    .slice(0, 20);
}

export async function getPersonBest(id: string) {
  const data = await fetchFromTMDB(`/person/${id}`, { append_to_response: 'combined_credits' });
  const best = data.combined_credits.cast
    .filter((m: any) => m.vote_count > 100)
    .sort((a: any, b: any) => b.vote_average - a.vote_average)
    .slice(0, 20)
    .map((m: any) => ({
      id: m.id, title: m.title || m.name, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, type: m.media_type, year: new Date(m.release_date || m.first_air_date).getFullYear(), rating: m.vote_average
    }));
  return { name: data.name, best };
}

export async function getPersonDetails(id: string) {
  const data = await fetchFromTMDB(`/person/${id}`, { append_to_response: 'combined_credits' });
  const credits = data.combined_credits.cast.sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0)).slice(0, 15).map((m: any) => ({
    id: m.id, title: m.title || m.name, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, type: m.media_type, year: new Date(m.release_date || m.first_air_date).getFullYear(), rating: m.vote_average
  }));
  return { id: data.id, name: data.name, biography: data.biography, birthday: data.birthday, place_of_birth: data.place_of_birth, image: `https://image.tmdb.org/t/p/h632${data.profile_path}`, known_for: data.known_for_department, credits };
}

export async function getMediaByGenre(genreId: string, type: 'movie' | 'show') {
  const data = await fetchFromTMDB(`/discover/${type === 'movie' ? 'movie' : 'tv'}`, { with_genres: genreId, sort_by: 'popularity.desc', 'vote_count.gte': '100' });
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id, title: m.title || m.name, type, image: `https://image.tmdb.org/t/p/w500${m.poster_path}`, year: new Date(m.release_date || m.first_air_date).getFullYear(), rating: m.vote_average, description: m.overview
  }));
}
