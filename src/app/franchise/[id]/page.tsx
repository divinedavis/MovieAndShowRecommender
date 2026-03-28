import Image from 'next/image';
import Link from 'next/link';
import { getCollectionDetails } from '@/lib/tmdb';
import { Metadata } from 'next';
import { generateWatchOrderSchema } from '@/lib/seo';

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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://movies.unittap.com' },
      { '@type': 'ListItem', position: 2, name: 'Franchise', item: 'https://movies.unittap.com' },
      { '@type': 'ListItem', position: 3, name: details.name, item:  }
    ]
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <header className="mb-20 flex flex-col items-center text-center">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4">← BACK TO DISCOVERY</Link>
        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase mb-6">{details.name}</h1>
        <div className="bg-blue-600 border-4 border-black text-white px-8 py-4 font-black italic text-2xl uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
          TOTAL BINGE TIME: {details.bingeTime}
        </div>
        <p className="text-xl md:text-2xl font-black text-gray-400 uppercase italic max-w-4xl">The Definitive Watch Order & Chronological Timeline</p>
        <div className="w-full h-4 bg-black mt-12"></div>
      </header>

      <section className="max-w-7xl mx-auto">
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-black -translate-x-1/2 hidden lg:block"></div>
          
          <div className="space-y-24">
            {details.parts.map((movie: any, index: number) => (
              <div key={movie.id} className={`relative flex flex-col lg:flex-row items-center ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="lg:w-1/2 p-8">
                  <Link href={`/movie/${movie.id}`} className="block bg-white border-8 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all group overflow-hidden rounded-3xl">
                    <div className="relative aspect-[2/3] w-full">
                      <Image src={movie.image} alt={`Poster for ${movie.title}`} fill className="object-cover transition-transform group-hover:scale-110" />
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
    </main>
  );
}
