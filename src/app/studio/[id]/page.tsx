import Image from 'next/image';
import Link from 'next/link';
import { getStudioDetails } from '@/lib/tmdb';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const details = await getStudioDetails(id);
  return {
    title: `Upcoming ${details.name} Movies 2026 - Official Release Schedule`,
    description: `The complete guide to ${details.name} films. From all-time classics to upcoming 2026 releases, track your favorite studio's filmography.`
  };
}

export default async function StudioPage({ params }: Props) {
  const { id } = await params;
  const details = await getStudioDetails(id);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <header className="mb-20 flex flex-col items-center text-center">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4">← BACK TO HOME</Link>
        {details.logo ? (
          <div className="relative h-20 w-full mb-8 flex justify-center">
            <Image src={details.logo} alt={`${details.name} Logo`} fill className="object-contain grayscale contrast-200" />
          </div>
        ) : (
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-6">{details.name}</h1>
        )}
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6">{details.name} PRODUCTIONS</h1>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Filmography Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {details.movies.map((item: any) => (
            <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                <Image src={item.image} alt={`Poster for ${item.title}`} fill className="object-cover" />
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1 italic">{item.rating.toFixed(1)} IMDB</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{item.year} // STUDIO CLASSIC</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
