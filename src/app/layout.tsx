import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MovieRec",
    template: "%s | MovieRec",
  },
  description: "The world's most optimized movie and show recommender. Find what to watch in 2026, track award winners, and explore cinematic franchises.",
  openGraph: {
    title: "MovieRec",
    description: "The ultimate movie and show discovery engine.",
    url: "https://movies.unittap.com",
    siteName: "MovieRec",
    images: [
      {
        url: "/og-logo.png", // This will now point to your brand logo
        width: 1200,
        height: 630,
        alt: "MovieRec Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieRec",
    description: "The ultimate movie and show discovery engine.",
    images: ["/og-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
