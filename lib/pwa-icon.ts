import { createElement } from 'react';
import { ImageResponse } from 'next/og';

export function createPwaIcon(size: number) {
  const radius = Math.round(size * 0.225);
  const inner = Math.round(size * 0.085);
  const mark = Math.round(size * 0.72);

  const streamMark = createElement(
    'svg',
    { width: mark, height: mark, viewBox: '0 0 100 100' },
    createElement(
      'g',
      {
        fill: 'none',
        stroke: '#ffffff',
        strokeWidth: 5.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
      createElement('path', { d: 'M27 31c2 16 10 21 23 25 14 5 21 12 22 25' }),
      createElement('path', { d: 'M15 45c16 0 22 9 35 11 14 4 21 12 22 25' }),
      createElement('path', { d: 'M44 18c-4 16 0 28 6 38 8 12 19 13 22 25' }),
      createElement('path', { d: 'M66 33c-8 8-12 15-16 23' }),
    ),
    createElement('circle', {
      cx: 27,
      cy: 22,
      r: 7,
      fill: '#e6b650',
      stroke: '#ffffff',
      strokeWidth: 2.6,
    }),
  );

  const icon = createElement(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7fbf9',
        borderRadius: radius,
      },
    },
    createElement(
      'div',
      {
        style: {
          width: size - inner * 2,
          height: size - inner * 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius,
          background: 'linear-gradient(135deg,#0b8580 0%,#075f61 56%,#063f49 100%)',
        },
      },
      streamMark,
    ),
  );

  return new ImageResponse(icon, {
    width: size,
    height: size,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
