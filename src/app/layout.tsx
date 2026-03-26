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
    default: 'MovieRec',
    template: '%s | MovieRec',
  },
  description: 'The world\'s most optimized movie and show recommender.',
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
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
