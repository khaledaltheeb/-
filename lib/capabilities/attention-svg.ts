import type { AttentionActivity } from './attention-lab';
import { getAttentionSeries } from './attention-lab';

const W = 794;
const H = 1123;
const COLORS = ['#2563EB', '#F97316', '#16A34A', '#DB2777', '#7C3AED', '#EAB308', '#0891B2'];
const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'heart'] as const;

type Shape = typeof SHAPES[number];

function esc(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] ?? char));
}

function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: readonly T[], random: () => number) {
  return items[Math.floor(random() * items.length)]!;
}

function starPoints(cx: number, cy: number, r: number) {
  const points: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 === 0 ? r : r * 0.45;
    points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
  }
  return points.join(' ');
}

function shapeSvg(shape: Shape, x: number, y: number, size: number, color: string, outline = '#334155') {
  const s = size;
  if (shape === 'circle') return `<circle cx="${x}" cy="${y}" r="${s * 0.43}" fill="${color}" stroke="${outline}" stroke-width="2"/>`;
  if (shape === 'square') return `<rect x="${x - s * 0.42}" y="${y - s * 0.42}" width="${s * 0.84}" height="${s * 0.84}" rx="6" fill="${color}" stroke="${outline}" stroke-width="2"/>`;
  if (shape === 'triangle') return `<path d="M ${x} ${y - s * 0.48} L ${x + s * 0.48} ${y + s * 0.42} L ${x - s * 0.48} ${y + s * 0.42} Z" fill="${color}" stroke="${outline}" stroke-width="2"/>`;
  if (shape === 'diamond') return `<path d="M ${x} ${y - s * 0.5} L ${x + s * 0.46} ${y} L ${x} ${y + s * 0.5} L ${x - s * 0.46} ${y} Z" fill="${color}" stroke="${outline}" stroke-width="2"/>`;
  return `<path d="M ${x} ${y + s * 0.36} C ${x - s * 0.7} ${y - s * 0.05}, ${x - s * 0.35} ${y - s * 0.62}, ${x} ${y - s * 0.25} C ${x + s * 0.35} ${y - s * 0.62}, ${x + s * 0.7} ${y - s * 0.05}, ${x} ${y + s * 0.36} Z" fill="${color}" stroke="${outline}" stroke-width="2"/>`;
}

function fishSvg(x: number, y: number, size: number, color: string) {
  const bodyW = size * 0.9;
  const bodyH = size * 0.5;
  return `<g><ellipse cx="${x}" cy="${y}" rx="${bodyW / 2}" ry="${bodyH / 2}" fill="${color}" stroke="#334155" stroke-width="2"/><path d="M ${x - bodyW / 2} ${y} L ${x - bodyW * 0.78} ${y - bodyH * 0.55} L ${x - bodyW * 0.78} ${y + bodyH * 0.55} Z" fill="${color}" stroke="#334155" stroke-width="2"/><circle cx="${x + bodyW * 0.22}" cy="${y - bodyH * 0.08}" r="2.6" fill="#0F172A"/></g>`;
}

function flowerSvg(x: number, y: number, size: number, color = '#FACC15') {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = i * Math.PI / 3;
    return `<circle cx="${x + Math.cos(a) * size * 0.3}" cy="${y + Math.sin(a) * size * 0.3}" r="${size * 0.22}" fill="${color}" stroke="#A16207" stroke-width="1.2"/>`;
  }).join('');
  return `<g>${petals}<circle cx="${x}" cy="${y}" r="${size * 0.18}" fill="#F97316"/></g>`;
}

function catSvg(x: number, y: number, size: number, color = '#F59E0B') {
  return `<g><path d="M ${x - size * 0.38} ${y - size * 0.2} L ${x - size * 0.26} ${y - size * 0.58} L ${x - size * 0.05} ${y - size * 0.32} L ${x + size * 0.06} ${y - size * 0.32} L ${x + size * 0.28} ${y - size * 0.58} L ${x + size * 0.4} ${y - size * 0.18} Q ${x + size * 0.48} ${y + size * 0.35} ${x} ${y + size * 0.42} Q ${x - size * 0.48} ${y + size * 0.35} ${x - size * 0.38} ${y - size * 0.2} Z" fill="${color}" stroke="#7C2D12" stroke-width="2"/><circle cx="${x - size * 0.15}" cy="${y}" r="${size * 0.045}" fill="#111827"/><circle cx="${x + size * 0.15}" cy="${y}" r="${size * 0.045}" fill="#111827"/><path d="M ${x - size * 0.06} ${y + size * 0.12} Q ${x} ${y + size * 0.18} ${x + size * 0.06} ${y + size * 0.12}" fill="none" stroke="#7C2D12" stroke-width="1.5"/></g>`;
}

function beeSvg(x: number, y: number, size: number) {
  return `<g><ellipse cx="${x - size * 0.18}" cy="${y - size * 0.18}" rx="${size * 0.22}" ry="${size * 0.15}" fill="#DBEAFE" stroke="#60A5FA"/><ellipse cx="${x + size * 0.18}" cy="${y - size * 0.18}" rx="${size * 0.22}" ry="${size * 0.15}" fill="#DBEAFE" stroke="#60A5FA"/><ellipse cx="${x}" cy="${y}" rx="${size * 0.35}" ry="${size * 0.26}" fill="#FACC15" stroke="#92400E" stroke-width="2"/><path d="M ${x - size * 0.15} ${y - size * 0.22} L ${x - size * 0.15} ${y + size * 0.22} M ${x + size * 0.12} ${y - size * 0.22} L ${x + size * 0.12} ${y + size * 0.22}" stroke="#111827" stroke-width="${Math.max(2, size * 0.08)}"/><circle cx="${x + size * 0.25}" cy="${y - size * 0.03}" r="2" fill="#111827"/></g>`;
}

function commonHeader(activity: AttentionActivity) {
  const test = activity.kind === 'test';
  const band = test ? '#EDE9FE' : '#DBEAFE';
  const accent = test ? '#7C3AED' : '#2563EB';
  return `<rect width="794" height="1123" fill="#FFFEFB"/><rect x="24" y="24" width="746" height="1075" rx="28" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/><circle cx="704" cy="82" r="38" fill="#FEF3C7"/><path d="M688 82 l10 10 22 -25" fill="none" stroke="#F59E0B" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><text x="397" y="72" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="31" font-weight="800" fill="#0F3D67" direction="rtl">${esc(activity.seriesTitle)}</text><rect x="247" y="91" width="300" height="42" rx="21" fill="${band}"/><text x="397" y="119" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="18" font-weight="700" fill="${accent}" direction="rtl">${esc(activity.label)} - المستوى ${activity.level}</text><text x="397" y="161" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="16" fill="#334155" direction="rtl">${esc(activity.instruction)}</text><line x1="70" y1="184" x2="724" y2="184" stroke="#E2E8F0" stroke-width="2"/>`;
}

function footer(activity: AttentionActivity, extra = '') {
  return `${extra}<rect x="54" y="1010" width="686" height="64" rx="18" fill="#F8FAFC" stroke="#CBD5E1"/><text x="710" y="1038" text-anchor="end" font-family="Tahoma,Arial,sans-serif" font-size="14" font-weight="700" fill="#334155" direction="rtl">الاسم: ............................</text><text x="465" y="1038" text-anchor="end" font-family="Tahoma,Arial,sans-serif" font-size="14" font-weight="700" fill="#334155" direction="rtl">التاريخ: ............</text><text x="255" y="1038" text-anchor="end" font-family="Tahoma,Arial,sans-serif" font-size="14" font-weight="700" fill="#334155" direction="rtl">الأخطاء: ............</text><text x="397" y="1062" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="13" fill="#64748B" direction="rtl">${activity.kind === 'test' ? 'اختبار إتقان للمهمة - ليس أداة تشخيص' : 'تدريب متدرج: الدقة أولًا ثم السرعة والاستقلال'}</text></svg>`;
}

function targetIndices(total: number, count: number, random: () => number) {
  const set = new Set<number>();
  while (set.size < Math.min(count, total)) set.add(Math.floor(random() * total));
  return set;
}

function renderSelective(activity: AttentionActivity) {
  const random = rng(activity.seed);
  const level = activity.level;
  const cols = 5 + level;
  const rows = 4 + level;
  const total = cols * rows;
  const targetCount = Math.min(3 + level, 8);
  const targets = targetIndices(total, targetCount, random);
  const cellW = 610 / cols;
  const cellH = 610 / rows;
  let items = `<rect x="278" y="205" width="238" height="66" rx="18" fill="#EFF6FF" stroke="#93C5FD"/><text x="492" y="232" text-anchor="end" font-family="Tahoma,Arial,sans-serif" font-size="15" font-weight="700" fill="#1E3A8A" direction="rtl">ابحث عن:</text>${fishSvg(325, 238, 50, '#2563EB')}`;
  for (let i = 0; i < total; i += 1) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = 92 + col * cellW + cellW / 2;
    const y = 310 + row * cellH + cellH / 2;
    if (targets.has(i)) items += fishSvg(x, y, Math.min(54, cellW * 0.66), '#2563EB');
    else {
      const closeColor = level >= 3 && random() > 0.55 ? '#2563EB' : pick(COLORS.filter((c) => c !== '#2563EB'), random);
      if (level >= 4 && random() > 0.5) items += shapeSvg(pick(SHAPES, random), x, y, Math.min(44, cellW * 0.58), closeColor);
      else items += fishSvg(x, y, Math.min(52, cellW * 0.64), closeColor);
    }
  }
  return items;
}

function pathPoint(y: number, phase: number, amplitude: number) {
  return 397 + Math.sin((y - 280) / 72 + phase) * amplitude;
}

function renderSustained(activity: AttentionActivity) {
  const random = rng(activity.seed);
  const level = activity.level;
  const phase = random() * Math.PI;
  const amplitude = 125 + level * 11;
  const points: Array<[number, number]> = [];
  for (let y = 300; y <= 900; y += 40) points.push([pathPoint(y, phase, amplitude), y]);
  const d = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y}`).join(' ');
  let body = `<path d="${d}" fill="none" stroke="#0F766E" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity="0.12"/><path d="${d}" fill="none" stroke="#0F766E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8 7"/>${beeSvg(points[0]![0], 255, 54)}<rect x="340" y="918" width="114" height="52" rx="26" fill="#FEF3C7" stroke="#D97706"/><text x="397" y="950" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="15" font-weight="700" fill="#92400E" direction="rtl">النهاية</text>`;
  const flowerCount = 4 + level;
  const selected = targetIndices(points.length - 2, flowerCount, random);
  points.slice(1, -1).forEach(([x, y], i) => {
    if (selected.has(i)) body += flowerSvg(x + (random() - 0.5) * 18, y, 25, '#FACC15');
    else if (random() > 0.55) body += flowerSvg(x + (random() - 0.5) * 26, y, 20, pick(['#F472B6', '#60A5FA', '#A78BFA'], random));
  });
  for (let i = 0; i < 12 + level * 3; i += 1) {
    const x = 85 + random() * 624;
    const y = 300 + random() * 590;
    body += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${4 + random() * 5}" fill="${pick(['#DCFCE7', '#E0F2FE', '#FCE7F3'], random)}"/>`;
  }
  return body;
}

function renderDistractor(activity: AttentionActivity) {
  const random = rng(activity.seed);
  const level = activity.level;
  const cols = 6 + level;
  const rows = 5 + level;
  const total = cols * rows;
  const targets = targetIndices(total, 4 + level, random);
  const cellW = 620 / cols;
  const cellH = 650 / rows;
  let body = `<rect x="286" y="205" width="222" height="62" rx="18" fill="#FFF7ED" stroke="#FDBA74"/><text x="480" y="231" text-anchor="end" font-family="Tahoma,Arial,sans-serif" font-size="15" font-weight="700" fill="#9A3412" direction="rtl">الهدف:</text><polygon points="${starPoints(325, 238, 23)}" fill="#FACC15" stroke="#92400E" stroke-width="2"/>`;
  for (let i = 0; i < total; i += 1) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = 87 + col * cellW + cellW / 2;
    const y = 305 + row * cellH + cellH / 2;
    if (targets.has(i)) body += `<polygon points="${starPoints(x, y, Math.min(23, cellW * 0.28))}" fill="#FACC15" stroke="#92400E" stroke-width="2"/>`;
    else {
      const color = level >= 3 && random() > 0.55 ? '#FACC15' : pick(COLORS, random);
      const shape = level >= 4 ? pick(['diamond', 'heart', 'circle'] as const, random) : pick(['heart', 'circle', 'square'] as const, random);
      body += shapeSvg(shape, x, y, Math.min(42, cellW * 0.52), color);
    }
  }
  return body;
}

function renderVisualScan(activity: AttentionActivity) {
  const random = rng(activity.seed);
  const level = activity.level;
  const rows = 5 + level;
  const cols = 7 + level;
  const rowH = 640 / rows;
  const cellW = 560 / cols;
  let body = `<rect x="80" y="214" width="634" height="48" rx="14" fill="#F0FDFA"/><text x="397" y="245" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="15" font-weight="700" fill="#115E59" direction="rtl">ابدأ من السهم ← أكمل الصف كاملًا ← ثم انزل للصف التالي</text>`;
  for (let row = 0; row < rows; row += 1) {
    const y = 310 + row * rowH;
    body += `<rect x="80" y="${y - rowH * 0.38}" width="634" height="${rowH * 0.78}" rx="12" fill="${row % 2 === 0 ? '#F8FAFC' : '#FFFFFF'}" stroke="#E2E8F0"/><path d="M 690 ${y} L 660 ${y} M 668 ${y - 9} L 658 ${y} L 668 ${y + 9}" fill="none" stroke="#2563EB" stroke-width="3" stroke-linecap="round"/>`;
    const targets = targetIndices(cols, level >= 4 ? 2 : 1, random);
    for (let col = 0; col < cols; col += 1) {
      const x = 120 + col * cellW + cellW / 2;
      if (targets.has(col)) body += shapeSvg('diamond', x, y, Math.min(34, cellW * 0.5), '#2563EB');
      else body += shapeSvg(pick(SHAPES.filter((s) => s !== 'diamond'), random), x, y, Math.min(32, cellW * 0.48), pick(COLORS, random));
    }
  }
  return body;
}

function renderHidden(activity: AttentionActivity) {
  const random = rng(activity.seed);
  const level = activity.level;
  const catCount = 3 + level;
  const catSize = 44 - level * 3;
  let body = `<rect x="65" y="215" width="664" height="720" rx="28" fill="#EFF6FF"/><circle cx="640" cy="285" r="44" fill="#FDE68A"/><path d="M65 700 Q180 630 290 700 T520 690 T729 705 L729 935 L65 935 Z" fill="#BBF7D0"/><path d="M65 790 Q180 725 300 790 T530 775 T729 795 L729 935 L65 935 Z" fill="#86EFAC"/>`;
  for (let i = 0; i < 5 + level; i += 1) {
    const x = 110 + random() * 570;
    const h = 70 + random() * 110;
    body += `<rect x="${x - 8}" y="${690 - h}" width="16" height="${h}" rx="8" fill="#A16207"/><circle cx="${x}" cy="${680 - h}" r="${34 + random() * 18}" fill="#4ADE80"/><circle cx="${x - 25}" cy="${695 - h}" r="${25 + random() * 12}" fill="#22C55E"/>`;
  }
  const positions: Array<[number, number]> = [];
  while (positions.length < catCount) {
    const candidate: [number, number] = [105 + random() * 580, 330 + random() * 520];
    if (positions.every(([x, y]) => Math.hypot(x - candidate[0], y - candidate[1]) > 80)) positions.push(candidate);
  }
  positions.forEach(([x, y], i) => {
    body += catSvg(x, y, catSize, pick(['#F59E0B', '#FB7185', '#60A5FA'], random));
    if (level >= 3 && i % 2 === 0) body += `<circle cx="${x + catSize * 0.32}" cy="${y + catSize * 0.2}" r="${catSize * 0.33}" fill="#4ADE80" opacity="0.92"/>`;
  });
  for (let i = 0; i < 20 + level * 4; i += 1) {
    const x = 90 + random() * 610;
    const y = 300 + random() * 590;
    body += flowerSvg(x, y, 11 + random() * 7, pick(['#FDE047', '#FB7185', '#93C5FD'], random));
  }
  return body;
}

function renderRuleSwitch(activity: AttentionActivity) {
  const random = rng(activity.seed);
  const level = activity.level;
  const bands = 2 + Math.floor((level + 1) / 2);
  const bandH = 660 / bands;
  let body = '';
  const rules = [
    { label: 'ضع دائرة حول الأزرق', type: 'blue' },
    { label: 'ضع دائرة حول الدوائر', type: 'circle' },
    { label: 'ضع دائرة حول البرتقالي', type: 'orange' },
    { label: 'ضع دائرة حول المثلثات', type: 'triangle' },
  ] as const;
  for (let band = 0; band < bands; band += 1) {
    const rule = rules[(band + activity.variant + level) % rules.length]!;
    const yTop = 265 + band * bandH;
    body += `<rect x="72" y="${yTop}" width="650" height="${bandH - 12}" rx="18" fill="${band % 2 === 0 ? '#F8FAFC' : '#FFFBEB'}" stroke="#E2E8F0"/><rect x="492" y="${yTop + 12}" width="205" height="34" rx="17" fill="#E0F2FE"/><text x="594" y="${yTop + 35}" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="13" font-weight="700" fill="#0C4A6E" direction="rtl">${rule.label}</text>`;
    const cols = 7 + level;
    for (let col = 0; col < cols; col += 1) {
      const x = 110 + col * (570 / cols) + 25;
      const y = yTop + bandH * 0.62;
      let shape: Shape = pick(SHAPES, random);
      let color = pick(COLORS, random);
      if (col % 4 === 0) {
        if (rule.type === 'blue') color = '#2563EB';
        if (rule.type === 'orange') color = '#F97316';
        if (rule.type === 'circle') shape = 'circle';
        if (rule.type === 'triangle') shape = 'triangle';
      }
      body += shapeSvg(shape, x, y, 34, color);
    }
  }
  return body;
}

function renderSpeed(activity: AttentionActivity) {
  const random = rng(activity.seed);
  const level = activity.level;
  const cols = 8 + level;
  const rows = 7 + level;
  const total = cols * rows;
  const targets = targetIndices(total, 6 + level * 2, random);
  const cellW = 620 / cols;
  const cellH = 600 / rows;
  const time = Math.max(45, 90 - level * 10);
  let body = `<rect x="84" y="210" width="626" height="60" rx="18" fill="#FEF3C7"/><text x="660" y="246" text-anchor="end" font-family="Tahoma,Arial,sans-serif" font-size="15" font-weight="700" fill="#92400E" direction="rtl">الهدف: المثلث الأزرق</text><text x="128" y="246" text-anchor="start" font-family="Tahoma,Arial,sans-serif" font-size="17" font-weight="800" fill="#B45309" direction="rtl">${time} ثانية</text>${shapeSvg('triangle', 385, 240, 34, '#2563EB')}`;
  for (let i = 0; i < total; i += 1) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = 87 + col * cellW + cellW / 2;
    const y = 315 + row * cellH + cellH / 2;
    if (targets.has(i)) body += shapeSvg('triangle', x, y, Math.min(30, cellW * 0.46), '#2563EB');
    else {
      const shape = level >= 3 && random() > 0.62 ? 'triangle' : pick(SHAPES, random);
      const color = shape === 'triangle' && level >= 3 ? pick(['#0891B2', '#7C3AED', '#16A34A'], random) : pick(COLORS, random);
      body += shapeSvg(shape, x, y, Math.min(28, cellW * 0.44), color);
    }
  }
  body += `<rect x="220" y="935" width="354" height="48" rx="16" fill="#F8FAFC" stroke="#CBD5E1"/><text x="397" y="965" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="14" font-weight="700" fill="#334155" direction="rtl">الصحيح: ..........   الأخطاء: ..........</text>`;
  return body;
}

function renderDual(activity: AttentionActivity) {
  const random = rng(activity.seed);
  const level = activity.level;
  const phase = random() * Math.PI;
  const amplitude = 170;
  const points: Array<[number, number]> = [];
  for (let y = 290; y <= 885; y += 35) points.push([397 + Math.sin((y - 270) / (64 - level * 3) + phase) * amplitude, y]);
  const d = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y}`).join(' ');
  let body = `<path d="${d}" fill="none" stroke="#CBD5E1" stroke-width="25" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#334155" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/><circle cx="${points[0]![0]}" cy="${points[0]![1]}" r="18" fill="#86EFAC" stroke="#16A34A" stroke-width="3"/><circle cx="${points[points.length - 1]![0]}" cy="${points[points.length - 1]![1]}" r="18" fill="#BFDBFE" stroke="#2563EB" stroke-width="3"/>`;
  const starCount = 4 + level;
  const targetSet = targetIndices(points.length - 2, starCount, random);
  points.slice(1, -1).forEach(([x, y], i) => {
    if (targetSet.has(i)) body += `<polygon points="${starPoints(x, y, 15)}" fill="#FACC15" stroke="#92400E" stroke-width="1.7"/>`;
    else if (level >= 3 && random() > 0.62) body += `<circle cx="${x + (random() - 0.5) * 55}" cy="${y}" r="10" fill="#F472B6" stroke="#9D174D"/>`;
  });
  body += `<rect x="248" y="920" width="298" height="60" rx="18" fill="#EFF6FF" stroke="#93C5FD"/><text x="397" y="956" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="16" font-weight="700" fill="#1E3A8A" direction="rtl">عدد النجوم على الطريق: ..........</text>`;
  return body;
}

function renderBody(activity: AttentionActivity) {
  if (activity.taskType === 'selective-search') return renderSelective(activity);
  if (activity.taskType === 'sustained-trail') return renderSustained(activity);
  if (activity.taskType === 'distractor-grid') return renderDistractor(activity);
  if (activity.taskType === 'visual-scan') return renderVisualScan(activity);
  if (activity.taskType === 'hidden-targets') return renderHidden(activity);
  if (activity.taskType === 'rule-switching') return renderRuleSwitch(activity);
  if (activity.taskType === 'processing-speed') return renderSpeed(activity);
  return renderDual(activity);
}

export function renderAttentionWorksheet(activity: AttentionActivity) {
  const series = getAttentionSeries(activity.seriesSlug);
  const target = series?.target ?? 'الهدف';
  const helper = activity.kind === 'test' ? '' : `<rect x="72" y="962" width="650" height="34" rx="12" fill="#F0FDF4"/><text x="397" y="985" text-anchor="middle" font-family="Tahoma,Arial,sans-serif" font-size="13" fill="#166534" direction="rtl">تذكّر: المطلوب هو ${esc(target)} - اعمل بهدوء ثم تحقق من إجابتك.</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc"><title id="title">${esc(activity.seriesTitle)} - ${esc(activity.label)}</title><desc id="desc">ورقة نشاط عربية قابلة للطباعة للأطفال.</desc>${commonHeader(activity)}${renderBody(activity)}${footer(activity, helper)}`;
}
