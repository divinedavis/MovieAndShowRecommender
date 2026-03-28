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

const COUNTRIES: Record<string, { name: string; adjective: string; intro: string }> = {
  'US': {
    name: 'American',
    adjective: 'American',
    intro: 'Hollywood has dominated global cinema for over a century, producing everything from intimate indie dramas to the biggest blockbusters in history. American cinema continues to push boundaries in storytelling and spectacle.',
  },
  'GB': {
    name: 'British',
    adjective: 'British',
    intro: 'British cinema boasts a rich tradition of literary adaptations, sharp wit, and world-class talent. From period dramas to gritty social realism, UK films offer unparalleled depth and craftsmanship.',
  },
  'FR': {
    name: 'French',
    adjective: 'French',
    intro: 'France is the birthplace of cinema itself, and French films continue to lead the world in artistic innovation. From the New Wave to contemporary auteurs, French cinema remains synonymous with artistic excellence.',
  },
  'KR': {
    name: 'South Korean',
    adjective: 'Korean',
    intro: 'South Korean cinema has exploded onto the world stage, with films like Parasite proving that Korean storytelling resonates universally. Known for genre-bending narratives and masterful direction, Korean film is a global powerhouse.',
  },
  'JP': {
    name: 'Japanese',
    adjective: 'Japanese',
    intro: 'From Kurosawa to Studio Ghibli, Japanese cinema has given the world some of its most visionary films. Spanning anime, samurai epics, horror, and quiet dramas, Japanese filmmaking is endlessly inventive.',
  },
  'IN': {
    name: 'Indian',
    adjective: 'Indian',
    intro: 'India produces more films annually than any other country. From Bollywood spectacles to regional masterpieces, Indian cinema offers incredible diversity in language, style, and storytelling tradition.',
  },
  'IT': {
    name: 'Italian',
    adjective: 'Italian',
    intro: 'Italian neorealism changed cinema forever, and Italy continues to produce films of extraordinary beauty and emotion. From Fellini to modern masters, Italian cinema celebrates life in all its complexity.',
  },
  'ES': {
    name: 'Spanish',
    adjective: 'Spanish',
    intro: 'Spanish cinema, led by visionaries like Pedro Almodovar, is known for its passion, color, and emotional intensity. Spain has produced some of the most distinctive voices in world cinema.',
  },
  'DE': {
    name: 'German',
    adjective: 'German',
    intro: 'German cinema has a storied history from Expressionism to the New German Cinema. Known for intellectual rigor and visual innovation, German films continue to challenge and inspire audiences worldwide.',
  },
  'BR': {
    name: 'Brazilian',
    adjective: 'Brazilian',
    intro: 'Brazilian cinema pulses with the energy and diversity of its culture. From City of God to contemporary festival favorites, Brazilian films offer raw, powerful storytelling rooted in a unique national identity.',
  },
  'MX': {
    name: 'Mexican',
    adjective: 'Mexican',
    intro: 'Mexico has produced some of the world\'s most celebrated filmmakers, including Alfonso Cuaron, Guillermo del Toro, and Alejandro Gonzalez Inarritu. Mexican cinema blends magical realism with unflinching social commentary.',
  },
  'SE': {
    name: 'Swedish',
    adjective: 'Swedish',
    intro: 'Swedish cinema, forever marked by the genius of Ingmar Bergman, continues to produce deeply introspective and visually striking films. Scandinavian storytelling at its most profound.',
  },
  'DK': {
    name: 'Danish',
    adjective: 'Danish',
    intro: 'Danish cinema punches well above its weight, with the Dogme 95 movement and filmmakers like Lars von Trier pushing the boundaries of the art form. Denmark consistently produces some of Europe\'s finest films.',
  },
};

export async function generateStaticParams() {
  return Object.keys(COUNTRIES).map((country) => ({ country: country.toLowerCase() }));
}

interface Props {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const code = country.toUpperCase();
  const config = COUNTRIES[code];
  if (!config) return { title: 'World Cinema' };
  return {
    title: 'Best ' + config.name + ' Cinema - Top ' + config.adjective + ' Movies',
    description: config.intro.slice(0, 160),
    keywords: ['best ' + config.adjective.toLowerCase() + ' movies', config.name.toLowerCase() + ' cinema', 'top ' + config.adjective.toLowerCase() + ' films'],
    alternates: { canonical: BASE_URL + '/cinema/' + country },
    openGraph: {
      title: 'Best ' + config.name + ' Cinema | UnitTap Movies',
      description: config.intro.slice(0, 160),
      type: 'website',
      url: BASE_URL + '/cinema/' + country,
    },
  };
}

export default async function CinemaCountryPage({ params }: Props) {
  const { country } = await params;
  const code = country.toUpperCase();
  const config = COUNTRIES[code];
  if (!config) return <div>Country not found</div>;

  const data = await tmdbFetch('/discover/movie', {
    with_origin_country: code,
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
    name: 'Best ' + config.name + ' Cinema',
    description: config.intro,
    url: BASE_URL + '/cinema/' + country,
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        url: BASE_URL + '/movie/' + m.id,
        image: m.image,
        countryOfOrigin: { '@type': 'Country', name: config.name },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">{config.adjective} Cinema</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">Top {config.name} Movies</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed font-medium">{config.intro}</p>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Best {config.adjective} Films</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {movies.map((movie: any) => (
            <Link key={movie.id} href={'/movie/' + movie.id} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                {movie.image && <Image src={movie.image} alt={movie.title} fill className="object-cover" quality={85} />}
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{movie.rating.toFixed(1)}</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{movie.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{movie.year} // {config.adjective.toUpperCase()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
