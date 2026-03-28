import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://movies.unittap.com';

export const revalidate = 86400;

interface Props {
  params: Promise<{ year: string }>;
}

const YEARS = ['2020', '2021', '2022', '2023', '2024', '2025'];

async function fetchYearData(year: string) {
  const baseParams = { api_key: API_KEY!, language: 'en-US', primary_release_year: year, page: '1' };
  const [highestRated, mostPopular, boxOffice] = await Promise.all([
    fetch(`${TMDB_BASE_URL}/discover/movie?${new URLSearchParams({ ...baseParams, sort_by: 'vote_average.desc', 'vote_count.gte': '200' })}`, { next: { revalidate: 86400 } }).then(r => r.json()),
    fetch(`${TMDB_BASE_URL}/discover/movie?${new URLSearchParams({ ...baseParams, sort_by: 'popularity.desc' })}`, { next: { revalidate: 86400 } }).then(r => r.json()),
    fetch(`${TMDB_BASE_URL}/discover/movie?${new URLSearchParams({ ...baseParams, sort_by: 'revenue.desc', 'vote_count.gte': '50' })}`, { next: { revalidate: 86400 } }).then(r => r.json()),
  ]);
  const mapMovies = (results: any[]) => results.slice(0, 10).map((m: any) => ({
    id: m.id, title: m.title, image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0, rating: m.vote_average || 0,
  }));
  return {
    highestRated: mapMovies(highestRated.results || []),
    mostPopular: mapMovies(mostPopular.results || []),
    boxOffice: mapMovies(boxOffice.results || []),
  };
}

export async function generateStaticParams() {
  return YEARS.map((year) => ({ year }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year} in Movies - The Best Films of ${year}`,
    description: `A complete look at ${year} in movies. Discover the highest rated, most popular, and biggest box office hits of ${year}.`,
    keywords: [`best movies ${year}`, `${year} movies`, `top films ${year}`, `${year} box office`, `${year} movie review`],
    alternates: { canonical: `${BASE_URL}/year/${year}` },
    openGraph: { title: `${year} in Movies | UnitTap Movies`, description: `The best films of ${year} - highest rated, most popular, and box office hits.`, type: 'website' },
  };
}

export default async function YearInReviewPage({ params }: Props) {
  const { year } = await params;
  const data = await fetchYearData(year);

  const allMovies = [...data.highestRated, ...data.mostPopular, ...data.boxOffice];
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best Movies of ${year}`,
    url: `${BASE_URL}/year/${year}`,
    numberOfItems: data.highestRated.length,
    itemListElement: data.highestRated.map((m: any, i: number) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'Movie', name: m.title, url: `${BASE_URL}/movie/${m.id}`, image: m.image,
        aggregateRating: m.rating ? { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' } : undefined },
    })),
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${year} in Movies - The Best Films of ${year}`,
    url: `${BASE_URL}/year/${year}`,
    author: { '@type': 'Organization', name: 'UnitTap Movies' },
    publisher: { '@type': 'Organization', name: 'UnitTap Movies', url: BASE_URL },
    datePublished: `${year}-12-31`,
  };

  const topRated = data.highestRated[0];
  const topPopular = data.mostPopular[0];
  const narrative = `${year} was a remarkable year for cinema. ${topRated ? `The highest-rated film was ${topRated.title} with a score of ${topRated.rating.toFixed(1)}/10.` : ''} ${topPopular ? `The most talked-about movie was ${topPopular.title}.` : ''} Here is a comprehensive look at the best films ${year} had to offer.`;

  const sections = [
    { title: 'HIGHEST RATED', movies: data.highestRated },
    { title: 'MOST POPULAR', movies: data.mostPopular },
    { title: 'BOX OFFICE HITS', movies: data.boxOffice },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">{year} IN MOVIES</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">THE BEST FILMS OF THE YEAR</p>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl">{narrative}</p>
        <div className="flex gap-3 mt-6 flex-wrap">
          {YEARS.map((y) => (
            <Link key={y} href={`/year/${y}`} className={`border-4 border-black px-4 py-2 font-black text-sm uppercase ${y === year ? 'bg-blue-600 text-white' : 'bg-white hover:bg-yellow-400'} transition`}>
              {y}
            </Link>
          ))}
        </div>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      {sections.map((section) => (
        <section key={section.title} className="mb-16">
          <h2 className="text-4xl font-black italic uppercase mb-8 border-b-4 border-black pb-4">{section.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {section.movies.map((item: any, index: number) => (
              <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                  {item.image ? <Image src={item.image} alt={`${item.title} (${item.year})`} fill className="object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-black">NO IMAGE</div>}
                  <div className="absolute top-2 left-2 bg-blue-600 text-white border-2 border-black text-[10px] font-black px-2 py-1">#{index + 1}</div>
                  <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase">{item.year || 'TBA'}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
