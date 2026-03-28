const SITEMAP_URL = 'https://movies.unittap.com/sitemap.xml';

export async function GET() {
  const pings = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  ];

  const results = await Promise.allSettled(
    pings.map(async (url) => {
      const res = await fetch(url, { cache: 'no-store' });
      return { url, status: res.status, ok: res.ok };
    })
  );

  const report = results.map((r, i) => ({
    engine: pings[i],
    status: r.status === 'fulfilled' ? r.value : 'failed',
  }));

  return Response.json({
    message: 'Sitemap ping complete',
    sitemap: SITEMAP_URL,
    results: report,
    timestamp: new Date().toISOString(),
  });
}
