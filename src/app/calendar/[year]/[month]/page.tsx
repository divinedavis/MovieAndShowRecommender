import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { getMonthlyReleases } from '@/lib/tmdb';
import { getTranslations } from '@/lib/translations';

interface Props {
  params: Promise<{ year: string; month: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, month } = await params;
  const t = getTranslations('en-US');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('en-US', { month: 'long' });
  const baseUrl = 'https://movies.unittap.com';
  
  return {
    title: `New Movie Releases in ${monthName} ${year} - Full Calendar & Schedule`,
    description: `Discover all the new movies coming out in ${monthName} ${year}. Our comprehensive release calendar includes trailers, cast, and where to stream the latest titles.`,
    keywords: [`new movie releases ${monthName} ${year}`, `${monthName} ${year} movie calendar`, `upcoming movies ${monthName}`, `movie release dates ${year}`],
    alternates: {
      canonical: `${baseUrl}/calendar/${year}/${month}`,
      types: {
        ...((() => {
          const prev = new Date(parseInt(year), parseInt(month) - 2, 1);
          const next = new Date(parseInt(year), parseInt(month), 1);
          const prevYear = prev.getFullYear();
          const prevMonth = String(prev.getMonth() + 1).padStart(2, '0');
          const nextYear = next.getFullYear();
          const nextMonth = String(next.getMonth() + 1).padStart(2, '0');
          return {
            'prev': `${baseUrl}/calendar/${prevYear}/${prevMonth}`,
            'next': `${baseUrl}/calendar/${nextYear}/${nextMonth}`,
          };
        })()),
      },
    },
    openGraph: {
      title: `${monthName} ${year} Movie Releases | UnitTap Movies`,
      description: `All movies releasing in ${monthName} ${year}. Trailers, cast details, and streaming availability.`,
      type: 'website',
      url: `${baseUrl}/calendar/${year}/${month}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${monthName} ${year} Movie Releases`,
      description: `All movies releasing in ${monthName} ${year}.`,
    },
  };
}

export default async function CalendarPage({ params }: Props) {
  const { year, month } = await params;
  const movies = await getMonthlyReleases(year, month);
  const t = getTranslations('en-US');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('en-US', { month: 'long' });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Movie Releases ${monthName} ${year}`,
    "itemListElement": movies.map((m: any, i: number) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Movie",
        "name": m.title,
        "url": `https://movies.unittap.com/movie/${m.id}`,
        "datePublished": m.releaseDate,
        "image": m.image
      }
    }))
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10 font-sans selection:bg-yellow-400 selection:text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">{t.backToDiscovery}</Link>
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-4">{monthName} {year}</h1>
        <p className="text-2xl font-black text-gray-400 uppercase italic">{t.upcomingReleases}</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <div className="flex justify-between items-center mb-8">
        {(() => {
          const prev = new Date(parseInt(year), parseInt(month) - 2, 1);
          const next = new Date(parseInt(year), parseInt(month), 1);
          const prevYear = prev.getFullYear();
          const prevMonth = String(prev.getMonth() + 1).padStart(2, '0');
          const prevMonthName = prev.toLocaleString('en-US', { month: 'long' });
          const nextYear = next.getFullYear();
          const nextMonth = String(next.getMonth() + 1).padStart(2, '0');
          const nextMonthName = next.toLocaleString('en-US', { month: 'long' });
          return (
            <>
              <Link href={`/calendar/${prevYear}/${prevMonth}`} className="bg-white border-4 border-black px-4 py-2 font-black text-xs uppercase hover:bg-yellow-400 transition">
                &larr; {prevMonthName} {prevYear}
              </Link>
              <Link href={`/calendar/${nextYear}/${nextMonth}`} className="bg-white border-4 border-black px-4 py-2 font-black text-xs uppercase hover:bg-yellow-400 transition">
                {nextMonthName} {nextYear} &rarr;
              </Link>
            </>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {movies.map((item: any) => (
          <Link key={item.id} href={`/movie/${item.id}`} className="block bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="relative aspect-[2/3] w-full border-b-4 border-black">
              <Image src={item.image} alt={item.title} fill className="object-cover transition-transform group-hover:scale-110" />
              <div className="absolute top-2 left-2 bg-blue-600 text-white border-2 border-black text-[10px] font-black px-2 py-1 italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{item.releaseDate}</div>
            </div>
            <div className="p-4">
              <h3 className="font-black uppercase text-sm leading-tight mb-2 h-10 overflow-hidden group-hover:text-blue-600">{item.title}</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase">{monthName.toUpperCase()} RELEASE</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
