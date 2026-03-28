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

const KEYWORDS: Record<string, { id: string; title: string; intro: string }> = {
  'time-travel': {
    id: '4379',
    title: 'Best Time Travel Movies',
    intro: 'From paradoxes to parallel timelines, time travel movies have fascinated audiences for decades. Whether it\'s the comedic genius of Back to the Future or the mind-bending complexity of Interstellar, these films explore what it means to manipulate the fabric of time itself.',
  },
  'superhero': {
    id: '9715',
    title: 'Best Superhero Movies',
    intro: 'The superhero genre has evolved from campy comic book adaptations to sprawling cinematic universes. These are the films that redefined what it means to be a hero on the big screen, delivering spectacle, heart, and unforgettable characters.',
  },
  'zombie': {
    id: '12377',
    title: 'Best Zombie Movies',
    intro: 'The undead have shambled through cinema for nearly a century, and the zombie genre continues to evolve. From George Romero\'s social commentary to modern survival thrillers, these films prove there\'s always new life in the living dead.',
  },
  'heist': {
    id: '10349',
    title: 'Best Heist Movies',
    intro: 'There\'s nothing quite like a perfectly executed heist film. The planning, the tension, the inevitable twist -- heist movies deliver some of cinema\'s most thrilling sequences. These are the best capers ever committed to film.',
  },
  'dystopia': {
    id: '4565',
    title: 'Best Dystopian Movies',
    intro: 'Dystopian films hold a dark mirror to society, imagining futures where things have gone terribly wrong. From totalitarian regimes to post-apocalyptic wastelands, these films warn, provoke, and entertain in equal measure.',
  },
  'space': {
    id: '1430',
    title: 'Best Space Movies',
    intro: 'The final frontier has inspired some of the most visually stunning and intellectually ambitious films ever made. From realistic depictions of space travel to epic space operas, these movies capture the wonder and terror of the cosmos.',
  },
  'serial-killer': {
    id: '10714',
    title: 'Best Serial Killer Movies',
    intro: 'Few genres create as much tension and psychological complexity as the serial killer film. These movies delve into the darkest corners of the human mind, delivering chilling performances and edge-of-your-seat suspense.',
  },
  'revenge': {
    id: '11322',
    title: 'Best Revenge Movies',
    intro: 'Revenge is a dish best served on the big screen. From elegant psychological games to brutal action spectacles, revenge films tap into our primal desire for justice -- or vengeance. These are the most satisfying revenge stories ever told.',
  },
};

export async function generateStaticParams() {
  return Object.keys(KEYWORDS).map((keyword) => ({ keyword }));
}

interface Props {
  params: Promise<{ keyword: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { keyword } = await params;
  const config = KEYWORDS[keyword];
  if (!config) return { title: 'Tag Movies' };
  return {
    title: config.title + ' - Top Films Ranked',
    description: config.intro.slice(0, 160),
    keywords: [keyword + ' movies', 'best ' + keyword + ' films', 'top ' + keyword + ' movies', keyword + ' movie list'],
    alternates: { canonical: BASE_URL + '/tag/' + keyword },
    openGraph: {
      title: config.title + ' | UnitTap Movies',
      description: config.intro.slice(0, 160),
      type: 'website',
      url: BASE_URL + '/tag/' + keyword,
    },
  };
}

export default async function TagPage({ params }: Props) {
  const { keyword } = await params;
  const config = KEYWORDS[keyword];
  if (!config) return <div>Tag not found</div>;

  const data = await tmdbFetch('/discover/movie', {
    with_keywords: config.id,
    sort_by: 'vote_average.desc',
    'vote_count.gte': '200',
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
    description: config.intro,
    url: BASE_URL + '/tag/' + keyword,
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

  const label = keyword.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">{config.title}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">Top Ranked {label} Films</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed font-medium">{config.intro}</p>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Top {label} Movies</h2>
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
