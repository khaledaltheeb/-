import { ImageResponse } from 'next/og';

export function createPwaIcon(size: number) {
  const radius = Math.round(size * 0.225);
  const inner = Math.round(size * 0.085);
  const mark = Math.round(size * 0.72);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f7fbf9',
          borderRadius: radius,
        }}
      >
        <div
          style={{
            width: size - inner * 2,
            height: size - inner * 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius,
            background: 'linear-gradient(135deg,#0b8580 0%,#075f61 56%,#063f49 100%)',
            color: '#ffffff',
            fontSize: Math.round(mark * 0.62),
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          ر
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  );
}
