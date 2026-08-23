import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export function GET() {
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
          padding: '72px 84px',
          background: 'linear-gradient(135deg, #f7fbfa 0%, #e9f5f3 55%, #d9efec 100%)',
          color: '#123b3c',
          fontFamily: 'sans-serif',
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
            ر
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.1 }}>روافد</div>
            <div style={{ fontSize: 24, marginTop: 10, color: '#416a6a' }}>منصة عربية للمعرفة الصحية والنفسية الموثوقة</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 980 }}>
          <div style={{ fontSize: 46, fontWeight: 750, lineHeight: 1.35 }}>
            الصحة النفسية · التربية الخاصة · التوحد · صعوبات التعلم · سرطان الأطفال
          </div>
          <div style={{ fontSize: 25, lineHeight: 1.6, marginTop: 26, color: '#345d5e' }}>
            معرفة موثوقة، أدلة عملية، مختصون ومراكز، ومسارات منظمة للأسرة ومقدم الرعاية.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 20, color: '#4f7172' }}>
          <span>rawafid</span>
          <span>المعرفة تبدأ من سؤال واضح</span>
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
