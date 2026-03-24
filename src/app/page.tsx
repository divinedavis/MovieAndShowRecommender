import Image from 'next/image';
import Link from 'next/link';
import { getMediaData, MediaItem } from '@/lib/tmdb';

function MediaCard({ item }: { item: MediaItem }) {
  return (
    <Link href={`/${item.type}/${item.id}`} className="block border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all bg-white group">
      <div className="relative h-72 w-full">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {item.rating > 0 && (
          <div className="absolute top-2 right-2 bg-black/80 text-white font-black text-xs px-2 py-1 rounded-md backdrop-blur-sm">
            {item.rating}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-black text-lg leading-tight mb-2 h-14 overflow-hidden group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          <span>{item.year}</span>
          <span className="text-gray-200">|</span>
          <span>{item.type === 'movie' ? 'Movie' : 'TV Series'}</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 h-10">{item.description}</p>
      </div>
    </Link>
  );
}

function Section({ title, items, id }: { title: string, items: MediaItem[], id?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-20" id={id}>
      <h2 className="text-3xl font-black mb-10 pb-5 border-b-4 border-gray-900 tracking-tight text-gray-950 uppercase italic">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const { movies, shows, upcoming2025, upcoming2026 } = await getMediaData();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b sticky top-0 z-50 shadow-md py-5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white px-3 py-1 font-black text-xl italic tracking-tighter">MREC</div>
            <div className="hidden md:block">
              <h1 className="text-xl font-black tracking-tighter leading-none">MOVIEREC</h1>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">SEO ENGINE v2.0</p>
            </div>
          </Link>
          <nav className="hidden md:flex space-x-10 text-xs font-black uppercase tracking-widest text-gray-600">
            <a href="#2025" className="hover:text-blue-600 transition">2025 Calendar</a>
            <a href="#2026" className="hover:text-blue-600 transition">2026 Sneak Peak</a>
            <a href="#movies" className="hover:text-blue-600 transition">Box Office</a>
            <a href="#shows" className="hover:text-blue-600 transition">Streaming</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <Section 
          id="2025"
          title="Upcoming Movies 2025" 
          items={upcoming2025} 
        />

        <Section 
          id="2026"
          title="Movies Coming in 2026" 
          items={upcoming2026} 
        />

        <div id="movies">
          <Section 
            title="Top 5 Box Office (Now Showing)" 
            items={movies.filter(m => m.category === 'box-office')} 
          />
          
          <Section 
            title="Hottest on Streaming" 
            items={movies.filter(m => m.category === 'streaming')} 
          />
        </div>

        <div id="shows">
          <Section 
            title="Most Popular Series" 
            items={shows.filter(s => s.category === 'box-office')} 
          />

          <Section 
            title="Trending Shows" 
            items={shows.filter(s => s.category === 'streaming')} 
          />
        </div>
      </div>

      <footer className="bg-gray-950 text-white py-20 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <h2 className="text-3xl font-black mb-6 md:mb-0">MOVIEREC</h2>
            <p className="text-gray-400 text-sm max-w-sm text-center md:text-right">
              Aggregating data from TMDB and top streaming services to help you find what to watch in 2025, 2026, and beyond.
            </p>
          </div>
          <div className="pt-10 border-t border-gray-900 text-gray-500 text-[10px] font-black uppercase tracking-widest text-center">
            © {new Date().getFullYear()} MOVIEREC. Reach for 1M MAU.
          </div>
        </div>
      </footer>
    </main>
  );
}
