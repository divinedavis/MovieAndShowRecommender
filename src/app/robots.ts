import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/search/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/search/'],
        // Note: crawlDelay is supported by Next.js MetadataRoute.Robots
      },
    ],
    sitemap: [
      'https://movies.unittap.com/sitemap.xml',
      'https://movies.unittap.com/video-sitemap.xml',
      'https://movies.unittap.com/sitemap-index.xml',
    ],
  };
}
