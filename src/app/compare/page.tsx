import Image from 'next/image';
import Link from 'next/link';
import { getMediaDetails } from '@/lib/tmdb';
import { Metadata } from 'next';

interface Props {
  searchParams: Promise<{ id1?: string, id2?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { id1, id2 } = await searchParams;
  if (!id1 || !id2) return { title: 'Compare Movies' };
  
  const [m1, m2] = await Promise.all([
    getMediaDetails(id1, 'movie'),
    getMediaDetails(id2, 'movie')
  ]);
  
  return {
    title: `${m1.title} vs ${m2.title} Comparison - Ratings, Cast & Runtime`,
    description: `Which is better, ${m1.title} or ${m2.title}? Compare ratings, runtime, cast, and where to stream both movies in our 2026 head-to-head comparison.`
  };
}

export default async function ComparePage({ searchParams }: Props) {
  const { id1, id2 } = await searchParams;
  
  if (!id1 || !id2) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-10">
        <div className="text-center">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-8">Movie VS Movie</h1>
            <p className="text-xl font-bold text-gray-400 mb-8 uppercase">Select two movies to compare their stats.</p>
            <Link href="/" className="bg-blue-600 text-white px-8 py-4 font-black uppercase italic border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">Browse Movies</Link>
        </div>
      </main>
    );
  }

  const [m1, m2] = await Promise.all([
    getMediaDetails(id1, 'movie'),
    getMediaDetails(id2, 'movie')
  ]);

  const stats = [
    { label: 'RATING', v1: m1.rating.toFixed(1), v2: m2.rating.toFixed(1) },
    { label: 'YEAR', v1: m1.year, v2: m2.year },
    { label: 'RUNTIME', v1: `${m1.runtime}m`, v2: `${m2.runtime}m` },
    { label: 'GENRES', v1: m1.genres[0], v2: m2.genres[0] },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10 font-sans">
      <header className="mb-20 text-center">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-8 inline-block">← BACK TO DISCOVERY</Link>
        <div className="flex items-center justify-center gap-4 md:gap-12 flex-col md:flex-row">
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter">{m1.title}</h1>
            <span className="text-7xl md:text-9xl font-black text-blue-600 italic">VS</span>
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter">{m2.title}</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 items-start">
        <div className="bg-white border-8 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] rounded-3xl overflow-hidden">
            <div className="relative aspect-[2/3]">
                <Image src={m1.image} alt={m1.title} fill className="object-cover" />
            </div>
            <div className="p-8">
                <Link href={`/movie/${m1.id}`} className="w-full bg-black text-white py-4 font-black uppercase italic text-center block">View Profile</Link>
            </div>
        </div>

        <div className="space-y-6">
            {stats.map(s => (
                <div key={s.label} className="text-center">
                    <p className="text-xs font-black tracking-widest text-blue-600 mb-2">{s.label}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-100 p-4 border-2 border-black font-black text-xl italic">{s.v1}</div>
                        <div className="bg-gray-100 p-4 border-2 border-black font-black text-xl italic">{s.v2}</div>
                    </div>
                </div>
            ))}
            <div className="mt-12 p-8 bg-yellow-400 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
                <h3 className="font-black italic uppercase text-2xl mb-2">Verdict</h3>
                <p className="font-bold uppercase text-xs">Based on IMDB & Meta Data</p>
                <div className="text-4xl font-black italic mt-4 uppercase underline decoration-black underline-offset-8">
                    {m1.rating > m2.rating ? m1.title : m2.title} WINS
                </div>
            </div>
        </div>

        <div className="bg-white border-8 border-black shadow-[-15px_15px_0px_0px_rgba(0,0,0,1)] rounded-3xl overflow-hidden">
            <div className="relative aspect-[2/3]">
                <Image src={m2.image} alt={m2.title} fill className="object-cover" />
            </div>
            <div className="p-8">
                <Link href={`/movie/${m2.id}`} className="w-full bg-black text-white py-4 font-black uppercase italic text-center block">View Profile</Link>
            </div>
        </div>
      </div>
    </main>
  );
}
