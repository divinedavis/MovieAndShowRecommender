import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://movies.unittap.com';

export const revalidate = 86400;

interface Props {
  params: Promise<{ season: string }>;
}

const SEASON_CONFIG: Record<string, { title: string; description: string; genres?: string; keywords?: string; sortBy: string; extraParams?: Record<string, string> }> = {
  christmas: {
    title: 'Best Christmas Movies of All Time',
    description: 'Discover the greatest Christmas movies ever made. From heartwarming classics to modern holiday favorites, find the perfect film for the festive season.',
    keywords: '207317',
    sortBy: 'popularity.desc',
  },
  summer: {
    title: 'Best Summer Blockbusters',
    description: 'The biggest and best summer blockbuster movies. Action-packed adventures and thrilling spectacles perfect for the summer season.',
    genres: '28,12',
    sortBy: 'revenue.desc',
    extraParams: { 'vote_count.gte': '500' },
  },
  halloween: {
    title: 'Best Halloween Horror Movies',
    description: 'The scariest Halloween horror movies to watch. From terrifying classics to modern nightmare fuel, get ready for fright night.',
    genres: '27',
    sortBy: 'popularity.desc',
  },
  valentines: {
    title: 'Best Valentine\'s Day Romance Movies',
    description: 'The most romantic movies for Valentine\'s Day. Swoon-worthy love stories and heartfelt romances for date night.',
    genres: '10749',
    sortBy: 'popularity.desc',
  },
  thanksgiving: {
    title: 'Best Thanksgiving Family Movies',
    description: 'The best family-friendly movies for Thanksgiving. Heartwarming dramas and feel-good films the whole family can enjoy together.',
    genres: '18,10751',
    sortBy: 'popularity.desc',
  },
};

const SEASONS = Object.keys(SEASON_CONFIG);

async function fetchSeasonalMovies(season: string) {
  const config = SEASON_CONFIG[season];
  if (!config) return [];
  const params = new URLSearchParams({
    api_key: API_KEY!,
    language: 'en-US',
    sort_by: config.sortBy,
    'vote_count.gte': '100',
    page: '1',
  });
  if (config.genres) params.append('with_genres', config.genres);
  if (config.keywords) params.append('with_keywords', config.keywords);
  if (config.extraParams) Object.entries(config.extraParams).forEach(([k, v]) => params.set(k, v));
  const res = await fetch(`${TMDB_BASE_URL}/discover/movie?${params.toString()}`, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id, title: m.title, image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0, rating: m.vote_average || 0,
  }));
}

export async function generateStaticParams() {
  return SEASONS.map((season) => ({ season }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { season } = await params;
  const config = SEASON_CONFIG[season];
  if (!config) return { title: 'Seasonal Movies' };
  return {
    title: config.title,
    description: config.description,
    keywords: [config.title.toLowerCase(), `${season} movies`, `best ${season} films`, `${season} movie list`],
    alternates: { canonical: `${BASE_URL}/lists/seasonal/${season}` },
    openGraph: { title: `${config.title} | UnitTap Movies`, description: config.description, type: 'website' },
  };
}

export default async function SeasonalPage({ params }: Props) {
  const { season } = await params;
  const config = SEASON_CONFIG[season];
  if (!config) return <div>Not found</div>;
  const movies = await fetchSeasonalMovies(season);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: config.title,
    description: config.description,
    url: `${BASE_URL}/lists/seasonal/${season}`,
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
          {SEASONS.map((s) => (
            <Link key={s} href={`/lists/seasonal/${s}`} className={`border-4 border-black px-4 py-2 font-black text-sm uppercase ${s === season ? 'bg-blue-600 text-white' : 'bg-white hover:bg-yellow-400'} transition`}>
              {s}
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
