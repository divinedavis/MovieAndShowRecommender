import Image from 'next/image';
import Link from 'next/link';
import { getPersonBest } from '@/lib/tmdb';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const details = await getPersonBest(id);
  return {
    title: `Best ${details.name} Movies Ranked - Top 10 Career Highlights`,
    description: `The ultimate ranking of ${details.name}'s movies. From critically acclaimed hits to box office blockbusters, see where your favorite ranks.`
  };
}

export default async function PersonBestPage({ params }: Props) {
  const { id } = await params;
  const details = await getPersonBest(id);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <header className="mb-20">
        <Link href={`/person/${id}`} className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO PROFILE</Link>
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">BEST OF {details.name}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">CAREER RANKINGS BY IMDB RATING</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {details.best.map((item: any, index: number) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative h-80 w-full border-b-4 border-black">
              <Image src={item.image} alt={`Poster for ${item.title}`} fill className="object-cover" />
              <div className="absolute top-4 left-4 bg-blue-600 text-white font-black italic border-2 border-black px-3 py-1">#{index + 1}</div>
              <div className="absolute top-4 right-4 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)} IMDB</div>
            </div>
            <div className="p-5">
              <h3 className="font-black uppercase text-lg leading-tight mb-2 h-14 overflow-hidden">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">{item.year} // RANKED</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
