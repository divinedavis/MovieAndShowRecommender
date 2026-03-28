import Image from 'next/image';
import Link from 'next/link';
import { getMediaDetails } from '@/lib/tmdb';
import { Metadata } from 'next';
import { LinkifyDescription } from '@/lib/seo';

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const API_KEY = process.env.TMDB_API_KEY;
  const pages = [1, 2, 3, 4, 5];
  const results = await Promise.all(
    pages.map(p => fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${p}`).then(r => r.json()))
  );
  const ids = results.flatMap((data: any) => data.results.map((m: any) => ({ id: String(m.id) })));
  return ids;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const details = await getMediaDetails(id, 'movie');
  const director = details.credits?.crew?.find((c: any) => c.job === 'Director') || null;
  const baseUrl = 'https://movies.unittap.com';
  
  return {
    title: `${details.title} (${details.year}) - Watch, Stream & Reviews`,
    description: `Watch ${details.title} (${details.year}). ${details.description?.slice(0, 100)}... Available on ${details.streamingProviders?.join(', ') || 'streaming'}. Rated ${(details.rating || 0).toFixed(1)}/10.`,
    keywords: [
      details.title,
      `${details.title} ${details.year}`,
      ...details.genres.map((g: string) => `${g} movie`),
      ...(director ? [`${director.name} movies`, `${director.name} director`] : []),
      ...details.cast.slice(0, 3).map((c: any) => c.name),
      `${details.title} streaming`,
      `watch ${details.title} online`,
      `${details.title} cast`,
      `${details.title} reviews`,
      `where to watch ${details.title}`,
    ],
    alternates: {
      canonical: `${baseUrl}/movie/${id}`,
      languages: {
        'en-US': `${baseUrl}/movie/${id}`,
        'fr-FR': `${baseUrl}/fr/movie/${id}`,
        'es-ES': `${baseUrl}/es/movie/${id}`,
        'ko-KR': `${baseUrl}/ko/movie/${id}`,
        'hi-IN': `${baseUrl}/hi/movie/${id}`,
      },
    },
    openGraph: { 
      title: `${details.title} (${details.year}) | UnitTap Movies`,
      description: details.description.substring(0, 160),
      images: [details.image],
      type: 'video.movie',
      ...(details.trailerKey ? { videos: [{ url: `https://www.youtube.com/watch?v=${details.trailerKey}`, type: 'text/html', width: 1280, height: 720 }] } : {})
    },
    twitter: {
      card: 'summary_large_image',
      title: details.title,
      description: details.description.substring(0, 160),
      images: [details.image],
    }
  };
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const details = await getMediaDetails(id, 'movie');

  const trailerUrl = details.trailerKey 
    ? `https://www.youtube.com/watch?v=${details.trailerKey}`
    : null;

  const director = details.credits?.crew?.find((c: any) => c.job === 'Director') || null;

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: details.title,
    description: details.description,
    image: details.image,
    datePublished: `${details.year}-01-01`,
    genre: details.genres,
    duration: details.runtime ? `PT${details.runtime}M` : undefined,
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
    },
    ...(director ? { director: { '@type': 'Person', name: director.name } } : {}),
    recommendation: details.similar.slice(0, 5).map((s: any) => ({
      '@type': 'Movie',
      name: s.title,
      url: `https://movies.unittap.com/movie/${s.id}`,
    })),
    additionalProperty: [
      ...(details.runtime ? [{ '@type': 'PropertyValue', name: 'Runtime', value: `${details.runtime} min` }] : []),
      { '@type': 'PropertyValue', name: 'Language', value: details.genres.length > 0 ? 'English' : 'Unknown' },
      { '@type': 'PropertyValue', name: 'Year', value: String(details.year) },
      { '@type': 'PropertyValue', name: 'Rating', value: `${(details.rating || 0).toFixed(1)}/10` },
    ],
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://movies.unittap.com' },
      { '@type': 'ListItem', position: 2, name: 'Movies', item: 'https://movies.unittap.com/genre/28' },
      { '@type': 'ListItem', position: 3, name: details.title, item: `https://movies.unittap.com/movie/${id}` }
    ]
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Where can I watch ${details.title} online?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: details.streamingProviders.length > 0 
            ? `You can stream ${details.title} on ${details.streamingProviders.join(', ')}. Check our guide for full streaming details.`
            : `Currently, ${details.title} streaming availability varies by region. Check Netflix, Max, and Amazon Prime for the latest updates.`
        }
      },
      {
        '@type': 'Question',
        name: `Is ${details.title} on Netflix?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: details.streamingProviders.includes('Netflix') 
            ? `Yes, ${details.title} is currently available for streaming on Netflix.`
            : `No, ${details.title} is not currently on Netflix. It may be available on other platforms like Max or Disney+.`
        }
      },
      {
        '@type': 'Question',
        name: `When was ${details.title} released?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${details.title} was released in ${details.year}.`
        }
      },
      {
        '@type': 'Question',
        name: `How long is ${details.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: details.runtime
            ? `${details.title} has a runtime of ${details.runtime} minutes (${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m).`
            : `Runtime information for ${details.title} is not currently available.`
        }
      },
      {
        '@type': 'Question',
        name: `Is ${details.title} worth watching?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `With a rating of ${(details.rating || 0).toFixed(1)}/10 from ${details.voteCount.toLocaleString()} voters, ${details.title} is ${details.rating >= 7 ? 'highly recommended' : details.rating >= 5 ? 'a solid watch' : 'worth checking out for fans of the genre'}.`
        }
      },
      {
        '@type': 'Question',
        name: `Who stars in ${details.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${details.title} stars ${details.cast.slice(0, 3).map((c: any) => c.name).join(', ')}.`
        }
      },
      {
        '@type': 'Question',
        name: `What genre is ${details.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${details.title} is a ${details.genres.join(', ')} film.`
        }
      }
    ]
  };

  if (details.trailerKey) {
    jsonLd.video = {
      '@type': 'VideoObject',
      name: `${details.title} Official Trailer`,
      description: `Official trailer for ${details.title}`,
      uploadDate: `${details.year}-01-01`,
      contentUrl: trailerUrl,
      embedUrl: `https://www.youtube.com/embed/${details.trailerKey}`,
      thumbnailUrl: [
        details.image,
        `https://img.youtube.com/vi/${details.trailerKey}/maxresdefault.jpg`
      ],
      potentialAction: {
        '@type': 'WatchAction',
        target: `https://www.youtube.com/watch?v=${details.trailerKey}`
      },
      duration: details.runtime ? `PT${details.runtime}M` : undefined
    };
  }

  if (details.reviews.length > 0) {
    jsonLd.review = details.reviews.map((r: any) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      reviewBody: r.content.substring(0, 200),
      reviewRating: r.rating ? {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: '10'
      } : undefined
    }));
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 font-sans selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="relative h-[50vh] md:h-[65vh] w-full shadow-inner">
        <Image src={details.image} alt={`Poster backdrop for ${details.title}`} fill className="object-cover" priority quality={85} />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <nav className="flex text-white/60 text-[10px] font-black uppercase tracking-widest mb-4 gap-2 flex-wrap">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href={`/genre/${details.genres[0]?.toLowerCase()}`} className="hover:text-white">{details.genres[0]}</Link>
            <span>/</span>
            <span className="text-white">{details.title}</span>
          </nav>
          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 italic tracking-tighter shadow-2xl leading-tight break-words">{details.title.toUpperCase()}</h1>
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white font-black text-[10px] md:text-xs uppercase tracking-widest">
            <span className="bg-yellow-400 text-black px-3 py-1.5 rounded font-black text-sm italic">{(details.rating || 0).toFixed(1)} IMDB</span>
            <span>{details.year}</span>
            {details.runtime && <span>{details.runtime} MINS</span>}
            <div className="flex gap-2 md:gap-3 flex-wrap">
              {details.genreObjects?.map((g: any) => (
                <Link key={g.id} href={`/genre/${g.slug}`} className="border-2 border-white/40 px-3 py-1 rounded text-[10px] hover:border-yellow-400 hover:text-yellow-400 transition">{g.name.toUpperCase()}</Link>
              )) || details.genres.map((g: string) => (
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
                    <Link href={`/after/${id}`} className="bg-black text-white text-[10px] font-black px-4 py-2 uppercase hover:bg-blue-600 transition border-2 border-black whitespace-nowrap">Movies Like This →</Link>
                </div>
            </div>
            <p className="text-gray-800 text-lg md:text-xl leading-relaxed font-medium">
                {LinkifyDescription(details.description, details.cast.map((c: any) => ({ id: c.id, name: c.name, type: 'person' })), id)}
            </p>
            {details.streamingProviders.length > 0 && (
              <p className="text-gray-600 text-base leading-relaxed mt-6 bg-gray-100 p-4 rounded-xl border-2 border-gray-200">
                You can watch <strong>{details.title}</strong> on {details.streamingProviders.join(', ')}.{' '}
                {details.title} is currently available for streaming in the United States.
                {details.streamingProviders.length > 1 && ` Compare ${details.streamingProviders.length} streaming options to find the best way to watch.`}
              </p>
            )}
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-black mb-8 italic tracking-tight border-l-8 border-blue-600 pl-6 uppercase">The Crew</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
              {details.cast.map((c: any) => (
                <Link key={c.id} href={`/person/${c.id}`} className="group">
                  {c.image && <div className="relative aspect-[2/3] md:h-44 w-full mb-3 rounded-xl overflow-hidden shadow-lg group-hover:shadow-blue-200 transition-all group-hover:scale-105">
                    <Image src={c.image} alt={`Actor ${c.name}`} fill className="object-cover" quality={85} />
                  </div>}
                  <p className="font-black text-xs md:text-sm uppercase tracking-tight group-hover:text-blue-600 transition-colors">{c.name}</p>
                  <p className="text-gray-400 text-[9px] md:text-[10px] font-black uppercase">{c.character}</p>
                </Link>
              ))}
            </div>
          </section>

          {details.reviews.length > 0 && (
            <section>
                <h2 className="text-2xl md:text-3xl font-black mb-8 italic tracking-tight border-l-8 border-blue-600 pl-6 uppercase">Community Reviews</h2>
                <div className="space-y-6">
                    {details.reviews.map((r: any) => (
                        <div key={r.id} className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-black text-blue-600 uppercase text-xs tracking-widest">{r.author}</span>
                                {r.rating && <span className="bg-yellow-400 text-black px-2 py-1 rounded font-black text-[10px] italic">{r.rating}/10</span>}
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">{r.content}</p>
                        </div>
                    ))}
                </div>
            </section>
          )}

          {director && (
            <section className="bg-gray-900 p-6 md:p-8 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
              <h2 className="text-xl md:text-2xl font-black mb-4 italic tracking-tight uppercase">More from {director.name}</h2>
              <p className="text-gray-300 text-sm mb-4 font-medium">Explore more films by this director.</p>
              <Link href={`/person/${director.id}`} className="bg-yellow-400 text-black font-black px-6 py-3 rounded-xl uppercase italic hover:bg-white transition inline-block border-2 border-black text-sm">VIEW FILMOGRAPHY →</Link>
            </section>
          )}

          {details.collection && (
            <section className="bg-blue-600 p-6 md:p-10 rounded-2xl md:rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
              <h2 className="text-2xl md:text-3xl font-black mb-4 italic tracking-tight uppercase leading-tight">Part of the {details.collection.name}</h2>
              <p className="mb-8 font-bold opacity-90">Watch the entire franchise in chronological order.</p>
              <Link href={`/franchise/${details.collection.id}`} className="bg-white text-black font-black px-6 md:px-8 py-3 md:py-4 rounded-xl uppercase italic hover:bg-yellow-400 transition inline-block border-2 border-black text-sm">VIEW WATCH ORDER</Link>
            </section>
          )}
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

          <div className="bg-yellow-400 p-6 md:p-8 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <h3 className="font-black mb-4 uppercase text-xs tracking-widest">SHARE THIS PAGE</h3>
             <div className="flex gap-2">
                <button className="flex-1 bg-white border-2 border-black p-2 font-black text-[10px] uppercase hover:bg-black hover:text-white transition">Copy Link</button>
                <button className="flex-1 bg-blue-400 border-2 border-black p-2 font-black text-[10px] uppercase hover:bg-black hover:text-white transition">Twitter</button>
             </div>
          </div>

          <div>
            <h3 className="font-black mb-6 md:mb-8 uppercase text-xs md:text-sm tracking-tight border-b-2 border-gray-100 pb-4 italic">SIMILAR TITLES</h3>
            <div className="space-y-4 md:space-y-6">
              {details.similar.slice(0, 5).map((s: any) => (
                <Link key={s.id} href={`/movie/${s.id}`} className="flex items-center space-x-4 md:space-x-5 group">
                  <div className="relative aspect-[2/3] md:h-24 w-14 md:w-16 flex-shrink-0 shadow-md group-hover:shadow-xl transition-all">
                    <Image src={s.image} alt={`Similar title ${s.title}`} fill className="object-cover rounded-xl" quality={85} />
                  </div>
                  <p className="font-black text-xs md:text-sm uppercase group-hover:text-blue-600 transition tracking-tighter leading-tight break-words">{s.title}</p>
                </Link>
              ))}
            </div>
          </div>
          {trendingMovies.length > 0 && (
            <div>
              <h3 className="font-black mb-6 md:mb-8 uppercase text-xs md:text-sm tracking-tight border-b-2 border-gray-100 pb-4 italic">TRENDING RIGHT NOW</h3>
              <div className="space-y-4 md:space-y-6">
                {trendingMovies.map((s: any) => (
                  <Link key={s.id} href={`/movie/${s.id}`} className="flex items-center space-x-4 md:space-x-5 group">
                    {s.image && <div className="relative aspect-[2/3] md:h-24 w-14 md:w-16 flex-shrink-0 shadow-md group-hover:shadow-xl transition-all">
                      <Image src={s.image} alt={`Trending: ${s.title}`} fill className="object-cover rounded-xl" quality={85} />
                    </div>}
                    <p className="font-black text-xs md:text-sm uppercase group-hover:text-blue-600 transition tracking-tighter leading-tight break-words">{s.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
