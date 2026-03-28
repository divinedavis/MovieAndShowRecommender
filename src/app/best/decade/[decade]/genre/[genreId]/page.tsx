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

const DECADES = ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

const GENRES: Record<string, string> = {
  '28': 'Action',
  '35': 'Comedy',
  '18': 'Drama',
  '27': 'Horror',
  '878': 'Sci-Fi',
  '10749': 'Romance',
  '53': 'Thriller',
  '16': 'Animation',
};

export async function generateStaticParams() {
  const params: { decade: string; genreId: string }[] = [];
  for (const decade of DECADES) {
    for (const genreId of Object.keys(GENRES)) {
      params.push({ decade, genreId });
    }
  }
  return params;
}

interface Props {
  params: Promise<{ decade: string; genreId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { decade, genreId } = await params;
  const genreName = GENRES[genreId] || 'Movies';
  return {
    title: 'Best ' + genreName + ' Movies of the ' + decade + ' - Top Rated Films',
    description: 'Discover the highest rated ' + genreName.toLowerCase() + ' movies from the ' + decade + '. A curated list of the best ' + genreName.toLowerCase() + ' films of the decade.',
    keywords: ['best ' + genreName.toLowerCase() + ' movies ' + decade, decade + ' ' + genreName.toLowerCase() + ' films', 'top ' + genreName.toLowerCase() + ' ' + decade],
    alternates: { canonical: BASE_URL + '/best/decade/' + decade + '/genre/' + genreId },
    openGraph: {
      title: 'Best ' + genreName + ' Movies of the ' + decade + ' | UnitTap Movies',
      description: 'The top rated ' + genreName.toLowerCase() + ' films from the ' + decade + '.',
      type: 'website',
      url: BASE_URL + '/best/decade/' + decade + '/genre/' + genreId,
    },
  };
}

export default async function DecadeGenrePage({ params }: Props) {
  const { decade, genreId } = await params;
  const genreName = GENRES[genreId] || 'Movies';
  const decadeStart = parseInt(decade.replace('s', ''));
  const startDate = decadeStart + '-01-01';
  const endDate = (decadeStart + 9) + '-12-31';

  const data = await tmdbFetch('/discover/movie', {
    with_genres: genreId,
    'primary_release_date.gte': startDate,
    'primary_release_date.lte': endDate,
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
    name: 'Best ' + genreName + ' Movies of the ' + decade,
    description: 'Top rated ' + genreName.toLowerCase() + ' films from the ' + decade + '.',
    url: BASE_URL + '/best/decade/' + decade + '/genre/' + genreId,
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
        genre: genreName,
        aggregateRating: { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase mb-4">Best {genreName} of the {decade}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">Top Rated Films</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed font-medium mb-4">
            The {decade} produced some of the most memorable {genreName.toLowerCase()} films in cinema history. This curated list ranks the best {genreName.toLowerCase()} movies from {decadeStart} to {decadeStart + 9} based on audience ratings and critical acclaim.
          </p>
          {movies.length > 0 && (
            <p className="text-gray-700 text-lg leading-relaxed font-medium">
              Topping the list is <strong>{movies[0].title}</strong> ({movies[0].year}) with a rating of {movies[0].rating.toFixed(1)}/10. Whether you lived through the {decade} or are discovering these films for the first time, this collection represents the very best the decade had to offer in {genreName.toLowerCase()}.
            </p>
          )}
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">{decade} {genreName}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {movies.map((movie: any) => (
            <Link key={movie.id} href={'/movie/' + movie.id} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                {movie.image && <Image src={movie.image} alt={movie.title} fill className="object-cover" quality={85} />}
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{movie.rating.toFixed(1)}</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{movie.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{movie.year} // {genreName.toUpperCase()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-6 border-b-4 border-black pb-4">Explore More</h2>
        <div className="flex flex-wrap gap-3">
          {DECADES.filter(d => d !== decade).map(d => (
            <Link key={d} href={'/best/decade/' + d + '/genre/' + genreId} className="inline-block bg-black text-white font-black uppercase text-xs px-4 py-2 hover:bg-yellow-400 hover:text-black transition-colors border-2 border-black">
              {d} {genreName}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
