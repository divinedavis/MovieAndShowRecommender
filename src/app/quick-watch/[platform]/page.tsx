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

const PLATFORMS: Record<string, { id: string; name: string }> = {
  netflix: { id: '8', name: 'Netflix' },
  max: { id: '1899', name: 'Max' },
  disney: { id: '337', name: 'Disney+' },
  hulu: { id: '15', name: 'Hulu' },
  prime: { id: '9', name: 'Prime Video' },
  apple: { id: '350', name: 'Apple TV+' },
};

export function generateStaticParams() {
  return Object.keys(PLATFORMS).map((platform) => ({ platform }));
}

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }): Promise<Metadata> {
  const { platform } = await params;
  const p = PLATFORMS[platform];
  if (!p) return { title: 'Quick Watch' };
  return {
    title: `Quick Movies on ${p.name} - Films Under 100 Minutes`,
    description: `Short movies on ${p.name} you can finish in under 100 minutes. Perfect for a quick movie night when you don't have time for a 3-hour epic.`,
    openGraph: {
      title: `Quick Movies on ${p.name} - Films Under 100 Minutes`,
      description: `The best short films on ${p.name} for a quick watch.`,
      url: `https://movies.unittap.com/quick-watch/${platform}`,
    },
    alternates: { canonical: `https://movies.unittap.com/quick-watch/${platform}` },
  };
}

export default async function QuickWatchPlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const p = PLATFORMS[platform];
  if (!p) return <main className="min-h-screen bg-gray-50 p-10 text-center"><h1 className="text-4xl font-black">Platform Not Found</h1></main>;

  const data = await fetchTMDB('/discover/movie', {
    with_watch_providers: p.id,
    watch_region: 'US',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '200',
    'with_runtime.lte': '100',
  });

  const movies = data.results.slice(0, 20);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Quick Movies on ${p.name} - Under 100 Minutes`,
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        datePublished: m.release_date,
        aggregateRating: { '@type': 'AggregateRating', ratingValue: m.vote_average, bestRating: 10, ratingCount: m.vote_count },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="max-w-5xl mx-auto mb-12">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">Quick Movies on {p.name}</h1>
        <p className="text-xs font-black tracking-widest text-blue-600 uppercase mb-4">Films Under 100 Minutes</p>
        <p className="text-lg text-gray-600 max-w-3xl">No time for a three-hour epic? These highly-rated films on {p.name} clock in under 100 minutes &mdash; perfect for a quick but satisfying movie night.</p>
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
              </div>
            </div>
          </Link>
        ))}
      </section>
      <nav className="max-w-5xl mx-auto mt-12">
        <h2 className="text-lg font-black uppercase mb-4">Quick Watch on Other Platforms</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(PLATFORMS).filter(([k]) => k !== platform).map(([k, v]) => (
            <Link key={k} href={`/quick-watch/${k}`} className="bg-black text-white font-black uppercase text-xs px-4 py-2 border-2 border-black hover:bg-blue-600 transition-colors">{v.name}</Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
