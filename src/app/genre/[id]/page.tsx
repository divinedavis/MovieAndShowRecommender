import Image from 'next/image';
import Link from 'next/link';
import { getMediaByGenre } from '@/lib/tmdb';
import { Metadata } from 'next';

export const revalidate = 3600;

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
  'animation': '16',
  'romance': '10749',
  'thriller': '53',
  'crime': '80',
  'fantasy': '14',
  'adventure': '12',
  'family': '10751',
  'history': '36',
  'music': '10402',
  'mystery': '9648',
  'war': '10752',
  'western': '37',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const name = id.charAt(0).toUpperCase() + id.slice(1);
  const baseUrl = 'https://movies.unittap.com';
  return {
    title: `Best ${name} Movies 2026 - Top Rated & Trending Now`,
    description: `Explore the top-rated and trending ${id} movies and TV shows for 2026. Updated daily with real-time rankings from TMDB. Discover must-watch ${id} films.`,
    keywords: [`best ${id} movies`, `top ${id} films 2026`, `${id} movies list`, `trending ${id} movies`, `${id} TV shows`],
    alternates: {
      canonical: `${baseUrl}/genre/${id}`,
    },
    openGraph: {
      title: `Best ${name} Movies 2026 | UnitTap Movies`,
      description: `Discover the top-rated ${id} movies and series. Updated daily with real-time rankings.`,
      type: 'website',
    },
  };
}

export default async function GenrePage({ params }: Props) {
  const { id } = await params;
  const genreId = GENRE_MAP[id] || id;
  const movies = await getMediaByGenre(genreId, 'movie');
  const shows = await getMediaByGenre(genreId, 'show');

  const name = id.charAt(0).toUpperCase() + id.slice(1);
  const baseUrl = 'https://movies.unittap.com';

  const moviesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${name} Movies`,
    description: `Top-rated and trending ${id} movies, updated daily.`,
    url: `${baseUrl}/genre/${id}`,
    itemListElement: movies.slice(0, 10).map((item: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: item.title,
        url: `${baseUrl}/movie/${item.id}`,
        image: item.image,
        datePublished: `${item.year}-01-01`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: item.rating,
          bestRating: '10',
        },
      },
    })),
  };

  const showsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${name} TV Series`,
    description: `Top-rated and trending ${id} TV shows, updated daily.`,
    url: `${baseUrl}/genre/${id}`,
    itemListElement: shows.slice(0, 10).map((item: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'TVSeries',
        name: item.title,
        url: `${baseUrl}/show/${item.id}`,
        image: item.image,
        datePublished: `${item.year}-01-01`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: item.rating,
          bestRating: '10',
        },
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://movies.unittap.com' },
      { '@type': 'ListItem', position: 2, name: 'Genre', item: 'https://movies.unittap.com' },
      { '@type': 'ListItem', position: 3, name: name, item:  }
    ]
  };

  return (
    <main className=min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10>
      <script
        type=application/ld+json
        dangerouslySetInnerHTML={{ __html: JSON.stringify(moviesJsonLd) }}
      />
      <script
        type=application/ld+json
        dangerouslySetInnerHTML={{ __html: JSON.stringify(showsJsonLd) }}
      />
      <script
        type=application/ld+json
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">\u2190 BACK TO HOME</Link>
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">{name}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">Top Rated & Trending in 2026</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Best {name} Movies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {movies.map((item: any) => (
            <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
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
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
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
