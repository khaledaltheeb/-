import { ImageResponse } from 'next/og';

export const alt = 'روافد — منصة عربية للمعرفة الصحية والنفسية الموثوقة';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      dir="rtl"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg,#eef9f6 0%,#fffefb 54%,#fff6e6 100%)',
        color: '#12343b',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: 999, background: 'rgba(67,200,177,.12)', top: -250, left: -120 }} />
      <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: 999, border: '1px solid rgba(7,95,97,.12)', bottom: -190, right: -70 }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', padding: '68px 78px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 82, height: 82, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg,#0b8580,#063f49)', color: '#fff', fontSize: 42, fontWeight: 900 }}>ر</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 46, fontWeight: 900 }}>روافد</div>
            <div style={{ fontSize: 21, color: '#587278', marginTop: 6 }}>منصة عربية غير تجارية للمعرفة الموثوقة</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1000 }}>
          <div style={{ fontSize: 49, fontWeight: 900, lineHeight: 1.32 }}>الصحة النفسية · التربية الخاصة · التوحد · صعوبات التعلم · سرطان الأطفال</div>
          <div style={{ marginTop: 24, fontSize: 24, lineHeight: 1.6, color: '#3d5e65' }}>مصادر قابلة للتتبع، أدلة عملية، محتوى مراجع، ومسارات واضحة للأسرة ومقدم الرعاية.</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 19, color: '#557177' }}>
          <span>RAWAFID</span>
          <span>المعرفة تبدأ من سؤال واضح</span>
        </div>
      </div>
    </div>,
    size,
  );
}
