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

const PLATFORMS = [
  { id: '8', name: 'Netflix', slug: 'netflix', color: 'bg-red-600' },
  { id: '1899', name: 'Max', slug: 'max', color: 'bg-purple-600' },
  { id: '337', name: 'Disney+', slug: 'disney', color: 'bg-blue-600' },
  { id: '15', name: 'Hulu', slug: 'hulu', color: 'bg-green-600' },
  { id: '9', name: 'Prime Video', slug: 'prime', color: 'bg-cyan-600' },
  { id: '350', name: 'Apple TV+', slug: 'apple', color: 'bg-gray-800' },
];

export const metadata: Metadata = {
  title: "Netflix vs Max vs Disney+ vs Hulu - Best Streaming Platform for Movies 2026",
  description: "Compare the top 10 movies on Netflix, Max, Disney+, Hulu, Prime Video, and Apple TV+. Find which streaming platform has the best movie catalog in 2026.",
  openGraph: {
    title: "Netflix vs Max vs Disney+ vs Hulu - Best Streaming Platform for Movies 2026",
    description: "Side-by-side comparison of the best movies on every major streaming platform.",
    url: "https://movies.unittap.com/streaming/compare",
  },
  alternates: { canonical: "https://movies.unittap.com/streaming/compare" },
};

export default async function StreamingComparePage() {
  const platformData = await Promise.all(
    PLATFORMS.map(async (p) => {
      const data = await fetchTMDB('/discover/movie', {
        with_watch_providers: p.id,
        watch_region: 'US',
        sort_by: 'vote_average.desc',
        'vote_count.gte': '500',
      });
      return { ...p, movies: data.results.slice(0, 10) };
    })
  );

  const avgRatings = platformData.map((p) => {
    const avg = p.movies.reduce((sum: number, m: any) => sum + m.vote_average, 0) / p.movies.length;
    return { name: p.name, avg: avg.toFixed(2), count: p.movies.length };
  });

  const jsonLdSchemas = platformData.map((p) => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Top Movies on ${p.name}`,
    numberOfItems: p.movies.length,
    itemListElement: p.movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        aggregateRating: { '@type': 'AggregateRating', ratingValue: m.vote_average, bestRating: 10, ratingCount: m.vote_count },
      },
    })),
  }));

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      {jsonLdSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <header className="max-w-6xl mx-auto mb-12">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">Netflix vs Max vs Disney+ vs Hulu</h1>
        <p className="text-xs font-black tracking-widest text-blue-600 uppercase mb-4">Best Streaming Platform for Movies 2026</p>
        <p className="text-lg text-gray-600 max-w-3xl">Which streaming service has the best movies right now? We compared the top-rated films on every major platform so you can decide where your subscription dollars go.</p>
      </header>

      {/* Summary Table */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-2xl font-black italic uppercase mb-6">Platform Ratings at a Glance</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-4 text-left font-black uppercase text-sm">Platform</th>
                <th className="p-4 text-left font-black uppercase text-sm">Avg Rating (Top 10)</th>
                <th className="p-4 text-left font-black uppercase text-sm">Top Movie</th>
              </tr>
            </thead>
            <tbody>
              {platformData.map((p, i) => (
                <tr key={p.slug} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-4 font-black uppercase text-sm">{p.name}</td>
                  <td className="p-4 font-black text-yellow-600">&star; {avgRatings[i].avg}</td>
                  <td className="p-4 font-bold text-sm">{p.movies[0]?.title || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Per-Platform Sections */}
      {platformData.map((p) => (
        <section key={p.slug} className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl font-black italic uppercase mb-6">
            <span className={`${p.color} text-white px-3 py-1 mr-2 inline-block border-2 border-black`}>{p.name}</span>
            Top 10 Movies
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {p.movies.map((m: any, i: number) => (
              <Link key={m.id} href={`/movie/${m.id}`} className="group">
                <div className="bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden transition-transform group-hover:-translate-y-1">
                  <div className="relative aspect-[2/3]">
                    {m.poster_path ? (
                      <Image src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} alt={m.title} fill className="object-cover" sizes="(max-width:768px) 50vw, 20vw" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                    )}
                    <div className="absolute top-1 left-1 bg-yellow-400 text-black font-black text-xs px-1.5 py-0.5 border border-black">#{i + 1}</div>
                  </div>
                  <div className="p-2">
                    <h3 className="font-black text-xs uppercase leading-tight truncate">{m.title}</h3>
                    <span className="text-yellow-600 font-black text-xs">&star; {m.vote_average.toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
