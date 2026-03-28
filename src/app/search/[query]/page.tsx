import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 3600;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

const POPULAR_QUERIES = [
  'best-horror-movies',
  'new-releases-2026',
  'top-netflix-movies',
  'oscar-winners',
  'best-comedies',
];

interface Props {
  params: Promise<{ query: string }>;
}

async function searchMulti(query: string) {
  const decoded = query.replace(/-/g, ' ');
  const url = `${TMDB_BASE_URL}/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(decoded)}&page=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results
    .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
    .slice(0, 20)
    .map((r: any) => ({
      id: r.id,
      title: r.title || r.name,
      type: r.media_type === 'tv' ? 'show' : 'movie',
      image: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null,
      year: r.release_date || r.first_air_date ? new Date(r.release_date || r.first_air_date).getFullYear() : 0,
      rating: r.vote_average || 0,
      description: r.overview || '',
    }));
}

export async function generateStaticParams() {
  return POPULAR_QUERIES.map((query) => ({ query }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { query } = await params;
  const displayQuery = query.replace(/-/g, ' ');
  const baseUrl = 'https://movies.unittap.com';
  return {
    title: `${displayQuery} - Movies & Shows | UnitTap Movies`,
    description: `Search results for "${displayQuery}". Find movies, TV shows, and actors matching your search on UnitTap Movies.`,
    alternates: { canonical: `${baseUrl}/search/${query}` },
    openGraph: {
      title: `${displayQuery} - Search Results | UnitTap Movies`,
      description: `Movies and shows matching "${displayQuery}".`,
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}

export default async function SearchPage({ params }: Props) {
  const { query } = await params;
  const displayQuery = query.replace(/-/g, ' ');
  const results = await searchMulti(query);
  const baseUrl = 'https://movies.unittap.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: `Search: ${displayQuery}`,
    url: `${baseUrl}/search/${query}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: results.map((r: any, i: number) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': r.type === 'movie' ? 'Movie' : 'TVSeries',
          name: r.title,
          url: `${baseUrl}/${r.type}/${r.id}`,
        },
      })),
    },
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">SEARCH: {displayQuery.toUpperCase()}</h1>
        <p className="text-xl font-black text-gray-400 uppercase italic">{results.length} RESULTS FOUND</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      {results.length === 0 ? (
        <p className="text-xl font-bold text-gray-500">No results found. Try a different search term.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {results.filter((item: any) => item.image).map((item: any) => (
            <Link key={`${item.type}-${item.id}`} href={`/${item.type}/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                <Image src={item.image} alt={`${item.title}`} fill className="object-cover" />
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{item.year} // {item.type.toUpperCase()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
