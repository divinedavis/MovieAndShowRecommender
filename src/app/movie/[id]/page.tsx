import Image from 'next/image';
import { getMediaDetails } from '@/lib/tmdb';
import { Metadata } from 'next';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const details = await getMediaDetails(params.id, 'movie');
  return {
    title: `Watch ${details.title} (${details.year}) - Release Date & Full Cast`,
    description: details.description.substring(0, 160),
    openGraph: { images: [details.image] }
  };
}

export default async function MoviePage({ params }: Props) {
  const details = await getMediaDetails(params.id, 'movie');

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
    'actor': details.cast.map(c => ({ '@type': 'Person', 'name': c.name })),
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="relative h-[65vh] w-full shadow-inner">
        <Image src={details.image} alt={details.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-10 max-w-7xl mx-auto w-full">
          <h1 className="text-7xl font-black text-white mb-6 italic tracking-tighter shadow-2xl">{details.title.toUpperCase()}</h1>
          <div className="flex flex-wrap items-center gap-6 text-white font-black text-xs uppercase tracking-widest">
            <span className="bg-yellow-500 text-black px-3 py-1.5 rounded font-black text-sm italic">{details.rating.toFixed(1)} IMDB</span>
            <span>{details.year}</span>
            {details.runtime && <span>{details.runtime} MINS</span>}
            <div className="flex gap-3">
              {details.genres.map(g => (
                <span key={g} className="border-2 border-white/40 px-3 py-1 rounded text-[10px]">{g.toUpperCase()}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 py-20 grid grid-cols-1 lg:grid-cols-3 gap-20">
        <div className="lg:col-span-2 space-y-16">
          <section>
            <h2 className="text-3xl font-black mb-8 italic tracking-tight border-l-8 border-blue-600 pl-6">THE STORY</h2>
            <p className="text-gray-800 text-xl leading-relaxed font-medium">{details.description}</p>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-8 italic tracking-tight border-l-8 border-blue-600 pl-6">THE CREW</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {details.cast.map(c => (
                <div key={c.id} className="group">
                  {c.image && <div className="relative h-44 w-full mb-3 rounded-xl overflow-hidden shadow-lg group-hover:shadow-blue-200 transition-all">
                    <Image src={c.image} alt={c.name} fill className="object-cover" />
                  </div>}
                  <p className="font-black text-sm uppercase tracking-tight">{c.name}</p>
                  <p className="text-gray-400 text-[10px] font-black uppercase">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-12">
          <div className="bg-white p-8 rounded-3xl border-4 border-gray-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black mb-6 uppercase text-xs tracking-widest text-blue-600">STREAMING PROVIDERS</h3>
            {details.streamingProviders.length > 0 ? (
              <div className="space-y-4">
                {details.streamingProviders.map(p => (
                  <div key={p} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border-2 border-gray-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-black text-sm uppercase italic">{p}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-xs font-bold uppercase italic italic-none">Check availability on Netflix / HBO Max / Amazon Prime</p>
            )}
            <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition mt-8 shadow-xl uppercase italic tracking-widest text-sm">WATCH NOW</button>
          </div>

          <div>
            <h3 className="font-black mb-8 uppercase text-sm tracking-tight border-b-2 border-gray-100 pb-4 italic">SIMILAR TITLES</h3>
            <div className="space-y-6">
              {details.similar.map(s => (
                <a key={s.id} href={`/movie/${s.id}`} className="flex items-center space-x-5 group">
                  <div className="relative h-24 w-16 flex-shrink-0 shadow-md group-hover:shadow-xl transition-all">
                    <Image src={s.image} alt={s.title} fill className="object-cover rounded-xl" />
                  </div>
                  <p className="font-black text-sm uppercase group-hover:text-blue-600 transition tracking-tighter leading-tight">{s.title}</p>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
