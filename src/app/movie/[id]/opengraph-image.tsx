import { ImageResponse } from 'next/og';
import { getMediaDetails } from '@/lib/tmdb';

export const runtime = 'edge';
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const { id } = await params;
  const details = await getMediaDetails(id, 'movie');

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          backgroundColor: '#000',
          backgroundImage: `url(${details.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
          }}
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div
              style={{
                backgroundColor: '#facc15',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '24px',
                fontWeight: '900',
                marginRight: '20px',
              }}
            >
              {details.rating.toFixed(1)} IMDB
            </div>
            <div
              style={{
                color: '#fff',
                fontSize: '24px',
                fontWeight: 'bold',
                letterSpacing: '0.1em',
              }}
            >
              {details.year} // {details.genres[0].toUpperCase()}
            </div>
          </div>

          <h1
            style={{
              fontSize: '80px',
              fontWeight: '900',
              color: '#fff',
              textTransform: 'uppercase',
              margin: 0,
              lineHeight: 1,
              letterSpacing: '-0.05em',
              fontStyle: 'italic',
            }}
          >
            {details.title}
          </h1>

          <div
            style={{
              marginTop: '40px',
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '20px 40px',
              fontSize: '28px',
              fontWeight: '900',
              borderRadius: '12px',
              border: '4px solid #fff',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            WATCH NOW ON {details.streamingProviders[0]?.toUpperCase() || 'STREAMING'} →
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
