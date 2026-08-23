import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 84px',
          background: 'linear-gradient(135deg, #f7fbfa 0%, #e9f5f3 55%, #d9efec 100%)',
          color: '#123b3c',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#075f61',
              color: '#fff',
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            R
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.1 }}>RAWAFID</div>
            <div style={{ fontSize: 24, marginTop: 10, color: '#416a6a' }}>Arabic knowledge platform for trusted health and wellbeing information</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 980 }}>
          <div style={{ fontSize: 46, fontWeight: 750, lineHeight: 1.35 }}>
            Mental health · Inclusive education · Autism · Learning difficulties · Pediatric cancer
          </div>
          <div style={{ fontSize: 25, lineHeight: 1.6, marginTop: 26, color: '#345d5e' }}>
            Trusted knowledge, practical guides, specialists, centers, and clear pathways for families and caregivers.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 20, color: '#4f7172' }}>
          <span>rawafid</span>
          <span>Knowledge starts with a clear question</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
      },
    },
  );
}
