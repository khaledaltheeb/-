import type { MemoryActivity } from './memory-lab';

type Token = { name: string; shape: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'flower' | 'fish' | 'house' | 'sun' | 'kite' | 'balloon' | 'leaf'; color: string; accent: string };

const TOKENS: Token[] = [
  { name: 'كرة', shape: 'circle', color: '#38BDF8', accent: '#075985' },
  { name: 'مربع', shape: 'square', color: '#A78BFA', accent: '#5B21B6' },
  { name: 'مثلث', shape: 'triangle', color: '#FBBF24', accent: '#92400E' },
  { name: 'نجمة', shape: 'star', color: '#FACC15', accent: '#854D0E' },
  { name: 'قلب', shape: 'heart', color: '#FB7185', accent: '#9F1239' },
  { name: 'زهرة', shape: 'flower', color: '#F472B6', accent: '#9D174D' },
  { name: 'سمكة', shape: 'fish', color: '#22D3EE', accent: '#155E75' },
  { name: 'بيت', shape: 'house', color: '#FB923C', accent: '#9A3412' },
  { name: 'شمس', shape: 'sun', color: '#FDE047', accent: '#A16207' },
  { name: 'طائرة', shape: 'kite', color: '#34D399', accent: '#065F46' },
  { name: 'بالون', shape: 'balloon', color: '#60A5FA', accent: '#1E40AF' },
  { name: 'ورقة', shape: 'leaf', color: '#86EFAC', accent: '#166534' },
];

function esc(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] ?? char));
}

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffled<T>(values: readonly T[], seed: number) {
  const copy = [...values];
  const random = seeded(seed);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

function starPoints(cx: number, cy: number, outer: number, inner: number) {
  const points: string[] = [];
  for (let index = 0; index < 10; index += 1) {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + index * Math.PI / 5;
    points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
  }
  return points.join(' ');
}

function tokenSvg(token: Token, cx: number, cy: number, size = 58, label = true) {
  const r = size / 2;
  let icon = '';
  switch (token.shape) {
    case 'circle':
      icon = `<circle cx="${cx}" cy="${cy}" r="${r * 0.68}" fill="${token.color}" stroke="${token.accent}" stroke-width="4"/>`;
      break;
    case 'square':
      icon = `<rect x="${cx - r * 0.65}" y="${cy - r * 0.65}" width="${r * 1.3}" height="${r * 1.3}" rx="9" fill="${token.color}" stroke="${token.accent}" stroke-width="4"/>`;
      break;
    case 'triangle':
      icon = `<polygon points="${cx},${cy-r*0.78} ${cx-r*0.78},${cy+r*0.67} ${cx+r*0.78},${cy+r*0.67}" fill="${token.color}" stroke="${token.accent}" stroke-width="4" stroke-linejoin="round"/>`;
      break;
    case 'star':
      icon = `<polygon points="${starPoints(cx, cy, r * 0.85, r * 0.38)}" fill="${token.color}" stroke="${token.accent}" stroke-width="4" stroke-linejoin="round"/>`;
      break;
    case 'heart':
      icon = `<path d="M ${cx} ${cy+r*0.68} C ${cx-r*0.9} ${cy+r*0.05}, ${cx-r*0.75} ${cy-r*0.72}, ${cx-r*0.18} ${cy-r*0.62} C ${cx} ${cy-r*0.6}, ${cx} ${cy-r*0.38}, ${cx} ${cy-r*0.2} C ${cx} ${cy-r*0.38}, ${cx} ${cy-r*0.6}, ${cx+r*0.18} ${cy-r*0.62} C ${cx+r*0.75} ${cy-r*0.72}, ${cx+r*0.9} ${cy+r*0.05}, ${cx} ${cy+r*0.68} Z" fill="${token.color}" stroke="${token.accent}" stroke-width="4"/>`;
      break;
    case 'flower':
      icon = Array.from({ length: 6 }, (_, i) => {
        const angle = i * Math.PI / 3;
        return `<circle cx="${cx + Math.cos(angle) * r * 0.48}" cy="${cy + Math.sin(angle) * r * 0.48}" r="${r * 0.34}" fill="${token.color}" stroke="${token.accent}" stroke-width="2.5"/>`;
      }).join('') + `<circle cx="${cx}" cy="${cy}" r="${r * 0.3}" fill="#FDE68A" stroke="${token.accent}" stroke-width="2"/>`;
      break;
    case 'fish':
      icon = `<ellipse cx="${cx}" cy="${cy}" rx="${r*0.72}" ry="${r*0.48}" fill="${token.color}" stroke="${token.accent}" stroke-width="4"/><polygon points="${cx-r*0.7},${cy} ${cx-r*1.15},${cy-r*0.48} ${cx-r*1.15},${cy+r*0.48}" fill="${token.color}" stroke="${token.accent}" stroke-width="4"/><circle cx="${cx+r*0.33}" cy="${cy-r*0.12}" r="3.5" fill="${token.accent}"/>`;
      break;
    case 'house':
      icon = `<rect x="${cx-r*0.58}" y="${cy-r*0.05}" width="${r*1.16}" height="${r*0.85}" rx="4" fill="#FDBA74" stroke="${token.accent}" stroke-width="4"/><polygon points="${cx-r*0.72},${cy-r*0.05} ${cx},${cy-r*0.75} ${cx+r*0.72},${cy-r*0.05}" fill="${token.color}" stroke="${token.accent}" stroke-width="4"/><rect x="${cx-r*0.14}" y="${cy+r*0.28}" width="${r*0.28}" height="${r*0.47}" fill="#FFF7ED" stroke="${token.accent}" stroke-width="2"/>`;
      break;
    case 'sun':
      icon = Array.from({ length: 8 }, (_, i) => {
        const angle = i * Math.PI / 4;
        const x1 = cx + Math.cos(angle) * r * 0.7;
        const y1 = cy + Math.sin(angle) * r * 0.7;
        const x2 = cx + Math.cos(angle) * r * 1.0;
        const y2 = cy + Math.sin(angle) * r * 1.0;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${token.accent}" stroke-width="4" stroke-linecap="round"/>`;
      }).join('') + `<circle cx="${cx}" cy="${cy}" r="${r*0.57}" fill="${token.color}" stroke="${token.accent}" stroke-width="3"/>`;
      break;
    case 'kite':
      icon = `<polygon points="${cx},${cy-r*0.85} ${cx+r*0.62},${cy} ${cx},${cy+r*0.72} ${cx-r*0.62},${cy}" fill="${token.color}" stroke="${token.accent}" stroke-width="4"/><path d="M ${cx} ${cy+r*0.72} Q ${cx+r*0.3} ${cy+r*1.0} ${cx-r*0.1} ${cy+r*1.22}" fill="none" stroke="${token.accent}" stroke-width="3"/>`;
      break;
    case 'balloon':
      icon = `<ellipse cx="${cx}" cy="${cy-r*0.1}" rx="${r*0.57}" ry="${r*0.7}" fill="${token.color}" stroke="${token.accent}" stroke-width="4"/><path d="M ${cx} ${cy+r*0.6} Q ${cx+r*0.2} ${cy+r*0.95} ${cx-r*0.08} ${cy+r*1.25}" fill="none" stroke="${token.accent}" stroke-width="3"/>`;
      break;
    case 'leaf':
      icon = `<path d="M ${cx-r*0.65} ${cy+r*0.52} Q ${cx-r*0.8} ${cy-r*0.55} ${cx+r*0.68} ${cy-r*0.62} Q ${cx+r*0.55} ${cy+r*0.62} ${cx-r*0.65} ${cy+r*0.52} Z" fill="${token.color}" stroke="${token.accent}" stroke-width="4"/><path d="M ${cx-r*0.52} ${cy+r*0.42} L ${cx+r*0.46} ${cy-r*0.42}" stroke="${token.accent}" stroke-width="3"/>`;
      break;
  }
  return `<g>${icon}${label ? `<text x="${cx}" y="${cy+r+24}" text-anchor="middle" font-size="15" font-weight="700" fill="#475569">${esc(token.name)}</text>` : ''}</g>`;
}

function decorativeCorners() {
  return `<g opacity=".9"><polygon points="${starPoints(60, 80, 18, 8)}" fill="#F9A8D4"/><polygon points="${starPoints(730, 105, 16, 7)}" fill="#FDE68A"/><circle cx="70" cy="1035" r="9" fill="#A7F3D0"/><circle cx="720" cy="1010" r="11" fill="#BFDBFE"/></g>`;
}

function header(activity: MemoryActivity, subtitle: string) {
  return `<rect width="794" height="1123" rx="24" fill="#FFFDFC"/>
  <rect x="18" y="18" width="758" height="1087" rx="25" fill="none" stroke="#64748B" stroke-width="2"/>
  ${decorativeCorners()}
  <rect x="105" y="42" width="584" height="74" rx="35" fill="#FCE7F3" stroke="#F9A8D4" stroke-width="2"/>
  <text x="397" y="88" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="30" font-weight="900" fill="#831843">${esc(activity.seriesTitle)}</text>
  <rect x="245" y="128" width="304" height="38" rx="19" fill="#FDF2F8" stroke="#FBCFE8"/>
  <text x="397" y="153" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="18" font-weight="800" fill="#9D174D">المستوى ${activity.level} - ${esc(activity.label)}</text>
  <text x="397" y="194" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="16" fill="#334155">${esc(subtitle)}</text>`;
}

function wrapWords(text: string, maxChars = 64) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

function instructionBanner(text: string, y = 208) {
  const lines = wrapWords(text);
  const textSvg = lines.map((line, index) => `<text x="397" y="${y + (lines.length === 1 ? 37 : 27 + index * 22)}" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="${lines.length === 1 ? 15 : 13.5}" font-weight="700" fill="#1E3A8A">${esc(line)}</text>`).join('');
  return `<rect x="62" y="${y}" width="670" height="64" rx="20" fill="#EFF6FF" stroke="#93C5FD" stroke-width="2"/>${textSvg}`;
}

function strategyTip(activity: MemoryActivity, y: number) {
  if (activity.kind === 'test') return '';
  const tip = activity.level <= 2 ? 'فكرة تدريب: سمِّ العناصر أو المواقع بصمت قبل تغطيتها.' : 'فكرة تدريب: قسّم المعلومات إلى مجموعات صغيرة بدل حفظها دفعة واحدة.';
  return `<rect x="105" y="${y}" width="584" height="42" rx="18" fill="#ECFDF5" stroke="#A7F3D0"/>
    <text x="397" y="${y + 27}" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="14" font-weight="700" fill="#166534">${esc(tip)}</text>`;
}

function footer(activity: MemoryActivity) {
  const testNote = activity.kind === 'test' ? 'نتيجة هذا الاختبار لمتابعة إتقان السلسلة وليست درجة معيارية أو تشخيصًا.' : 'سجّل الاستراتيجية والتلميحات، وليس عدد الإجابات الصحيحة فقط.';
  return `<rect x="42" y="1000" width="710" height="78" rx="18" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
  <text x="725" y="1027" text-anchor="end" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="13" font-weight="700" fill="#334155">الاسم: ............................</text>
  <text x="495" y="1027" text-anchor="end" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="13" font-weight="700" fill="#334155">التاريخ: ...............</text>
  <text x="300" y="1027" text-anchor="end" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="13" font-weight="700" fill="#334155">صحيح: .... / ${activity.itemCount}</text>
  <text x="135" y="1027" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="13" font-weight="700" fill="#334155">التلميحات: ....</text>
  <text x="397" y="1059" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="11.5" fill="#64748B">${esc(testNote)}</text>`;
}

function foldPanel(title: string, subtitle: string, content: string, y = 286, height = 190) {
  return `<rect x="70" y="${y}" width="654" height="${height}" rx="20" fill="#FFF7ED" stroke="#FDBA74" stroke-width="2" stroke-dasharray="8 6"/>
    <text x="397" y="${y + 28}" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="15" font-weight="900" fill="#9A3412">${esc(title)}</text>
    <text x="397" y="${y + 50}" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="12.5" fill="#7C2D12">${esc(subtitle)}</text>
    ${content}
    <line x1="84" y1="${y + height - 18}" x2="710" y2="${y + height - 18}" stroke="#FB923C" stroke-width="2" stroke-dasharray="6 6"/>
    <text x="397" y="${y + height - 3}" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="11" fill="#9A3412">خط الطي أو التغطية قبل الاستجابة</text>`;
}

function choiceCard(token: Token, x: number, y: number, width = 116, height = 112, indexLabel?: number) {
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
    ${indexLabel ? `<circle cx="${x+20}" cy="${y+20}" r="13" fill="#FDF2F8" stroke="#F9A8D4"/><text x="${x+20}" y="${y+25}" text-anchor="middle" font-size="12" font-weight="900" fill="#9D174D">${indexLabel}</text>` : ''}
    ${tokenSvg(token, x + width / 2, y + 47, 48, true)}
    <circle cx="${x + width - 17}" cy="${y + height - 17}" r="9" fill="#fff" stroke="#94A3B8" stroke-width="2"/>
  </g>`;
}

function renderVisualWorking(activity: MemoryActivity) {
  const pool = shuffled(TOKENS, activity.seed);
  const targets = pool.slice(0, activity.itemCount);
  const distractorCount = Math.min(5, TOKENS.length - activity.itemCount);
  const options = shuffled([...targets, ...pool.slice(activity.itemCount, activity.itemCount + distractorCount)], activity.seed + 44);
  const studyWidth = Math.min(80, 520 / targets.length);
  const startX = 397 - (studyWidth * targets.length) / 2;
  const study = targets.map((token, index) => tokenSvg(token, startX + studyWidth * index + studyWidth / 2, 375, 45, false)).join('');
  const cols = options.length <= 8 ? 4 : 5;
  const cardWidth = cols === 4 ? 132 : 104;
  const gap = 12;
  const gridWidth = cols * cardWidth + (cols - 1) * gap;
  const gridX = (794 - gridWidth) / 2;
  const choices = options.map((token, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return choiceCard(token, gridX + col * (cardWidth + gap), 570 + row * 130, cardWidth, 116);
  }).join('');
  return `${header(activity, 'احتفظ بالصور في ذهنك ثم استخدمها بعد اختفاء النموذج.')}
    ${instructionBanner(activity.instruction)}
    ${foldPanel(`شاهد لمدة ${activity.encodingSeconds} ثوانٍ`, 'بعد انتهاء الوقت غطِّ هذه المنطقة بالكامل.', study, 286, 180)}
    ${strategyTip(activity, 485)}
    <text x="397" y="550" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="18" font-weight="900" fill="#831843">ضع دائرة حول العناصر التي كانت في لوحة الذاكرة</text>
    ${choices}${footer(activity)}`;
}

function renderSpatial(activity: MemoryActivity) {
  const size = activity.level === 1 ? 2 : activity.level <= 3 ? 3 : 4;
  const cells = size * size;
  const indices = shuffled(Array.from({ length: cells }, (_, i) => i), activity.seed).slice(0, Math.min(activity.itemCount, cells));
  const gridSide = size === 2 ? 230 : size === 3 ? 270 : 300;
  const cell = gridSide / size;
  const gridX = (794 - gridSide) / 2;
  function grid(y: number, showTargets: boolean) {
    let svg = `<rect x="${gridX}" y="${y}" width="${gridSide}" height="${gridSide}" rx="12" fill="#fff" stroke="#94A3B8" stroke-width="2"/>`;
    for (let i = 1; i < size; i += 1) {
      svg += `<line x1="${gridX+i*cell}" y1="${y}" x2="${gridX+i*cell}" y2="${y+gridSide}" stroke="#CBD5E1" stroke-width="2"/>`;
      svg += `<line x1="${gridX}" y1="${y+i*cell}" x2="${gridX+gridSide}" y2="${y+i*cell}" stroke="#CBD5E1" stroke-width="2"/>`;
    }
    if (showTargets) {
      indices.forEach((index, order) => {
        const col = index % size;
        const row = Math.floor(index / size);
        const cx = gridX + col * cell + cell / 2;
        const cy = y + row * cell + cell / 2;
        svg += `<circle cx="${cx}" cy="${cy}" r="${Math.min(24, cell*0.25)}" fill="${TOKENS[(activity.seed + order) % TOKENS.length].color}" stroke="#334155" stroke-width="3"/>`;
      });
    }
    return svg;
  }
  const studyGrid = grid(310, true);
  const study = foldPanel(`شاهد المواقع لمدة ${activity.encodingSeconds} ثوانٍ`, 'تذكر الصف والعمود أو الزاوية التي يوجد فيها كل لون.', studyGrid, 278, (activity.level === 1 ? 290 : activity.level <= 3 ? 335 : 360));
  const recallY = activity.level === 1 ? 650 : activity.level <= 3 ? 680 : 660;
  return `${header(activity, 'تذكّر أين ظهرت العلامات ثم أعدها في شبكة فارغة.')}${instructionBanner(activity.instruction)}${study}
    <text x="397" y="${recallY - 22}" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="18" font-weight="900" fill="#831843">ضع علامة في المواقع نفسها</text>
    ${grid(recallY, false)}${footer(activity)}`;
}

function renderVisualSequence(activity: MemoryActivity) {
  const sequence = shuffled(TOKENS, activity.seed).slice(0, activity.itemCount);
  const choices = shuffled(sequence, activity.seed + 77);
  const slot = Math.min(86, 560 / sequence.length);
  const start = 397 - (slot * sequence.length) / 2;
  const study = sequence.map((token, index) => `<g>${tokenSvg(token, start + slot * index + slot/2, 374, 42, false)}<text x="${start + slot * index + slot/2}" y="428" text-anchor="middle" font-size="12" font-weight="800" fill="#64748B">${index+1}</text></g>`).join('');
  const answerSlot = Math.min(105, 620 / choices.length);
  const answerStart = 397 - (answerSlot * choices.length) / 2;
  const answers = choices.map((token, index) => `<g>${tokenSvg(token, answerStart + answerSlot*index + answerSlot/2, 680, 49, true)}<rect x="${answerStart + answerSlot*index + answerSlot/2 - 18}" y="750" width="36" height="32" rx="8" fill="#fff" stroke="#94A3B8" stroke-width="2"/><text x="${answerStart + answerSlot*index + answerSlot/2}" y="772" text-anchor="middle" font-size="13" fill="#94A3B8">#</text></g>`).join('');
  return `${header(activity, 'تذكر ترتيب الصور، وليس فقط أي صور ظهرت.')}${instructionBanner(activity.instruction)}
    ${foldPanel(`شاهد التسلسل لمدة ${activity.encodingSeconds} ثوانٍ`, 'ابدأ من الرقم 1 واتبع الترتيب المعروض.', study, 286, 185)}
    ${strategyTip(activity, 490)}
    <text x="397" y="620" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="18" font-weight="900" fill="#831843">اكتب رقم ترتيب كل صورة كما ظهرت</text>${answers}${footer(activity)}`;
}

function auditoryWords(activity: MemoryActivity) {
  return shuffled(TOKENS, activity.seed).slice(0, activity.itemCount);
}

function renderAuditory(activity: MemoryActivity) {
  const sequence = auditoryWords(activity);
  const distractors = shuffled(TOKENS.filter((token) => !sequence.includes(token)), activity.seed + 11).slice(0, 4);
  const choices = shuffled([...sequence, ...distractors], activity.seed + 54);
  const words = sequence.map((token, index) => `<text x="397" y="${334 + index * 25}" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="16" font-weight="800" fill="#7C2D12">${index+1}. ${esc(token.name)}</text>`).join('');
  const prompt = foldPanel('للمرافق فقط - اقرأ مرة واحدة', activity.reverseRecall ? 'اقرأ من 1 إلى النهاية، ثم اطلب من الطفل الإجابة بالعكس.' : 'لا تدع الطفل يرى القائمة أثناء الاستجابة.', words, 278, 220);
  const cols = choices.length > 8 ? 5 : 4;
  const cardWidth = cols === 5 ? 110 : 138;
  const gap = 12;
  const gridX = (794 - (cols*cardWidth + (cols-1)*gap))/2;
  const cards = choices.map((token, index) => {
    const col = index % cols;
    const row = Math.floor(index/cols);
    const x = gridX + col*(cardWidth+gap);
    const y = 580 + row*142;
    const rankX = x + cardWidth/2 - 24;
    return `<g>${choiceCard(token, x, y, cardWidth, 116)}<rect x="${rankX}" y="${y+119}" width="48" height="28" rx="8" fill="#fff" stroke="#94A3B8"/><text x="${rankX+24}" y="${y+139}" text-anchor="middle" font-size="11.5" fill="#94A3B8">الرتبة</text></g>`;
  }).join('');
  return `${header(activity, 'استمع، احتفظ بالتسلسل، ثم حوّله إلى استجابة بصرية.')}${instructionBanner(activity.instruction)}${prompt}
    <text x="397" y="560" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="18" font-weight="900" fill="#831843">رقّم الصور بحسب ما سمعته${activity.reverseRecall ? ' - بالعكس' : ''}</text>${cards}${footer(activity)}`;
}

function renderAssociative(activity: MemoryActivity) {
  const pool = shuffled(TOKENS, activity.seed);
  const pairCount = activity.itemCount;
  const left = pool.slice(0, pairCount);
  const right = pool.slice(pairCount, pairCount*2);
  const studyCols = pairCount <= 3 ? pairCount : 3;
  const pairWidth = studyCols === 3 ? 190 : 220;
  const studyX = (794 - (studyCols*pairWidth + (studyCols-1)*12))/2;
  const study = left.map((token, index) => {
    const col = index % studyCols;
    const row = Math.floor(index/studyCols);
    const x = studyX + col*(pairWidth+12);
    const y = 330 + row*92;
    return `<g><rect x="${x}" y="${y}" width="${pairWidth}" height="80" rx="14" fill="#fff" stroke="#F9A8D4"/><text x="${x+pairWidth/2}" y="${y+48}" text-anchor="middle" font-size="22" fill="#64748B">↔</text>${tokenSvg(token, x+pairWidth-45, y+36, 38, false)}${tokenSvg(right[index], x+45, y+36, 38, false)}</g>`;
  }).join('');
  const studyHeight = pairCount <= 3 ? 190 : 285;
  const shuffledRight = shuffled(right, activity.seed + 101);
  const recallTop = pairCount <= 3 ? 590 : 680;
  const rowGap = Math.min(72, 350/pairCount);
  const recall = left.map((token,index) => {
    const y = recallTop + index*rowGap;
    return `${tokenSvg(token, 610, y, 40, false)}<line x1="560" y1="${y}" x2="235" y2="${y}" stroke="#E2E8F0" stroke-width="2" stroke-dasharray="5 5"/>${tokenSvg(shuffledRight[index], 185, y, 40, false)}`;
  }).join('');
  return `${header(activity, 'كوّن روابط بين الأزواج ثم استدعِ الشريك الصحيح.')}${instructionBanner(activity.instruction)}
    ${foldPanel(`شاهد ${pairCount} أزواج`, 'بعد التغطية لن تبقى الأزواج في الترتيب نفسه.', study, 280, studyHeight)}
    <text x="397" y="${recallTop - 40}" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="18" font-weight="900" fill="#831843">صِل كل عنصر بشريكه الذي تعلمته</text>${recall}${footer(activity)}`;
}

const WORK_TOKENS = TOKENS.slice(0, 8);
const ACTIONS = ['ضع دائرة حول', 'اشطب', 'ضع نقطة تحت', 'ارسم مربعًا حول', 'لوّن بخفة', 'ضع علامة × داخل'];

function instructionSteps(activity: MemoryActivity) {
  const tokens = shuffled(WORK_TOKENS, activity.seed + 12).slice(0, activity.itemCount);
  const actions = shuffled(ACTIONS, activity.seed + 29);
  const steps = tokens.map((token,index) => `${actions[index % actions.length]} ${token.name}`);
  if (activity.level === 4 && steps.length >= 4) steps[3] = `بعد تنفيذ الخطوة الأولى، ${steps[3]}`;
  if (activity.level === 5 && steps.length >= 5) steps[4] = `إذا انتهيت من الخطوة الثالثة، ${steps[4]}`;
  return steps;
}

function renderInstruction(activity: MemoryActivity) {
  const steps = instructionSteps(activity);
  const stepText = steps.map((step,index) => `<text x="397" y="${326+index*24}" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="14.5" font-weight="800" fill="#7C2D12">${index+1}. ${esc(step)}</text>`).join('');
  const prompt = foldPanel('للمرافق فقط - اقرأ جميع التعليمات مرة واحدة', 'بعد القراءة اطوِ أو غطِّ هذه البطاقة قبل أن يبدأ الطفل.', stepText, 278, 235);
  const work = WORK_TOKENS.map((token,index) => {
    const col = index % 4;
    const row = Math.floor(index/4);
    const x = 120 + col*180;
    const y = 635 + row*180;
    return `<g><rect x="${x-60}" y="${y-68}" width="120" height="142" rx="18" fill="#fff" stroke="#CBD5E1" stroke-width="2"/>${tokenSvg(token,x,y-10,58,true)}</g>`;
  }).join('');
  return `${header(activity, 'اسمع سلسلة تعليمات ثم نفذها على مساحة العمل دون إعادة القراءة.')}${instructionBanner(activity.instruction)}${prompt}
    <text x="397" y="570" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="18" font-weight="900" fill="#831843">مساحة التنفيذ</text>${work}${footer(activity)}`;
}

function renderDelayed(activity: MemoryActivity) {
  const pool = shuffled(TOKENS, activity.seed);
  const targets = pool.slice(0, activity.itemCount);
  const distractors = pool.slice(activity.itemCount, Math.min(TOKENS.length, activity.itemCount + 4));
  const targetSlot = Math.min(76, 520/targets.length);
  const targetStart = 397 - targetSlot*targets.length/2;
  const study = targets.map((token,index) => tokenSvg(token,targetStart+targetSlot*index+targetSlot/2,365,42,false)).join('');
  const random = seeded(activity.seed+401);
  const interferenceCount = 10 + activity.level*3;
  const interference = Array.from({length:interferenceCount},(_,index) => {
    const cols = 8;
    const col = index%cols;
    const row = Math.floor(index/cols);
    const x = 125 + col*77;
    const y = 545 + row*45;
    const blue = random() < .33;
    return `<circle cx="${x}" cy="${y}" r="16" fill="${blue ? '#60A5FA' : random() < .5 ? '#F9A8D4' : '#FDE68A'}" stroke="#64748B" stroke-width="2"/>`;
  }).join('');
  const choices = shuffled([...targets,...distractors],activity.seed+202);
  const cols = choices.length > 10 ? 6 : choices.length > 8 ? 5 : 4;
  const cardW = cols === 6 ? 90 : cols === 5 ? 104 : 132;
  const gap=8;
  const gridX=(794-(cols*cardW+(cols-1)*gap))/2;
  const choiceY = 755;
  const cardH = cols === 6 ? 96 : 105;
  const rowStep = cols === 6 ? 108 : 118;
  const cards = choices.map((token,index) => choiceCard(token,gridX+(index%cols)*(cardW+gap),choiceY+Math.floor(index/cols)*rowStep,cardW,cardH)).join('');
  return `${header(activity, 'تذكر المعلومات بعد أن تنشغل بمهمة أخرى قصيرة.')}${instructionBanner(activity.instruction)}
    ${foldPanel(`شاهد لمدة ${activity.encodingSeconds} ثوانٍ`, 'بعد التغطية انتقل مباشرة إلى المهمة الفاصلة.', study, 282, 175)}
    <text x="397" y="520" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="16" font-weight="900" fill="#1E3A8A">المهمة الفاصلة: اشطب كل دائرة زرقاء فقط</text>${interference}
    <text x="397" y="725" text-anchor="middle" direction="rtl" font-family="Tahoma,Arial,sans-serif" font-size="18" font-weight="900" fill="#831843">الآن: ضع دائرة حول العناصر التي تتذكرها من البداية</text>${cards}${footer(activity)}`;
}

export function renderMemoryWorksheet(activity: MemoryActivity) {
  let body = '';
  switch (activity.taskType) {
    case 'visual-working': body = renderVisualWorking(activity); break;
    case 'spatial-memory': body = renderSpatial(activity); break;
    case 'visual-sequence': body = renderVisualSequence(activity); break;
    case 'auditory-working': body = renderAuditory(activity); break;
    case 'associative-memory': body = renderAssociative(activity); break;
    case 'instruction-memory': body = renderInstruction(activity); break;
    case 'delayed-recall': body = renderDelayed(activity); break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 794 1123" role="img" aria-label="${esc(`${activity.seriesTitle} - ${activity.label}`)}">${body}</svg>`;
}
