import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://movies.unittap.com';

export const revalidate = 86400;

interface Props {
  params: Promise<{ year: string }>;
}

const YEARS = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];

async function fetchBoxOffice(year: string) {
  const params = new URLSearchParams({
    api_key: API_KEY!, language: 'en-US', primary_release_year: year,
    sort_by: 'revenue.desc', 'vote_count.gte': '10', page: '1',
  });
  const res = await fetch(`${TMDB_BASE_URL}/discover/movie?${params.toString()}`, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data = await res.json();
  // Fetch details for revenue data
  const movieIds = data.results.slice(0, 20).map((m: any) => m.id);
  const details = await Promise.all(
    movieIds.map(async (id: number) => {
      const detailRes = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`, { next: { revalidate: 86400 } });
      if (!detailRes.ok) return null;
      return detailRes.json();
    })
  );
  return details.filter(Boolean).map((m: any) => ({
    id: m.id, title: m.title, image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0, rating: m.vote_average || 0,
    revenue: m.revenue || 0,
  }));
}

function formatRevenue(revenue: number): string {
  if (revenue >= 1_000_000_000) return `$${(revenue / 1_000_000_000).toFixed(1)}B`;
  if (revenue >= 1_000_000) return `$${(revenue / 1_000_000).toFixed(0)}M`;
  if (revenue > 0) return `$${revenue.toLocaleString()}`;
  return 'N/A';
}

export async function generateStaticParams() {
  return YEARS.map((year) => ({ year }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `Highest Grossing Movies of ${year} - Box Office Rankings`,
    description: `The highest grossing movies of ${year} ranked by worldwide box office revenue. See which films dominated the box office in ${year}.`,
    keywords: [`highest grossing movies ${year}`, `${year} box office`, `top earning movies ${year}`, `box office rankings ${year}`],
    alternates: { canonical: `${BASE_URL}/box-office/${year}` },
    openGraph: { title: `Highest Grossing Movies of ${year} | UnitTap Movies`, description: `Box office rankings for ${year}.`, type: 'website' },
  };
}

export default async function BoxOfficePage({ params }: Props) {
  const { year } = await params;
  const movies = await fetchBoxOffice(year);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Highest Grossing Movies of ${year}`,
    url: `${BASE_URL}/box-office/${year}`,
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'Movie', name: m.title, url: `${BASE_URL}/movie/${m.id}`, image: m.image,
        description: `Box office: ${formatRevenue(m.revenue)}`,
        aggregateRating: m.rating ? { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' } : undefined },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">BOX OFFICE {year}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">HIGHEST GROSSING MOVIES</p>
        <div className="flex gap-3 mt-6 flex-wrap">
          {YEARS.map((y) => (
            <Link key={y} href={`/box-office/${y}`} className={`border-4 border-black px-4 py-2 font-black text-sm uppercase ${y === year ? 'bg-blue-600 text-white' : 'bg-white hover:bg-yellow-400'} transition`}>
              {y}
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
              <div className="absolute top-2 right-2 bg-green-500 border-2 border-black text-[10px] font-black px-2 py-1">{formatRevenue(item.revenue)}</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
              <div className="flex justify-between">
                <p className="text-[10px] text-gray-500 font-black uppercase">{item.year || 'TBA'}</p>
                <p className="text-[10px] text-gray-500 font-black">{item.rating.toFixed(1)}/10</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
