import Image from 'next/image';
import Link from 'next/link';
import { getMediaByGenre } from '@/lib/tmdb';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

const GENRE_MAP: Record<string, string> = {
  'action': '28',
  'comedy': '35',
  'horror': '27',
  'sci-fi': '878',
  'drama': '18',
  'documentary': '99',
  'animation': '16'
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const name = id.charAt(0).toUpperCase() + id.slice(1);
  return {
    title: `Best ${name} Movies 2026 - Top Rated & Trending Now`,
    description: `Explore the top-rated and trending ${id} movies and TV shows for 2026. Updated daily with real-time rankings.`
  };
}

export default async function GenrePage({ params }: Props) {
  const { id } = await params;
  const genreId = GENRE_MAP[id] || id;
  const movies = await getMediaByGenre(genreId, 'movie');
  const shows = await getMediaByGenre(genreId, 'show');

  const name = id.charAt(0).toUpperCase() + id.slice(1);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO HOME</Link>
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">{name}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">Top Rated & Trending in 2026</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Best {name} Movies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {movies.map((item: any) => (
            <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
              <div className="relative h-72 w-full border-b-4 border-black">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{item.year} // MOVIE</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Trending {name} Series</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {shows.map((item: any) => (
            <Link key={item.id} href={`/show/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
              <div className="relative h-72 w-full border-b-4 border-black">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{item.year} // SERIES</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
