import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://movies.unittap.com';

export const revalidate = 86400;

interface Props {
  params: Promise<{ platform: string; genreId: string; year: string }>;
}

const PLATFORMS: Record<string, { name: string; providerId: string }> = {
  netflix: { name: 'Netflix', providerId: '8' },
  max: { name: 'Max', providerId: '1899' },
  disney: { name: 'Disney+', providerId: '337' },
};

const GENRES: Record<string, string> = {
  '28': 'Action', '35': 'Comedy', '18': 'Drama', '27': 'Horror', '878': 'Sci-Fi',
};

const PLATFORM_IDS = Object.keys(PLATFORMS);
const GENRE_IDS = Object.keys(GENRES);
const YEARS_LIST = ['2024', '2025', '2026'];

async function fetchTripleCombo(platformId: string, genreId: string, year: string) {
  const platform = PLATFORMS[platformId];
  if (!platform) return [];
  const params = new URLSearchParams({
    api_key: API_KEY!, language: 'en-US', with_watch_providers: platform.providerId,
    watch_region: 'US', with_genres: genreId, primary_release_year: year, sort_by: 'popularity.desc', page: '1',
  });
  const res = await fetch(`${TMDB_BASE_URL}/discover/movie?${params.toString()}`, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id, title: m.title, image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0, rating: m.vote_average || 0,
  }));
}

export async function generateStaticParams() {
  return PLATFORM_IDS.flatMap((platform) =>
    GENRE_IDS.flatMap((genreId) =>
      YEARS_LIST.map((year) => ({ platform, genreId, year }))
    )
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { platform, genreId, year } = await params;
  const platformName = PLATFORMS[platform]?.name || platform;
  const genreName = GENRES[genreId] || genreId;
  return {
    title: `Best ${genreName} Movies on ${platformName} (${year})`,
    description: `The best ${genreName.toLowerCase()} movies streaming on ${platformName} from ${year}. Find top-rated ${genreName.toLowerCase()} films available to watch now.`,
    keywords: [`${genreName.toLowerCase()} movies ${platformName.toLowerCase()} ${year}`, `best ${genreName.toLowerCase()} on ${platformName.toLowerCase()}`, `${platformName.toLowerCase()} ${genreName.toLowerCase()} ${year}`],
    alternates: { canonical: `${BASE_URL}/streaming/best/${platform}/${genreId}/${year}` },
    openGraph: { title: `Best ${genreName} on ${platformName} (${year}) | UnitTap Movies`, description: `Top ${genreName} movies on ${platformName} from ${year}.`, type: 'website' },
  };
}

export default async function TripleComboPage({ params }: Props) {
  const { platform, genreId, year } = await params;
  const platformName = PLATFORMS[platform]?.name || platform;
  const genreName = GENRES[genreId] || genreId;
  const movies = await fetchTripleCombo(platform, genreId, year);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${genreName} Movies on ${platformName} (${year})`,
    url: `${BASE_URL}/streaming/best/${platform}/${genreId}/${year}`,
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
        <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase mb-4">BEST {genreName.toUpperCase()} ON {platformName.toUpperCase()} ({year})</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl">The top {genreName.toLowerCase()} movies streaming on {platformName} from {year}, ranked by popularity.</p>
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
