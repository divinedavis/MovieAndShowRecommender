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
  title: "Best International Thriller Movies - Global Suspense Cinema",
  description: "The best thriller movies from around the world. Non-English language thrillers that prove suspense has no language barrier. Korean, French, Spanish, and more.",
  openGraph: {
    title: "Best International Thriller Movies - Global Suspense Cinema",
    description: "Top-rated non-English thriller films from around the globe.",
    url: "https://movies.unittap.com/lists/international-thrillers",
  },
  alternates: { canonical: "https://movies.unittap.com/lists/international-thrillers" },
};

export default async function InternationalThrillersPage() {
  // Genre 53 = Thriller, exclude English language
  const [korean, french, spanish, german, japanese] = await Promise.all([
    fetchTMDB('/discover/movie', { with_genres: '53', with_original_language: 'ko', sort_by: 'vote_average.desc', 'vote_count.gte': '200' }),
    fetchTMDB('/discover/movie', { with_genres: '53', with_original_language: 'fr', sort_by: 'vote_average.desc', 'vote_count.gte': '200' }),
    fetchTMDB('/discover/movie', { with_genres: '53', with_original_language: 'es', sort_by: 'vote_average.desc', 'vote_count.gte': '200' }),
    fetchTMDB('/discover/movie', { with_genres: '53', with_original_language: 'de', sort_by: 'vote_average.desc', 'vote_count.gte': '100' }),
    fetchTMDB('/discover/movie', { with_genres: '53', with_original_language: 'ja', sort_by: 'vote_average.desc', 'vote_count.gte': '100' }),
  ]);

  const seen = new Set<number>();
  const allMovies: any[] = [];
  for (const results of [korean.results, french.results, spanish.results, german.results, japanese.results]) {
    for (const m of results) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        allMovies.push(m);
      }
    }
  }
  const movies = allMovies.sort((a: any, b: any) => b.vote_average - a.vote_average).slice(0, 20);

  const LANG_NAMES: Record<string, string> = { ko: 'Korean', fr: 'French', es: 'Spanish', de: 'German', ja: 'Japanese', hi: 'Hindi', zh: 'Chinese', it: 'Italian', pt: 'Portuguese', th: 'Thai', da: 'Danish', sv: 'Swedish', no: 'Norwegian' };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Best International Thriller Movies',
    description: 'Top-rated non-English thriller films from around the world.',
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        datePublished: m.release_date,
        inLanguage: m.original_language,
        aggregateRating: { '@type': 'AggregateRating', ratingValue: m.vote_average, bestRating: 10, ratingCount: m.vote_count },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="max-w-5xl mx-auto mb-12">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">Best International Thriller Movies</h1>
        <p className="text-xs font-black tracking-widest text-blue-600 uppercase mb-4">Global Suspense Cinema</p>
        <p className="text-lg text-gray-600 max-w-3xl">Suspense knows no language barrier. From the nail-biting intensity of Korean thrillers to the cerebral sophistication of French crime films, international cinema offers some of the most gripping thrillers ever made. These films prove that great suspense transcends borders.</p>
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
                <div className="absolute top-2 left-2 bg-red-700 text-white font-black text-xs px-2 py-1 border-2 border-black">#{i + 1}</div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white font-bold text-xs px-2 py-1 rounded">
                  {LANG_NAMES[m.original_language] || m.original_language.toUpperCase()}
                </div>
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
    </main>
  );
}
