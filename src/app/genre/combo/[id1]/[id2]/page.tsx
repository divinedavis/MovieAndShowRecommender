import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://movies.unittap.com';

export const revalidate = 86400;

interface Props {
  params: Promise<{ id1: string; id2: string }>;
}

const GENRES: Record<string, string> = {
  '28': 'Action', '35': 'Comedy', '18': 'Drama', '27': 'Horror', '878': 'Sci-Fi',
  '53': 'Thriller', '10749': 'Romance',
};

const COMBOS = [
  { id1: '28', id2: '35' },   // action+comedy
  { id1: '27', id2: '35' },   // horror+comedy
  { id1: '878', id2: '53' },  // sci-fi+thriller
  { id1: '10749', id2: '35' }, // romance+comedy
  { id1: '18', id2: '53' },   // drama+thriller
  { id1: '28', id2: '878' },  // action+sci-fi
];

async function fetchGenreCombo(id1: string, id2: string) {
  const params = new URLSearchParams({
    api_key: API_KEY!, language: 'en-US', with_genres: `${id1},${id2}`,
    sort_by: 'popularity.desc', 'vote_count.gte': '100', page: '1',
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
  return COMBOS.map(({ id1, id2 }) => ({ id1, id2 }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id1, id2 } = await params;
  const g1 = GENRES[id1] || 'Genre';
  const g2 = GENRES[id2] || 'Genre';
  return {
    title: `Best ${g1} ${g2} Movies - Top ${g1}-${g2} Films`,
    description: `Discover the best movies that combine ${g1.toLowerCase()} and ${g2.toLowerCase()} genres. These ${g1.toLowerCase()}-${g2.toLowerCase()} films offer the perfect blend of both worlds.`,
    keywords: [`${g1.toLowerCase()} ${g2.toLowerCase()} movies`, `best ${g1.toLowerCase()} ${g2.toLowerCase()} films`, `${g1.toLowerCase()} ${g2.toLowerCase()} genre`, `${g1.toLowerCase()} meets ${g2.toLowerCase()}`],
    alternates: { canonical: `${BASE_URL}/genre/combo/${id1}/${id2}` },
    openGraph: { title: `Best ${g1} ${g2} Movies | UnitTap Movies`, description: `Top movies combining ${g1} and ${g2} genres.`, type: 'website' },
  };
}

export default async function GenreComboPage({ params }: Props) {
  const { id1, id2 } = await params;
  const g1 = GENRES[id1] || 'Genre';
  const g2 = GENRES[id2] || 'Genre';
  const movies = await fetchGenreCombo(id1, id2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${g1} ${g2} Movies`,
    url: `${BASE_URL}/genre/combo/${id1}/${id2}`,
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
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">BEST {g1.toUpperCase()} {g2.toUpperCase()} MOVIES</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">TOP {g1.toUpperCase()}-{g2.toUpperCase()} FILMS</p>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl">The best movies that combine {g1.toLowerCase()} and {g2.toLowerCase()} genres. These films deliver the perfect blend of {g1.toLowerCase()} and {g2.toLowerCase()} elements.</p>
        <div className="flex gap-3 mt-6 flex-wrap">
          {COMBOS.map(({ id1: cId1, id2: cId2 }) => (
            <Link key={`${cId1}-${cId2}`} href={`/genre/combo/${cId1}/${cId2}`} className={`border-4 border-black px-4 py-2 font-black text-sm uppercase ${cId1 === id1 && cId2 === id2 ? 'bg-blue-600 text-white' : 'bg-white hover:bg-yellow-400'} transition`}>
              {GENRES[cId1]}/{GENRES[cId2]}
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
