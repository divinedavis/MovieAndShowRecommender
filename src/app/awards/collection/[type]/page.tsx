import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 3600;

const BASE_URL = 'https://movies.unittap.com';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(TMDB_BASE + endpoint);
  url.searchParams.append('api_key', API_KEY!);
  url.searchParams.append('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('TMDB API error: ' + res.statusText);
  return res.json();
}

const AWARD_TYPES: Record<string, {
  title: string;
  description: string;
  fetchParams: Record<string, string>;
}> = {
  'best-picture': {
    title: 'Best Picture Movies - Award Winners & Nominees',
    description: 'Explore Oscar Best Picture winners and nominees. The most prestigious award in cinema history.',
    fetchParams: {
      sort_by: 'vote_average.desc',
      'vote_count.gte': '2000',
      with_keywords: '158436|282',
    },
  },
  'best-director': {
    title: 'Best Director Movies - Films by Acclaimed Directors',
    description: 'Top-rated movies from the world\'s most acclaimed directors. Award-winning filmmaking at its finest.',
    fetchParams: {
      sort_by: 'vote_average.desc',
      'vote_count.gte': '3000',
    },
  },
  'best-animated': {
    title: 'Best Animated Movies - Award Winners & Nominees',
    description: 'The highest-rated animated films of all time. From Disney classics to modern masterpieces.',
    fetchParams: {
      with_genres: '16',
      sort_by: 'vote_average.desc',
      'vote_count.gte': '1000',
    },
  },
  'best-documentary': {
    title: 'Best Documentary Movies - Award Winners & Nominees',
    description: 'The most acclaimed documentary films. True stories told through masterful filmmaking.',
    fetchParams: {
      with_genres: '99',
      sort_by: 'vote_average.desc',
      'vote_count.gte': '300',
    },
  },
  'best-foreign': {
    title: 'Best Foreign Language Films - Award Winners & Nominees',
    description: 'The greatest non-English language films. Cinema without borders, from Parasite to Amelie.',
    fetchParams: {
      sort_by: 'vote_average.desc',
      'vote_count.gte': '1000',
      with_original_language: 'fr|ko|ja|es|de|it|zh|hi|pt|sv',
    },
  },
};

export async function generateStaticParams() {
  return Object.keys(AWARD_TYPES).map((type) => ({ type }));
}

interface Props {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const config = AWARD_TYPES[type];
  if (!config) return { title: 'Award Collection' };
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: BASE_URL + '/awards/collection/' + type },
    openGraph: {
      title: config.title,
      description: config.description,
      type: 'website',
      url: BASE_URL + '/awards/collection/' + type,
    },
  };
}

export default async function AwardCollectionPage({ params }: Props) {
  const { type } = await params;
  const config = AWARD_TYPES[type];
  if (!config) return <div>Award type not found</div>;

  const data = await tmdbFetch('/discover/movie', { ...config.fetchParams, page: '1' });
  const movies = data.results.slice(0, 20).map((m: any) => ({
    id: m.id,
    title: m.title,
    image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
    rating: m.vote_average || 0,
  }));

  const label = type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: config.title,
    description: config.description,
    url: BASE_URL + '/awards/collection/' + type,
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        url: BASE_URL + '/movie/' + m.id,
        image: m.image,
        datePublished: m.year + '-01-01',
        aggregateRating: { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">{label}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">Award Winners &amp; Nominees</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed font-medium mb-4">{config.description}</p>
          <p className="text-gray-700 text-lg leading-relaxed font-medium">
            This collection showcases the finest films in the {label.toLowerCase()} category, ranked by audience and critical acclaim. Each film represents the pinnacle of cinematic achievement in its respective category.
          </p>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">{label} Films</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {movies.map((movie: any) => (
            <Link key={movie.id} href={'/movie/' + movie.id} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                {movie.image && <Image src={movie.image} alt={movie.title} fill className="object-cover" quality={85} />}
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{movie.rating.toFixed(1)}</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{movie.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{movie.year} // {label.toUpperCase()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
