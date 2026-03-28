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

async function getDirectorRanked(id: string) {
  const data = await fetchFromTMDB(`/person/${id}`, { append_to_response: 'movie_credits' });
  const directed = (data.movie_credits?.crew || [])
    .filter((m: any) => m.job === 'Director' && m.vote_count > 5)
    .sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0))
    .map((m: any) => ({
      id: m.id, title: m.title, image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      year: m.release_date ? new Date(m.release_date).getFullYear() : 0, rating: m.vote_average || 0,
    }));
  return {
    name: data.name,
    image: data.profile_path ? `https://image.tmdb.org/t/p/h632${data.profile_path}` : null,
    movies: directed,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getDirectorRanked(id);
  return {
    title: `${data.name}'s Movies Ranked from Best to Worst`,
    description: `Every movie directed by ${data.name}, ranked from highest to lowest rated. ${data.movies.length > 0 ? `Their highest-rated film is ${data.movies[0].title} at ${data.movies[0].rating.toFixed(1)}/10.` : ''}`,
    keywords: [`${data.name} movies ranked`, `${data.name} filmography`, `${data.name} best movies`, `${data.name} director`],
    alternates: { canonical: `${BASE_URL}/person/${id}/ranked` },
    openGraph: { title: `${data.name}'s Movies Ranked | UnitTap Movies`, description: `All ${data.name} directed films ranked by rating.`, type: 'website' },
  };
}

export default async function DirectorRankedPage({ params }: Props) {
  const { id } = await params;
  const data = await getDirectorRanked(id);
  const firstYear = data.movies.length > 0 ? Math.min(...data.movies.filter((m: any) => m.year > 0).map((m: any) => m.year)) : 0;
  const narrative = `${data.name} has directed ${data.movies.length} films${firstYear ? ` since ${firstYear}` : ''}. ${data.movies.length > 0 ? `Their highest-rated is ${data.movies[0].title} at ${data.movies[0].rating.toFixed(1)}/10${data.movies.length > 1 ? `, while their lowest-rated is ${data.movies[data.movies.length - 1].title} at ${data.movies[data.movies.length - 1].rating.toFixed(1)}/10` : ''}.` : ''}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${data.name}'s Movies Ranked`,
    description: narrative,
    url: `${BASE_URL}/person/${id}/ranked`,
    numberOfItems: data.movies.length,
    itemListElement: data.movies.map((m: any, i: number) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'Movie', name: m.title, url: `${BASE_URL}/movie/${m.id}`, image: m.image,
        aggregateRating: m.rating ? { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' } : undefined },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href={`/person/${id}`} className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO {data.name.toUpperCase()}</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">{data.name.toUpperCase()}&apos;S MOVIES RANKED</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">FROM BEST TO WORST</p>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl">{narrative}</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {data.movies.map((item: any, index: number) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              {item.image ? <Image src={item.image} alt={`${item.title} (${item.year})`} fill className="object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-black">NO IMAGE</div>}
              <div className="absolute top-2 left-2 bg-blue-600 text-white border-2 border-black text-[10px] font-black px-2 py-1">#{index + 1}</div>
              <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">{item.year || 'TBA'}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
