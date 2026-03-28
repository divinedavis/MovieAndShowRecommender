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

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ALL_ENTRIES = [...LETTERS, '0-9'];

export function generateStaticParams() {
  return ALL_ENTRIES.map((letter) => ({ letter: letter.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ letter: string }> }): Promise<Metadata> {
  const { letter } = await params;
  const display = letter === '0-9' ? '0-9' : letter.toUpperCase();
  return {
    title: `Movies Starting with ${display} - Browse All ${display} Movies`,
    description: `Browse popular movies that start with the letter ${display}. Find films alphabetically in our complete movie database.`,
    openGraph: {
      title: `Movies Starting with ${display} - Browse All ${display} Movies`,
      url: `https://movies.unittap.com/browse/${letter}`,
    },
    alternates: { canonical: `https://movies.unittap.com/browse/${letter}` },
  };
}

export default async function BrowseLetterPage({ params }: { params: Promise<{ letter: string }> }) {
  const { letter } = await params;
  const display = letter === '0-9' ? '0-9' : letter.toUpperCase();

  // Fetch several pages of popular movies to filter by letter
  const pages = await Promise.all([
    fetchTMDB('/movie/popular', { page: '1' }),
    fetchTMDB('/movie/popular', { page: '2' }),
    fetchTMDB('/movie/popular', { page: '3' }),
    fetchTMDB('/movie/popular', { page: '4' }),
    fetchTMDB('/movie/popular', { page: '5' }),
  ]);

  const allMovies = pages.flatMap((p) => p.results);

  const filtered = allMovies.filter((m: any) => {
    if (!m.title) return false;
    const firstChar = m.title.charAt(0).toUpperCase();
    if (letter === '0-9') return /[0-9]/.test(firstChar);
    return firstChar === letter.toUpperCase();
  });

  const movies = filtered.slice(0, 20);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Movies Starting with ${display}`,
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        datePublished: m.release_date,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="max-w-5xl mx-auto mb-12">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">Movies Starting with {display}</h1>
        <p className="text-lg text-gray-600">Browse all popular movies that begin with &ldquo;{display}&rdquo;.</p>
      </header>

      {/* Alphabet Navigation */}
      <nav className="max-w-5xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2">
          {ALL_ENTRIES.map((l) => {
            const slug = l.toLowerCase();
            const isActive = slug === letter;
            return (
              <Link
                key={l}
                href={`/browse/${slug}`}
                className={`font-black text-sm px-3 py-1.5 border-2 border-black transition-colors ${isActive ? 'bg-black text-white' : 'bg-white text-black hover:bg-yellow-400'}`}
              >
                {l}
              </Link>
            );
          })}
        </div>
      </nav>

      {movies.length === 0 ? (
        <div className="max-w-5xl mx-auto text-center py-20">
          <p className="text-2xl font-black text-gray-300">No popular movies found starting with &ldquo;{display}&rdquo;</p>
        </div>
      ) : (
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
      )}
    </main>
  );
}
