import Image from 'next/image';
import Link from 'next/link';
import { getActorOnPlatform } from '@/lib/tmdb';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string; platform: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, platform } = await params;
  const details = await getActorOnPlatform(id, platform);
  const pName = platform.charAt(0).toUpperCase() + platform.slice(1);
  return {
    title: `Best ${details.name} Movies on ${pName} - Watch Online (March 2026)`,
    description: `Streaming guide for ${details.name} on ${pName}. Find every movie and show starring ${details.name} available to watch right now.`
  };
}

export default async function ActorOnPlatformPage({ params }: Props) {
  const { id, platform } = await params;
  const details = await getActorOnPlatform(id, platform);
  const pName = platform.charAt(0).toUpperCase() + platform.slice(1);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <header className="mb-20">
        <Link href={`/person/${id}`} className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO PROFILE</Link>
        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">{details.name} ON {platform}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">Available to Stream in March 2026</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {details.movies.map((item: any) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              <Image src={item.image} alt={`Poster for ${item.title}`} fill className="object-cover" />
              <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)} IMDB</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">{item.year} // {pName.toUpperCase()}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
