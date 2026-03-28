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
  title: "Critics' Picks vs Audience Favorites - Who's Right?",
  description: "Compare the highest-rated critic darlings with the most popular audience favorites. Do critics and audiences agree? See the data side by side.",
  openGraph: {
    title: "Critics' Picks vs Audience Favorites - Who's Right?",
    description: "Critics vs audiences: who picks better movies?",
    url: "https://movies.unittap.com/lists/critics-vs-audience",
  },
  alternates: { canonical: "https://movies.unittap.com/lists/critics-vs-audience" },
};

export default async function CriticsVsAudiencePage() {
  const [criticsData, audienceData] = await Promise.all([
    fetchTMDB('/discover/movie', {
      sort_by: 'vote_average.desc',
      'vote_count.gte': '1000',
      page: '1',
    }),
    fetchTMDB('/discover/movie', {
      sort_by: 'vote_count.desc',
      'vote_average.gte': '6',
      page: '1',
    }),
  ]);

  const criticsPicks = criticsData.results.slice(0, 15);
  const audienceFavs = audienceData.results.slice(0, 15);

  const criticsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "Critics' Top Picks",
    numberOfItems: criticsPicks.length,
    itemListElement: criticsPicks.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        aggregateRating: { '@type': 'AggregateRating', ratingValue: m.vote_average, bestRating: 10, ratingCount: m.vote_count },
      },
    })),
  };

  const audienceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Audience Favorites',
    numberOfItems: audienceFavs.length,
    itemListElement: audienceFavs.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        aggregateRating: { '@type': 'AggregateRating', ratingValue: m.vote_average, bestRating: 10, ratingCount: m.vote_count },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(criticsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(audienceJsonLd) }} />
      <header className="max-w-6xl mx-auto mb-12">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">Critics&apos; Picks vs Audience Favorites</h1>
        <p className="text-xs font-black tracking-widest text-blue-600 uppercase mb-4">Who&apos;s Right?</p>
        <p className="text-lg text-gray-600 max-w-3xl">The age-old debate: do critics know best, or does the audience have the final say? We put the highest-rated films (critics&apos; proxy) against the most-voted films (audience proxy) to see where they agree &mdash; and where they diverge dramatically.</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Critics Section */}
        <section>
          <h2 className="text-2xl font-black italic uppercase mb-6 bg-black text-white px-4 py-3 inline-block border-2 border-black">Critics&apos; Picks</h2>
          <p className="text-sm text-gray-500 mb-4">Sorted by highest rating with 1000+ votes</p>
          <div className="space-y-4">
            {criticsPicks.map((m: any, i: number) => (
              <Link key={m.id} href={`/movie/${m.id}`} className="flex items-center gap-4 bg-white border-3 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
                <span className="font-black text-2xl text-gray-300 w-8">#{i + 1}</span>
                <div className="relative w-12 h-18 flex-shrink-0">
                  {m.poster_path && <Image src={`https://image.tmdb.org/t/p/w200${m.poster_path}`} alt={m.title} width={48} height={72} className="object-cover rounded border border-black" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm uppercase truncate">{m.title}</h3>
                  <span className="text-gray-400 text-xs">{m.release_date?.slice(0, 4)}</span>
                </div>
                <div className="text-right">
                  <div className="text-yellow-600 font-black">&star; {m.vote_average.toFixed(1)}</div>
                  <div className="text-gray-400 text-xs">{m.vote_count.toLocaleString()} votes</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Audience Section */}
        <section>
          <h2 className="text-2xl font-black italic uppercase mb-6 bg-blue-600 text-white px-4 py-3 inline-block border-2 border-black">Audience Favorites</h2>
          <p className="text-sm text-gray-500 mb-4">Sorted by most votes with 6.0+ rating</p>
          <div className="space-y-4">
            {audienceFavs.map((m: any, i: number) => (
              <Link key={m.id} href={`/movie/${m.id}`} className="flex items-center gap-4 bg-white border-3 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
                <span className="font-black text-2xl text-gray-300 w-8">#{i + 1}</span>
                <div className="relative w-12 h-18 flex-shrink-0">
                  {m.poster_path && <Image src={`https://image.tmdb.org/t/p/w200${m.poster_path}`} alt={m.title} width={48} height={72} className="object-cover rounded border border-black" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm uppercase truncate">{m.title}</h3>
                  <span className="text-gray-400 text-xs">{m.release_date?.slice(0, 4)}</span>
                </div>
                <div className="text-right">
                  <div className="text-yellow-600 font-black">&star; {m.vote_average.toFixed(1)}</div>
                  <div className="text-gray-400 text-xs">{m.vote_count.toLocaleString()} votes</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
