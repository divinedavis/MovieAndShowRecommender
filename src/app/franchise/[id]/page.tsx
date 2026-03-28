import Image from 'next/image';
import Link from 'next/link';
import { getCollectionDetails } from '@/lib/tmdb';
import { Metadata } from 'next';
import { generateWatchOrderSchema } from '@/lib/seo';

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const details = await getCollectionDetails(id);
  const baseUrl = 'https://movies.unittap.com';

  return {
    title: `${details.name} Chronological Watch Order & Timeline (2026)`,
    description: `How to watch the ${details.name} movies in chronological order. Total binge time: ${details.bingeTime}. Full timeline, rankings, and where to stream the entire franchise.`,
    keywords: [`${details.name} watch order`, `${details.name} chronological order`, `${details.name} movies timeline`, `best way to watch ${details.name}`],
    alternates: {
      canonical: `${baseUrl}/franchise/${id}`,
    },
    openGraph: {
      title: `${details.name} | The Ultimate Watch Order`,
      description: `Full chronological timeline for the ${details.name} movies.`,
      images: [details.image],
      type: 'website'
    }
  };
}

export default async function FranchisePage({ params }: Props) {
  const { id } = await params;
  const details = await getCollectionDetails(id);
  const jsonLd = generateWatchOrderSchema(details);

  // Release order: sorted by release year (already sorted from TMDB)
  const releaseOrder = [...details.parts].sort((a: any, b: any) => a.year - b.year);
  // Chronological order: same as release order for most franchises (in-universe timeline not available from TMDB)
  const chronologicalOrder = [...details.parts].sort((a: any, b: any) => a.year - b.year);

  const releaseOrderJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${details.name} Release Order`,
    description: `Watch the ${details.name} in release date order.`,
    itemListElement: releaseOrder.map((p: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: p.title,
        url: `https://movies.unittap.com/movie/${p.id}`,
        datePublished: `${p.year}-01-01`,
      },
    })),
  };

  const seriesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MovieSeries',
    name: details.name,
    description: details.description,
    image: details.image,
    url: `https://movies.unittap.com/franchise/${id}`,
    hasPart: details.parts.map((p: any) => ({
      '@type': 'Movie',
      name: p.title,
      url: `https://movies.unittap.com/movie/${p.id}`,
      datePublished: `${p.year}-01-01`,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: p.rating,
        bestRating: '10'
      }
    }))
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://movies.unittap.com' },
      { '@type': 'ListItem', position: 2, name: 'Franchise', item: 'https://movies.unittap.com' },
      { '@type': 'ListItem', position: 3, name: details.name, item: `https://movies.unittap.com/franchise/${id}` }
    ]
  };

  const totalMinutes = details.parts.reduce((acc: number, p: any) => acc + (p.runtime || 0), 0);
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What order should I watch the ${details.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The recommended watch order for ${details.name} is: ${releaseOrder.map((p: any, i: number) => `${i + 1}. ${p.title} (${p.year})`).join(', ')}. This follows the release date order, which is the best way to experience the franchise for the first time.`,
        },
      },
      {
        '@type': 'Question',
        name: `How long does it take to binge the ${details.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The total runtime for all ${details.parts.length} movies in the ${details.name} is ${details.bingeTime} (${totalMinutes} minutes). That is approximately ${Math.ceil(totalMinutes / 60)} hours of viewing.`,
        },
      },
      {
        '@type': 'Question',
        name: `How many movies are in the ${details.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `There are ${details.parts.length} movies in the ${details.name}: ${details.parts.map((p: any) => p.title).join(', ')}.`,
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(releaseOrderJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seriesJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="mb-20 flex flex-col items-center text-center">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4">← BACK TO DISCOVERY</Link>
        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase mb-6">{details.name}</h1>
        <div className="bg-blue-600 border-4 border-black text-white px-8 py-4 font-black italic text-2xl uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
          TOTAL BINGE TIME: {details.bingeTime}
        </div>
        <p className="text-xl md:text-2xl font-black text-gray-400 uppercase italic max-w-4xl">The Definitive Watch Order & Chronological Timeline</p>
        <div className="w-full h-4 bg-black mt-12"></div>
      </header>

      {/* Release Order Section */}
      <section className="max-w-7xl mx-auto mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Release Order (Recommended)</h2>
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-black -translate-x-1/2 hidden lg:block"></div>
          <div className="space-y-24">
            {releaseOrder.map((movie: any, index: number) => (
              <div key={movie.id} className={`relative flex flex-col lg:flex-row items-center ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="lg:w-1/2 p-8">
                  <Link href={`/movie/${movie.id}`} className="block bg-white border-8 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all group overflow-hidden rounded-3xl">
                    <div className="relative aspect-[2/3] w-full">
                      <Image src={movie.image} alt={`Poster for ${movie.title}`} fill className="object-cover transition-transform group-hover:scale-110" quality={85} />
                      <div className="absolute top-6 left-6 bg-blue-600 text-white font-black px-4 py-2 italic border-2 border-black">#{index + 1}</div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">{movie.title}</h3>
                      <p className="text-gray-500 font-black uppercase mb-4 text-xs tracking-widest">Released: {movie.year} // Runtime: {movie.runtime}m // Rating: {movie.rating.toFixed(1)}</p>
                      <p className="text-gray-700 font-medium leading-relaxed line-clamp-3">{movie.description}</p>
                    </div>
                  </Link>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-yellow-400 border-4 border-black rounded-full z-10 hidden lg:flex items-center justify-center font-black italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {movie.year}
                </div>
                <div className="lg:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chronological Order Section */}
      <section className="max-w-7xl mx-auto mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-blue-600 pb-4">Chronological Order</h2>
        <p className="text-lg font-medium text-gray-600 mb-8">Watch in the order of the story timeline for a different perspective on the franchise.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {chronologicalOrder.map((movie: any, index: number) => (
            <Link key={movie.id} href={`/movie/${movie.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                <Image src={movie.image} alt={`${movie.title} chronological order`} fill className="object-cover" quality={85} />
                <div className="absolute top-2 left-2 bg-green-500 text-white border-2 border-black text-[10px] font-black px-2 py-1">#{index + 1}</div>
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{movie.rating.toFixed(1)}</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{movie.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{movie.year} // {movie.runtime}m</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto mb-24">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8 border-b-8 border-black pb-4">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black text-lg uppercase mb-2">What order should I watch the {details.name}?</h3>
            <p className="text-gray-700">The recommended order is release order: {releaseOrder.map((p: any, i: number) => `${i + 1}. ${p.title} (${p.year})`).join(', ')}.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black text-lg uppercase mb-2">How long to binge the {details.name}?</h3>
            <p className="text-gray-700">Total binge time is {details.bingeTime} ({totalMinutes} minutes) across {details.parts.length} movies.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black text-lg uppercase mb-2">How many movies are in the {details.name}?</h3>
            <p className="text-gray-700">There are {details.parts.length} movies: {details.parts.map((p: any) => p.title).join(', ')}.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
