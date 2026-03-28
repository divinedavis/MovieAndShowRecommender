import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://movies.unittap.com';

export const revalidate = 86400;

interface Props {
  params: Promise<{ id1: string; id2: string }>;
}

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY!);
  url.searchParams.append('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`TMDB API error: ${res.statusText}`);
  return res.json();
}

async function getActorData(id: string) {
  const data = await fetchFromTMDB(`/person/${id}`, { append_to_response: 'movie_credits' });
  const movies = (data.movie_credits?.cast || []).filter((m: any) => m.vote_count > 10);
  const totalFilms = movies.length;
  const avgRating = totalFilms > 0 ? movies.reduce((sum: number, m: any) => sum + (m.vote_average || 0), 0) / totalFilms : 0;
  const mostPopular = movies.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))[0];
  const genreCounts: Record<string, number> = {};
  movies.forEach((m: any) => (m.genre_ids || []).forEach((g: number) => { genreCounts[g] = (genreCounts[g] || 0) + 1; }));
  const topGenreId = Object.entries(genreCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0];
  const topMovies = movies.sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0)).slice(0, 10).map((m: any) => ({
    id: m.id, title: m.title, image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0, rating: m.vote_average || 0,
  }));
  return {
    id: data.id, name: data.name, image: data.profile_path ? `https://image.tmdb.org/t/p/h632${data.profile_path}` : null,
    birthday: data.birthday, totalFilms, avgRating: Number(avgRating.toFixed(1)),
    mostPopularFilm: mostPopular ? { title: mostPopular.title, rating: mostPopular.vote_average } : null,
    topGenreId, topMovies,
  };
}

const GENRE_MAP: Record<string, string> = {
  '28': 'Action', '12': 'Adventure', '16': 'Animation', '35': 'Comedy', '80': 'Crime',
  '99': 'Documentary', '18': 'Drama', '10751': 'Family', '14': 'Fantasy', '36': 'History',
  '27': 'Horror', '10402': 'Music', '9648': 'Mystery', '10749': 'Romance', '878': 'Sci-Fi',
  '10770': 'TV Movie', '53': 'Thriller', '10752': 'War', '37': 'Western',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id1, id2 } = await params;
  const [actor1, actor2] = await Promise.all([getActorData(id1), getActorData(id2)]);
  return {
    title: `${actor1.name} vs ${actor2.name} - Career Comparison`,
    description: `Compare ${actor1.name} and ${actor2.name}: total films, average ratings, most popular movies, and top genres. Who has the better filmography?`,
    keywords: [`${actor1.name} vs ${actor2.name}`, `${actor1.name} movies`, `${actor2.name} movies`, 'actor comparison', 'filmography comparison'],
    alternates: { canonical: `${BASE_URL}/compare/actors/${id1}/${id2}` },
    openGraph: {
      title: `${actor1.name} vs ${actor2.name} - Career Comparison | UnitTap Movies`,
      description: `Head-to-head career comparison of ${actor1.name} and ${actor2.name}.`,
      type: 'website',
    },
  };
}

export default async function ActorComparisonPage({ params }: Props) {
  const { id1, id2 } = await params;
  const [actor1, actor2] = await Promise.all([getActorData(id1), getActorData(id2)]);

  const actor1TopJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${actor1.name}'s Top Films`,
    itemListElement: actor1.topMovies.map((m: any, i: number) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'Movie', name: m.title, url: `${BASE_URL}/movie/${m.id}`, image: m.image },
    })),
  };

  const actor2TopJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${actor2.name}'s Top Films`,
    itemListElement: actor2.topMovies.map((m: any, i: number) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'Movie', name: m.title, url: `${BASE_URL}/movie/${m.id}`, image: m.image },
    })),
  };

  const narrative = `${actor1.name} has appeared in ${actor1.totalFilms} films with an average rating of ${actor1.avgRating}/10, while ${actor2.name} has ${actor2.totalFilms} films averaging ${actor2.avgRating}/10. ${actor1.mostPopularFilm ? `${actor1.name}'s most popular film is ${actor1.mostPopularFilm.title} (${actor1.mostPopularFilm.rating.toFixed(1)}/10)` : ''}${actor2.mostPopularFilm ? `, compared to ${actor2.name}'s ${actor2.mostPopularFilm.title} (${actor2.mostPopularFilm.rating.toFixed(1)}/10)` : ''}. ${actor1.topGenreId ? `${actor1.name} gravitates toward ${GENRE_MAP[actor1.topGenreId] || 'various'} films` : ''}${actor2.topGenreId ? `, while ${actor2.name} favors ${GENRE_MAP[actor2.topGenreId] || 'various'} movies` : ''}.`;

  const stats = [
    { label: 'Total Films', v1: actor1.totalFilms, v2: actor2.totalFilms },
    { label: 'Avg Rating', v1: actor1.avgRating, v2: actor2.avgRating },
    { label: 'Top Genre', v1: GENRE_MAP[actor1.topGenreId || ''] || 'N/A', v2: GENRE_MAP[actor2.topGenreId || ''] || 'N/A', isText: true },
    { label: 'Best Film', v1: actor1.mostPopularFilm?.title || 'N/A', v2: actor2.mostPopularFilm?.title || 'N/A', isText: true },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(actor1TopJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(actor2TopJsonLd) }} />
      <header className="mb-16">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">{actor1.name} VS {actor2.name}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">CAREER COMPARISON</p>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl">{narrative}</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      {/* Comparison Table */}
      <section className="mb-16">
        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="text-center">
            {actor1.image && <div className="relative w-32 h-32 mx-auto mb-4 border-4 border-black overflow-hidden"><Image src={actor1.image} alt={actor1.name} fill className="object-cover" /></div>}
            <h2 className="font-black text-xl uppercase">{actor1.name}</h2>
          </div>
          <div className="flex items-center justify-center font-black text-4xl text-gray-300">VS</div>
          <div className="text-center">
            {actor2.image && <div className="relative w-32 h-32 mx-auto mb-4 border-4 border-black overflow-hidden"><Image src={actor2.image} alt={actor2.name} fill className="object-cover" /></div>}
            <h2 className="font-black text-xl uppercase">{actor2.name}</h2>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-8 space-y-4">
          {stats.map((s) => (
            <div key={s.label} className="grid grid-cols-3 gap-4 border-4 border-black bg-white p-4">
              <div className={`text-center font-black text-lg ${!s.isText && Number(s.v1) > Number(s.v2) ? 'text-green-600' : ''}`}>{typeof s.v1 === 'number' ? s.v1.toFixed(1) : s.v1}</div>
              <div className="text-center font-black text-sm uppercase text-gray-500">{s.label}</div>
              <div className={`text-center font-black text-lg ${!s.isText && Number(s.v2) > Number(s.v1) ? 'text-green-600' : ''}`}>{typeof s.v2 === 'number' ? s.v2.toFixed(1) : s.v2}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Films Side by Side */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {[{ actor: actor1 }, { actor: actor2 }].map(({ actor }) => (
          <div key={actor.id}>
            <h2 className="text-3xl font-black italic uppercase mb-6">{actor.name}&apos;s Top Films</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {actor.topMovies.slice(0, 6).map((m: any, i: number) => (
                <Link key={m.id} href={`/movie/${m.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                  <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                    {m.image ? <Image src={m.image} alt={m.title} fill className="object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                    <div className="absolute top-2 left-2 bg-blue-600 text-white border-2 border-black text-[10px] font-black px-2 py-1">#{i + 1}</div>
                    <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{m.rating.toFixed(1)}</div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-black uppercase text-xs leading-tight">{m.title}</h3>
                    <p className="text-[10px] text-gray-500 font-black">{m.year || 'TBA'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
