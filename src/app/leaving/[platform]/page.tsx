import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://movies.unittap.com';

export const revalidate = 43200; // 12 hours

interface Props {
  params: Promise<{ platform: string }>;
}

const PLATFORM_CONFIG: Record<string, { name: string; providerId: string }> = {
  netflix: { name: 'Netflix', providerId: '8' },
  max: { name: 'Max', providerId: '1899' },
  disney: { name: 'Disney+', providerId: '337' },
  hulu: { name: 'Hulu', providerId: '15' },
  prime: { name: 'Amazon Prime Video', providerId: '9' },
  apple: { name: 'Apple TV+', providerId: '350' },
};

const PLATFORMS = Object.keys(PLATFORM_CONFIG);

async function fetchLeavingSoon(platform: string) {
  const config = PLATFORM_CONFIG[platform];
  if (!config) return [];
  const params = new URLSearchParams({
    api_key: API_KEY!,
    language: 'en-US',
    with_watch_providers: config.providerId,
    watch_region: 'US',
    sort_by: 'release_date.asc',
    'vote_count.gte': '50',
    page: '1',
  });
  const res = await fetch(`${TMDB_BASE_URL}/discover/movie?${params.toString()}`, { next: { revalidate: 43200 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id, title: m.title, image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0, rating: m.vote_average || 0,
  }));
}

export async function generateStaticParams() {
  return PLATFORMS.map((platform) => ({ platform }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { platform } = await params;
  const config = PLATFORM_CONFIG[platform];
  if (!config) return { title: 'Leaving Soon' };
  return {
    title: `Movies Leaving ${config.name} Soon - Watch Before They're Gone`,
    description: `These movies may be leaving ${config.name} soon. Watch them before they disappear from the platform. Don't miss these films while they're still available to stream.`,
    keywords: [`leaving ${config.name.toLowerCase()} soon`, `${config.name.toLowerCase()} expiring movies`, `movies leaving ${config.name.toLowerCase()}`, `last chance ${config.name.toLowerCase()}`],
    alternates: { canonical: `${BASE_URL}/leaving/${platform}` },
    openGraph: { title: `Movies Leaving ${config.name} Soon | UnitTap Movies`, description: `Watch these movies before they leave ${config.name}.`, type: 'website' },
  };
}

export default async function LeavingSoonPage({ params }: Props) {
  const { platform } = await params;
  const config = PLATFORM_CONFIG[platform];
  if (!config) return <div>Not found</div>;
  const movies = await fetchLeavingSoon(platform);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Movies Leaving ${config.name} Soon`,
    description: `Movies that may be leaving ${config.name} soon.`,
    url: `${BASE_URL}/leaving/${platform}`,
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
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">LEAVING {config.name.toUpperCase()} SOON</h1>
        <p className="text-2xl font-black text-red-600 uppercase italic">WATCH BEFORE THEY&apos;RE GONE</p>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl">These movies may be leaving {config.name} soon based on their catalog age. Watch them while you still can.</p>
        <div className="flex gap-3 mt-6 flex-wrap">
          {PLATFORMS.map((p) => (
            <Link key={p} href={`/leaving/${p}`} className={`border-4 border-black px-4 py-2 font-black text-sm uppercase ${p === platform ? 'bg-red-600 text-white' : 'bg-white hover:bg-yellow-400'} transition`}>
              {PLATFORM_CONFIG[p].name}
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
              <div className="absolute top-2 left-2 bg-red-600 text-white border-2 border-black text-[10px] font-black px-2 py-1">#{index + 1}</div>
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
