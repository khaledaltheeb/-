import React from 'react';
import { ImageResponse } from 'next/og';

export function createPwaIcon(size: number) {
  const stroke = Math.max(5, Math.round(size * 0.053));
  return new ImageResponse(
    React.createElement(
      'div',
      {
        style: {
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', background: '#f7fbf9',
          borderRadius: Math.round(size * 0.225),
        },
      },
      React.createElement('div', {
        style: {
          position: 'absolute', inset: size * .085, borderRadius: size * .22,
          background: 'linear-gradient(145deg,#0b8580 0%,#075f61 56%,#063f49 100%)',
          boxShadow: `inset 0 ${Math.max(1,Math.round(size*.006))}px 0 rgba(255,255,255,.22)`,
        },
      }),
      React.createElement('div', { style: { position:'absolute', width:size*.64, height:size*.64, borderRadius:999, background:'rgba(255,255,255,.09)', top:-size*.24, left:-size*.2 } }),
      React.createElement(
        'svg',
        { width:size*.72, height:size*.72, viewBox:'0 0 100 100', style:{position:'relative'} },
        React.createElement('g', { fill:'none', stroke:'#fff', strokeWidth:stroke/(size*.72)*100, strokeLinecap:'round', strokeLinejoin:'round' },
          React.createElement('path', { d:'M27 31c2 16 10 21 23 25 14 5 21 12 22 25' }),
          React.createElement('path', { d:'M15 45c16 0 22 9 35 11 14 4 21 12 22 25' }),
          React.createElement('path', { d:'M44 18c-4 16 0 28 6 38 8 12 19 13 22 25' }),
          React.createElement('path', { d:'M66 33c-8 8-12 15-16 23' }),
        ),
        React.createElement('circle', { cx:27, cy:22, r:7, fill:'#e6b650', stroke:'#fff', strokeWidth:2.6 }),
      ),
    ),
    { width:size, height:size, headers:{'Cache-Control':'public, max-age=31536000, immutable'} },
  );
}
