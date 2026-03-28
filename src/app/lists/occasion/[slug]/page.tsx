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

interface OccasionConfig {
  title: string;
  description: string;
  genres: string;
  intro: string;
  minVotes: string;
}

const OCCASIONS: Record<string, OccasionConfig> = {
  'date-night': {
    title: 'Best Date Night Movies',
    description: 'The perfect movies for a romantic evening. Comedies, romances, and charming films ideal for couples.',
    genres: '10749,35',
    intro: 'Planning a date night? The right movie sets the perfect mood. This curated selection of romantic comedies, charming dramas, and feel-good films will make your evening memorable. From laugh-out-loud comedies to swoon-worthy romances, these are the movies that bring couples closer together.',
    minVotes: '500',
  },
  'guys-night': {
    title: 'Best Movies for a Guys Night',
    description: 'Action-packed, hilarious, and adrenaline-fueled movies perfect for hanging out with the boys.',
    genres: '28,35',
    intro: 'Round up the crew and fire up one of these crowd-pleasers. From explosive action blockbusters to riotous comedies, these are the movies that deliver maximum entertainment and endless quotable moments. The kind of films where everyone in the room is having the time of their life.',
    minVotes: '500',
  },
  'girls-night': {
    title: 'Best Girls Night Movies',
    description: 'Fun, empowering, and entertaining movies perfect for a girls night in. Comedies, dramas, and feel-good films.',
    genres: '35,10749,18',
    intro: 'Grab the wine and the snacks -- it\'s girls night. This selection features the funniest, most empowering, and most entertaining films for a night in with your friends. From sharp comedies to moving dramas to feel-good favorites, these movies spark laughter and great conversation.',
    minVotes: '300',
  },
  'family-night': {
    title: 'Best Family Movie Night Picks',
    description: 'Wholesome, fun movies the whole family can enjoy together. Age-appropriate picks for all ages.',
    genres: '10751',
    intro: 'Family movie night is a cherished tradition, and finding the right film for all ages can be a challenge. These movies strike the perfect balance -- engaging enough for adults, appropriate and fun for kids, and packed with heart and humor that brings the whole family together.',
    minVotes: '500',
  },
  'solo-watch': {
    title: 'Best Movies to Watch Alone',
    description: 'Cerebral thrillers, deep dramas, and thought-provoking films best enjoyed in quiet solitude.',
    genres: '53,18',
    intro: 'Sometimes the best movie nights are the ones you spend alone. These are the films that demand your full attention -- cerebral thrillers that keep you guessing, deep character studies that stay with you for days, and thought-provoking dramas that reward solitary contemplation. No distractions, no compromises, just you and a great film.',
    minVotes: '500',
  },
};

export async function generateStaticParams() {
  return Object.keys(OCCASIONS).map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = OCCASIONS[slug];
  if (!config) return { title: 'Movie Recommendations' };
  return {
    title: config.title + ' - Curated Recommendations',
    description: config.description,
    keywords: [slug.replace(/-/g, ' ') + ' movies', config.title.toLowerCase(), 'movies for ' + slug.replace(/-/g, ' ')],
    alternates: { canonical: BASE_URL + '/lists/occasion/' + slug },
    openGraph: {
      title: config.title + ' | UnitTap Movies',
      description: config.description,
      type: 'website',
      url: BASE_URL + '/lists/occasion/' + slug,
    },
  };
}

export default async function OccasionPage({ params }: Props) {
  const { slug } = await params;
  const config = OCCASIONS[slug];
  if (!config) return <div>Occasion not found</div>;

  const data = await tmdbFetch('/discover/movie', {
    with_genres: config.genres,
    sort_by: 'vote_average.desc',
    'vote_count.gte': config.minVotes,
    page: '1',
  });

  const movies = data.results.slice(0, 20).map((m: any) => ({
    id: m.id,
    title: m.title,
    image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
    rating: m.vote_average || 0,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: config.title,
    description: config.description,
    url: BASE_URL + '/lists/occasion/' + slug,
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

  const label = slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">{config.title}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">Curated Recommendations</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed font-medium">{config.intro}</p>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">{label} Movies</h2>
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

      <section className="mb-16">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-6 border-b-4 border-black pb-4">Other Occasions</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(OCCASIONS).filter(([k]) => k !== slug).map(([k, v]) => (
            <Link key={k} href={'/lists/occasion/' + k} className="inline-block bg-black text-white font-black uppercase text-xs px-4 py-2 hover:bg-yellow-400 hover:text-black transition-colors border-2 border-black">
              {v.title} &rarr;
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
