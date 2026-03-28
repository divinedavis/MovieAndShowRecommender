import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAwardMultiCeremonyData } from '@/lib/tmdb';
import { getCountryByCode } from '@/lib/countries';
import { getTranslations } from '@/lib/translations';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const isGlobal = slug === 'oscars' || slug === 'black-reel' || slug === 'best-picture';
  const country = isGlobal ? null : getCountryByCode(slug);
  const lang = country?.lang || 'en-US';
  const t = getTranslations(lang);
  const name = country ? country.name : (slug === 'black-reel' ? 'Black Reel' : 'Oscars');
  
  return {
    title: `${t.awardsSeoTitle} ${name}`,
    description: `${t.awardsSeoDesc} ${name}.`,
  };
}

export default async function AwardCeremonyPage({ params }: Props) {
  const { slug } = await params;
  
  const isGlobal = slug === 'oscars' || slug === 'black-reel' || slug === 'best-picture';
  const type = isGlobal ? (slug === 'black-reel' ? 'black-reel' : 'oscars') : slug.toUpperCase();
  
  const country = isGlobal ? null : getCountryByCode(slug);
  const lang = country?.lang || 'en-US';
  const t = getTranslations(lang);
  
  const ceremonies = await getAwardMultiCeremonyData(type, lang, country?.code || 'US');

  const ceremonyDisplayName = country
    ? `${country.name} Cinema Awards`
    : (type === 'oscars' ? 'Mainstream Cinema Awards' : 'Black Excellence in Cinema');

  const eventOrganizer = type === 'oscars'
    ? 'Academy of Motion Picture Arts and Sciences'
    : type === 'black-reel'
    ? 'Black Reel Awards Organization'
    : `${country?.name || 'International'} Film Academy`;

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ceremonyDisplayName,
    startDate: '2026',
    location: { '@type': 'Place', name: 'Hollywood' },
    organizer: { '@type': 'Organization', name: eventOrganizer }
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://movies.unittap.com' },
      { '@type': 'ListItem', position: 2, name: 'Awards', item: 'https://movies.unittap.com' },
      { '@type': 'ListItem', position: 3, name: ceremonyDisplayName, item: `https://movies.unittap.com/awards/${slug}` }
    ]
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10 font-sans selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <header className="mb-20">
        <Link href={lang === 'en-US' ? '/' : `/${lang.split('-')[0]}`} className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">{t.backToDiscovery}</Link>
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-4">
          {country ? `${country.name} Cinema Awards` : (type === 'oscars' ? 'Mainstream Cinema Awards' : 'Black Excellence in Cinema')}
        </h1>
        <p className="text-xl md:text-2xl font-black text-gray-400 uppercase italic">2026 CEREMONIES // {t.winnersAndNominees}</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      {ceremonies.map((ceremony: any) => (
        <section key={ceremony.name} className="mb-24">
          <h2 className="text-3xl md:text-4xl font-black uppercase italic border-l-8 border-blue-600 pl-6 mb-10 tracking-tight leading-tight">
            {ceremony.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {ceremony.nominees.map((n: any) => (
              <Link key={n.id} href={`/movie/${n.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                  <Image src={n.image} alt={`Poster for ${n.title}`} fill className="object-cover transition-transform group-hover:scale-110" />
                  {n.isWinner && (
                    <div className="absolute top-3 left-3 bg-yellow-400 border-2 border-black text-black font-black text-[10px] px-2 py-1 uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      WINNER
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-black uppercase text-lg leading-none mb-2 group-hover:text-blue-600">{n.title}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase">{n.year} RELEASE</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
