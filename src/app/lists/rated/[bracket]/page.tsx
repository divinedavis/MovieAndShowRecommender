import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://movies.unittap.com';

export const revalidate = 86400;

interface Props {
  params: Promise<{ bracket: string }>;
}

const BRACKET_CONFIG: Record<string, { title: string; description: string; params: Record<string, string> }> = {
  masterpieces: {
    title: 'Masterpiece Movies Rated 8.5+ on IMDB',
    description: 'The highest-rated masterpiece movies scoring 8.5 or above. These are the greatest films ever made according to audience ratings.',
    params: { 'vote_average.gte': '8.5', 'vote_count.gte': '1000', sort_by: 'vote_average.desc' },
  },
  'hidden-gems': {
    title: 'Hidden Gem Movies You Missed',
    description: 'Discover hidden gem movies rated 7.0-8.0 that flew under the radar. Critically acclaimed films with smaller audiences that deserve more attention.',
    params: { 'vote_average.gte': '7.0', 'vote_average.lte': '8.0', 'vote_count.gte': '100', 'vote_count.lte': '1000', sort_by: 'vote_average.desc' },
  },
  'crowd-pleasers': {
    title: 'Most Popular Crowd-Pleaser Movies',
    description: 'The most popular crowd-pleaser movies loved by millions. These highly-rated films have massive audience appeal and widespread acclaim.',
    params: { 'vote_average.gte': '7.5', 'vote_count.gte': '5000', sort_by: 'popularity.desc' },
  },
  'cult-classics': {
    title: 'Cult Classic Movies',
    description: 'The best cult classic movies from before 2000. These beloved films have dedicated fan followings and enduring cultural impact.',
    params: { 'vote_average.gte': '6.5', 'vote_count.gte': '200', 'vote_count.lte': '2000', 'primary_release_date.lte': '1999-12-31', sort_by: 'vote_average.desc' },
  },
};

const BRACKETS = Object.keys(BRACKET_CONFIG);

async function fetchBracketMovies(bracket: string) {
  const config = BRACKET_CONFIG[bracket];
  if (!config) return [];
  const params = new URLSearchParams({ api_key: API_KEY!, language: 'en-US', page: '1', ...config.params });
  const res = await fetch(`${TMDB_BASE_URL}/discover/movie?${params.toString()}`, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id, title: m.title, image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0, rating: m.vote_average || 0,
  }));
}

export async function generateStaticParams() {
  return BRACKETS.map((bracket) => ({ bracket }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bracket } = await params;
  const config = BRACKET_CONFIG[bracket];
  if (!config) return { title: 'Movie Ratings' };
  return {
    title: config.title,
    description: config.description,
    keywords: [config.title.toLowerCase(), `${bracket.replace(/-/g, ' ')} movies`, 'top rated movies', 'best movies by rating'],
    alternates: { canonical: `${BASE_URL}/lists/rated/${bracket}` },
    openGraph: { title: `${config.title} | UnitTap Movies`, description: config.description, type: 'website' },
  };
}

export default async function RatingBracketPage({ params }: Props) {
  const { bracket } = await params;
  const config = BRACKET_CONFIG[bracket];
  if (!config) return <div>Not found</div>;
  const movies = await fetchBracketMovies(bracket);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: config.title,
    description: config.description,
    url: `${BASE_URL}/lists/rated/${bracket}`,
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'Movie', name: m.title, url: `${BASE_URL}/movie/${m.id}`, image: m.image,
        aggregateRating: m.rating ? { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' } : undefined },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">{config.title.toUpperCase()}</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl">{config.description}</p>
        <div className="flex gap-3 mt-6 flex-wrap">
          {BRACKETS.map((b) => (
            <Link key={b} href={`/lists/rated/${b}`} className={`border-4 border-black px-4 py-2 font-black text-sm uppercase ${b === bracket ? 'bg-blue-600 text-white' : 'bg-white hover:bg-yellow-400'} transition`}>
              {b.replace(/-/g, ' ')}
            </Link>
          ))}
        </div>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {movies.map((item: any, index: number) => (
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
