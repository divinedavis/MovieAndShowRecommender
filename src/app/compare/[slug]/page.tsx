import Image from 'next/image';
import Link from 'next/link';
import { getMediaDetails } from '@/lib/tmdb';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [id1, id2] = slug.split('-vs-');
  const [m1, m2] = await Promise.all([getMediaDetails(id1, 'movie'), getMediaDetails(id2, 'movie')]);
  return {
    title: `${m1.title} vs ${m2.title} - Which is Better? Comparison & Ratings`,
    description: `A detailed comparison between ${m1.title} and ${m2.title}. Compare IMDB ratings, box office, cast, and where to stream.`
  };
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const [id1, id2] = slug.split('-vs-');
  const [m1, m2] = await Promise.all([getMediaDetails(id1, 'movie'), getMediaDetails(id2, 'movie')]);

  const stats = [
    { label: 'IMDB RATING', v1: m1.rating.toFixed(1), v2: m2.rating.toFixed(1) },
    { label: 'RELEASE YEAR', v1: m1.year, v2: m2.year },
    { label: 'RUNTIME', v1: `${m1.runtime} MINS`, v2: `${m2.runtime} MINS` },
    { label: 'GENRES', v1: m1.genres[0], v2: m2.genres[0] }
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <header className="mb-20 text-center">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4">← BACK TO DISCOVERY</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-6">{m1.title} <span className="text-blue-600">VS</span> {m2.title}</h1>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 items-stretch justify-center max-w-7xl mx-auto">
        <div className="lg:w-1/3 bg-white border-8 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] rounded-[40px] overflow-hidden">
          <div className="relative h-[500px]">
            <Image src={m1.image} alt={m1.title} fill className="object-cover" />
          </div>
          <div className="p-8 text-center">
            <h2 className="text-3xl font-black uppercase italic">{m1.title}</h2>
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col justify-center gap-8 py-12">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{s.label}</p>
              <div className="flex items-center justify-between gap-4">
                <span className="text-3xl font-black italic w-1/2 text-right">{s.v1}</span>
                <span className="w-px h-10 bg-gray-200"></span>
                <span className="text-3xl font-black italic w-1/2 text-left">{s.v2}</span>
              </div>
            </div>
          ))}
          <div className="mt-8 space-y-4">
            <Link href={`/movie/${m1.id}`} className="block w-full bg-black text-white py-4 rounded-xl font-black uppercase italic hover:bg-blue-600 transition text-center">WATCH {m1.title}</Link>
            <Link href={`/movie/${m2.id}`} className="block w-full bg-black text-white py-4 rounded-xl font-black uppercase italic hover:bg-blue-600 transition text-center">WATCH {m2.title}</Link>
          </div>
        </div>

        <div className="lg:w-1/3 bg-white border-8 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] rounded-[40px] overflow-hidden">
          <div className="relative h-[500px]">
            <Image src={m2.image} alt={m2.title} fill className="object-cover" />
          </div>
          <div className="p-8 text-center">
            <h2 className="text-3xl font-black uppercase italic">{m2.title}</h2>
          </div>
        </div>
      </div>
    </main>
  );
}
