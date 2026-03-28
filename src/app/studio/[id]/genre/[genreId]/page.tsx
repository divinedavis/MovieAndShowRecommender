import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://movies.unittap.com';

export const revalidate = 86400;

interface Props {
  params: Promise<{ id: string; genreId: string }>;
}

const STUDIOS: Record<string, string> = {
  '2': 'Disney', '174': 'Warner Bros', '33': 'Universal', '4': 'Paramount', '34': 'Sony Pictures', '41077': 'A24',
};

const GENRES: Record<string, string> = {
  '28': 'Action', '35': 'Comedy', '18': 'Drama', '27': 'Horror', '878': 'Sci-Fi', '53': 'Thriller', '10749': 'Romance', '16': 'Animation',
};

const STUDIO_IDS = Object.keys(STUDIOS);
const GENRE_IDS = Object.keys(GENRES);

async function fetchStudioGenreMovies(studioId: string, genreId: string) {
  const params = new URLSearchParams({
    api_key: API_KEY!, language: 'en-US', with_companies: studioId, with_genres: genreId, sort_by: 'popularity.desc', 'vote_count.gte': '50', page: '1',
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
  return STUDIO_IDS.flatMap((id) => GENRE_IDS.map((genreId) => ({ id, genreId })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, genreId } = await params;
  const studioName = STUDIOS[id] || 'Studio';
  const genreName = GENRES[genreId] || 'Genre';
  return {
    title: `Best ${genreName} Movies from ${studioName}`,
    description: `Discover the best ${genreName.toLowerCase()} movies produced by ${studioName}. Top-rated ${genreName.toLowerCase()} films from one of Hollywood's most iconic studios.`,
    keywords: [`${studioName} ${genreName.toLowerCase()} movies`, `best ${studioName} ${genreName.toLowerCase()}`, `${studioName} films`, `${genreName.toLowerCase()} movies`],
    alternates: { canonical: `${BASE_URL}/studio/${id}/genre/${genreId}` },
    openGraph: { title: `Best ${genreName} Movies from ${studioName} | UnitTap Movies`, description: `Top ${genreName} films from ${studioName}.`, type: 'website' },
  };
}

export default async function StudioGenrePage({ params }: Props) {
  const { id, genreId } = await params;
  const studioName = STUDIOS[id] || 'Studio';
  const genreName = GENRES[genreId] || 'Genre';
  const movies = await fetchStudioGenreMovies(id, genreId);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${genreName} Movies from ${studioName}`,
    url: `${BASE_URL}/studio/${id}/genre/${genreId}`,
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
        <Link href={`/studio/${id}`} className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO {studioName.toUpperCase()}</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">BEST {genreName.toUpperCase()} FROM {studioName.toUpperCase()}</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl">The top {genreName.toLowerCase()} movies produced by {studioName}, ranked by popularity.</p>
        <div className="flex gap-3 mt-6 flex-wrap">
          {GENRE_IDS.map((gId) => (
            <Link key={gId} href={`/studio/${id}/genre/${gId}`} className={`border-4 border-black px-4 py-2 font-black text-sm uppercase ${gId === genreId ? 'bg-blue-600 text-white' : 'bg-white hover:bg-yellow-400'} transition`}>
              {GENRES[gId]}
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
