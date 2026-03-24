import Image from 'next/image';
import Link from 'next/link';
import { getMediaData, MediaItem } from '@/lib/tmdb';

function MediaCard({ item }: { item: MediaItem }) {
  return (
    <Link href={`/${item.type}/${item.id}`} className="block bg-white rounded-2xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
      <div className="relative h-80 w-full border-b-4 border-black">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 right-3 bg-yellow-400 border-2 border-black text-black font-black text-xs px-2 py-1 italic">
          {item.rating} IMDB
        </div>
        {item.isWinner && (
          <div className="absolute top-3 left-3 bg-blue-600 border-2 border-black text-white font-black text-[10px] px-2 py-1 uppercase tracking-tighter italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce">
            WINNER
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-black uppercase tracking-tighter leading-none mb-3 h-14 overflow-hidden group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mb-4">
            <span className="bg-gray-100 border border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">{item.year}</span>
            <span className="bg-gray-100 border border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">{item.type === 'movie' ? 'MOVIE' : 'SERIES'}</span>
        </div>
        <p className="text-gray-700 text-xs font-bold leading-relaxed line-clamp-2 h-10">{item.description}</p>
      </div>
    </Link>
  );
}

function Section({ title, items, id, subtitle, link }: { title: string, subtitle?: string, items: MediaItem[], id?: string, link?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-24" id={id}>
      <div className="flex flex-col mb-12">
        {link ? (
          <Link href={link} className="group inline-block">
            <h2 className="text-5xl font-black tracking-tighter text-black uppercase italic inline-block group-hover:text-blue-600 transition-colors">{title}</h2>
            <span className="ml-4 text-gray-300 font-black italic uppercase text-lg group-hover:text-blue-600">+ VIEW ALL CEREMONIES</span>
          </Link>
        ) : (
          <h2 className="text-5xl font-black tracking-tighter text-black uppercase italic inline-block">{title}</h2>
        )}
        {subtitle && <p className="text-blue-600 font-black uppercase tracking-widest text-xs mt-2 italic underline decoration-4">{subtitle}</p>}
        <div className="w-full h-2 bg-black mt-6"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const { movies, shows, upcoming2025, upcoming2026, oscars, bra } = await getMediaData();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 font-sans selection:bg-yellow-400 selection:text-black">
      <header className="bg-white border-b-4 border-black sticky top-0 z-50 shadow-md py-6">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-blue-600 border-4 border-black text-white px-4 py-1 font-black text-2xl italic tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">MOVIEREC</div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-black tracking-tighter leading-none uppercase">OSCARS & RECS</h1>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">SEO ENGINE v3.2 // 2026 WINNERS LIVE</p>
            </div>
          </Link>
          <nav className="hidden md:flex space-x-8 text-xs font-black uppercase tracking-widest">
            <a href="#oscars" className="hover:text-blue-600 transition underline decoration-2">THE OSCARS</a>
            <a href="#bra" className="hover:text-blue-600 transition underline decoration-2">BLACK REEL</a>
            <a href="#2025" className="hover:text-blue-600 transition">2025</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-20">
        
        <Section 
          id="oscars"
          title="Best Picture Award" 
          subtitle="Academy Awards (The Oscars) // 2026 Winners & Nominees"
          items={oscars} 
          link="/awards/oscars"
        />

        <Section 
          id="bra"
          title="The BRA Awards" 
          subtitle="Black Reel Awards (The BRAs) // 2026 Excellence in Cinema"
          items={bra} 
          link="/awards/black-reel"
        />

        <Section 
          id="2025"
          title="Upcoming 2025" 
          items={upcoming2025} 
        />

        <Section 
          id="2026"
          title="Coming in 2026" 
          items={upcoming2026} 
        />

        <div id="movies">
          <Section 
            title="Top Box Office (Now)" 
            items={movies.filter(m => m.category === 'box-office')} 
          />
        </div>

        <div id="shows">
          <Section 
            title="Trending Shows" 
            items={shows.filter(s => s.category === 'streaming')} 
          />
        </div>
      </div>

      <footer className="bg-gray-950 text-white py-24 mt-20 border-t-8 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h2 className="text-4xl font-black mb-8 md:mb-0 italic tracking-tighter">MOVIEREC.</h2>
          </div>
          <div className="pt-12 border-t border-gray-900 text-gray-500 text-[10px] font-black uppercase tracking-widest">
            © {new Date().getFullYear()} MOVIEREC. THE 1M MAU MISSION.
          </div>
        </div>
      </footer>
    </main>
  );
}
