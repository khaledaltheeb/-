import { ImageResponse } from 'next/og';
import type { CapabilityRecord } from '@/lib/capabilities';

type JsonRecord = Record<string, unknown>;

type CoverPalette = {
  background: string;
  panel: string;
  ink: string;
  accent: string;
  accentSoft: string;
  line: string;
};

const PALETTES: Record<string, CoverPalette> = {
  'neurodevelopmental-learning': { background: '#ecf8f5', panel: '#ffffff', ink: '#123e45', accent: '#0b7f78', accentSoft: '#cdebe5', line: '#8bc7bd' },
  'genetic-metabolic': { background: '#f4f0fb', panel: '#ffffff', ink: '#3f3559', accent: '#7454a6', accentSoft: '#e4d9f4', line: '#b8a3d8' },
  'motor-neurological': { background: '#eef5fb', panel: '#ffffff', ink: '#263f59', accent: '#286b9d', accentSoft: '#d5e6f4', line: '#8bb6d7' },
  'sensory-communication': { background: '#fff6e9', panel: '#ffffff', ink: '#56442d', accent: '#a7691b', accentSoft: '#f4dfbd', line: '#d6aa69' },
  'chronic-health': { background: '#f9f2f1', panel: '#ffffff', ink: '#573a3b', accent: '#9c5354', accentSoft: '#efd5d5', line: '#c98b8b' },
  'progressive-psychosocial': { background: '#f1f6ef', panel: '#ffffff', ink: '#344b38', accent: '#4d7656', accentSoft: '#d9e7d8', line: '#97b69c' },
  default: { background: '#eff8f6', panel: '#ffffff', ink: '#143f45', accent: '#0b7772', accentSoft: '#d3ebe7', line: '#88c3ba' },
};

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function seedFrom(value: string) {
  let seed = 0;
  for (const char of value) seed = (seed * 31 + char.charCodeAt(0)) % 9973;
  return seed;
}

function Motif({ category, palette, seed }: { category: string; palette: CoverPalette; seed: number }) {
  const shift = seed % 38;
  if (category === 'genetic-metabolic') {
    return <svg width="430" height="430" viewBox="0 0 430 430" fill="none">
      <path d="M116 48C278 100 155 166 314 218C154 270 276 337 116 385" stroke={palette.accent} strokeWidth="18" strokeLinecap="round" />
      <path d="M314 48C152 100 275 166 116 218C276 270 154 337 314 385" stroke={palette.line} strokeWidth="18" strokeLinecap="round" />
      {[86,132,179,225,272,319,365].map((y, index) => <path key={y} d={`M${index % 2 ? 150 : 136} ${y}H${index % 2 ? 280 : 294}`} stroke={palette.ink} strokeWidth="7" strokeLinecap="round" opacity="0.55" />)}
    </svg>;
  }
  if (category === 'motor-neurological') {
    return <svg width="430" height="430" viewBox="0 0 430 430" fill="none">
      <circle cx="215" cy="215" r="145" stroke={palette.line} strokeWidth="24" />
      <path d="M92 262C132 159 191 118 294 121" stroke={palette.accent} strokeWidth="25" strokeLinecap="round" />
      <path d="M272 83L326 118L276 158" stroke={palette.accent} strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="143" cy="284" r="33" fill={palette.accentSoft} stroke={palette.ink} strokeWidth="8" />
    </svg>;
  }
  if (category === 'sensory-communication') {
    return <svg width="430" height="430" viewBox="0 0 430 430" fill="none">
      <path d="M55 215C111 121 181 84 215 84C249 84 319 121 375 215C319 309 249 346 215 346C181 346 111 309 55 215Z" stroke={palette.accent} strokeWidth="20" />
      <circle cx="215" cy="215" r="58" fill={palette.accentSoft} stroke={palette.ink} strokeWidth="14" />
      <path d="M320 116C352 142 372 176 378 215M340 85C386 122 411 167 417 215" stroke={palette.line} strokeWidth="12" strokeLinecap="round" />
    </svg>;
  }
  if (category === 'chronic-health') {
    return <svg width="430" height="430" viewBox="0 0 430 430" fill="none">
      <circle cx="215" cy="215" r="150" fill={palette.accentSoft} opacity="0.7" />
      <path d="M54 223H130L159 159L201 293L239 191L264 223H377" stroke={palette.accent} strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={220 + shift} cy="108" r="28" fill={palette.panel} stroke={palette.ink} strokeWidth="9" />
    </svg>;
  }
  if (category === 'progressive-psychosocial') {
    return <svg width="430" height="430" viewBox="0 0 430 430" fill="none">
      <circle cx="215" cy="215" r="155" stroke={palette.line} strokeWidth="19" />
      <circle cx="215" cy="215" r="105" stroke={palette.accentSoft} strokeWidth="19" />
      <path d="M215 74L261 201L215 356L169 228L215 74Z" fill={palette.accent} />
      <circle cx="215" cy="215" r="28" fill={palette.panel} stroke={palette.ink} strokeWidth="8" />
    </svg>;
  }
  if (category === 'neurodevelopmental-learning') {
    const points = [[92,138],[190,78],[304,126],[336,246],[238,335],[110,292],[206,211]];
    return <svg width="430" height="430" viewBox="0 0 430 430" fill="none">
      <path d="M92 138L190 78L304 126L336 246L238 335L110 292L92 138ZM92 138L206 211M190 78L206 211M304 126L206 211M336 246L206 211M238 335L206 211M110 292L206 211" stroke={palette.line} strokeWidth="13" strokeLinecap="round" />
      {points.map(([cx, cy], index) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={index === 6 ? 38 : 25 + ((seed + index) % 8)} fill={index === 6 ? palette.accent : palette.panel} stroke={index === 6 ? palette.ink : palette.accent} strokeWidth="9" />)}
    </svg>;
  }
  return <svg width="430" height="430" viewBox="0 0 430 430" fill="none">
    <circle cx="215" cy="215" r="152" stroke={palette.line} strokeWidth="24" />
    <path d="M115 215C115 160 160 115 215 115C270 115 315 160 315 215C315 270 270 315 215 315" stroke={palette.accent} strokeWidth="26" strokeLinecap="round" />
    <circle cx="215" cy="215" r="44" fill={palette.accentSoft} stroke={palette.ink} strokeWidth="10" />
  </svg>;
}

export function capabilityCover(record: CapabilityRecord, routeSlug?: string) {
  const schema = asRecord(record.schema_json);
  const category = str(schema?.legacy_category) || 'default';
  const palette = PALETTES[category] || PALETTES.default;
  const seed = seedFrom(routeSlug || record.slug);
  const englishTitle = str(schema?.legacy_title_en) || (routeSlug === 'registry' ? 'Capabilities Registry' : routeSlug === 'protocol' ? 'Capability Discovery Protocol' : routeSlug === 'methodology' ? 'Evidence & Methodology' : 'Capabilities Reference');
  const categoryLabel = category === 'default' ? 'Capabilities • Access • Participation' : ({
    'neurodevelopmental-learning': 'Neurodevelopment • Learning • Communication',
    'genetic-metabolic': 'Genetic • Metabolic • Functional Support',
    'motor-neurological': 'Motor • Neurological • Participation',
    'sensory-communication': 'Sensory Access • Communication',
    'chronic-health': 'Chronic Health • Sustainable Participation',
    'progressive-psychosocial': 'Stability • Function • Participation',
  } as Record<string, string>)[category];

  const response = new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: palette.background, color: palette.ink, fontFamily: 'sans-serif' }}>
      <div style={{ position: 'absolute', width: 650, height: 650, borderRadius: 999, background: palette.accentSoft, opacity: 0.55, left: -190 + (seed % 45), top: -270 }} />
      <div style={{ position: 'absolute', width: 430, height: 430, borderRadius: 999, border: `2px solid ${palette.line}`, opacity: 0.35, right: -170, bottom: -185 + (seed % 35) }} />
      <div style={{ width: '48%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 42 }}>
        <div style={{ width: 470, height: 470, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 90, background: palette.panel, border: `1px solid ${palette.line}`, boxShadow: '0 28px 80px rgba(20,63,69,0.09)' }}>
          <Motif category={category} palette={palette} seed={seed} />
        </div>
      </div>
      <div style={{ width: '52%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '72px 72px 72px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: palette.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 19, fontWeight: 800 }}>R</div>
          <div style={{ fontSize: 23, letterSpacing: 5, fontWeight: 800 }}>RAWAFID</div>
        </div>
        <div style={{ fontSize: englishTitle.length > 48 ? 45 : 54, lineHeight: 1.12, fontWeight: 800, letterSpacing: -1.5, maxWidth: 560 }}>{englishTitle}</div>
        <div style={{ width: 90, height: 8, borderRadius: 99, background: palette.accent, marginTop: 30, marginBottom: 23 }} />
        <div style={{ fontSize: 22, lineHeight: 1.4, color: palette.accent, fontWeight: 650, maxWidth: 560 }}>{categoryLabel}</div>
        <div style={{ fontSize: 17, lineHeight: 1.4, color: palette.ink, opacity: 0.62, marginTop: 14 }}>Evidence-bounded • person-specific • measurable</div>
      </div>
    </div>,
    { width: 1200, height: 675 },
  );
  response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  return response;
}
