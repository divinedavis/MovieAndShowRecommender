import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 3600;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

const PLATFORMS: Record<string, { id: string; label: string }> = {
  netflix: { id: '8', label: 'Netflix' },
  max: { id: '1899', label: 'Max' },
  disney: { id: '337', label: 'Disney+' },
  hulu: { id: '15', label: 'Hulu' },
  apple: { id: '350', label: 'Apple TV+' },
  prime: { id: '9', label: 'Amazon Prime' },
};

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface Props {
  params: Promise<{ platform: string; year: string; month: string }>;
}

async function fetchPlatformMonthMovies(platformId: string, year: string, month: string) {
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = `${year}-${month.padStart(2, '0')}-28`;
  const url = `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&with_watch_providers=${platformId}&watch_region=US&sort_by=popularity.desc&page=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id,
    title: m.title,
    image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
    rating: m.vote_average || 0,
    releaseDate: m.release_date || '',
  }));
}

export async function generateStaticParams() {
  const now = new Date();
  const params: { platform: string; year: string; month: string }[] = [];
  const platformKeys = Object.keys(PLATFORMS);
  for (let offset = 0; offset <= 2; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const year = String(d.getFullYear());
    const month = String(d.getMonth() + 1);
    for (const platform of platformKeys) {
      params.push({ platform, year, month });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { platform, year, month } = await params;
  const p = PLATFORMS[platform] || { label: platform };
  const monthName = MONTH_NAMES[parseInt(month) - 1] || month;
  const baseUrl = 'https://movies.unittap.com';
  return {
    title: `New on ${p.label} ${monthName} ${year} - Movies & Shows`,
    description: `Discover all new movies and shows coming to ${p.label} in ${monthName} ${year}. Updated daily with the latest additions, trailers, and release dates.`,
    keywords: [`new on ${p.label} ${monthName} ${year}`, `${p.label} new releases ${monthName}`, `${p.label} movies ${monthName} ${year}`],
    alternates: { canonical: `${baseUrl}/new-on/${platform}/${year}/${month}` },
    openGraph: {
      title: `New on ${p.label} ${monthName} ${year} | UnitTap Movies`,
      description: `All new movies and shows on ${p.label} in ${monthName} ${year}.`,
      type: 'website',
    },
  };
}

export default async function NewOnPlatformPage({ params }: Props) {
  const { platform, year, month } = await params;
  const config = PLATFORMS[platform] || { id: '8', label: platform };
  const movies = await fetchPlatformMonthMovies(config.id, year, month);
  const monthName = MONTH_NAMES[parseInt(month) - 1] || month;
  const baseUrl = 'https://movies.unittap.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `New on ${config.label} ${monthName} ${year}`,
    description: `Movies and shows added to ${config.label} in ${monthName} ${year}.`,
    url: `${baseUrl}/new-on/${platform}/${year}/${month}`,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        url: `${baseUrl}/movie/${m.id}`,
        image: m.image,
        datePublished: m.releaseDate,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO HOME</Link>
        <h1 className="text-5xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">NEW ON {config.label.toUpperCase()}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">{monthName.toUpperCase()} {year}</p>
        <div className="flex gap-3 mt-6 flex-wrap">
          {Object.entries(PLATFORMS).map(([key, val]) => (
            <Link key={key} href={`/new-on/${key}/${year}/${month}`} className={`border-4 border-black px-4 py-2 font-black text-xs uppercase ${key === platform ? 'bg-blue-600 text-white' : 'bg-white hover:bg-yellow-400'} transition`}>
              {val.label}
            </Link>
          ))}
        </div>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      {movies.length === 0 ? (
        <p className="text-xl font-bold text-gray-500">No movies found for this period. Check back soon for updates.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {movies.filter((item: any) => item.image).map((item: any) => (
            <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                <Image src={item.image} alt={`${item.title}`} fill className="object-cover" />
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{item.releaseDate}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
