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

async function getMovieWithSimilar(id: string) {
  const [movie, similarData] = await Promise.all([
    fetchFromTMDB(`/movie/${id}`),
    fetchFromTMDB(`/movie/${id}/similar`),
  ]);
  const similar = similarData.results.slice(0, 20).map((m: any) => ({
    id: m.id,
    title: m.title,
    image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
    rating: m.vote_average || 0,
    description: m.overview,
  }));
  return {
    title: movie.title,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
    genres: movie.genres?.map((g: any) => g.name) || [],
    similar,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getMovieWithSimilar(id);
  return {
    title: `Movies Like ${data.title} - Similar Films to Watch`,
    description: `If you loved ${data.title} (${data.year}), here are 20 similar movies you should watch next. Find films with the same vibe, genre, and feel.`,
    keywords: [`movies like ${data.title}`, `similar to ${data.title}`, `films like ${data.title}`, `${data.title} alternatives`, ...data.genres.map((g: string) => `${g.toLowerCase()} movies`)],
    alternates: { canonical: `${BASE_URL}/like/${id}` },
    openGraph: {
      title: `Movies Like ${data.title} - Similar Films to Watch | UnitTap Movies`,
      description: `If you loved ${data.title}, here are 20 similar movies to watch next.`,
      type: 'website',
    },
  };
}

export default async function MoviesLikePage({ params }: Props) {
  const { id } = await params;
  const data = await getMovieWithSimilar(id);

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Movies Like ${data.title}`,
    description: `Similar movies to ${data.title}`,
    url: `${BASE_URL}/like/${id}`,
    numberOfItems: data.similar.length,
    itemListElement: data.similar.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        url: `${BASE_URL}/movie/${m.id}`,
        image: m.image,
        datePublished: m.year ? `${m.year}-01-01` : undefined,
        aggregateRating: m.rating ? { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' } : undefined,
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: data.title, item: `${BASE_URL}/movie/${id}` },
      { '@type': 'ListItem', position: 3, name: `Movies Like ${data.title}`, item: `${BASE_URL}/like/${id}` },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <header className="mb-20">
        <Link href={`/movie/${id}`} className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO {data.title.toUpperCase()}</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">MOVIES LIKE {data.title.toUpperCase()}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">SIMILAR FILMS TO WATCH</p>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl">
          If you loved <strong>{data.title}</strong> ({data.year}), here are {data.similar.length} similar movies you should watch next. These films share similar themes, genres ({data.genres.join(', ')}), and storytelling styles.
        </p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {data.similar.map((item: any, index: number) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              {item.image ? (
                <Image src={item.image} alt={`${item.title} (${item.year})`} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-black">NO IMAGE</div>
              )}
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
