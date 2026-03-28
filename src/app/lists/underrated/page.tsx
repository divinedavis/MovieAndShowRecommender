import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY!);
  url.searchParams.append('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`TMDB error: ${res.statusText}`);
  return res.json();
}

export const metadata: Metadata = {
  title: 'Most Underrated Movies You Need to Watch | Hidden Gems',
  description: 'Discover the most underrated movies that scored high with critics but flew under the radar. Hidden gems with ratings above 7.5 that deserve more attention.',
  openGraph: {
    title: 'Most Underrated Movies You Need to Watch',
    description: 'Hidden treasures that scored high but flew under the radar.',
    url: 'https://movies.unittap.com/lists/underrated',
  },
  alternates: { canonical: 'https://movies.unittap.com/lists/underrated' },
};

export default async function UnderratedMoviesPage() {
  const data = await fetchTMDB('/discover/movie', {
    'vote_average.gte': '7.5',
    'vote_count.gte': '50',
    'vote_count.lte': '500',
    sort_by: 'vote_average.desc',
    page: '1',
  });

  const movies = data.results.slice(0, 20);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Most Underrated Movies You Need to Watch',
    description: 'Hidden gems with high ratings but low vote counts.',
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        datePublished: m.release_date,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: m.vote_average,
          bestRating: 10,
          ratingCount: m.vote_count,
        },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="max-w-5xl mx-auto mb-12">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">Most Underrated Movies You Need to Watch</h1>
        <p className="text-lg text-gray-600 max-w-3xl">These hidden treasures scored high with critics but flew under the radar. With ratings above 7.5 but fewer than 500 votes, these films deserve a much wider audience. Prepare to discover your next favorite movie.</p>
      </header>
      <section className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {movies.map((m: any, i: number) => (
          <Link key={m.id} href={`/movie/${m.id}`} className="group">
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden transition-transform group-hover:-translate-y-1">
              <div className="relative aspect-[2/3]">
                {m.poster_path ? (
                  <Image src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} alt={m.title} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="absolute top-2 left-2 bg-yellow-400 text-black font-black text-xs px-2 py-1 border-2 border-black">#{i + 1}</div>
              </div>
              <div className="p-3">
                <h2 className="font-black text-sm uppercase leading-tight truncate">{m.title}</h2>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-yellow-600 font-black text-sm">&star; {m.vote_average.toFixed(1)}</span>
                  <span className="text-gray-400 text-xs font-bold">{m.release_date?.slice(0, 4)}</span>
                </div>
                <span className="text-gray-400 text-xs">{m.vote_count} votes</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
