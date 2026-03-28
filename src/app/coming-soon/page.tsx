import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 86400;

const BASE_URL = 'https://movies.unittap.com';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(TMDB_BASE + endpoint);
  url.searchParams.append('api_key', API_KEY!);
  url.searchParams.append('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('TMDB API error: ' + res.statusText);
  return res.json();
}

export const metadata: Metadata = {
  title: 'Coming Soon to Theaters - Upcoming Movie Releases 2026',
  description: 'See what movies are coming soon to theaters. Browse upcoming releases with trailers, release dates, and descriptions. Updated daily.',
  keywords: ['coming soon movies', 'upcoming movies 2026', 'new movies coming out', 'future movie releases', 'upcoming films'],
  alternates: { canonical: BASE_URL + '/coming-soon' },
  openGraph: {
    title: 'Coming Soon - Upcoming Movies | UnitTap Movies',
    description: 'Upcoming movie releases coming soon to theaters and streaming.',
    type: 'website',
    url: BASE_URL + '/coming-soon',
  },
};

export default async function ComingSoonPage() {
  const [page1, page2] = await Promise.all([
    tmdbFetch('/movie/upcoming', { page: '1', region: 'US' }),
    tmdbFetch('/movie/upcoming', { page: '2', region: 'US' }),
  ]);

  const allMovies = [...page1.results, ...page2.results];
  const movies = allMovies
    .filter((m: any) => m.release_date && new Date(m.release_date) > new Date())
    .sort((a: any, b: any) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime())
    .slice(0, 30)
    .map((m: any) => ({
      id: m.id,
      title: m.title,
      image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
      year: new Date(m.release_date).getFullYear(),
      rating: m.vote_average || 0,
      releaseDate: m.release_date,
      description: m.overview,
    }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Coming Soon to Theaters - Upcoming Movie Releases',
    description: 'Upcoming movie releases ordered by release date.',
    url: BASE_URL + '/coming-soon',
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        url: BASE_URL + '/movie/' + m.id,
        image: m.image,
        datePublished: m.releaseDate,
      },
    })),
  };

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">Coming Soon</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">Upcoming Movie Releases 2026</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed font-medium mb-4">
            Get a first look at all the movies heading to theaters and streaming platforms soon. From highly anticipated sequels to original stories, here&apos;s everything you need to plan your upcoming movie nights.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed font-medium">
            This page is updated daily with the latest release dates and information. Bookmark it to stay ahead of every major movie launch.
          </p>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Upcoming Releases</h2>
        <div className="space-y-6">
          {movies.map((movie: any) => (
            <Link key={movie.id} href={'/movie/' + movie.id} className="flex bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all overflow-hidden">
              <div className="relative w-24 md:w-32 shrink-0">
                {movie.image && <Image src={movie.image} alt={movie.title} fill className="object-cover" quality={85} />}
              </div>
              <div className="p-4 flex-1 min-w-0 border-l-4 border-black">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-black uppercase text-sm md:text-lg leading-tight mb-1">{movie.title}</h3>
                    <p className="text-xs font-black text-yellow-600 uppercase mb-2">{formatDate(movie.releaseDate)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 hidden md:block">{movie.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
