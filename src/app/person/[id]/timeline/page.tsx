import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 3600;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

interface Props {
  params: Promise<{ id: string }>;
}

async function getPersonTimeline(id: string) {
  const url = `${TMDB_BASE_URL}/person/${id}?api_key=${API_KEY}&language=en-US&append_to_response=combined_credits`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  const credits = data.combined_credits.cast
    .filter((c: any) => c.release_date || c.first_air_date)
    .sort((a: any, b: any) => {
      const dateA = new Date(a.release_date || a.first_air_date).getTime();
      const dateB = new Date(b.release_date || b.first_air_date).getTime();
      return dateA - dateB;
    })
    .map((c: any) => ({
      id: c.id,
      title: c.title || c.name,
      type: c.media_type === 'tv' ? 'show' : 'movie',
      image: c.poster_path ? `https://image.tmdb.org/t/p/w500${c.poster_path}` : null,
      year: new Date(c.release_date || c.first_air_date).getFullYear(),
      releaseDate: c.release_date || c.first_air_date,
      rating: c.vote_average || 0,
      character: c.character || '',
    }));
  return {
    name: data.name,
    image: data.profile_path ? `https://image.tmdb.org/t/p/h632${data.profile_path}` : null,
    credits,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getPersonTimeline(id);
  const name = data?.name || 'Actor';
  const baseUrl = 'https://movies.unittap.com';
  return {
    title: `${name} Complete Filmography Timeline`,
    description: `Explore ${name}'s complete filmography in chronological order. See every movie and TV show from their career, from earliest to latest.`,
    keywords: [`${name} filmography`, `${name} movies list`, `${name} timeline`, `${name} career`, `${name} all movies`],
    alternates: { canonical: `${baseUrl}/person/${id}/timeline` },
    openGraph: {
      title: `${name} Complete Filmography Timeline | UnitTap Movies`,
      description: `Every movie and show by ${name}, in chronological order.`,
      type: 'profile',
    },
  };
}

export default async function PersonTimelinePage({ params }: Props) {
  const { id } = await params;
  const data = await getPersonTimeline(id);
  if (!data) return <div>Person not found</div>;
  const baseUrl = 'https://movies.unittap.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${data.name} Complete Filmography`,
    description: `Chronological filmography of ${data.name}.`,
    url: `${baseUrl}/person/${id}/timeline`,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: data.credits.map((c: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': c.type === 'movie' ? 'Movie' : 'TVSeries',
        name: c.title,
        url: `${baseUrl}/${c.type}/${c.id}`,
        datePublished: c.releaseDate,
      },
    })),
  };

  // Group by decade
  const decades: Record<string, typeof data.credits> = {};
  data.credits.forEach((c) => {
    const decade = `${Math.floor(c.year / 10) * 10}s`;
    if (!decades[decade]) decades[decade] = [];
    decades[decade].push(c);
  });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href={`/person/${id}`} className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO {data.name.toUpperCase()}</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">{data.name}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">COMPLETE FILMOGRAPHY TIMELINE</p>
        <p className="text-lg font-bold text-gray-500 mt-2">{data.credits.length} credits in chronological order</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      {Object.entries(decades).map(([decade, credits]) => (
        <section key={decade} className="mb-16">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8 border-b-8 border-black pb-4">{decade}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {credits.filter((c: any) => c.image).map((item: any) => (
              <Link key={`${item.id}-${item.character}`} href={`/${item.type}/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                  <Image src={item.image} alt={`${item.title} (${item.year})`} fill className="object-cover" />
                  <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-black uppercase text-sm leading-tight mb-1 h-10 overflow-hidden">{item.title}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase">{item.year} // {item.type.toUpperCase()}</p>
                  {item.character && <p className="text-[10px] text-blue-600 font-bold mt-1">as {item.character}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
