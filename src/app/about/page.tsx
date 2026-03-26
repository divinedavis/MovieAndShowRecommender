import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 p-6 md:p-20 max-w-4xl mx-auto">
      <Link href="/" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline mb-12 inline-block">← BACK TO HOME</Link>
      
      <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-12 border-b-8 border-black pb-4">About UnitTap</h1>
      
      <div className="space-y-12 text-xl font-medium leading-relaxed">
        <section>
          <h2 className="text-3xl font-black uppercase italic mb-6">Our Mission</h2>
          <p>UnitTap is the definitive resource for movie discovery and streaming guidance. Our platform leverages the power of data to help cinephiles find where their favorite films are playing, understand complex watch orders for major franchises, and discover the best-rated content across all platforms.</p>
        </section>

        <section>
          <h2 className="text-3xl font-black uppercase italic mb-6">For the Press</h2>
          <p>Looking for movie trends, streaming availability data, or industry insights? Our data is sourced from global leaders like TMDB and localized for over 20 countries. We provide unique insights into regional popularity and awards season projections.</p>
          <div className="mt-8 bg-blue-600 text-white p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-black uppercase mb-4">Contact for Media Inquiries</h3>
            <p className="font-bold opacity-90">For interviews, data requests, or partnership opportunities, contact us at:</p>
            <p className="text-2xl font-black mt-2">press@unittap.com</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-black uppercase italic mb-6">Global Reach</h2>
          <p>We are committed to accessibility, offering localized experiences in French, Spanish, Hindi, Korean, and more. Our mission is to make cinema discovery universal.</p>
        </section>
      </div>

      <footer className="mt-20 pt-12 border-t-4 border-black">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">© 2026 UNITTAP MOVIES. ALL RIGHTS RESERVED.</p>
      </footer>
    </main>
  );
}
