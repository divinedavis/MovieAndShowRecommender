import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string; year: string }>;
}

const TOP_GENRE_IDS = ['28', '35', '18', '27', '878', '53', '10749', '16'];
const YEARS = ['2020', '2021', '2022', '2023', '2024', '2025'];

const GENRE_ID_TO_NAME: Record<string, string> = {
  '28': 'Action',
  '35': 'Comedy',
  '18': 'Drama',
  '27': 'Horror',
  '878': 'Sci-Fi',
  '53': 'Thriller',
  '10749': 'Romance',
  '16': 'Animation',
};

export async function generateStaticParams() {
  return TOP_GENRE_IDS.flatMap(id =>
    YEARS.map(year => ({ id, year }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, year } = await params;
  const genreName = GENRE_ID_TO_NAME[id] || id;
  const baseUrl = 'https://movies.unittap.com';
  return {
    title: `Best ${genreName} Movies of ${year} - Top Rated & Reviewed`,
    description: `Discover the best ${genreName} movies released in ${year}. Top-rated and critically acclaimed ${genreName.toLowerCase()} films ranked by audience score.`,
    keywords: [`best ${genreName.toLowerCase()} movies ${year}`, `top ${genreName.toLowerCase()} films ${year}`, `${year} ${genreName.toLowerCase()} movies list`],
    alternates: {
      canonical: `${baseUrl}/genre/${id}/year/${year}`,
    },
    openGraph: {
      title: `Best ${genreName} Movies of ${year} | UnitTap Movies`,
      description: `Top-rated ${genreName} movies from ${year}, ranked by audience score.`,
      type: 'website',
    },
  };
}

async function getMoviesByGenreAndYear(genreId: string, year: string) {
  const API_KEY = process.env.TMDB_API_KEY;
  const res = await fetch(
    `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&primary_release_year=${year}&sort_by=vote_average.desc&vote_count.gte=100`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id,
    title: m.title,
    image: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
    year: new Date(m.release_date).getFullYear(),
    rating: m.vote_average || 0,
  }));
}

export const revalidate = 86400;

export default async function GenreYearPage({ params }: Props) {
  const { id, year } = await params;
  const genreName = GENRE_ID_TO_NAME[id] || id;
  const movies = await getMoviesByGenreAndYear(id, year);
  const baseUrl = 'https://movies.unittap.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${genreName} Movies of ${year}`,
    description: `Top-rated ${genreName} movies released in ${year}.`,
    url: `${baseUrl}/genre/${id}/year/${year}`,
    itemListElement: movies.slice(0, 10).map((item: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: item.title,
        url: `${baseUrl}/movie/${item.id}`,
        image: item.image,
        datePublished: `${item.year}-01-01`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: item.rating,
          bestRating: '10',
        },
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Genre', item: `${baseUrl}/genre/${id}` },
      { '@type': 'ListItem', position: 3, name: `${genreName} ${year}`, item: `${baseUrl}/genre/${id}/year/${year}` },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <header className="mb-20">
        <nav className="flex gap-2 text-blue-600 font-black uppercase text-xs tracking-widest mb-4 flex-wrap">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="text-gray-400">/</span>
          <Link href={`/genre/${id}`} className="hover:underline">{genreName}</Link>
          <span className="text-gray-400">/</span>
          <span>{year}</span>
        </nav>
        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">
          Best {genreName}
        </h1>
        <p className="text-3xl font-black text-blue-600 uppercase italic">{year} — TOP RATED</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {movies.map((item: any, i: number) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-black text-yellow-400 border-2 border-yellow-400 text-[10px] font-black px-2 py-1">#{i + 1}</div>
              <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden group-hover:text-blue-600">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">{item.year} // {genreName.toUpperCase()}</p>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-20 bg-white border-4 border-black p-8 rounded-2xl">
        <h2 className="text-2xl font-black uppercase italic mb-6">Browse by Year</h2>
        <div className="flex flex-wrap gap-4">
          {YEARS.map(y => (
            <Link key={y} href={`/genre/${id}/year/${y}`} className={`px-6 py-3 border-4 border-black font-black uppercase italic text-sm transition ${y === year ? 'bg-yellow-400' : 'bg-white hover:bg-yellow-400'}`}>{y}</Link>
          ))}
        </div>
      </section>
    </main>
  );
}
