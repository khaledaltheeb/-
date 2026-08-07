import React from 'react';
import { ImageResponse } from 'next/og';

export function createPwaIcon(size: number) {
  return new ImageResponse(
    React.createElement(
      'div',
      {
        style: {
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg,#075e5d 0%,#0b7772 58%,#0f8f88 100%)',
          color: '#fff', fontFamily: 'Arial, sans-serif', borderRadius: Math.round(size * 0.22),
        },
      },
      React.createElement('div', { style: { position:'absolute', width:size*.7, height:size*.7, borderRadius:999, background:'rgba(255,255,255,.08)', top:-size*.28, left:-size*.18 } }),
      React.createElement('div', { style: { position:'absolute', width:size*.55, height:size*.55, borderRadius:999, background:'rgba(128,240,194,.10)', bottom:-size*.23, right:-size*.16 } }),
      React.createElement('div', { style: { display:'flex', alignItems:'center', justifyContent:'center', width:size*.62, height:size*.62, borderRadius:size*.18, border:`${Math.max(2,Math.round(size*.012))}px solid rgba(255,255,255,.2)`, background:'rgba(255,255,255,.08)', fontSize:size*.38, lineHeight:1, fontWeight:900 } }, 'ر'),
    ),
    {
      width: size,
      height: size,
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
  );
}
