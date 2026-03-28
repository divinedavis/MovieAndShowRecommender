import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { getPlatformGenreData } from '@/lib/tmdb';

interface Props {
  params: Promise<{ slug: string; genreId: string }>;
}

const SLUG_TO_PROVIDER_ID: Record<string, string> = {
  'new-on-netflix': '8',
  'new-on-max': '1899',
  'new-on-disney': '337',
  'new-on-hulu': '15',
  'new-on-apple': '350',
  'new-on-amazon': '9',
};

const SLUG_TO_PLATFORM_NAME: Record<string, string> = {
  'new-on-netflix': 'Netflix',
  'new-on-max': 'Max',
  'new-on-disney': 'Disney+',
  'new-on-hulu': 'Hulu',
  'new-on-apple': 'Apple TV+',
  'new-on-amazon': 'Amazon Prime',
};

const GENRE_ID_TO_NAME: Record<string, string> = {
  '28': 'Action',
  '35': 'Comedy',
  '18': 'Drama',
  '27': 'Horror',
  '878': 'Sci-Fi',
  '53': 'Thriller',
  '10749': 'Romance',
  '16': 'Animation',
};

const TOP_COMBOS = [
  { slug: 'new-on-netflix', genreId: '28' },
  { slug: 'new-on-netflix', genreId: '18' },
  { slug: 'new-on-netflix', genreId: '27' },
  { slug: 'new-on-netflix', genreId: '35' },
  { slug: 'new-on-max', genreId: '28' },
  { slug: 'new-on-max', genreId: '18' },
  { slug: 'new-on-max', genreId: '878' },
  { slug: 'new-on-disney', genreId: '16' },
  { slug: 'new-on-disney', genreId: '28' },
  { slug: 'new-on-hulu', genreId: '35' },
  { slug: 'new-on-hulu', genreId: '53' },
  { slug: 'new-on-apple', genreId: '18' },
  { slug: 'new-on-amazon', genreId: '28' },
  { slug: 'new-on-amazon', genreId: '878' },
];

export async function generateStaticParams() {
  return TOP_COMBOS;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, genreId } = await params;
  const platform = SLUG_TO_PLATFORM_NAME[slug] || slug;
  const genre = GENRE_ID_TO_NAME[genreId] || genreId;
  const baseUrl = 'https://movies.unittap.com';
  return {
    title: `Best ${genre} Movies on ${platform} - Top Rated & Streaming Now`,
    description: `Find the best ${genre} movies streaming on ${platform}. Ranked by audience rating, discover top ${genre.toLowerCase()} films available on ${platform} right now.`,
    keywords: [`best ${genre.toLowerCase()} movies on ${platform.toLowerCase()}`, `${platform.toLowerCase()} ${genre.toLowerCase()} movies`, `top ${genre.toLowerCase()} ${platform.toLowerCase()}`, `stream ${genre.toLowerCase()} ${platform.toLowerCase()}`],
    alternates: {
      canonical: `${baseUrl}/streaming/${slug}/genre/${genreId}`,
    },
    openGraph: {
      title: `Best ${genre} Movies on ${platform} | UnitTap Movies`,
      description: `Top-rated ${genre} movies streaming on ${platform}.`,
      type: 'website',
    },
  };
}

export const revalidate = 3600;

export default async function StreamingGenrePage({ params }: Props) {
  const { slug, genreId } = await params;
  const platform = SLUG_TO_PLATFORM_NAME[slug] || slug;
  const genre = GENRE_ID_TO_NAME[genreId] || genreId;
  const providerId = SLUG_TO_PROVIDER_ID[slug] || '8';
  const movies = await getPlatformGenreData(providerId, genreId);
  const baseUrl = 'https://movies.unittap.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${genre} Movies on ${platform}`,
    description: `Top-rated ${genre} movies streaming on ${platform}.`,
    url: `${baseUrl}/streaming/${slug}/genre/${genreId}`,
    itemListElement: movies.slice(0, 10).map((item: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: item.title,
        url: `${baseUrl}/movie/${item.id}`,
        image: item.image,
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: platform, item: `${baseUrl}/streaming/${slug}` },
      { '@type': 'ListItem', position: 3, name: `${genre} on ${platform}`, item: `${baseUrl}/streaming/${slug}/genre/${genreId}` },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <header className="mb-20">
        <nav className="flex gap-2 text-blue-600 font-black uppercase text-xs tracking-widest mb-4 flex-wrap">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="text-gray-400">/</span>
          <Link href={`/streaming/${slug}`} className="hover:underline">{platform}</Link>
          <span className="text-gray-400">/</span>
          <span>{genre}</span>
        </nav>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">
          Best {genre} on {platform}
        </h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">TOP RATED & STREAMING NOW</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {movies.map((item: any, i: number) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-black text-yellow-400 border-2 border-yellow-400 text-[10px] font-black px-2 py-1">#{i + 1}</div>
              <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)} IMDB</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden group-hover:text-blue-600">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">{item.year} // {platform.toUpperCase()}</p>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-20 bg-white border-4 border-black p-8 rounded-2xl">
        <h2 className="text-2xl font-black uppercase italic mb-6">Other Genres on {platform}</h2>
        <div className="flex flex-wrap gap-4">
          {Object.entries(GENRE_ID_TO_NAME).map(([gId, gName]) => (
            <Link key={gId} href={`/streaming/${slug}/genre/${gId}`} className={`px-6 py-3 border-4 border-black font-black uppercase italic text-sm transition ${gId === genreId ? 'bg-yellow-400' : 'bg-white hover:bg-yellow-400'}`}>{gName}</Link>
          ))}
        </div>
      </section>
    </main>
  );
}
