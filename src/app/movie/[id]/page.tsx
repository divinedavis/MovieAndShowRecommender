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
      
      <div className="relative h-[60vh] w-full">
        <Image src={details.image} alt={details.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 max-w-7xl mx-auto w-full">
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">{details.title.toUpperCase()}</h1>
          <div className="flex items-center space-x-4 text-white font-bold">
            <span className="bg-yellow-500 text-black px-2 py-1 rounded">{details.rating.toFixed(1)}</span>
            <span>{details.year}</span>
            <span>{details.runtime} mins</span>
            <div className="flex space-x-2">
              {details.genres.map(g => (
                <span key={g} className="border border-white/30 px-2 py-0.5 rounded text-xs">{g.toUpperCase()}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Overview</h2>
            <p className="text-gray-700 text-lg leading-relaxed">{details.description}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Top Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {details.cast.map(c => (
                <div key={c.id} className="text-center">
                  {c.image && <div className="relative h-32 w-full mb-2 rounded-lg overflow-hidden">
                    <Image src={c.image} alt={c.name} fill className="object-cover" />
                  </div>}
                  <p className="font-bold text-sm">{c.name}</p>
                  <p className="text-gray-500 text-xs">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-black mb-4 uppercase text-xs tracking-widest text-blue-600">Where to Watch</h3>
            <button className="w-full bg-blue-600 text-white font-black py-4 rounded-lg hover:bg-blue-700 transition mb-4 shadow-lg">STREAM NOW</button>
            <p className="text-xs text-gray-500 text-center font-bold">Official providers only</p>
          </div>

          <div>
            <h3 className="font-black mb-6 uppercase text-sm tracking-tight">Similar Movies</h3>
            <div className="space-y-4">
              {details.similar.map(s => (
                <a key={s.id} href={`/movie/${s.id}`} className="flex items-center space-x-4 group">
                  <div className="relative h-20 w-14 flex-shrink-0">
                    <Image src={s.image} alt={s.title} fill className="object-cover rounded" />
                  </div>
                  <p className="font-bold group-hover:text-blue-600 transition">{s.title}</p>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
