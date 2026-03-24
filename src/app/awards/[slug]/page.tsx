import Image from 'next/image';
import Link from 'next/link';
import { getAwardCeremonyData } from '@/lib/tmdb';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AwardCeremonyPage({ params }: Props) {
  const { slug } = await params;
  const data = await getAwardCeremonyData(slug);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-10">
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO HOME</Link>
        <h1 className="text-7xl font-black italic tracking-tighter uppercase mb-4">{data.name}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">{data.year} CEREMONY // BEST PICTURE NOMINEES & WINNER</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {data.nominees.map((n: any) => (
          <Link key={n.id} href={`/movie/${n.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative h-80 w-full border-b-4 border-black">
              <Image src={n.image} alt={n.title} fill className="object-cover" />
              {n.isWinner && (
                <div className="absolute inset-0 border-8 border-yellow-400 flex items-center justify-center bg-yellow-400/20">
                    <span className="bg-yellow-400 text-black font-black text-xs px-4 py-2 uppercase italic border-2 border-black">WINNER</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-black uppercase text-lg leading-none mb-3">{n.title}</h3>
              <p className="text-xs text-gray-500 font-black uppercase">{n.year} RELEASE</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
