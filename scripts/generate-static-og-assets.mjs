import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'public', 'images', 'og');

const assets = [
  {
    filename: 'addiction-recovery.png',
    label: 'الإدمان والتعافي',
    title: 'طريق آمن إلى التعافي',
    subtitle: 'سلامة · علاج قائم على الدليل · تعافٍ وظيفي',
    accent: '#d97745',
    accentSoft: '#fff0df',
  },
  {
    filename: 'family-guide.png',
    label: 'دليل الأسرة',
    title: 'فهم أوضح ودعم عملي',
    subtitle: 'معرفة موثوقة · خطوات يومية · قرارات تشاركية',
    accent: '#0f8f88',
    accentSoft: '#e5f6f1',
  },
  {
    filename: 'capabilities.png',
    label: 'لنرتقي بقدراتهم',
    title: 'قدرات ووصول وتمكين',
    titleSize: 55,
    subtitle: 'نقاط قوة · تيسيرات · مشاركة ودمج',
    accent: '#7567c7',
    accentSoft: '#f0edff',
  },
  {
    filename: 'comparisons.png',
    label: 'الموسوعة المنهجية',
    title: 'مقارنات تشرح الفروق',
    subtitle: 'مفهومان · سياق واضح · تطبيق مسؤول',
    accent: '#b6812f',
    accentSoft: '#fff5df',
  },
];

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function svgFor(asset) {
  const label = escapeXml(asset.label);
  const title = escapeXml(asset.title);
  const subtitle = escapeXml(asset.subtitle);
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f7fcfa"/>
        <stop offset="0.54" stop-color="#fffdf9"/>
        <stop offset="1" stop-color="${asset.accentSoft}"/>
      </linearGradient>
      <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#075e5d"/>
        <stop offset="1" stop-color="#0f8f88"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#173f46" flood-opacity="0.12"/>
      </filter>
      <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="2.2" fill="#0f8f88" opacity="0.10"/>
      </pattern>
    </defs>
    <rect width="1200" height="675" fill="url(#background)"/>
    <rect width="1200" height="675" fill="url(#dots)" opacity="0.55"/>
    <circle cx="120" cy="98" r="230" fill="${asset.accent}" opacity="0.13"/>
    <circle cx="160" cy="575" r="155" fill="none" stroke="${asset.accent}" stroke-width="38" opacity="0.16"/>
    <g filter="url(#shadow)">
      <rect x="66" y="104" width="332" height="468" rx="42" fill="#ffffff"/>
      <rect x="92" y="130" width="280" height="416" rx="31" fill="${asset.accentSoft}"/>
      <path d="M111 452 C168 407 226 471 352 344" fill="none" stroke="${asset.accent}" stroke-width="19" stroke-linecap="round" opacity="0.85"/>
      <circle cx="141" cy="414" r="22" fill="#0f8f88"/>
      <circle cx="238" cy="414" r="22" fill="${asset.accent}"/>
      <circle cx="331" cy="340" r="22" fill="#f4b942"/>
      <rect x="126" y="205" width="212" height="18" rx="9" fill="#ffffff" opacity="0.92"/>
      <rect x="173" y="242" width="165" height="14" rx="7" fill="#ffffff" opacity="0.72"/>
    </g>
    <g transform="translate(1084 68)">
      <rect x="0" y="0" width="72" height="72" rx="22" fill="url(#brand)"/>
      <circle cx="25" cy="23" r="7" fill="#ffffff"/>
      <path d="M15 48c15-1 24-8 28-20 4-10 10-16 23-19-1 14-7 24-16 32-9 7-21 10-35 10Z" fill="#ffffff"/>
      <path d="M19 58c11 0 20-4 27-10 8-6 13-14 16-24 0 14-5 26-14 34-8 7-18 11-29 11Z" fill="#f4b942"/>
    </g>
    <g font-family="DejaVu Sans, sans-serif" text-anchor="end">
      <text x="1058" y="168" font-size="25" font-weight="700" fill="#0f6f6c">${label}</text>
      <text x="1058" y="295" font-size="${asset.titleSize ?? 61}" font-weight="800" fill="#143b42">${title}</text>
      <text x="1058" y="375" font-size="28" font-weight="500" fill="#526c72">${subtitle}</text>
      <text x="1058" y="530" font-size="28" font-weight="800" fill="#143b42">منصة روافد</text>
      <text x="1058" y="568" font-size="18" font-weight="500" letter-spacing="1" fill="#6a7d82">RAWAFID PLATFORM · HEALTHRENEWAL.ORG</text>
    </g>
    <rect x="454" y="421" width="604" height="2" rx="1" fill="#0f8f88" opacity="0.18"/>
  </svg>`;
}

await mkdir(outputDirectory, { recursive: true });
for (const asset of assets) {
  const outputPath = path.join(outputDirectory, asset.filename);
  await sharp(Buffer.from(svgFor(asset)))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
  console.log(`Generated ${path.relative(root, outputPath)}`);
}
