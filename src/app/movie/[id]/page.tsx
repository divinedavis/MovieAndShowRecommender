import Image from 'next/image';
import Link from 'next/link';
import { getMediaDetails } from '@/lib/tmdb';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const details = await getMediaDetails(id, 'movie');
  return {
    title: `Watch ${details.title} (${details.year}) - Release Date, Cast & Where to Stream`,
    description: details.description.substring(0, 160),
    openGraph: { images: [details.image] }
  };
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const details = await getMediaDetails(id, 'movie');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    'name': details.title,
    'description': details.description,
    'image': details.poster,
    'datePublished': details.year.toString(),
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': details.rating.toFixed(1),
      'bestRating': '10',
      'ratingCount': '100'
    },
    'actor': details.cast.map((c: any) => ({ '@type': 'Person', 'name': c.name })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 font-sans selection:bg-yellow-400 selection:text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="relative h-[65vh] w-full shadow-inner">
        <Image src={details.image} alt={`Poster backdrop for ${details.title}`} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-10 max-w-7xl mx-auto w-full">
          <nav className="flex text-white/60 text-[10px] font-black uppercase tracking-widest mb-4 gap-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href={`/genre/${details.genres[0]?.toLowerCase()}`} className="hover:text-white">{details.genres[0]}</Link>
            <span>/</span>
            <span className="text-white">{details.title}</span>
          </nav>
          <h1 className="text-7xl font-black text-white mb-6 italic tracking-tighter shadow-2xl leading-none">{details.title.toUpperCase()}</h1>
          <div className="flex flex-wrap items-center gap-6 text-white font-black text-xs uppercase tracking-widest">
            <span className="bg-yellow-400 text-black px-3 py-1.5 rounded font-black text-sm italic">{details.rating.toFixed(1)} IMDB</span>
            <span>{details.year}</span>
            {details.runtime && <span>{details.runtime} MINS</span>}
            <div className="flex gap-3">
              {details.genres.map((g: string) => (
                <span key={g} className="border-2 border-white/40 px-3 py-1 rounded text-[10px]">{g.toUpperCase()}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 py-20 grid grid-cols-1 lg:grid-cols-3 gap-20">
        <div className="lg:col-span-2 space-y-16">
          <section>
            <div className="flex justify-between items-center mb-8 border-l-8 border-blue-600 pl-6">
                <h2 className="text-3xl font-black italic tracking-tight uppercase">The Story</h2>
                <Link href={`/after/${id}`} className="bg-black text-white text-[10px] font-black px-4 py-2 uppercase hover:bg-blue-600 transition border-2 border-black">Movies Like This →</Link>
            </div>
            <p className="text-gray-800 text-xl leading-relaxed font-medium">{details.description}</p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-8 italic tracking-tight border-l-8 border-blue-600 pl-6 uppercase">The Crew</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {details.cast.map((c: any) => (
                <Link key={c.id} href={`/person/${c.id}`} className="group">
                  {c.image && <div className="relative h-44 w-full mb-3 rounded-xl overflow-hidden shadow-lg group-hover:shadow-blue-200 transition-all group-hover:scale-105">
                    <Image src={c.image} alt={`Actor ${c.name}`} fill className="object-cover" />
                  </div>}
                  <p className="font-black text-sm uppercase tracking-tight group-hover:text-blue-600 transition-colors">{c.name}</p>
                  <p className="text-gray-400 text-[10px] font-black uppercase">{c.character}</p>
                </Link>
              ))}
            </div>
          </section>

          {details.collection && (
            <section className="bg-blue-600 p-10 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-white">
              <h2 className="text-3xl font-black mb-4 italic tracking-tight uppercase">Part of the {details.collection.name}</h2>
              <p className="mb-8 font-bold opacity-90">Watch the entire franchise in chronological order.</p>
              <Link href={`/franchise/${details.collection.id}`} className="bg-white text-black font-black px-8 py-4 rounded-xl uppercase italic hover:bg-yellow-400 transition inline-block border-2 border-black">VIEW WATCH ORDER</Link>
            </section>
          )}
        </div>

        <aside className="space-y-12">
          <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black mb-6 uppercase text-xs tracking-widest text-blue-600">STREAMING PROVIDERS</h3>
            {details.streamingProviders.length > 0 ? (
              <div className="space-y-4">
                {details.streamingProviders.map((p: string) => (
                  <div key={p} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border-2 border-gray-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-black text-sm uppercase italic">{p}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-xs font-bold uppercase italic">Check availability on Netflix / Max / Amazon Prime</p>
            )}
            <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition mt-8 shadow-xl uppercase italic tracking-widest text-sm border-2 border-black">WATCH NOW</button>
          </div>

          <div>
            <h3 className="font-black mb-8 uppercase text-sm tracking-tight border-b-2 border-gray-100 pb-4 italic">SIMILAR TITLES</h3>
            <div className="space-y-6">
              {details.similar.slice(0, 5).map((s: any) => (
                <Link key={s.id} href={`/movie/${s.id}`} className="flex items-center space-x-5 group">
                  <div className="relative h-24 w-16 flex-shrink-0 shadow-md group-hover:shadow-xl transition-all">
                    <Image src={s.image} alt={`Similar title ${s.title}`} fill className="object-cover rounded-xl" />
                  </div>
                  <p className="font-black text-sm uppercase group-hover:text-blue-600 transition tracking-tighter leading-tight">{s.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
