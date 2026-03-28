import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://movies.unittap.com';

export const revalidate = 86400;

interface Props {
  params: Promise<{ lang: string }>;
}

const LANGUAGES: Record<string, string> = {
  en: 'English', fr: 'French', es: 'Spanish', ko: 'Korean', hi: 'Hindi',
  ja: 'Japanese', zh: 'Chinese', de: 'German', it: 'Italian', pt: 'Portuguese',
};

const LANG_CODES = Object.keys(LANGUAGES);

async function fetchByLanguage(lang: string) {
  const params = new URLSearchParams({
    api_key: API_KEY!, language: 'en-US', with_original_language: lang,
    sort_by: 'popularity.desc', 'vote_count.gte': '100', page: '1',
  });
  const res = await fetch(`${TMDB_BASE_URL}/discover/movie?${params.toString()}`, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.slice(0, 20).map((m: any) => ({
    id: m.id, title: m.title, image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0, rating: m.vote_average || 0,
  }));
}

export async function generateStaticParams() {
  return LANG_CODES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const langName = LANGUAGES[lang] || lang;
  return {
    title: `Best ${langName} Movies - Top Films in ${langName}`,
    description: `Discover the best ${langName} language movies. Top-rated and most popular films originally made in ${langName}, from classics to new releases.`,
    keywords: [`best ${langName.toLowerCase()} movies`, `${langName.toLowerCase()} language films`, `top ${langName.toLowerCase()} cinema`, `${langName.toLowerCase()} movie list`],
    alternates: { canonical: `${BASE_URL}/language/${lang}` },
    openGraph: { title: `Best ${langName} Movies | UnitTap Movies`, description: `Top ${langName} language films ranked by popularity.`, type: 'website' },
  };
}

export default async function LanguagePage({ params }: Props) {
  const { lang } = await params;
  const langName = LANGUAGES[lang] || lang;
  const movies = await fetchByLanguage(lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${langName} Movies`,
    url: `${BASE_URL}/language/${lang}`,
    numberOfItems: movies.length,
    itemListElement: movies.map((m: any, i: number) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'Movie', name: m.title, url: `${BASE_URL}/movie/${m.id}`, image: m.image,
        aggregateRating: m.rating ? { '@type': 'AggregateRating', ratingValue: m.rating, bestRating: '10' } : undefined },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-4">BEST {langName.toUpperCase()} MOVIES</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">TOP FILMS IN {langName.toUpperCase()}</p>
        <div className="flex gap-3 mt-6 flex-wrap">
          {LANG_CODES.map((l) => (
            <Link key={l} href={`/language/${l}`} className={`border-4 border-black px-4 py-2 font-black text-sm uppercase ${l === lang ? 'bg-blue-600 text-white' : 'bg-white hover:bg-yellow-400'} transition`}>
              {LANGUAGES[l]}
            </Link>
          ))}
        </div>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {movies.map((item: any, index: number) => (
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
    </main>
  );
}
