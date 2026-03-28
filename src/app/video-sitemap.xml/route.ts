import { NextResponse } from 'next/server';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

async function fetchPopularMoviesWithTrailers() {
  const results: any[] = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) continue;
    const data = await res.json();
    for (const movie of data.results.slice(0, 10)) {
      const vidRes = await fetch(
        `${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}&language=en-US`,
        { next: { revalidate: 86400 } }
      );
      if (!vidRes.ok) continue;
      const vidData = await vidRes.json();
      const trailer = vidData.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) {
        results.push({
          id: movie.id,
          title: movie.title,
          description: (movie.overview || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
          titleClean: (movie.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
          thumbnail: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          playerLoc: `https://www.youtube.com/embed/${trailer.key}`,
          contentLoc: `https://www.youtube.com/watch?v=${trailer.key}`,
          publishDate: movie.release_date || '2026-01-01',
        });
      }
    }
  }
  return results;
}

export async function GET() {
  const videos = await fetchPopularMoviesWithTrailers();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videos.map(v => `  <url>
    <loc>https://movies.unittap.com/movie/${v.id}</loc>
    <video:video>
      <video:thumbnail_loc>${v.thumbnail}</video:thumbnail_loc>
      <video:title>${v.titleClean} Official Trailer</video:title>
      <video:description>${v.description}</video:description>
      <video:player_loc>${v.playerLoc}</video:player_loc>
      <video:content_loc>${v.contentLoc}</video:content_loc>
      <video:publication_date>${v.publishDate}</video:publication_date>
    </video:video>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
