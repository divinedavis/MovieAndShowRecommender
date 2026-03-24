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
      </div>
      <div className="p-5">
        {/* ENFORCED BOLD TITLES UNDER POSTERS */}
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

function Section({ title, items, id }: { title: string, items: MediaItem[], id?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-24" id={id}>
      <h2 className="text-5xl font-black mb-12 pb-6 border-b-8 border-black tracking-tighter text-black uppercase italic inline-block">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const { movies, shows, upcoming2025, upcoming2026, awards } = await getMediaData();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 font-sans selection:bg-yellow-400 selection:text-black">
      <header className="bg-white border-b-4 border-black sticky top-0 z-50 shadow-md py-6">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-blue-600 border-4 border-black text-white px-4 py-1 font-black text-2xl italic tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">MOVIEREC</div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-black tracking-tighter leading-none uppercase">MOVIES & SHOWS</h1>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">SEO ENGINE v3.0 // OSCARS UPDATED</p>
            </div>
          </Link>
          <nav className="hidden md:flex space-x-8 text-xs font-black uppercase tracking-widest">
            <a href="#oscars" className="hover:text-blue-600 transition">Oscar Winners</a>
            <a href="#2025" className="hover:text-blue-600 transition">2025 Release</a>
            <a href="#2026" className="hover:text-blue-600 transition">2026 Sneak Peak</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-20">
        
        <Section 
          id="oscars"
          title="Oscar Best Picture Winners" 
          items={awards} 
        />

        <Section 
          id="2025"
          title="Most Anticipated 2025" 
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
          
          <Section 
            title="Trending Streaming" 
            items={movies.filter(m => m.category === 'streaming')} 
          />
        </div>

        <div id="shows">
          <Section 
            title="Popular Series" 
            items={shows.filter(s => s.category === 'box-office')} 
          />

          <Section 
            title="Trending Shows" 
            items={shows.filter(s => s.category === 'streaming')} 
          />
        </div>
      </div>

      <footer className="bg-gray-950 text-white py-24 mt-20 border-t-8 border-blue-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h2 className="text-4xl font-black mb-8 md:mb-0 italic tracking-tighter">MOVIEREC.</h2>
            <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-gray-500">
                <a href="#">ABOUT</a>
                <a href="#">SEO DATA</a>
                <a href="#">TMDB</a>
            </div>
          </div>
          <div className="pt-12 border-t border-gray-900 text-gray-500 text-[10px] font-black uppercase tracking-widest flex justify-between">
            <span>© {new Date().getFullYear()} MOVIEREC. 1M MAU MISSION.</span>
            <span>POWERED BY NEXT.JS 15</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
