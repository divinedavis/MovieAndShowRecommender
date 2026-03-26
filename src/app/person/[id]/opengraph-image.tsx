import { ImageResponse } from 'next/og';
import { getPersonDetails } from '@/lib/tmdb';

export const runtime = 'edge';
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const { id } = await params;
  const details = await getPersonDetails(id);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundColor: '#f9fafb',
          padding: '40px',
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
            backgroundColor: '#2563eb',
            clipPath: 'polygon(0 0, 45% 0, 35% 100%, 0% 100%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            position: 'relative',
            height: '500px',
            width: '350px',
            border: '8px solid #000',
            boxShadow: '20px 20px 0px 0px rgba(0,0,0,1)',
            overflow: 'hidden',
          }}
        >
          <img
            src={details.image}
            style={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '80px', flex: 1, position: 'relative' }}>
          <div
            style={{
              backgroundColor: '#000',
              color: '#fff',
              padding: '8px 16px',
              fontSize: '20px',
              fontWeight: '900',
              alignSelf: 'flex-start',
              marginBottom: '20px',
              letterSpacing: '0.1em',
            }}
          >
            {details.known_for?.toUpperCase()}
          </div>

          <h1
            style={{
              fontSize: '100px',
              fontWeight: '900',
              color: '#000',
              textTransform: 'uppercase',
              margin: 0,
              lineHeight: 0.8,
              letterSpacing: '-0.05em',
              fontStyle: 'italic',
            }}
          >
            {details.name}
          </h1>

          <div style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {details.credits.slice(0, 3).map((c: any) => (
              <div
                key={c.id}
                style={{
                  backgroundColor: '#fff',
                  border: '3px solid #000',
                  padding: '10px 20px',
                  fontSize: '18px',
                  fontWeight: '900',
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                }}
              >
                {c.title.toUpperCase()}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '60px',
              fontSize: '24px',
              fontWeight: '900',
              color: '#2563eb',
              letterSpacing: '0.2em',
            }}
          >
            EXPLORE FILMOGRAPHY →
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
