import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://movies.unittap.com';

export const revalidate = 86400;

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY!);
  url.searchParams.append('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`TMDB API error: ${res.statusText}`);
  return res.json();
}

async function getPersonMovies(id: string) {
  const data = await fetchFromTMDB(`/person/${id}`, { append_to_response: 'movie_credits' });
  const movies = (data.movie_credits?.cast || [])
    .filter((m: any) => m.poster_path)
    .sort((a: any, b: any) => {
      const yearA = a.release_date ? new Date(a.release_date).getFullYear() : 0;
      const yearB = b.release_date ? new Date(b.release_date).getFullYear() : 0;
      return yearB - yearA;
    })
    .map((m: any) => ({
      id: m.id, title: m.title, character: m.character,
      image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      year: m.release_date ? new Date(m.release_date).getFullYear() : 0, rating: m.vote_average || 0,
    }));
  const years = movies.filter((m: any) => m.year > 0).map((m: any) => m.year);
  const firstYear = years.length > 0 ? Math.min(...years) : 0;
  return { name: data.name, image: data.profile_path ? `https://image.tmdb.org/t/p/h632${data.profile_path}` : null, movies, firstYear };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getPersonMovies(id);
  return {
    title: `Every ${data.name} Movie - Complete Film List`,
    description: `The complete list of every movie ${data.name} has appeared in. ${data.movies.length} films${data.firstYear ? ` since ${data.firstYear}` : ''}, sorted by year from newest to oldest.`,
    keywords: [`${data.name} movies`, `${data.name} filmography`, `${data.name} film list`, `every ${data.name} movie`],
    alternates: { canonical: `${BASE_URL}/person/${id}/movies` },
    openGraph: { title: `Every ${data.name} Movie | UnitTap Movies`, description: `Complete filmography of ${data.name}.`, type: 'website' },
  };
}

export default async function PersonMoviesPage({ params }: Props) {
  const { id } = await params;
  const data = await getPersonMovies(id);

  const narrative = `${data.name} has appeared in ${data.movies.length} movies${data.firstYear ? ` since ${data.firstYear}` : ''}. ${data.movies.length > 0 ? `Their most recent film is ${data.movies[0].title}${data.movies[0].year ? ` (${data.movies[0].year})` : ''}.` : ''}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Every ${data.name} Movie`,
    description: narrative,
    url: `${BASE_URL}/person/${id}/movies`,
    numberOfItems: data.movies.length,
    itemListElement: data.movies.map((m: any, i: number) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'Movie', name: m.title, url: `${BASE_URL}/movie/${m.id}`, image: m.image,
        datePublished: m.year ? `${m.year}-01-01` : undefined,
        aggregateRating: m.rating ? { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' } : undefined },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href={`/person/${id}`} className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO {data.name.toUpperCase()}</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">EVERY {data.name.toUpperCase()} MOVIE</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">COMPLETE FILM LIST</p>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl">{narrative}</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {data.movies.map((item: any, index: number) => (
          <Link key={`${item.id}-${index}`} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              <Image src={item.image} alt={`${item.title} (${item.year})`} fill className="object-cover" />
              <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-1 h-10 overflow-hidden">{item.title}</h3>
              {item.character && <p className="text-[10px] text-blue-600 font-black mb-1 truncate">as {item.character}</p>}
              <p className="text-[10px] text-gray-500 font-black uppercase">{item.year || 'TBA'}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
