import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { getMediaData, MediaItem } from '@/lib/tmdb';
import { getCountryByLang, TOP_COUNTRIES } from '@/lib/countries';
import { getTranslations } from '@/lib/translations';
import RegionSelector from '@/components/RegionSelector';

interface Props {
  lang?: string;
}

export async function generateMetadata({ lang = 'en-US' }: Props): Promise<Metadata> {
  const country = getCountryByLang(lang.split('-')[0]);
  const t = getTranslations(lang);
  const baseUrl = 'https://movies.unittap.com';
  
  return {
    title: `${t.seoTitle} ${country.name}`,
    description: `${t.seoDesc} ${country.name}. ${t.mostPopularReleases} ${country.name}.`,
    alternates: { 
      canonical: lang === 'en-US' ? baseUrl : `${baseUrl}/${lang.split('-')[0]}`,
      languages: {
        'x-default': baseUrl,
        'en-US': baseUrl,
        'fr-FR': `${baseUrl}/fr`,
        'es-ES': `${baseUrl}/es`,
        'ko-KR': `${baseUrl}/ko`,
        'hi-IN': `${baseUrl}/hi`,
      }
    },
    openGraph: {
      title: `${t.seoTitle} ${country.name}`,
      description: `${t.seoDesc} ${country.name}.`,
      images: ['/logo.png'],
    }
  };
}

function MediaCard({ item }: { item: MediaItem }) {
  return (
    <Link href={`/${item.type}/${item.id}`} className="block bg-white rounded-2xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
      <div className="relative aspect-[2/3] w-full border-b-4 border-black">
        <Image
          src={item.image}
          alt={`Poster for ${item.title}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 right-3 bg-yellow-400 border-2 border-black text-black font-black text-[10px] md:text-xs px-2 py-1 italic">
          {item.rating} IMDB
        </div>
        {item.isWinner && (
          <div className="absolute top-3 left-3 bg-blue-600 border-2 border-black text-white font-black text-[10px] px-2 py-1 uppercase tracking-tighter italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce">
            WINNER
          </div>
        )}
      </div>
      <div className="p-4 md:p-5">
        <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter leading-none mb-3 h-12 md:h-14 overflow-hidden group-hover:text-blue-600 transition-colors break-words">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mb-4">
            <span className="bg-gray-100 border border-black px-2 py-0.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest">{item.year}</span>
            <span className="bg-gray-100 border border-black px-2 py-0.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest">{item.type === 'movie' ? 'MOVIE' : 'SERIES'}</span>
        </div>
        <p className="text-gray-700 text-[10px] md:text-xs font-bold leading-relaxed line-clamp-2 h-8 md:h-10">{item.description}</p>
      </div>
    </Link>
  );
}

function Section({ title, items, id, subtitle, link, viewAllText = '+ VIEW ALL' }: { title: string, subtitle?: string, items: MediaItem[], id?: string, link?: string, viewAllText?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-16 md:mb-24" id={id}>
      <div className="flex flex-col mb-8 md:mb-12">
        {link ? (
          <Link href={link} className="group inline-block">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-black uppercase italic inline-block group-hover:text-blue-600 transition-colors leading-tight">{title}</h2>
            <span className="ml-0 md:ml-4 text-gray-400 font-black italic uppercase text-xs md:text-lg group-hover:text-blue-600 block md:inline mt-2 md:mt-0">{viewAllText}</span>
          </Link>
        ) : (
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-black uppercase italic inline-block leading-tight">{title}</h2>
        )}
        {subtitle && <p className="text-blue-600 font-black uppercase tracking-widest text-[10px] md:text-xs mt-2 italic underline decoration-2 md:decoration-4">{subtitle}</p>}
        <div className="w-full h-1.5 md:h-2 bg-black mt-4 md:mt-6"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default async function Home({ lang = 'en-US' }: { lang?: string }) {
  const country = getCountryByLang(lang.split('-')[0]);
  const t = getTranslations(lang);
  const { movies, shows, top2025, top2026Month, localAwards, currentMonthName } = await getMediaData(lang, country.code);

  const topRegions = TOP_COUNTRIES.slice(0, 5);
  const otherRegions = TOP_COUNTRIES.slice(5);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 font-sans selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      <header className="bg-white border-b-4 border-black sticky top-0 z-50 shadow-md py-4 md:py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <Link href="/" className="flex items-center flex-shrink-0">
                <Image src="/logo.png" alt="MovieRec Logo" width={180} height={60} className="h-10 md:h-12 w-auto" priority />
            </Link>
            <Link href="/compare" className="bg-yellow-400 border-2 md:border-4 border-black text-black px-3 md:px-4 py-1 md:py-1.5 font-black text-[10px] md:text-sm uppercase italic tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all whitespace-nowrap">
                {t.compare} →
            </Link>
          </div>
          <nav className="flex items-center space-x-4 md:space-x-6 text-[10px] font-black uppercase tracking-widest overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {/* Country Selector */}
            <RegionSelector 
                currentCountry={country}
                topCountries={topRegions}
                otherCountries={otherRegions}
                t={t}
            />
            <Link href="/best/netflix/03" className="hover:text-red-600 whitespace-nowrap">{t.netflix}</Link>
            <Link href="/best/max/03" className="hover:text-blue-600 whitespace-nowrap">{t.max}</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        
        <Section 
          id="oscars"
          title={country.awardCeremony} 
          subtitle={`${country.name} Local Cinema // 2026 ${t.winnersAndNominees}`}
          items={localAwards} 
          link={`/awards/${country.code.toLowerCase()}`}
          viewAllText={t.viewAll}
        />

        <Section 
          id="2026"
          title={`${t.topMoviesThisMonth} ${currentMonthName}`} 
          subtitle={`${t.mostPopularReleases} ${country.name} (${currentMonthName})`}
          items={top2026Month} 
          link={`/calendar/2026/03`}
          viewAllText={t.viewAll}
        />

        <Section 
          id="2025"
          title="Top from 2025" 
          subtitle={t.theAbsoluteBestMovies}
          items={top2025} 
        />

        <div id="movies">
          <Section 
            title={`${t.topBoxOffice} ${country.name}`} 
            items={movies.filter(m => m.category === 'box-office')} 
          />
        </div>

        <div id="shows">
          <Section 
            title={t.trendingShows} 
            items={shows.filter(s => s.category === 'streaming')} 
          />
        </div>
      </div>

      <footer className="bg-gray-950 text-white py-16 md:py-24 mt-20 border-t-8 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <Image src="/logo.png" alt="MovieRec Logo" width={150} height={50} className="h-10 w-auto invert brightness-0 grayscale opacity-50 mb-8 md:mb-0" />
          </div>
          <div className="pt-12 border-t border-gray-900 text-gray-500 text-[10px] font-black uppercase tracking-widest">
            © {new Date().getFullYear()} MOVIEREC. THE 1M MAU MISSION.
          </div>
        </div>
      </footer>
    </main>
  );
}
