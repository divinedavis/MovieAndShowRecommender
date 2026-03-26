import { getMediaData } from '@/lib/tmdb';

export async function GET() {
  const { movies, top2026Month } = await getMediaData();
  const baseUrl = 'https://movies.unittap.com';

  const items = [...movies, ...top2026Month]
    .map((m) => `
    <item>
      <title><![CDATA[${m.title} (${m.year})]]></title>
      <link>${baseUrl}/${m.type}/${m.id}</link>
      <guid>${baseUrl}/${m.type}/${m.id}</guid>
      <pubDate>${new Date(m.releaseDate || Date.now()).toUTCString()}</pubDate>
      <description><![CDATA[${m.description}]]></description>
      <enclosure url="${m.image}" length="0" type="image/jpeg" />
    </item>`)
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>UnitTap Movies - Latest Releases & Trending</title>
  <link>${baseUrl}</link>
  <description>The definitive guide to movie discovery and streaming.</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
  ${items}
</channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
