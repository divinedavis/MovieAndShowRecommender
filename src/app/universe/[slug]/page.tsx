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

interface UniverseConfig {
  title: string;
  type: 'collection' | 'company';
  id: number;
  faqOrder: string;
  faqDuration: string;
  intro: string;
}

const UNIVERSES: Record<string, UniverseConfig> = {
  'marvel': {
    title: 'Marvel Cinematic Universe - Complete Watch Guide',
    type: 'company',
    id: 420,
    faqOrder: 'The recommended watch order follows the in-universe chronological timeline, starting with Captain America: The First Avenger and progressing through the Infinity Saga and into the Multiverse Saga.',
    faqDuration: 'Watching every MCU film back-to-back takes approximately 60+ hours.',
    intro: 'The Marvel Cinematic Universe is the most successful film franchise in history, spanning dozens of interconnected films and shows. From Iron Man to the latest Phase entries, the MCU has redefined blockbuster filmmaking.',
  },
  'dc': {
    title: 'DC Universe Movies - Complete Guide',
    type: 'company',
    id: 429,
    faqOrder: 'DC films can be watched in release order or grouped by continuity (DCEU, The Batman universe, standalone films).',
    faqDuration: 'The complete DC Extended Universe films take approximately 30+ hours to watch.',
    intro: 'From the dark streets of Gotham to the cosmic scale of the Justice League, DC Comics has produced some of the most iconic superhero films ever made. This guide covers every DC Universe film.',
  },
  'star-wars': {
    title: 'Star Wars Universe - Complete Watch Order',
    type: 'collection',
    id: 10,
    faqOrder: 'You can watch in release order (Episodes IV-VI, then I-III, then VII-IX) or chronological order (Episodes I through IX plus standalone films).',
    faqDuration: 'Watching all nine saga films plus the two standalone movies takes approximately 25 hours.',
    intro: 'A long time ago in a galaxy far, far away... The Star Wars saga is one of the most beloved franchises in cinema history. From the original trilogy to the sequels and anthology films, this guide covers the complete Star Wars movie universe.',
  },
  'harry-potter': {
    title: 'Harry Potter/Wizarding World - Complete Guide',
    type: 'collection',
    id: 1241,
    faqOrder: 'Watch the Harry Potter films in order from Philosopher\'s Stone through Deathly Hallows Part 2, then continue with the Fantastic Beasts series.',
    faqDuration: 'All eight Harry Potter films plus the Fantastic Beasts films take approximately 24 hours to watch.',
    intro: 'The Wizarding World franchise began with Harry Potter and has expanded into one of the most magical film series ever created. Follow the journey from Hogwarts to the wider wizarding world.',
  },
  'lord-of-the-rings': {
    title: 'Lord of the Rings/Middle Earth - Complete Guide',
    type: 'collection',
    id: 119,
    faqOrder: 'Watch The Hobbit trilogy first (chronologically), then The Lord of the Rings trilogy. Or start with the original LOTR trilogy for the intended experience.',
    faqDuration: 'The extended editions of all six films total approximately 20 hours.',
    intro: 'Peter Jackson\'s adaptation of J.R.R. Tolkien\'s Middle-earth is widely considered the greatest fantasy film achievement ever. From the Shire to Mount Doom, these films set the standard for epic filmmaking.',
  },
  'fast-furious': {
    title: 'Fast & Furious Franchise - Complete Guide',
    type: 'collection',
    id: 9485,
    faqOrder: 'Watch in release order for the best experience, though Tokyo Drift takes place chronologically between Fast & Furious 6 and Furious 7.',
    faqDuration: 'The complete main series takes approximately 22 hours to watch.',
    intro: 'What started as a street racing crime film has evolved into one of the biggest action franchises in cinema. The Fast & Furious saga spans continents, decades, and defies the laws of physics in the most entertaining way possible.',
  },
};

export async function generateStaticParams() {
  return Object.keys(UNIVERSES).map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = UNIVERSES[slug];
  if (!config) return { title: 'Universe Guide' };
  return {
    title: config.title,
    description: config.intro.slice(0, 160),
    alternates: { canonical: BASE_URL + '/universe/' + slug },
    openGraph: {
      title: config.title + ' | UnitTap Movies',
      description: config.intro.slice(0, 160),
      type: 'website',
      url: BASE_URL + '/universe/' + slug,
    },
  };
}

export default async function UniversePage({ params }: Props) {
  const { slug } = await params;
  const config = UNIVERSES[slug];
  if (!config) return <div>Universe not found</div>;

  let movies: any[] = [];
  let totalMinutes = 0;

  if (config.type === 'collection') {
    try {
      const collection = await tmdbFetch('/collection/' + config.id);
      const parts = collection.parts || [];
      const withRuntime = await Promise.all(
        parts.map(async (p: any) => {
          try {
            const details = await tmdbFetch('/movie/' + p.id);
            return { ...p, runtime: details.runtime || 0 };
          } catch {
            return { ...p, runtime: 0 };
          }
        })
      );
      withRuntime.sort((a: any, b: any) => new Date(a.release_date || '2099').getTime() - new Date(b.release_date || '2099').getTime());
      totalMinutes = withRuntime.reduce((sum: number, p: any) => sum + (p.runtime || 0), 0);
      movies = withRuntime.map((m: any) => ({
        id: m.id,
        title: m.title,
        image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
        year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
        rating: m.vote_average || 0,
        runtime: m.runtime,
      }));
    } catch {
      movies = [];
    }
  } else {
    const data = await tmdbFetch('/discover/movie', {
      with_companies: String(config.id),
      sort_by: 'primary_release_date.asc',
      'vote_count.gte': '50',
    });
    movies = data.results.slice(0, 30).map((m: any) => ({
      id: m.id,
      title: m.title,
      image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
      year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
      rating: m.vote_average || 0,
      runtime: 0,
    }));
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: config.title,
    description: config.intro,
    url: BASE_URL + '/universe/' + slug,
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
        aggregateRating: m.rating > 0 ? { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' } : undefined,
      },
    })),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the best order to watch ' + config.title.split(' - ')[0] + '?',
        acceptedAnswer: { '@type': 'Answer', text: config.faqOrder },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to watch all ' + config.title.split(' - ')[0] + ' movies?',
        acceptedAnswer: { '@type': 'Answer', text: config.faqDuration },
      },
    ],
  };

  const label = config.title.split(' - ')[0];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase mb-4">{label}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">Complete Watch Guide</p>
        {totalMinutes > 0 && (
          <p className="text-lg font-black text-yellow-600 mt-2">Total Marathon Time: {hours}h {mins}m</p>
        )}
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed font-medium">{config.intro}</p>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Complete Watch Order</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {movies.map((movie: any, i: number) => (
            <Link key={movie.id} href={'/movie/' + movie.id} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all relative">
              <div className="absolute -top-3 -left-3 bg-black text-white font-black text-sm w-8 h-8 flex items-center justify-center z-10 border-2 border-yellow-400">
                {i + 1}
              </div>
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                {movie.image && <Image src={movie.image} alt={movie.title} fill className="object-cover" quality={85} />}
                {movie.rating > 0 && <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{movie.rating.toFixed(1)}</div>}
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{movie.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{movie.year}{movie.runtime > 0 ? ' // ' + movie.runtime + ' MIN' : ''}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-24 max-w-4xl">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 border-b-4 border-black pb-4">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-black text-lg mb-2">What is the best order to watch {label}?</h3>
            <p className="text-gray-700 leading-relaxed">{config.faqOrder}</p>
          </div>
          <div>
            <h3 className="font-black text-lg mb-2">How long does it take to watch all {label} movies?</h3>
            <p className="text-gray-700 leading-relaxed">{config.faqDuration}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
