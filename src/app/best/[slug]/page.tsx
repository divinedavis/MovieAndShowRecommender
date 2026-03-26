import Image from 'next/image';
import Link from 'next/link';
import { getPlatformGenreData } from '@/lib/tmdb';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

const PLATFORM_MAP: Record<string, string> = { 'netflix': '8', 'max': '1899', 'disney': '337', 'amazon': '9', 'hulu': '15', 'paramount': '531', 'apple': '2' };
const GENRE_MAP: Record<string, string> = { 'horror': '27', 'action': '28', 'comedy': '35', 'sci-fi': '878', 'drama': '18', 'animation': '16' };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [p, g] = slug.split('-');
  const platform = p.charAt(0).toUpperCase() + p.slice(1);
  const genre = g.charAt(0).toUpperCase() + g.slice(1);
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  
  return {
    title: `15+ Best ${genre} Movies on ${platform} (${currentMonth}) - Ranked & Reviewed`,
    description: `Looking for the best ${genre} movies on ${platform}? Our expert-ranked list for ${currentMonth} features the top-rated titles you can stream right now.`,
    keywords: [`best ${genre} movies on ${platform}`, `top ${genre} movies ${platform}`, `what ${genre} to watch on ${platform}`, `${platform} ${genre} rankings`]
  };
}

export default async function BestPage({ params }: Props) {
  const { slug } = await params;
  const [p, g] = slug.split('-');
  const platformId = PLATFORM_MAP[p] || '8';
  const genreId = GENRE_MAP[g] || '27';
  const movies = await getPlatformGenreData(platformId, genreId);
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        url: `https://movies.unittap.com/movie/${m.id}`,
        name: m.title,
        image: m.image
      }
    }))
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO HOME</Link>
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">BEST {g} ON {p}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">MARCH 2026 // TOP RATED & STREAMING NOW</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {movies.map((item: any) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
              <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1 italic">{item.rating.toFixed(1)} IMDB</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">{item.year} // {p.toUpperCase()}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
