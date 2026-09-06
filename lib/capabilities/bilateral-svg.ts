import type { BilateralActivity, BilateralMarker } from './bilateral-tracks';

function markerSvg(marker: BilateralMarker) {
  if (marker.type === 'pause') {
    return `<g transform="translate(${marker.x} ${marker.y})"><path d="M0-18 5-6 18-5 8 4 11 17 0 10-11 17-8 4-18-5-5-6Z" fill="#FACC15" stroke="#92400E" stroke-width="3"/></g>`;
  }
  if (marker.type === 'slow') {
    return `<circle cx="${marker.x}" cy="${marker.y}" r="12" fill="#BFDBFE" stroke="#2563EB" stroke-width="4"/>`;
  }
  return `<path d="M${marker.x} ${marker.y - 14} L${marker.x + 14} ${marker.y + 12} L${marker.x - 14} ${marker.y + 12} Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="3"/>`;
}

function escapeXml(value: string) {
  return value.replace(/[&<>\"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char] ?? char));
}

export function renderBilateralSvg(activity: BilateralActivity) {
  const isTest = activity.kind === 'test';
  const subtitle = isTest ? `اختبار المستوى ${activity.level}` : `النشاط التدريبي - المستوى ${activity.level}`;
  const markers = (activity.markers ?? []).map(markerSvg).join('');
  const helper = isTest
    ? 'ابدأ باليدين معًا، وحافظ على التتبع حتى النهاية.'
    : 'اليد اليمنى على المسار الأزرق، واليسرى على المسار الأخضر. تحرك بهما معًا.';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 794 1123" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(activity.title)}</title>
  <desc id="desc">${escapeXml(activity.instruction)}</desc>
  <rect width="794" height="1123" rx="26" fill="#FFFDF8"/>
  <rect x="18" y="18" width="758" height="1087" rx="24" fill="none" stroke="#2563EB" stroke-width="3"/>
  <circle cx="730" cy="72" r="30" fill="#FDE68A"/><path d="M715 72 Q730 88 745 72" fill="none" stroke="#92400E" stroke-width="3" stroke-linecap="round"/><circle cx="720" cy="64" r="2.5" fill="#92400E"/><circle cx="740" cy="64" r="2.5" fill="#92400E"/>
  <text x="397" y="78" text-anchor="middle" direction="rtl" font-family="Arial, sans-serif" font-size="38" font-weight="800" fill="#0F4C81">مسارا اليدين المتزامنان</text>
  <rect x="282" y="98" width="230" height="42" rx="21" fill="${isTest ? '#FDE68A' : '#DCFCE7'}"/>
  <text x="397" y="127" text-anchor="middle" direction="rtl" font-family="Arial, sans-serif" font-size="21" font-weight="700" fill="#17324D">${escapeXml(subtitle)}</text>
  <text x="397" y="172" text-anchor="middle" direction="rtl" font-family="Arial, sans-serif" font-size="18" fill="#334155">${escapeXml(helper)}</text>
  <rect x="70" y="194" width="654" height="48" rx="20" fill="#E0F2FE" stroke="#7DD3FC"/>
  <text x="397" y="225" text-anchor="middle" direction="rtl" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#0C4A6E">${escapeXml(activity.instruction)}</text>

  <g>
    <circle cx="245" cy="250" r="31" fill="#DCFCE7" stroke="#16A34A" stroke-width="5"/><text x="245" y="257" text-anchor="middle" font-family="Arial" font-size="26">✋</text>
    <circle cx="549" cy="250" r="31" fill="#DBEAFE" stroke="#2563EB" stroke-width="5"/><text x="549" y="257" text-anchor="middle" font-family="Arial" font-size="26">✋</text>
    <text x="180" y="255" text-anchor="middle" direction="rtl" font-family="Arial" font-size="17" font-weight="700" fill="#166534">اليسرى - البداية</text>
    <text x="615" y="255" text-anchor="middle" direction="rtl" font-family="Arial" font-size="17" font-weight="700" fill="#1D4ED8">اليمنى - البداية</text>
  </g>

  <path d="${activity.leftPath}" fill="none" stroke="#16A34A" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${activity.rightPath}" fill="none" stroke="#2563EB" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  ${markers}

  <circle cx="245" cy="930" r="24" fill="#DCFCE7" stroke="#16A34A" stroke-width="5"/>
  <circle cx="549" cy="930" r="24" fill="#DBEAFE" stroke="#2563EB" stroke-width="5"/>
  <text x="245" y="976" text-anchor="middle" direction="rtl" font-family="Arial" font-size="18" font-weight="700" fill="#166534">النهاية</text>
  <text x="549" y="976" text-anchor="middle" direction="rtl" font-family="Arial" font-size="18" font-weight="700" fill="#1D4ED8">النهاية</text>

  <g opacity=".9"><text x="72" y="430" font-size="28">★</text><text x="700" y="530" font-size="26">✦</text><text x="90" y="760" font-size="24">●</text><text x="690" y="820" font-size="24">★</text></g>
  <rect x="52" y="1010" width="690" height="70" rx="18" fill="#F8FAFC" stroke="#CBD5E1"/>
  <text x="716" y="1038" text-anchor="end" direction="rtl" font-family="Arial" font-size="16" font-weight="700" fill="#334155">الاسم: ........................................</text>
  <text x="445" y="1038" text-anchor="end" direction="rtl" font-family="Arial" font-size="16" font-weight="700" fill="#334155">التاريخ: ....................</text>
  <text x="250" y="1038" text-anchor="end" direction="rtl" font-family="Arial" font-size="16" font-weight="700" fill="#334155">الوقت: ............</text>
  <text x="716" y="1066" text-anchor="end" direction="rtl" font-family="Arial" font-size="15" fill="#475569">هل تحركت اليدان معًا؟ نعم / لا</text>
  <text x="430" y="1066" text-anchor="end" direction="rtl" font-family="Arial" font-size="15" fill="#475569">عدد مرات الخروج عن المسار: ........</text>
  <text x="105" y="1066" text-anchor="start" direction="rtl" font-family="Arial" font-size="14" fill="#64748B">روافد - لنرتقي بقدراتهم</text>
</svg>`;
}
