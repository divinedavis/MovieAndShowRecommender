import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://movies.unittap.com'),
  title: {
    default: 'UnitTap Movies',
    template: '%s | UnitTap Movies',
  },
  description: "Find the best movies and shows on Netflix, Max, Disney+, Hulu and more. Browse by genre or streaming platform.",
  twitter: {
    site: '@unittap',
    card: 'summary_large_image',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'UnitTap Movies',
  url: 'https://movies.unittap.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://movies.unittap.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'UnitTap Movies',
  url: 'https://movies.unittap.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://movies.unittap.com/logo.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Replace with your actual GA ID in production */}
        <GoogleAnalytics GA_MEASUREMENT_ID="G-L2X7Z8L09Y" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed for UnitTap Movies"
          href="/feed.xml"
        />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
