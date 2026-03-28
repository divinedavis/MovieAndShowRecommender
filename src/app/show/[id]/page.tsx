import Image from 'next/image';
import Link from 'next/link';
import { getMediaDetails } from '@/lib/tmdb';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const details = await getMediaDetails(id, 'show');
  const baseUrl = 'https://movies.unittap.com';
  return {
    title: `Watch ${details.title} (${details.year}) - Stream & Full Cast`,
    description: details.description.substring(0, 160),
    alternates: {
      canonical: `${baseUrl}/show/${id}`,
      languages: {
        'en-US': `${baseUrl}/show/${id}`,
        'fr-FR': `${baseUrl}/fr/show/${id}`,
        'es-ES': `${baseUrl}/es/show/${id}`,
        'ko-KR': `${baseUrl}/ko/show/${id}`,
        'hi-IN': `${baseUrl}/hi/show/${id}`,
      },
    },
    openGraph: { 
      title: details.title,
      description: details.description.substring(0, 160),
      images: [details.image],
      type: 'video.tv_show'
    }
  };
}

export default async function ShowPage({ params }: Props) {
  const { id } = await params;
  const details = await getMediaDetails(id, 'show');

  const trailerUrl = details.trailerKey 
    ? `https://www.youtube.com/watch?v=${details.trailerKey}`
    : null;

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: details.title,
    description: details.description,
    image: details.image,
    datePublished: `${details.year}-01-01`,
    genre: details.genres,
    url: `https://movies.unittap.com/show/${id}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: details.rating,
      bestRating: '10',
      ratingCount: String(details.voteCount)
    },
    actor: details.cast.slice(0, 5).map((c: any) => ({
      '@type': 'Person',
      name: c.name,
      url: `https://movies.unittap.com/person/${c.id}`
    })),
    offers: {
      '@type': 'AggregateOffer',
      availability: 'https://schema.org/OnlineOnly',
      category: 'streaming'
    }
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://movies.unittap.com' },
      { '@type': 'ListItem', position: 2, name: 'Shows', item: 'https://movies.unittap.com/genre/drama' },
      { '@type': 'ListItem', position: 3, name: details.title, item:  }
    ]
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 font-sans selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="relative h-[50vh] md:h-[65vh] w-full shadow-inner">
        <Image src={details.image} alt={`Poster backdrop for ${details.title}`} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <nav className="flex text-white/60 text-[10px] font-black uppercase tracking-widest mb-4 gap-2 flex-wrap">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">{details.title}</span>
          </nav>
          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 italic tracking-tighter shadow-2xl leading-tight break-words">{details.title.toUpperCase()}</h1>
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white font-black text-[10px] md:text-xs uppercase tracking-widest">
            <span className="bg-yellow-400 text-black px-3 py-1.5 rounded font-black text-sm italic">{(details.rating || 0).toFixed(1)} IMDB</span>
            <span>{details.year}</span>
            <div className="flex gap-2 md:gap-3 flex-wrap">
              {details.genres.map((g: string) => (
                <span key={g} className="border-2 border-white/40 px-3 py-1 rounded text-[10px]">{g.toUpperCase()}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-20">
        <div className="lg:col-span-2 space-y-12 md:space-y-16">
          <section>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-l-8 border-blue-600 pl-6">
                <h2 className="text-2xl md:text-3xl font-black italic tracking-tight uppercase">The Story</h2>
                <div className="flex gap-3 md:gap-4 flex-wrap">
                    {trailerUrl && (
                        <a 
                          href={trailerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 text-white text-[10px] font-black px-4 py-2 uppercase hover:bg-red-700 transition border-2 border-black flex items-center gap-2 whitespace-nowrap"
                        >
                          <span className="text-lg">▶</span> OFFICIAL TRAILER
                        </a>
                    )}
                </div>
            </div>
            <p className="text-gray-800 text-lg md:text-xl leading-relaxed font-medium">{details.description}</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-black mb-8 italic tracking-tight border-l-8 border-blue-600 pl-6 uppercase">The Crew</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
              {details.cast.map((c: any) => (
                <Link key={c.id} href={`/person/${c.id}`} className="group">
                  {c.image && <div className="relative aspect-[2/3] md:h-44 w-full mb-3 rounded-xl overflow-hidden shadow-lg group-hover:shadow-blue-200 transition-all group-hover:scale-105">
                    <Image src={c.image} alt={`Actor ${c.name}`} fill className="object-cover" />
                  </div>}
                  <p className="font-black text-xs md:text-sm uppercase tracking-tight group-hover:text-blue-600 transition-colors">{c.name}</p>
                  <p className="text-gray-400 text-[9px] md:text-[10px] font-black uppercase">{c.character}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8 md:space-y-12">
          <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black mb-6 uppercase text-xs tracking-widest text-blue-600">STREAMING PROVIDERS</h3>
            {details.streamingProviders.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {details.streamingProviders.map((p: string) => (
                  <a 
                    key={p} 
                    href={details.watchLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border-2 border-gray-200 hover:border-black transition-colors group"
                  >
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-black text-xs md:text-sm uppercase italic group-hover:text-blue-600">{p}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-xs font-bold uppercase italic">Check availability on Netflix / Max / Amazon Prime</p>
            )}
            <a 
              href={details.watchLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-600 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl hover:bg-blue-700 transition mt-6 md:mt-8 shadow-xl uppercase italic tracking-widest text-xs md:text-sm border-2 border-black inline-block text-center"
            >
              WATCH NOW
            </a>
          </div>

          <div>
            <h3 className="font-black mb-6 md:mb-8 uppercase text-xs md:text-sm tracking-tight border-b-2 border-gray-100 pb-4 italic">SIMILAR SHOWS</h3>
            <div className="space-y-4 md:space-y-6">
              {details.similar.slice(0, 5).map((s: any) => (
                <Link key={s.id} href={`/show/${s.id}`} className="flex items-center space-x-4 md:space-x-5 group">
                  <div className="relative aspect-[2/3] md:h-24 w-14 md:w-16 flex-shrink-0 shadow-md group-hover:shadow-xl transition-all">
                    <Image src={s.image} alt={`Similar show ${s.title}`} fill className="object-cover rounded-xl" />
                  </div>
                  <p className="font-black text-xs md:text-sm uppercase group-hover:text-blue-600 transition tracking-tighter leading-tight break-words">{s.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
