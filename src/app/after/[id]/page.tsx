import Image from 'next/image';
import Link from 'next/link';
import { getMediaDetails } from '@/lib/tmdb';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const details = await getMediaDetails(id, 'movie');
  return {
    title: `Movies Like ${details.title} - What to Watch After Finished`,
    description: `Just finished ${details.title}? Here are the best similar movies and shows you'll love next. Updated March 2026 rankings.`
  };
}

export default async function AfterPage({ params }: Props) {
  const { id } = await params;
  const details = await getMediaDetails(id, 'movie');

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <header className="mb-20 text-center">
        <Link href={`/movie/${id}`} className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO ${details.title.toUpperCase()}</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-6">WHAT TO WATCH AFTER <span className="text-blue-600">{details.title}</span></h1>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 max-w-7xl mx-auto">
        {details.similar.map((item: any) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              <Image src={item.image} alt={`Poster for ${item.title}`} fill className="object-cover" />
              <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)} IMDB</div>
            </div>
            <div className="p-5">
              <h3 className="font-black uppercase text-lg leading-tight mb-2 h-14 overflow-hidden">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">{item.year} // SIMILAR VIBE</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
