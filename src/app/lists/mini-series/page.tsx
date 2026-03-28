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
  title: "Best Mini-Series & Limited Series to Watch",
  description: "The best mini-series and limited series with complete stories in one season. No multi-year commitment required - just great storytelling from start to finish.",
  openGraph: {
    title: "Best Mini-Series & Limited Series to Watch",
    description: "Complete stories in one season - the best limited series.",
    url: "https://movies.unittap.com/lists/mini-series",
  },
  alternates: { canonical: "https://movies.unittap.com/lists/mini-series" },
};

export default async function MiniSeriesPage() {
  const data = await fetchTMDB('/discover/tv', {
    with_type: '2',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '100',
    page: '1',
  });

  const shows = data.results.slice(0, 20);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Best Mini-Series & Limited Series',
    description: 'Top-rated limited series and mini-series.',
    numberOfItems: shows.length,
    itemListElement: shows.map((s: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'TVSeries',
        name: s.name,
        image: `https://image.tmdb.org/t/p/w500${s.poster_path}`,
        datePublished: s.first_air_date,
        numberOfSeasons: 1,
        aggregateRating: { '@type': 'AggregateRating', ratingValue: s.vote_average, bestRating: 10, ratingCount: s.vote_count },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="max-w-5xl mx-auto mb-12">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">Best Mini-Series &amp; Limited Series</h1>
        <p className="text-xs font-black tracking-widest text-blue-600 uppercase mb-4">Complete Stories in One Season</p>
        <p className="text-lg text-gray-600 max-w-3xl">No multi-year commitment required. These limited series and mini-series deliver a complete, satisfying story arc in a single season. Perfect for viewers who want great storytelling with a definitive ending.</p>
      </header>
      <section className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {shows.map((s: any, i: number) => (
          <Link key={s.id} href={`/show/${s.id}`} className="group">
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden transition-transform group-hover:-translate-y-1">
              <div className="relative aspect-[2/3]">
                {s.poster_path ? (
                  <Image src={`https://image.tmdb.org/t/p/w500${s.poster_path}`} alt={s.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="absolute top-2 left-2 bg-green-600 text-white font-black text-xs px-2 py-1 border-2 border-black">#{i + 1}</div>
              </div>
              <div className="p-3">
                <h2 className="font-black text-sm uppercase leading-tight truncate">{s.name}</h2>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-yellow-600 font-black text-sm">&star; {s.vote_average.toFixed(1)}</span>
                  <span className="text-gray-400 text-xs font-bold">{s.first_air_date?.slice(0, 4)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
