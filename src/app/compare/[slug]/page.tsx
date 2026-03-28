import Image from 'next/image';
import Link from 'next/link';
import { getMediaDetails } from '@/lib/tmdb';
import { Metadata } from 'next';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [id1, id2] = slug.split('-vs-');
  const [m1, m2] = await Promise.all([getMediaDetails(id1, 'movie'), getMediaDetails(id2, 'movie')]);

  return {
    title: `${m1.title} vs ${m2.title} - Side-by-Side Comparison & Streaming Guide`,
    description: `Compare ${m1.title} and ${m2.title} side-by-side. See which one has better ratings, longer runtime, and where each is streaming.`
  };
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const [id1, id2] = slug.split('-vs-');
  const [m1, m2] = await Promise.all([getMediaDetails(id1, 'movie'), getMediaDetails(id2, 'movie')]);

  const compareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${m1.title} vs ${m2.title} Comparison`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, item: { '@type': 'Movie', name: m1.title, url: `https://movies.unittap.com/movie/${id1}`, aggregateRating: { '@type': 'AggregateRating', ratingValue: m1.rating, bestRating: '10' } } },
      { '@type': 'ListItem', position: 2, item: { '@type': 'Movie', name: m2.title, url: `https://movies.unittap.com/movie/${id2}`, aggregateRating: { '@type': 'AggregateRating', ratingValue: m2.rating, bestRating: '10' } } }
    ]
  };

  const stats = [
    { label: 'IMDB RATING', v1: m1.rating.toFixed(1), v2: m2.rating.toFixed(1) },
    { label: 'RELEASE YEAR', v1: m1.year, v2: m2.year },
    { label: 'RUNTIME', v1: `${m1.runtime}m`, v2: `${m2.runtime}m` },
    { label: 'GENRES', v1: m1.genres[0], v2: m2.genres[0] }
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd) }}
      />
      <header className="mb-20 text-center">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">← BACK TO DISCOVERY</Link>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-6">{m1.title} <span className="text-blue-600">VS</span> {m2.title}</h1>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 items-stretch justify-center max-w-7xl mx-auto mb-20">
        <div className="lg:w-1/3 bg-white border-8 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] rounded-[40px] overflow-hidden">
          <div className="relative aspect-[2/3]">
            <Image src={m1.image} alt={m1.title} fill className="object-cover" />
          </div>
          <div className="p-8 text-center">
            <h2 className="text-3xl font-black uppercase italic">{m1.title}</h2>
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col justify-center gap-8 py-12">
          {stats.map(s => (
            <div key={s.label} className="text-center border-b-2 border-gray-100 pb-4">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{s.label}</p>
              <div className="flex items-center justify-between gap-4">
                <span className="text-3xl font-black italic w-1/2 text-right text-blue-600">{s.v1}</span>
                <span className="w-px h-10 bg-black"></span>
                <span className="text-3xl font-black italic w-1/2 text-left">{s.v2}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-1/3 bg-white border-8 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] rounded-[40px] overflow-hidden">
          <div className="relative aspect-[2/3]">
            <Image src={m2.image} alt={m2.title} fill className="object-cover" />
          </div>
          <div className="p-8 text-center">
            <h2 className="text-3xl font-black uppercase italic">{m2.title}</h2>
          </div>
        </div>
      </div>

      <section className="max-w-4xl mx-auto bg-white border-8 border-black rounded-[40px] p-12 mb-20 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-4xl font-black uppercase italic mb-10 text-center border-b-4 border-black inline-block">Streaming Comparison</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="font-black uppercase text-xl">{m1.title}</h3>
            {m1.streamingProviders.map((p: string) => (
              <div key={p} className="bg-gray-100 p-4 rounded-xl border-2 border-black font-black uppercase italic text-sm">{p}</div>
            ))}
          </div>
          <div className="space-y-6 text-right">
            <h3 className="font-black uppercase text-xl">{m2.title}</h3>
            {m2.streamingProviders.map((p: string) => (
              <div key={p} className="bg-blue-600 text-white p-4 rounded-xl border-2 border-black font-black uppercase italic text-sm">{p}</div>
            ))}
          </div>
        </div>
      </section>
      <section className="max-w-4xl mx-auto bg-yellow-50 border-8 border-black rounded-[40px] p-12 mb-20 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-3xl font-black uppercase italic mb-8 border-l-8 border-blue-600 pl-6">Our Verdict</h2>
        <p className="text-lg font-medium leading-relaxed text-gray-800">
          {m1.rating >= m2.rating
            ? `${m1.title} (${m1.year}, ${m1.rating.toFixed(1)}/10) edges out ${m2.title} (${m2.year}, ${m2.rating.toFixed(1)}/10) in audience rating on TMDB. `
            : `${m2.title} (${m2.year}, ${m2.rating.toFixed(1)}/10) scores higher than ${m1.title} (${m1.year}, ${m1.rating.toFixed(1)}/10) in audience rating on TMDB. `
          }
          {m1.runtime && m2.runtime && (
            m1.runtime <= m2.runtime
              ? `${m1.title} is the shorter watch at ${m1.runtime} minutes versus ${m2.runtime} minutes for ${m2.title}. `
              : `${m2.title} is the shorter watch at ${m2.runtime} minutes versus ${m1.runtime} minutes for ${m1.title}. `
          )}
          {m1.streamingProviders.length > 0 && `${m1.title} is available on ${m1.streamingProviders.join(', ')}. `}
          {m2.streamingProviders.length > 0 && `${m2.title} is available on ${m2.streamingProviders.join(', ')}.`}
        </p>
      </section>
    </main>
  );
}
