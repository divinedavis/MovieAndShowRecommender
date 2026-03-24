import Image from 'next/image';
import Link from 'next/link';
import { getMonthlyReleases } from '@/lib/tmdb';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ year: string; month: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, month } = await params;
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });
  return {
    title: `Movies Coming Out in ${monthName} ${year} - Release Dates & Trailers`,
    description: `The complete list of every movie release date for ${monthName} ${year}. Stay updated on what is coming to theaters and streaming.`
  };
}

export default async function CalendarPage({ params }: Props) {
  const { year, month } = await params;
  const movies = await getMonthlyReleases(year, month);
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO DISCOVERY</Link>
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">{monthName} {year}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">Upcoming Cinematic Releases</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {movies.map((item: any) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-blue-600 text-white border-2 border-black text-[10px] font-black px-2 py-1 italic">{item.releaseDate}</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">{monthName.toUpperCase()} RELEASE</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
