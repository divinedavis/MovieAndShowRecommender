import { getMediaData } from '@/lib/tmdb';
import Link from 'next/link';
import Image from 'next/image';

export default async function CompareSelectPage() {
  const { movies } = await getMediaData();
  const topMovies = movies.slice(0, 10);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10 font-sans">
      <header className="mb-20 text-center">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO HOME</Link>
        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase mb-6">MOVIE VS MOVIE</h1>
        <p className="text-xl md:text-2xl font-black text-gray-400 uppercase italic">Select two movies to compare side-by-side</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-black uppercase italic mb-12 border-b-8 border-black pb-4 inline-block">Popular Comparisons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Manually creating some high-traffic comparisons from the top movies */}
          {topMovies.map((m, i) => {
            if (i % 2 === 0 && topMovies[i+1]) {
              const m1 = topMovies[i];
              const m2 = topMovies[i+1];
              return (
                <Link 
                  key={`${m1.id}-vs-${m2.id}`}
                  href={`/compare/${m1.id}-vs-${m2.id}`}
                  className="flex items-center justify-between bg-white border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
                >
                  <div className="flex items-center gap-4 w-5/12">
                    <div className="relative h-20 w-14 flex-shrink-0">
                      <Image src={m1.image} alt={m1.title} fill className="object-cover rounded-lg border-2 border-black" />
                    </div>
                    <span className="font-black uppercase text-sm leading-tight line-clamp-2">{m1.title}</span>
                  </div>
                  
                  <span className="text-2xl font-black italic text-blue-600">VS</span>

                  <div className="flex items-center gap-4 w-5/12 text-right justify-end">
                    <span className="font-black uppercase text-sm leading-tight line-clamp-2">{m2.title}</span>
                    <div className="relative h-20 w-14 flex-shrink-0">
                      <Image src={m2.image} alt={m2.title} fill className="object-cover rounded-lg border-2 border-black" />
                    </div>
                  </div>
                </Link>
              );
            }
            return null;
          })}
        </div>
      </section>

      <div className="mt-20 p-12 bg-yellow-400 border-8 border-black rounded-[50px] text-center max-w-4xl mx-auto shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-4xl font-black italic uppercase mb-4">Custom Comparison</h2>
        <p className="font-bold text-black opacity-80 mb-0">Simply update the URL to compare any two movies:</p>
        <code className="block mt-4 bg-black text-white p-4 rounded-xl font-mono text-sm">
          movies.unittap.com/compare/[ID1]-vs-[ID2]
        </code>
      </div>
    </main>
  );
}
