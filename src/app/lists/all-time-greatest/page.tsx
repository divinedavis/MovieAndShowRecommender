import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 3600;

const BASE_URL = 'https://movies.unittap.com';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(TMDB_BASE + endpoint);
  url.searchParams.append('api_key', API_KEY!);
  url.searchParams.append('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('TMDB API error: ' + res.statusText);
  return res.json();
}

export const metadata: Metadata = {
  title: '50 Greatest Movies of All Time - The Definitive List',
  description: 'The definitive list of the 50 greatest movies ever made, ranked by audience ratings and critical acclaim. From timeless classics to modern masterpieces.',
  keywords: ['greatest movies of all time', 'best movies ever', 'top 50 movies', 'all time best films', 'classic movies list'],
  alternates: { canonical: BASE_URL + '/lists/all-time-greatest' },
  openGraph: {
    title: '50 Greatest Movies of All Time | UnitTap Movies',
    description: 'The definitive ranking of the 50 greatest films ever made.',
    type: 'website',
    url: BASE_URL + '/lists/all-time-greatest',
  },
};

export default async function AllTimeGreatestPage() {
  const [page1, page2, page3] = await Promise.all([
    tmdbFetch('/movie/top_rated', { page: '1' }),
    tmdbFetch('/movie/top_rated', { page: '2' }),
    tmdbFetch('/movie/top_rated', { page: '3' }),
  ]);

  const allMovies = [...page1.results, ...page2.results, ...page3.results];
  const movies = allMovies.slice(0, 50).map((m: any, i: number) => ({
    id: m.id,
    title: m.title,
    image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
    rating: m.vote_average || 0,
    description: m.overview,
    position: i + 1,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '50 Greatest Movies of All Time',
    description: 'The definitive ranking of the 50 greatest films ever made.',
    url: BASE_URL + '/lists/all-time-greatest',
    numberOfItems: 50,
    itemListElement: movies.map((m: any) => ({
      '@type': 'ListItem',
      position: m.position,
      item: {
        '@type': 'Movie',
        name: m.title,
        url: BASE_URL + '/movie/' + m.id,
        image: m.image,
        datePublished: m.year + '-01-01',
        aggregateRating: { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' },
      },
    })),
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '50 Greatest Movies of All Time - The Definitive List',
    description: 'A comprehensive ranking of the greatest films in cinema history.',
    url: BASE_URL + '/lists/all-time-greatest',
    datePublished: '2026-01-01',
    dateModified: new Date().toISOString(),
    author: { '@type': 'Organization', name: 'UnitTap Movies' },
    publisher: { '@type': 'Organization', name: 'UnitTap Movies' },
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">50 Greatest Films</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">The Definitive All-Time List</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed font-medium mb-4">
            What makes a film truly great? Is it the storytelling, the performances, the cultural impact, or the way it stands the test of time? This definitive list of the 50 greatest movies ever made considers all of these factors, drawing on audience ratings and critical consensus from millions of viewers worldwide.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed font-medium mb-4">
            From golden age classics to contemporary masterpieces, these are the films that have shaped cinema as an art form. Each one represents the pinnacle of filmmaking craft, storytelling ambition, and emotional power.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed font-medium">
            Whether you&apos;re a seasoned cinephile looking to revisit the greats or a new film fan building your watchlist, this is the essential starting point for anyone who loves movies.
          </p>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">The Top 50</h2>
        <div className="space-y-6">
          {movies.map((movie: any) => (
            <Link key={movie.id} href={'/movie/' + movie.id} className="flex bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all overflow-hidden">
              <div className="flex items-center justify-center w-16 md:w-24 bg-black text-white font-black text-2xl md:text-4xl shrink-0">
                {movie.position}
              </div>
              <div className="relative w-20 md:w-28 shrink-0 border-l-4 border-black">
                {movie.image && <Image src={movie.image} alt={movie.title} fill className="object-cover" quality={85} />}
              </div>
              <div className="p-4 flex-1 min-w-0">
                <h3 className="font-black uppercase text-sm md:text-lg leading-tight mb-1">{movie.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase mb-2">{movie.year} // RATING: {movie.rating.toFixed(1)}</p>
                <p className="text-xs text-gray-600 line-clamp-2 hidden md:block">{movie.description}</p>
              </div>
              <div className="flex items-center px-4 shrink-0">
                <div className="bg-yellow-400 border-2 border-black text-sm font-black px-3 py-1">{movie.rating.toFixed(1)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
