import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://movies.unittap.com';

export const revalidate = 3600;

interface Props {
  params: Promise<{ country: string }>;
}

const COUNTRIES: Record<string, string> = {
  us: 'United States', gb: 'United Kingdom', fr: 'France', de: 'Germany', kr: 'South Korea',
  jp: 'Japan', in: 'India', br: 'Brazil', es: 'Spain', it: 'Italy', mx: 'Mexico', au: 'Australia',
};

const COUNTRY_CODES = Object.keys(COUNTRIES);

async function fetchTrendingByCountry(country: string) {
  const region = country.toUpperCase();
  const url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US&region=${region}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id, title: m.title, image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0, rating: m.vote_average || 0,
  }));
}

export async function generateStaticParams() {
  return COUNTRY_CODES.map((country) => ({ country }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const name = COUNTRIES[country] || country;
  return {
    title: `Trending Movies in ${name} Right Now`,
    description: `See what movies are trending in ${name} this week. The most popular films audiences in ${name} are watching right now.`,
    keywords: [`trending movies ${name}`, `popular movies ${name}`, `${name} box office`, `what to watch in ${name}`],
    alternates: { canonical: `${BASE_URL}/trending/${country}` },
    openGraph: { title: `Trending Movies in ${name} | UnitTap Movies`, description: `This week's trending movies in ${name}.`, type: 'website' },
  };
}

export default async function TrendingCountryPage({ params }: Props) {
  const { country } = await params;
  const name = COUNTRIES[country] || country;
  const movies = await fetchTrendingByCountry(country);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Trending Movies in ${name}`,
    url: `${BASE_URL}/trending/${country}`,
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'Movie', name: m.title, url: `${BASE_URL}/movie/${m.id}`, image: m.image },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">TRENDING IN {name.toUpperCase()}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">THIS WEEK&apos;S MOST POPULAR MOVIES</p>
        <div className="flex gap-3 mt-6 flex-wrap">
          {COUNTRY_CODES.map((c) => (
            <Link key={c} href={`/trending/${c}`} className={`border-4 border-black px-4 py-2 font-black text-sm uppercase ${c === country ? 'bg-blue-600 text-white' : 'bg-white hover:bg-yellow-400'} transition`}>
              {c.toUpperCase()}
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
