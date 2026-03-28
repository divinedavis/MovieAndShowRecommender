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
  title: 'Free Movies to Stream Right Now - No Subscription Required',
  description: 'Watch great movies for free with no subscription needed. Discover the best free-to-stream films available right now in the US, updated daily.',
  keywords: ['free movies', 'free streaming', 'watch movies free', 'no subscription movies', 'free films online'],
  alternates: { canonical: BASE_URL + '/free' },
  openGraph: {
    title: 'Free Movies to Stream | UnitTap Movies',
    description: 'The best movies you can watch for free right now.',
    type: 'website',
    url: BASE_URL + '/free',
  },
};

export default async function FreeMoviesPage() {
  const data = await tmdbFetch('/discover/movie', {
    with_watch_monetization_types: 'free',
    watch_region: 'US',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '100',
    page: '1',
  });

  const movies = data.results.slice(0, 20).map((m: any) => ({
    id: m.id,
    title: m.title,
    image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
    rating: m.vote_average || 0,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Free Movies to Stream Right Now',
    description: 'Best free-to-stream movies available in the US.',
    url: BASE_URL + '/free',
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
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

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">Free Movies</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">No Subscription Required</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed font-medium mb-4">
            You don&apos;t need a premium subscription to watch great movies. These films are all available to stream for free in the United States right now, through ad-supported platforms like Tubi, Pluto TV, Peacock Free, and others.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed font-medium">
            From acclaimed classics to hidden gems, this list proves that the best things in life (and cinema) really can be free. Updated daily to reflect current availability.
          </p>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Stream Free Now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {movies.map((movie: any) => (
            <Link key={movie.id} href={'/movie/' + movie.id} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                {movie.image && <Image src={movie.image} alt={movie.title} fill className="object-cover" quality={85} />}
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{movie.rating.toFixed(1)}</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{movie.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{movie.year} // FREE</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
