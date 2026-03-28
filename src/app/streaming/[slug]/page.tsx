import Image from 'next/image';
import Link from 'next/link';
import { getMediaData } from '@/lib/tmdb';
import { Metadata } from 'next';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const platform = slug.split('-').pop()?.toUpperCase() || 'Streaming';
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return {
    title: `New on ${platform} (${currentMonth}) - Full List of Movie & Show Additions`,
    description: `Every movie and TV show coming to ${platform} in ${currentMonth}. Stay updated with the latest streaming releases, trailers, and rankings.`,
    keywords: [`new on ${slug}`, `coming to ${platform}`, `${platform} ${currentMonth} releases`, `streaming schedule ${platform}`]
  };
}

export default async function StreamingHub({ params }: Props) {
  const { slug } = await params;
  const platform = slug.split('-').pop()?.toUpperCase() || 'Streaming';
  const { top2026Month } = await getMediaData(); // Using recent data as a proxy

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO HOME</Link>
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">NEW ON {platform}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">MARCH 2026 // LATEST ADDITIONS</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {top2026Month.map((item: any) => (
          <Link key={item.id} href={`/${item.type}/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              <Image src={item.image} alt={item.title} fill className="object-cover transition-transform group-hover:scale-110" />
              <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1 italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">NEW</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden group-hover:text-blue-600">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">{platform} ORIGINAL</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
