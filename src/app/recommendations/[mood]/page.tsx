import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 3600;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

const MOOD_CONFIG: Record<string, { genres: string; label: string; description: string }> = {
  'feel-good': { genres: '35,10751', label: 'Feel-Good', description: 'Uplifting comedies and family films that will brighten your day.' },
  'mind-bending': { genres: '878,9648', label: 'Mind-Bending', description: 'Sci-fi and mystery films that will keep you thinking long after the credits roll.' },
  'intense-action': { genres: '28,53', label: 'Intense Action', description: 'Adrenaline-pumping action thrillers for when you need an edge-of-your-seat experience.' },
  'romantic': { genres: '10749', label: 'Romantic', description: 'Love stories and romantic films perfect for date night or a cozy evening.' },
  'dark-comedy': { genres: '35,80', label: 'Dark Comedy', description: 'Wickedly funny crime comedies with a twisted sense of humor.' },
  'scary': { genres: '27', label: 'Scary', description: 'Horror films guaranteed to give you nightmares and keep you up at night.' },
  'inspiring': { genres: '18,36', label: 'Inspiring', description: 'Powerful dramas and true stories that celebrate the human spirit.' },
  'adventure': { genres: '12,14', label: 'Adventure', description: 'Epic adventure and fantasy films that transport you to other worlds.' },
};

const ALL_MOODS = Object.keys(MOOD_CONFIG);

interface Props {
  params: Promise<{ mood: string }>;
}

async function fetchMoodMovies(mood: string) {
  const config = MOOD_CONFIG[mood];
  if (!config) return [];
  const url = `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=${config.genres}&sort_by=popularity.desc&vote_count.gte=200&page=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id,
    title: m.title,
    image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
    year: new Date(m.release_date).getFullYear(),
    rating: m.vote_average || 0,
    description: m.overview,
  }));
}

export async function generateStaticParams() {
  return ALL_MOODS.map((mood) => ({ mood }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mood } = await params;
  const config = MOOD_CONFIG[mood] || { label: mood, description: '' };
  const baseUrl = 'https://movies.unittap.com';
  return {
    title: `Best ${config.label} Movies to Watch Right Now`,
    description: `${config.description} Browse our curated list of the best ${config.label.toLowerCase()} movies streaming right now, ranked by popularity and ratings.`,
    keywords: [`${config.label.toLowerCase()} movies`, `best ${config.label.toLowerCase()} films`, `${config.label.toLowerCase()} movie recommendations`, `movies for ${mood} mood`],
    alternates: { canonical: `${baseUrl}/recommendations/${mood}` },
    openGraph: {
      title: `Best ${config.label} Movies to Watch Right Now | UnitTap Movies`,
      description: config.description,
      type: 'website',
    },
  };
}

export default async function MoodPage({ params }: Props) {
  const { mood } = await params;
  const config = MOOD_CONFIG[mood] || { label: mood, description: '', genres: '' };
  const movies = await fetchMoodMovies(mood);
  const baseUrl = 'https://movies.unittap.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${config.label} Movies`,
    description: config.description,
    url: `${baseUrl}/recommendations/${mood}`,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        url: `${baseUrl}/movie/${m.id}`,
        image: m.image,
        datePublished: `${m.year}-01-01`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: m.rating,
          bestRating: '10',
        },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO HOME</Link>
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">{config.label} MOVIES</h1>
        <p className="text-xl md:text-2xl font-black text-gray-400 uppercase italic mb-6">{config.description}</p>
        <div className="flex gap-3 flex-wrap">
          {ALL_MOODS.map((m) => (
            <Link key={m} href={`/recommendations/${m}`} className={`border-4 border-black px-4 py-2 font-black text-xs uppercase ${m === mood ? 'bg-blue-600 text-white' : 'bg-white hover:bg-yellow-400'} transition`}>
              {MOOD_CONFIG[m].label}
            </Link>
          ))}
        </div>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {movies.map((item: any, index: number) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              <Image src={item.image} alt={`${item.title} (${item.year})`} fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-blue-600 text-white border-2 border-black text-[10px] font-black px-2 py-1">#{index + 1}</div>
              <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">{item.year}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
