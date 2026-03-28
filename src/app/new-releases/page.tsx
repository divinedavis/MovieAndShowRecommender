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

function getWeekRange() {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const fmt = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  return { start, end, label: fmt(start) + ' - ' + fmt(end) };
}

export async function generateMetadata(): Promise<Metadata> {
  const { label } = getWeekRange();
  return {
    title: 'New Movie Releases This Week - ' + label,
    description: 'Discover the latest movies released this week. Stay up to date with new theatrical and streaming releases, updated daily.',
    keywords: ['new movies this week', 'new releases', 'movies out now', 'latest movies', 'new films today'],
    alternates: { canonical: BASE_URL + '/new-releases' },
    openGraph: {
      title: 'New Movie Releases This Week | UnitTap Movies',
      description: 'The latest movie releases this week, updated daily.',
      type: 'website',
      url: BASE_URL + '/new-releases',
    },
  };
}

export default async function NewReleasesPage() {
  const { start, end, label } = getWeekRange();
  const data = await tmdbFetch('/discover/movie', {
    'primary_release_date.gte': start,
    'primary_release_date.lte': end,
    sort_by: 'popularity.desc',
    region: 'US',
  });

  const movies = data.results.slice(0, 20).map((m: any) => ({
    id: m.id,
    title: m.title,
    image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
    rating: m.vote_average || 0,
    releaseDate: m.release_date,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'New Movie Releases This Week - ' + label,
    description: 'Movies released this week.',
    url: BASE_URL + '/new-releases',
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
        aggregateRating: m.rating > 0 ? { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' } : undefined,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">New Releases</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">{label}</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed font-medium mb-4">
            Stay on top of the latest movie releases hitting theaters and streaming platforms this week. This page is automatically updated daily to bring you the freshest films as they drop.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed font-medium">
            From highly anticipated blockbusters to indie gems, find out what&apos;s new and decide what to watch this weekend. Ratings update in real-time as audiences weigh in.
          </p>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">This Week&apos;s Releases</h2>
        {movies.length === 0 ? (
          <p className="text-gray-500 text-lg">No major releases found this week. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {movies.map((movie: any) => (
              <Link key={movie.id} href={'/movie/' + movie.id} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                  {movie.image && <Image src={movie.image} alt={movie.title} fill className="object-cover" quality={85} />}
                  {movie.rating > 0 && <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{movie.rating.toFixed(1)}</div>}
                </div>
                <div className="p-4">
                  <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{movie.title}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase">{movie.releaseDate} // NEW RELEASE</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
