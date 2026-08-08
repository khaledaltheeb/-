import { ImageResponse } from 'next/og';

export const CAPABILITY_OG_SIZE = { width: 1200, height: 675 } as const;

export function capabilityOgImage(title: string, kicker = 'لنرتقي بقدراتهم') {
  const safeTitle = title.length > 110 ? `${title.slice(0, 107).trim()}…` : title;
  return new ImageResponse(
    (
      <div
        dir="rtl"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg,#f5fffb 0%,#ffffff 48%,#fff6e9 100%)',
          color: '#143b42',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 470,
            height: 470,
            borderRadius: 999,
            left: -120,
            top: -150,
            background: 'radial-gradient(circle,#6dd6c2 0%,#0f8f88 42%,#075e5d 72%,rgba(7,94,93,0) 73%)',
            opacity: 0.92,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 310,
            height: 310,
            borderRadius: 999,
            left: 115,
            bottom: -140,
            border: '38px solid rgba(231,172,60,.32)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 190,
            height: 190,
            borderRadius: 999,
            right: -55,
            bottom: 38,
            background: 'rgba(141,123,216,.11)',
          }}
        />
        <div
          style={{
            width: '100%',
            padding: '76px 82px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: 820 }}>
            <div
              style={{
                display: 'flex',
                padding: '10px 18px',
                borderRadius: 999,
                background: '#e5f6f1',
                color: '#075e5d',
                fontSize: 23,
                fontWeight: 800,
              }}
            >
              {kicker}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 30,
                fontSize: safeTitle.length > 72 ? 48 : 58,
                lineHeight: 1.42,
                fontWeight: 900,
                letterSpacing: -1,
                maxWidth: 850,
              }}
            >
              {safeTitle}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg,#0f8f88,#3ec7ad)',
                color: '#fff',
                fontWeight: 900,
                fontSize: 30,
              }}
            >
              ر
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: 25, fontWeight: 900 }}>منصة روافد</div>
              <div style={{ display: 'flex', fontSize: 17, color: '#657d82' }}>العافية النفسية · الدمج · التمكين</div>
            </div>
          </div>
        </div>
      </div>
    ),
    CAPABILITY_OG_SIZE,
  );
}
