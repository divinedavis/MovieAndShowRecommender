import Image from 'next/image';
import { getMediaData, MediaItem } from '@/lib/tmdb';

function MediaCard({ item }: { item: MediaItem }) {
  return (
    <article className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="relative h-64 w-full">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <header className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 h-14">{item.title}</h3>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
            {item.rating}
          </span>
        </header>
        <p className="text-gray-500 text-sm mb-2">{item.year} • {item.type === 'movie' ? 'Movie' : 'TV Show'}</p>
        <p className="text-gray-700 text-sm line-clamp-3 h-15">{item.description}</p>
      </div>
    </article>
  );
}

function Section({ title, items }: { title: string, items: MediaItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-black mb-8 pb-4 border-b border-gray-200 tracking-tight text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const { movies, shows } = await getMediaData();

  const allItems = [...movies, ...shows];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': allItems.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': item.type === 'movie' ? 'Movie' : 'TVSeries',
        'name': item.title,
        'image': item.image,
        'datePublished': item.year.toString(),
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': item.rating.toString(),
          'bestRating': '10',
          'worstRating': '1',
          'ratingCount': '100'
        }
      }
    }))
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-blue-600">MOVIEREC</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">SEO RANKING POWERED</p>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-wide">
            <a href="#movies" className="hover:text-blue-600 transition">Movies</a>
            <a href="#shows" className="hover:text-blue-600 transition">Shows</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div id="movies">
          <Section 
            title="Top 5 Box Office (2024)" 
            items={movies.filter(m => m.category === 'box-office')} 
          />
          
          <Section 
            title="Trending on Streaming (This Week)" 
            items={movies.filter(m => m.category === 'streaming')} 
          />
        </div>

        <div id="shows">
          <Section 
            title="Most Popular TV Series" 
            items={shows.filter(s => s.category === 'box-office')} 
          />

          <Section 
            title="Must-Watch Streaming Shows" 
            items={shows.filter(s => s.category === 'streaming')} 
          />
        </div>
      </div>

      <footer className="bg-gray-950 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h2 className="text-xl font-black mb-4">MOVIEREC</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Building the worlds most optimized movie recommender to reach 1M MAU as fast as possible.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-blue-400">Resources</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li><a href="#" className="hover:text-white">SEO Strategy</a></li>
                <li><a href="#" className="hover:text-white">API Documentation</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-gray-500 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} MOVIEREC. Data from TMDB.
          </div>
        </div>
      </footer>
    </main>
  );
}
