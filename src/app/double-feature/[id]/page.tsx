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

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await tmdbFetch('/movie/' + id);
    const similar = await tmdbFetch('/movie/' + id + '/similar');
    const mainYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 2000;
    const pair = similar.results.find((m: any) => {
      const y = m.release_date ? new Date(m.release_date).getFullYear() : mainYear;
      return Math.abs(y - mainYear) >= 5 && m.vote_average >= 6;
    }) || similar.results[0];
    const pairTitle = pair ? pair.title : 'A Perfect Pairing';
    return {
      title: movie.title + ' + ' + pairTitle + ': The Perfect Double Feature',
      description: 'The ultimate double feature pairing: ' + movie.title + ' and ' + pairTitle + '. Two great films that complement each other perfectly.',
      alternates: { canonical: BASE_URL + '/double-feature/' + id },
      openGraph: {
        title: movie.title + ' + ' + pairTitle + ' Double Feature',
        description: 'The perfect double feature pairing for movie night.',
        type: 'website',
        url: BASE_URL + '/double-feature/' + id,
      },
    };
  } catch {
    return { title: 'Double Feature Recommendation' };
  }
}

export default async function DoubleFeaturePage({ params }: Props) {
  const { id } = await params;
  const movie = await tmdbFetch('/movie/' + id, { append_to_response: 'similar' });
  const mainYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 2000;
  const genres = (movie.genres || []).map((g: any) => g.name);
  const genreLabel = genres[0] || 'movie';

  const similarMovies = movie.similar?.results || [];
  const pair = similarMovies.find((m: any) => {
    const y = m.release_date ? new Date(m.release_date).getFullYear() : mainYear;
    return Math.abs(y - mainYear) >= 5 && m.vote_average >= 6;
  }) || similarMovies.find((m: any) => m.vote_average >= 6) || similarMovies[0];

  if (!pair) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-4">Double Feature</h1>
        <p className="text-lg text-gray-600">No suitable pairing found for this movie.</p>
      </main>
    );
  }

  const pairDetails = await tmdbFetch('/movie/' + pair.id);
  const movies = [
    {
      id: movie.id,
      title: movie.title,
      image: movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : null,
      year: mainYear,
      rating: movie.vote_average || 0,
      runtime: movie.runtime || 0,
      description: movie.overview,
    },
    {
      id: pairDetails.id,
      title: pairDetails.title,
      image: pairDetails.poster_path ? 'https://image.tmdb.org/t/p/w500' + pairDetails.poster_path : null,
      year: pairDetails.release_date ? new Date(pairDetails.release_date).getFullYear() : 0,
      rating: pairDetails.vote_average || 0,
      runtime: pairDetails.runtime || 0,
      description: pairDetails.overview,
    },
  ];

  const totalRuntime = movies[0].runtime + movies[1].runtime;
  const hours = Math.floor(totalRuntime / 60);
  const mins = totalRuntime % 60;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: movies[0].title + ' + ' + movies[1].title + ': Double Feature',
    description: 'The perfect double feature pairing.',
    url: BASE_URL + '/double-feature/' + id,
    numberOfItems: 2,
    itemListElement: movies.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        url: BASE_URL + '/movie/' + m.id,
        image: m.image,
        datePublished: m.year + '-01-01',
        duration: 'PT' + m.runtime + 'M',
        aggregateRating: { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase mb-4">Double Feature</h1>
        <p className="text-xl md:text-2xl font-black text-gray-400 uppercase italic">{movies[0].title} + {movies[1].title}</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <section className="mb-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed font-medium mb-4">
            Start your evening with <strong>{movies[0].title}</strong> ({movies[0].year}) then follow up with <strong>{movies[1].title}</strong> ({movies[1].year}) for the ultimate {genreLabel.toLowerCase()} night. Together, these two films create a viewing experience that&apos;s greater than the sum of its parts.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed font-medium">
            Total runtime: <strong>{hours}h {mins}m</strong>. Grab your snacks, settle in, and enjoy this perfectly paired double feature.
          </p>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">The Pairing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {movies.map((m, i) => (
            <Link key={m.id} href={'/movie/' + m.id} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                {m.image && <Image src={m.image} alt={m.title} fill className="object-cover" quality={85} />}
                <div className="absolute top-2 left-2 bg-black text-white text-xs font-black px-3 py-1">
                  {i === 0 ? 'FIRST' : 'SECOND'}
                </div>
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{m.rating.toFixed(1)}</div>
              </div>
              <div className="p-6">
                <h3 className="font-black uppercase text-lg leading-tight mb-2">{m.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase mb-3">{m.year} // {m.runtime} MIN</p>
                <p className="text-sm text-gray-600 line-clamp-3">{m.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 border-b-4 border-black pb-4">More Double Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {similarMovies.slice(0, 5).filter((m: any) => m.id !== pair.id).map((m: any) => (
            <Link key={m.id} href={'/double-feature/' + m.id} className="block bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                {m.poster_path && <Image src={'https://image.tmdb.org/t/p/w500' + m.poster_path} alt={m.title} fill className="object-cover" quality={85} />}
              </div>
              <div className="p-3">
                <h3 className="font-black uppercase text-[10px] leading-tight">{m.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
