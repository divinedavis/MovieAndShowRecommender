import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 3600;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

const DECADES = ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

const DECADE_RANGES: Record<string, { gte: string; lte: string }> = {
  '1970s': { gte: '1970-01-01', lte: '1979-12-31' },
  '1980s': { gte: '1980-01-01', lte: '1989-12-31' },
  '1990s': { gte: '1990-01-01', lte: '1999-12-31' },
  '2000s': { gte: '2000-01-01', lte: '2009-12-31' },
  '2010s': { gte: '2010-01-01', lte: '2019-12-31' },
  '2020s': { gte: '2020-01-01', lte: '2029-12-31' },
};

interface Props {
  params: Promise<{ decade: string }>;
}

async function fetchDecadeMovies(decade: string) {
  const range = DECADE_RANGES[decade];
  if (!range) return [];
  const url = `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&primary_release_date.gte=${range.gte}&primary_release_date.lte=${range.lte}&sort_by=vote_average.desc&vote_count.gte=500&page=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id,
    title: m.title,
    image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
    year: new Date(m.release_date).getFullYear(),
    rating: m.vote_average || 0,
    description: m.overview,
  }));
}

export async function generateStaticParams() {
  return DECADES.map((decade) => ({ decade }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { decade } = await params;
  const baseUrl = 'https://movies.unittap.com';
  return {
    title: `Best Movies of the ${decade} - Top Films`,
    description: `Discover the highest-rated movies of the ${decade}. From beloved classics to hidden gems, explore the top films that defined the ${decade} decade.`,
    keywords: [`best movies ${decade}`, `top films ${decade}`, `${decade} movies ranked`, `greatest movies of the ${decade}`],
    alternates: { canonical: `${baseUrl}/best/decade/${decade}` },
    openGraph: {
      title: `Best Movies of the ${decade} - Top Films | UnitTap Movies`,
      description: `The highest-rated movies of the ${decade}, ranked by audience ratings.`,
      type: 'website',
    },
  };
}

export default async function DecadePage({ params }: Props) {
  const { decade } = await params;
  const movies = await fetchDecadeMovies(decade);
  const baseUrl = 'https://movies.unittap.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Movies of the ${decade}`,
    description: `Top-rated movies from the ${decade} decade.`,
    url: `${baseUrl}/best/decade/${decade}`,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        url: `${baseUrl}/movie/${m.id}`,
        image: m.image,
        datePublished: `${m.year}-01-01`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: m.rating,
          bestRating: '10',
        },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO HOME</Link>
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">BEST OF THE {decade.toUpperCase()}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">TOP RATED FILMS OF THE DECADE</p>
        <div className="flex gap-3 mt-6 flex-wrap">
          {DECADES.map((d) => (
            <Link key={d} href={`/best/decade/${d}`} className={`border-4 border-black px-4 py-2 font-black text-sm uppercase ${d === decade ? 'bg-blue-600 text-white' : 'bg-white hover:bg-yellow-400'} transition`}>
              {d}
            </Link>
          ))}
        </div>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {movies.map((item: any, index: number) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              <Image src={item.image} alt={`${item.title} (${item.year})`} fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-blue-600 text-white border-2 border-black text-[10px] font-black px-2 py-1">#{index + 1}</div>
              <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">{item.year}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
