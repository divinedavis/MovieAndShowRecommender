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
  title: 'Most Polarizing Movies - Films That Divide Audiences',
  description: 'Discover the most divisive and polarizing movies that split audiences down the middle. High vote counts but mediocre averages reveal the films people love to argue about.',
  keywords: ['polarizing movies', 'divisive films', 'controversial movies', 'love it or hate it movies', 'audience divided movies'],
  alternates: { canonical: BASE_URL + '/lists/polarizing' },
  openGraph: {
    title: 'Most Polarizing Movies | UnitTap Movies',
    description: 'Films that divide audiences - high engagement but split opinions.',
    type: 'website',
    url: BASE_URL + '/lists/polarizing',
  },
};

export default async function PolarizingPage() {
  const data = await tmdbFetch('/discover/movie', {
    sort_by: 'vote_count.desc',
    'vote_average.gte': '5.5',
    'vote_average.lte': '7.0',
    'vote_count.gte': '5000',
    page: '1',
  });

  const movies = data.results.slice(0, 20).map((m: any) => ({
    id: m.id,
    title: m.title,
    image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
    rating: m.vote_average || 0,
    voteCount: m.vote_count || 0,
    description: m.overview,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Most Polarizing Movies',
    description: 'Films that divide audiences with high engagement but split opinions.',
    url: BASE_URL + '/lists/polarizing',
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
        aggregateRating: { '@type': 'AggregateRating', ratingValue: m.rating, ratingCount: m.voteCount, bestRating: '10' },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">Polarizing Movies</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">Films That Divide Audiences</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed font-medium mb-4">
            Some movies spark universal praise. Others are universally panned. But the most fascinating films are the ones that split audiences right down the middle. These are the polarizing movies -- films with massive vote counts that land in the mediocre range, not because they&apos;re mediocre, but because half the audience loved them while the other half didn&apos;t.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed font-medium">
            A rating of 6.0-7.0 with thousands of votes doesn&apos;t mean &ldquo;average&rdquo; -- it means &ldquo;fiercely debated.&rdquo; These are the films that fuel arguments, generate think pieces, and refuse to be ignored. Love them or hate them, you&apos;ll have an opinion.
          </p>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Most Divisive Films</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {movies.map((movie: any) => (
            <Link key={movie.id} href={'/movie/' + movie.id} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                {movie.image && <Image src={movie.image} alt={movie.title} fill className="object-cover" quality={85} />}
                <div className="absolute top-2 right-2 bg-red-400 border-2 border-black text-[10px] font-black px-2 py-1">{movie.rating.toFixed(1)}</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{movie.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{movie.year} // {(movie.voteCount / 1000).toFixed(0)}K VOTES</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
