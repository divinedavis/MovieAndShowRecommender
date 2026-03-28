import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 3600;

const BASE_URL = 'https://movies.unittap.com';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.append('api_key', API_KEY!);
  url.searchParams.append('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB API error: ${res.statusText}`);
  return res.json();
}

export const metadata: Metadata = {
  title: 'Best Movies Based on True Stories - Real Life Films',
  description: 'Discover the greatest movies inspired by real events and true stories. From biopics to historical dramas, explore films that bring real life to the big screen.',
  keywords: ['movies based on true stories', 'real life movies', 'biographical films', 'true story movies', 'based on real events'],
  alternates: { canonical: `${BASE_URL}/lists/true-story` },
  openGraph: {
    title: 'Best Movies Based on True Stories | UnitTap Movies',
    description: 'The greatest films inspired by real events and true stories.',
    type: 'website',
    url: `${BASE_URL}/lists/true-story`,
  },
};

export default async function TrueStoryPage() {
  const data = await fetchFromTMDB('/discover/movie', {
    with_keywords: '818',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '500',
    page: '1',
  });
  const movies = data.results.slice(0, 20).map((m: any) => ({
    id: m.id,
    title: m.title,
    image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
    rating: m.vote_average || 0,
    description: m.overview,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Best Movies Based on True Stories',
    description: 'The greatest films inspired by real events and true stories.',
    url: `${BASE_URL}/lists/true-story`,
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        url: `${BASE_URL}/movie/${m.id}`,
        image: m.image,
        datePublished: `${m.year}-01-01`,
        aggregateRating: { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">Based on True Stories</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">Real Life Films That Captivate</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed font-medium mb-4">
            Some of cinema&apos;s most powerful stories are the ones that actually happened. From gripping historical dramas to intimate biopics, movies based on true stories offer a unique blend of entertainment and education that resonates deeply with audiences.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed font-medium mb-4">
            This curated collection features the highest-rated films inspired by real events, real people, and real struggles. Whether it&apos;s a war hero&apos;s journey, a scientific breakthrough, or an against-all-odds survival story, these films prove that truth is often stranger &mdash; and more compelling &mdash; than fiction.
          </p>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Top True Story Films</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {movies.map((movie: any) => (
            <Link key={movie.id} href={`/movie/${movie.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                {movie.image && <Image src={movie.image} alt={movie.title} fill className="object-cover" quality={85} />}
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{movie.rating.toFixed(1)}</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{movie.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{movie.year} // TRUE STORY</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
