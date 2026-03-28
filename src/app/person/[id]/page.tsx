import Image from 'next/image';
import Link from 'next/link';
import { getPersonDetails } from '@/lib/tmdb';
import { Metadata } from 'next';
import { LinkifyDescription } from '@/lib/seo';

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const details = await getPersonDetails(id);
  const baseUrl = 'https://movies.unittap.com';
  
  return {
    title: `${details.name} - Filmography, Biography & Career Ranking`,
    description: `Explore ${details.name}'s movies, career milestones, and full filmography. ${details.biography?.substring(0, 120)}...`,
    keywords: [`${details.name} movies`, `${details.name} filmography`, `${details.name} biography`, `${details.name} awards`, `${details.name} career`],
    alternates: {
      canonical: `${baseUrl}/person/${id}`,
    },
    openGraph: { 
      title: `${details.name} | UnitTap Movies`,
      description: `Full filmography and biography of ${details.name}.`,
      images: [details.image],
      type: 'profile'
    },
    twitter: {
      card: 'summary_large_image',
      title: details.name,
      description: `Full filmography and biography of ${details.name}.`,
      images: [details.image],
    }
  };
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params;
  const details = await getPersonDetails(id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: details.name,
    description: details.biography?.substring(0, 500) || '',
    image: details.image,
    birthDate: details.birthday || undefined,
    birthPlace: details.place_of_birth ? { '@type': 'Place', name: details.place_of_birth } : undefined,
    url: `https://movies.unittap.com/person/${id}`,
    jobTitle: details.known_for,
    worksFor: { '@type': 'Organization', name: 'Film & Television Industry' },
    sameAs: [],
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://movies.unittap.com' },
      { '@type': 'ListItem', position: 2, name: 'People', item: 'https://movies.unittap.com' },
      { '@type': 'ListItem', position: 3, name: details.name, item: `https://movies.unittap.com/person/${id}` }
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
      <header className="mb-20 flex flex-col md:flex-row gap-12 items-start">
        <div className="relative aspect-[2/3] w-full md:w-[350px] flex-shrink-0 border-8 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
          {details.image && <Image src={details.image} alt={`Actor ${details.name}`} fill className="object-cover" priority quality={85} />}
        </div>
        <div className="flex-grow">
          <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">\u2190 BACK TO DISCOVERY</Link>
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-6">{details.name}</h1>
          <div className="flex flex-wrap gap-4 mb-8 text-xs font-black uppercase tracking-widest">
            <span className="bg-black text-white px-4 py-2">{details.known_for}</span>
            {details.birthday && <span className="border-4 border-black px-4 py-2">BORN: {details.birthday}</span>}
            <Link href={`/person/${id}/best`} className="bg-blue-600 text-white border-4 border-black px-4 py-2 hover:bg-yellow-400 hover:text-black transition italic">Career Ranking \u2192</Link>
          </div>
          <div className="max-w-3xl">
            <h2 className="text-2xl font-black uppercase italic mb-4 border-b-4 border-black inline-block">Biography</h2>
            <p className="text-xl font-medium leading-relaxed">
                {details.biography 
                  ? LinkifyDescription(details.biography, details.credits.map((c: any) => ({ id: c.id, name: c.title, type: c.type })), id)
                  : "No biography available."}
            </p>
          </div>
        </div>
      </header>

      <section className="mb-24">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">Top Filmography</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {details.credits.map((item: any) => (
            <Link key={item.id} href={`/${item.type}/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
              <div className="relative aspect-[2/3] w-full border-b-4 border-black">
                {item.image && <Image src={item.image} alt={`Poster for ${item.title}`} fill className="object-cover" quality={85} />}
                <div className="absolute top-2 right-2 bg-yellow-400 border-2 border-black text-[10px] font-black px-2 py-1">{item.rating.toFixed(1)}</div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden">{item.title}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase">{item.year} // {item.type.toUpperCase()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
