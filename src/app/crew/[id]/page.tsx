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
    const person = await tmdbFetch('/person/' + id, { append_to_response: 'combined_credits' });
    const crewCredits = person.combined_credits?.crew || [];
    const departments = [...new Set(crewCredits.map((c: any) => c.department))].filter(Boolean);
    const mainDept = person.known_for_department !== 'Acting' ? person.known_for_department : (departments[0] || 'Crew');
    return {
      title: person.name + ' - Filmography as ' + mainDept,
      description: 'Explore the complete filmography of ' + person.name + ' as ' + mainDept + '. All their work ranked by rating.',
      alternates: { canonical: BASE_URL + '/crew/' + id },
      openGraph: {
        title: person.name + ' Filmography | UnitTap Movies',
        description: person.name + ' - complete crew filmography ranked by rating.',
        type: 'website',
        url: BASE_URL + '/crew/' + id,
      },
    };
  } catch {
    return { title: 'Crew Filmography' };
  }
}

export default async function CrewPage({ params }: Props) {
  const { id } = await params;
  const person = await tmdbFetch('/person/' + id, { append_to_response: 'combined_credits' });
  const crewCredits = (person.combined_credits?.crew || [])
    .filter((c: any) => c.media_type === 'movie' && c.vote_count > 10)
    .sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0));

  const seen = new Set<number>();
  const uniqueCredits = crewCredits.filter((c: any) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  }).slice(0, 30);

  const departments = [...new Set(uniqueCredits.map((c: any) => c.department))].filter(Boolean);
  const mainDept = person.known_for_department !== 'Acting' ? person.known_for_department : (departments[0] || 'Crew');

  const movies = uniqueCredits.map((m: any) => ({
    id: m.id,
    title: m.title || m.name,
    image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
    rating: m.vote_average || 0,
    job: m.job || m.department,
  }));

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    url: BASE_URL + '/crew/' + id,
    image: person.profile_path ? 'https://image.tmdb.org/t/p/h632' + person.profile_path : undefined,
    jobTitle: mainDept,
    birthDate: person.birthday || undefined,
    birthPlace: person.place_of_birth || undefined,
  };

  const listJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: person.name + ' Filmography',
    description: person.name + ' films as ' + mainDept + ', ranked by rating.',
    url: BASE_URL + '/crew/' + id,
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: m.title,
        url: BASE_URL + '/movie/' + m.id,
        image: m.image,
        aggregateRating: { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <div className="flex items-start gap-8 mb-6">
          {person.profile_path && (
            <div className="relative w-32 h-44 shrink-0 border-4 border-black">
              <Image src={'https://image.tmdb.org/t/p/h632' + person.profile_path} alt={person.name} fill className="object-cover" />
            </div>
          )}
          <div>
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-2">{person.name}</h1>
            <p className="text-2xl font-black text-gray-400 uppercase italic">{mainDept} Filmography</p>
          </div>
        </div>
        <div className="w-full h-4 bg-black mt-4"></div>
      </header>

      {person.biography && (
        <section className="mb-16 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed font-medium">{person.biography.slice(0, 500)}{person.biography.length > 500 ? '...' : ''}</p>
          </div>
        </section>
      )}

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Work as {mainDept}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {movies.map((movie: any) => (
            <Link key={movie.id} href={'/movie/' + movie.id} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                {movie.image && <Image src={movie.image} alt={movie.title} fill className="object-cover" quality={85} />}
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{movie.rating.toFixed(1)}</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{movie.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{movie.year} // {movie.job}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
