import Link from 'next/link';
import { Metadata } from 'next';

export const revalidate = 3600;

const BASE_URL = 'https://movies.unittap.com';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(TMDB_BASE + endpoint);
  url.searchParams.append('api_key', API_KEY!);
  url.searchParams.append('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('TMDB API error: ' + res.statusText);
  return res.json();
}

interface TopicConfig {
  title: string;
  description: string;
  sections: { heading: string; content: string; links?: { label: string; href: string }[] }[];
}

const TOPICS: Record<string, TopicConfig> = {
  'streaming-guide': {
    title: 'Complete Streaming Guide 2026 - Netflix vs Max vs Disney+',
    description: 'Compare streaming services and find the best platform for your viewing preferences. Netflix, Max, Disney+, and more compared.',
    sections: [
      {
        heading: 'The Streaming Landscape in 2026',
        content: 'The streaming wars continue to evolve, with each platform carving out its niche. Netflix remains the largest by subscriber count, Max (formerly HBO Max) leads in prestige content, Disney+ dominates family and franchise entertainment, and newcomers continue to shake up the market. Understanding what each platform offers is key to getting the most value from your entertainment budget.',
        links: [
          { label: 'Browse Netflix Movies', href: '/streaming/netflix' },
          { label: 'Browse Disney+ Movies', href: '/streaming/disney' },
        ],
      },
      {
        heading: 'Which Service Has the Best Movies?',
        content: 'For sheer volume and variety, Netflix leads the pack. For critically acclaimed originals and classic cinema, Max is hard to beat. Disney+ excels for Marvel, Star Wars, Pixar, and family content. Amazon Prime Video offers a strong mix of originals and rental options. Apple TV+ has a smaller library but consistently high quality.',
        links: [
          { label: 'Free Movies to Stream', href: '/free' },
        ],
      },
      {
        heading: 'Budget-Friendly Options',
        content: 'Not ready to commit to a monthly subscription? Several platforms offer free ad-supported tiers. Tubi, Pluto TV, and Peacock Free all provide legitimate free streaming with surprisingly deep catalogs. You can also find great films on YouTube\'s free movie section.',
        links: [
          { label: 'Watch Free Movies', href: '/free' },
        ],
      },
    ],
  },
  'movie-night': {
    title: 'Perfect Movie Night Guide - How to Pick the Right Film',
    description: 'The ultimate guide to planning the perfect movie night. Tips for choosing films, setting the mood, and matching movies to your audience.',
    sections: [
      {
        heading: 'Know Your Audience',
        content: 'The most important factor in choosing a movie is understanding who you are watching with. A date night calls for something very different than a family gathering or a solo viewing session. Consider the mood, energy level, and preferences of everyone involved.',
        links: [
          { label: 'Date Night Movies', href: '/lists/occasion/date-night' },
          { label: 'Family Night Movies', href: '/lists/occasion/family-night' },
          { label: 'Solo Watch Movies', href: '/lists/occasion/solo-watch' },
        ],
      },
      {
        heading: 'Match the Mood',
        content: 'Feeling adventurous? Go for an action-packed thriller. Need to decompress? A light comedy or feel-good drama hits the spot. Craving intellectual stimulation? Try a mind-bending sci-fi film. The best movie nights align the film choice with the collective mood of the room.',
        links: [
          { label: 'Browse by Genre', href: '/genre/action' },
          { label: 'Top Rated Films', href: '/lists/all-time-greatest' },
        ],
      },
      {
        heading: 'The Double Feature Strategy',
        content: 'For a truly memorable movie night, consider a themed double feature. Pair two films that complement each other -- same genre but different decades, same director with different styles, or thematic parallels that spark great conversation between films.',
        links: [
          { label: 'Explore Double Features', href: '/double-feature/550' },
        ],
      },
    ],
  },
  'family-movies': {
    title: 'Family Movie Guide - Age-Appropriate Films for Everyone',
    description: 'Find the perfect movie for the whole family. Age-appropriate recommendations from animated classics to live-action adventures.',
    sections: [
      {
        heading: 'Movies for Young Children (Ages 3-7)',
        content: 'For the youngest viewers, animated films from Pixar, Disney, and Studio Ghibli are reliable choices. Look for simple stories with clear themes of friendship, courage, and kindness. Films like Toy Story, Moana, and My Neighbor Totoro have universal appeal that adults enjoy too.',
        links: [
          { label: 'Best Animated Movies', href: '/awards/collection/best-animated' },
          { label: 'Family Genre', href: '/genre/family' },
        ],
      },
      {
        heading: 'Movies for Tweens (Ages 8-12)',
        content: 'Tweens are ready for more complex stories with higher stakes. The Harry Potter series, Marvel films, and adventure movies like The Princess Bride offer exciting narratives that respect young viewers\' growing sophistication.',
        links: [
          { label: 'Harry Potter Universe', href: '/universe/harry-potter' },
          { label: 'Marvel Universe', href: '/universe/marvel' },
        ],
      },
      {
        heading: 'Movies the Whole Family Loves',
        content: 'The best family movies work on multiple levels, entertaining children while offering enough depth and humor to keep adults engaged. Films with heart, humor, and universal themes create shared experiences that families remember for years.',
        links: [
          { label: 'Family Night Picks', href: '/lists/occasion/family-night' },
          { label: 'New Releases', href: '/new-releases' },
        ],
      },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(TOPICS).map((topic) => ({ topic }));
}

interface Props {
  params: Promise<{ topic: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const config = TOPICS[topic];
  if (!config) return { title: 'Movie Guide' };
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: BASE_URL + '/guides/' + topic },
    openGraph: {
      title: config.title + ' | UnitTap Movies',
      description: config.description,
      type: 'article',
      url: BASE_URL + '/guides/' + topic,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { topic } = await params;
  const config = TOPICS[topic];
  if (!config) return <div>Guide not found</div>;

  const trending = await tmdbFetch('/trending/movie/week');
  const trendingTitles = trending.results.slice(0, 5).map((m: any) => ({
    id: m.id,
    title: m.title,
  }));

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: config.title,
    description: config.description,
    url: BASE_URL + '/guides/' + topic,
    datePublished: '2026-01-01',
    dateModified: new Date().toISOString(),
    author: { '@type': 'Organization', name: 'UnitTap Movies' },
    publisher: { '@type': 'Organization', name: 'UnitTap Movies' },
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <header className="mb-20">
        <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-4 inline-block">&larr; BACK TO HOME</Link>
        <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase mb-4">{config.title.split(' - ')[0]}</h1>
        <p className="text-xl font-black text-gray-400 uppercase italic">{config.title.split(' - ')[1] || 'Complete Guide'}</p>
        <div className="w-full h-4 bg-black mt-8"></div>
      </header>

      <article className="max-w-4xl">
        {config.sections.map((section, i) => (
          <section key={i} className="mb-16">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-6 border-b-4 border-black pb-4">{section.heading}</h2>
            <p className="text-gray-700 text-lg leading-relaxed font-medium mb-6">{section.content}</p>
            {section.links && section.links.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {section.links.map((link, j) => (
                  <Link key={j} href={link.href} className="inline-block bg-black text-white font-black uppercase text-xs px-4 py-2 hover:bg-yellow-400 hover:text-black transition-colors border-2 border-black">
                    {link.label} &rarr;
                  </Link>
                ))}
              </div>
            )}
          </section>
        ))}

        <section className="mb-16">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-6 border-b-4 border-black pb-4">Trending This Week</h2>
          <p className="text-gray-700 text-lg leading-relaxed font-medium mb-4">
            Not sure where to start? Here are the most popular movies right now:
          </p>
          <ul className="space-y-2">
            {trendingTitles.map((m: any) => (
              <li key={m.id}>
                <Link href={'/movie/' + m.id} className="text-blue-600 font-black hover:underline">{m.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}
