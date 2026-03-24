import Image from 'next/image';
import Link from 'next/link';
import { getPlatformGenreData } from '@/lib/tmdb';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ platform: string; month: string }>;
}

const PLATFORM_MAP: Record<string, string> = { 'netflix': '8', 'max': '1899', 'disney': '337', 'amazon': '9', 'apple': '2' };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { platform, month } = await params;
  const pName = platform.charAt(0).toUpperCase() + platform.slice(1);
  return {
    title: `Best on ${pName} March 2026 - Top Movies & Shows to Stream`,
    description: `The ultimate guide to what's new and best on ${pName} for March 2026. Updated daily rankings and hidden gems.`
  };
}

export default async function MonthlyPlatformPage({ params }: Props) {
  const { platform, month } = await params;
  const platformId = PLATFORM_MAP[platform] || '8';
  // Use Action as default for monthly roundup
  const movies = await getPlatformGenreData(platformId, '28');

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO HOME</Link>
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">BEST ON {platform}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">MARCH 2026 // NEW & TOP RATED</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {movies.map((item: any) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative h-72 w-full border-b-4 border-black">
              <Image src={item.image} alt={`Poster for ${item.title}`} fill className="object-cover" />
              <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">MARCH // {platform.toUpperCase()}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
