import { ImageResponse } from 'next/og';

export const dynamic = 'force-dynamic';

function clean(value: string | null, max: number) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const title = clean(url.searchParams.get('title'), 120) || 'روافد — معرفة عربية موثوقة';
  const context = clean(url.searchParams.get('context'), 70) || 'معرفة موثوقة · مصادر قابلة للتتبع · مسارات عملية';

  return new ImageResponse(
    (
      <div
        dir="rtl"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '68px 78px',
          background: 'linear-gradient(135deg, #f7fbfa 0%, #e8f5f2 56%, #fff9ed 100%)',
          color: '#123b3c',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, justifyContent: 'flex-start' }}>
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: 23,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#075f61',
              color: '#fff',
              fontSize: 40,
              fontWeight: 800,
            }}
          >ر</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1 }}>روافد</div>
            <div style={{ fontSize: 22, marginTop: 8, color: '#416a6a' }}>منصة عربية للمعرفة الصحية والنفسية الموثوقة</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1040 }}>
          <div style={{ fontSize: title.length > 80 ? 40 : 48, fontWeight: 800, lineHeight: 1.42 }}>
            {title}
          </div>
          <div style={{ fontSize: 23, lineHeight: 1.6, marginTop: 22, color: '#345d5e' }}>
            {context}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 19, color: '#4f7172' }}>
          <span>healthrenewal.org</span>
          <span>اسأل · افهم · تحقق من المصدر</span>
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
