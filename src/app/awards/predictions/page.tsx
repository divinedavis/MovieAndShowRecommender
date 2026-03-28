import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 3600;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

export const metadata: Metadata = {
  title: 'Oscar Predictions 2027 - Best Picture Frontrunners',
  description: 'Our predictions for the 2027 Academy Awards Best Picture race. See which films are leading the Oscar conversation, based on ratings, popularity, and critical reception.',
  keywords: ['oscar predictions 2027', 'best picture predictions', 'academy awards 2027', 'oscar frontrunners', 'best picture nominees 2027'],
  alternates: { canonical: 'https://movies.unittap.com/awards/predictions' },
  openGraph: {
    title: 'Oscar Predictions 2027 - Best Picture Frontrunners | UnitTap Movies',
    description: 'Our predictions for the 2027 Academy Awards Best Picture race.',
    type: 'article',
  },
};

async function fetchPredictions() {
  const currentYear = new Date().getFullYear();
  const url = `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&primary_release_year=${currentYear}&sort_by=vote_average.desc&vote_count.gte=100&page=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id,
    title: m.title,
    image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
    year: m.release_date ? new Date(m.release_date).getFullYear() : currentYear,
    rating: m.vote_average || 0,
    description: m.overview || '',
    voteCount: m.vote_count || 0,
  }));
}

export default async function AwardsPredictionsPage() {
  const movies = await fetchPredictions();
  const baseUrl = 'https://movies.unittap.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Oscar Predictions 2027 - Best Picture Frontrunners',
    description: 'Predicted frontrunners for the 2027 Academy Awards Best Picture.',
    url: `${baseUrl}/awards/predictions`,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        url: `${baseUrl}/movie/${m.id}`,
        image: m.image,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: m.rating,
          bestRating: '10',
          ratingCount: String(m.voteCount),
        },
      },
    })),
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Oscar Predictions 2027 - Best Picture Frontrunners',
    description: 'Our data-driven predictions for the 2027 Academy Awards Best Picture race.',
    url: `${baseUrl}/awards/predictions`,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: { '@type': 'Organization', name: 'UnitTap Movies' },
    publisher: { '@type': 'Organization', name: 'UnitTap Movies', url: baseUrl },
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO HOME</Link>
        <h1 className="text-5xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">OSCAR PREDICTIONS 2027</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">BEST PICTURE FRONTRUNNERS</p>
        <p className="text-lg font-medium text-gray-600 mt-4 max-w-3xl">Based on audience ratings, critical reception, and popularity data. These are the films most likely to compete for the top prize at the 2027 Academy Awards.</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {movies.filter((m: any) => m.image).map((item: any, index: number) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              <Image src={item.image} alt={`${item.title} - Oscar Prediction`} fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-blue-600 text-white border-2 border-black text-[10px] font-black px-2 py-1">#{index + 1}</div>
              <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">{item.voteCount.toLocaleString()} VOTES</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
