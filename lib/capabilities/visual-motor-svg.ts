import type { VisualMotorActivity } from './visual-motor-lab';

const W = 1240;
const H = 1754;
const TASK_TOP = 360;
const TASK_BOTTOM = 1515;

function esc(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c] as string));
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function textLines(text: string, max = 72) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function header(a: VisualMotorActivity) {
  const lines = textLines(a.instruction, 78);
  return `
  <rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>
  <rect x="54" y="45" rx="30" width="1132" height="245" fill="#eff6ff" stroke="#bfdbfe" stroke-width="3"/>
  <text x="1125" y="105" text-anchor="end" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="28" font-weight="700" fill="#1d4ed8">السلسلة ${a.seriesNumber} • ${esc(a.label)}</text>
  <text x="1125" y="160" text-anchor="end" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="42" font-weight="800" fill="#0f172a">${esc(a.seriesTitle)}</text>
  ${lines.map((line, i) => `<text x="1125" y="211" text-anchor="end" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="23" fill="#334155" transform="translate(0 ${i * 31})">${esc(line)}</text>`).join('')}
  <rect x="55" y="310" rx="16" width="1130" height="44" fill="#dbeafe"/>
  <text x="1120" y="340" text-anchor="end" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="20" fill="#1e3a8a">العمر الإرشادي: ${esc(a.age)} • المستوى ${a.level}/5 • ${a.kind === 'test' ? 'اختبار إتقان' : 'تدريب'}</text>
  `;
}

function footer(a: VisualMotorActivity) {
  return `
  <line x1="70" y1="1540" x2="1170" y2="1540" stroke="#cbd5e1" stroke-width="2"/>
  <text x="1135" y="1585" text-anchor="end" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="21" font-weight="700" fill="#334155">سجل الأداء</text>
  <text x="1135" y="1630" text-anchor="end" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="19" fill="#475569">الاسم: ____________________    التاريخ: __________    الزمن: __________</text>
  <text x="1135" y="1671" text-anchor="end" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="18" fill="#475569">${esc(a.observation)}</text>
  <text x="620" y="1720" text-anchor="middle" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="16" fill="#64748b">مهمة أداء تعليمية غير تشخيصية • Health Renewal</text>`;
}

function pathD(points: Array<[number, number]>) {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

function renderPathTracing(a: VisualMotorActivity) {
  const r = rng(a.seed);
  const count = 4 + a.level;
  const points: Array<[number, number]> = [];
  const left = 135;
  const right = 1105;
  const usable = right - left;
  for (let i = 0; i < count; i++) {
    const x = left + usable * (i / (count - 1));
    const base = TASK_TOP + 130 + (TASK_BOTTOM - TASK_TOP - 260) * (i % 2 ? 0.68 : 0.32);
    const jitter = (r() - 0.5) * (70 + a.level * 12);
    points.push([Math.round(x), Math.round(base + jitter)]);
  }
  const d = pathD(points);
  const outer = [150, 130, 110, 94, 82][a.level - 1];
  const inner = outer - 26;
  return `
  <text x="620" y="402" text-anchor="middle" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="24" font-weight="700" fill="#1e40af">ابقَ داخل الممر من البداية إلى النهاية</text>
  <path d="${d}" fill="none" stroke="#60a5fa" stroke-width="${outer}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="#ffffff" stroke-width="${inner}" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${points[0][0]}" cy="${points[0][1]}" r="34" fill="#22c55e"/><text x="${points[0][0]}" y="${points[0][1] + 8}" text-anchor="middle" font-family="Arial" font-size="20" font-weight="700" fill="#fff">ابدأ</text>
  <circle cx="${points[points.length - 1][0]}" cy="${points[points.length - 1][1]}" r="34" fill="#f59e0b"/><text x="${points[points.length - 1][0]}" y="${points[points.length - 1][1] + 8}" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#fff">نهاية</text>`;
}

type Cell = { t: boolean; r: boolean; b: boolean; l: boolean; v?: boolean };
function makeMaze(size: number, seed: number) {
  const rand = rng(seed);
  const cells: Cell[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => ({ t: true, r: true, b: true, l: true })));
  const stack: Array<[number, number]> = [[0, size - 1]];
  const seen = new Set<string>([`0,${size - 1}`]);
  const dirs = [
    [-1, 0, 't', 'b'],
    [0, 1, 'r', 'l'],
    [1, 0, 'b', 't'],
    [0, -1, 'l', 'r'],
  ] as const;
  while (stack.length) {
    const [rr, cc] = stack[stack.length - 1];
    const options = dirs.map((d) => ({ d, nr: rr + d[0], nc: cc + d[1] })).filter((o) => o.nr >= 0 && o.nr < size && o.nc >= 0 && o.nc < size && !seen.has(`${o.nr},${o.nc}`));
    if (!options.length) { stack.pop(); continue; }
    const pick = options[Math.floor(rand() * options.length)];
    const [, , wallHere, wallThere] = pick.d;
    cells[rr][cc][wallHere] = false;
    cells[pick.nr][pick.nc][wallThere] = false;
    seen.add(`${pick.nr},${pick.nc}`);
    stack.push([pick.nr, pick.nc]);
  }
  return cells;
}

function renderMaze(a: VisualMotorActivity) {
  const size = 5 + a.level;
  const cells = makeMaze(size, a.seed);
  const box = 930;
  const cell = box / size;
  const x0 = 155;
  const y0 = 440;
  let lines = '';
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    const x = x0 + c * cell, y = y0 + r * cell;
    const w = cells[r][c];
    if (w.t) lines += `<line x1="${x}" y1="${y}" x2="${x + cell}" y2="${y}"/>`;
    if (w.r) lines += `<line x1="${x + cell}" y1="${y}" x2="${x + cell}" y2="${y + cell}"/>`;
    if (w.b) lines += `<line x1="${x}" y1="${y + cell}" x2="${x + cell}" y2="${y + cell}"/>`;
    if (w.l) lines += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + cell}"/>`;
  }
  const sx = x0 + (size - 0.5) * cell, sy = y0 + 0.5 * cell;
  const gx = x0 + 0.5 * cell, gy = y0 + (size - 0.5) * cell;
  return `<text x="620" y="402" text-anchor="middle" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="24" font-weight="700" fill="#1e40af">خطط بعينيك ثم ارسم الطريق داخل الممرات</text>
  <g stroke="#334155" stroke-width="5" stroke-linecap="round">${lines}</g>
  <circle cx="${sx}" cy="${sy}" r="${Math.max(20, cell * 0.2)}" fill="#22c55e"/><text x="${sx}" y="${sy + 7}" text-anchor="middle" font-family="Arial" font-size="17" fill="#fff">S</text>
  <circle cx="${gx}" cy="${gy}" r="${Math.max(20, cell * 0.2)}" fill="#f59e0b"/><text x="${gx}" y="${gy + 7}" text-anchor="middle" font-family="Arial" font-size="17" fill="#fff">★</text>`;
}

function interpolatePolygon(vertices: Array<[number, number]>, n: number) {
  const segLengths = vertices.map((p, i) => {
    const q = vertices[(i + 1) % vertices.length];
    return Math.hypot(q[0] - p[0], q[1] - p[1]);
  });
  const total = segLengths.reduce((a, b) => a + b, 0);
  const pts: Array<[number, number]> = [];
  for (let k = 0; k < n; k++) {
    const target = (k / n) * total;
    let acc = 0;
    for (let i = 0; i < vertices.length; i++) {
      if (target <= acc + segLengths[i]) {
        const t = (target - acc) / segLengths[i];
        const p = vertices[i], q = vertices[(i + 1) % vertices.length];
        pts.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
        break;
      }
      acc += segLengths[i];
    }
  }
  return pts;
}

function renderDotToDot(a: VisualMotorActivity) {
  const shapes = [
    [[0.08,0.65],[0.28,0.3],[0.5,0.15],[0.72,0.3],[0.92,0.65],[0.7,0.82],[0.3,0.82]],
    [[0.15,0.72],[0.22,0.28],[0.52,0.1],[0.82,0.28],[0.88,0.72],[0.5,0.9]],
    [[0.1,0.55],[0.34,0.25],[0.7,0.25],[0.9,0.55],[0.7,0.8],[0.3,0.8]],
  ] as Array<Array<[number, number]>>;
  const verts = shapes[(a.seed + a.variant) % shapes.length];
  const n = 6 + a.level * 3;
  const pts = interpolatePolygon(verts, n).map(([x, y]) => [190 + x * 860, 500 + y * 790] as [number, number]);
  const hints = a.kind === 'training-a' ? Math.min(3, Math.floor(n / 5)) : 0;
  const hintLines = Array.from({ length: hints }, (_, i) => `<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[i + 1][0]}" y2="${pts[i + 1][1]}" stroke="#bfdbfe" stroke-width="5" stroke-dasharray="10 8"/>`).join('');
  return `<text x="620" y="402" text-anchor="middle" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="24" font-weight="700" fill="#1e40af">صِل الأرقام بالترتيب حتى يكتمل الشكل</text>
  ${hintLines}
  ${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="12" fill="#1d4ed8"/><circle cx="${x}" cy="${y}" r="24" fill="none" stroke="#bfdbfe" stroke-width="2"/><text x="${x + 29}" y="${y - 18}" font-family="Arial" font-size="19" font-weight="700" fill="#334155">${i + 1}</text>`).join('')}`;
}

function modelSvg(level: number, seed: number, x: number, y: number, scale = 1) {
  const rand = rng(seed);
  const w = 360 * scale, h = 360 * scale;
  const cx = x + w / 2, cy = y + h / 2;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#fff" stroke="#94a3b8" stroke-width="3"/>`;
  const stroke = '#1e3a8a';
  s += `<polygon points="${cx},${y + 55*scale} ${x + 70*scale},${y + 290*scale} ${x + 290*scale},${y + 290*scale}" fill="none" stroke="${stroke}" stroke-width="7"/>`;
  if (level >= 2) s += `<circle cx="${cx}" cy="${cy + 55*scale}" r="${55*scale}" fill="none" stroke="${stroke}" stroke-width="7"/>`;
  if (level >= 3) s += `<line x1="${x + 90*scale}" y1="${y + 110*scale}" x2="${x + 270*scale}" y2="${y + 275*scale}" stroke="${stroke}" stroke-width="7"/>`;
  if (level >= 4) s += `<rect x="${x + 125*scale}" y="${y + 125*scale}" width="${110*scale}" height="${70*scale}" fill="none" stroke="${stroke}" stroke-width="7" transform="rotate(${rand() > .5 ? 15 : -15} ${cx} ${cy})"/>`;
  if (level >= 5) s += `<line x1="${x + 75*scale}" y1="${cy}" x2="${x + 290*scale}" y2="${cy}" stroke="${stroke}" stroke-width="7"/><circle cx="${x + 85*scale}" cy="${y + 80*scale}" r="${20*scale}" fill="#dbeafe" stroke="${stroke}" stroke-width="5"/>`;
  return s;
}

function renderShapeCopying(a: VisualMotorActivity) {
  const y = 560;
  const targetHints = a.kind === 'training-a' ? `<circle cx="230" cy="620" r="7" fill="#94a3b8"/><circle cx="500" cy="850" r="7" fill="#94a3b8"/><circle cx="350" cy="1030" r="7" fill="#94a3b8"/>` : '';
  return `<text x="620" y="402" text-anchor="middle" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="24" font-weight="700" fill="#1e40af">شاهد النموذج ثم انسخه في المساحة الفارغة</text>
  <text x="900" y="510" text-anchor="middle" direction="rtl" font-family="Arial" font-size="22" font-weight="700" fill="#475569">النموذج</text>
  ${modelSvg(a.level, a.seed, 720, y, 1)}
  <text x="340" y="510" text-anchor="middle" direction="rtl" font-family="Arial" font-size="22" font-weight="700" fill="#475569">انسخ هنا</text>
  <rect x="160" y="${y}" width="360" height="360" rx="18" fill="#fff" stroke="#94a3b8" stroke-width="3" stroke-dasharray="10 8"/>${targetHints}
  <rect x="160" y="1000" width="920" height="290" rx="20" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
  <text x="1030" y="1050" text-anchor="end" direction="rtl" font-family="Arial" font-size="20" fill="#475569">بعد النسخ راجع:</text>
  <text x="1030" y="1095" text-anchor="end" direction="rtl" font-family="Arial" font-size="19" fill="#475569">□ الاتجاهات   □ عدد الأجزاء   □ موضع الأجزاء   □ إغلاق الأشكال</text>`;
}

function renderGridCopying(a: VisualMotorActivity) {
  const sizes = [4, 5, 5, 6, 7];
  const n = sizes[a.level - 1];
  const cell = Math.min(95, 390 / n);
  const gridW = cell * n;
  const y0 = 570;
  const srcX = 700;
  const dstX = 150;
  const rand = rng(a.seed);
  const density = 0.2 + a.level * 0.035;
  const marks: Array<{r:number;c:number;type:number}> = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (rand() < density) marks.push({ r, c, type: a.level >= 4 && rand() > .58 ? 2 : 1 });
  if (marks.length < Math.max(4, a.level + 2)) {
    for (let i = marks.length; i < Math.max(4, a.level + 2); i++) marks.push({ r: i % n, c: (i * 2 + 1) % n, type: a.level >= 4 && i % 2 ? 2 : 1 });
  }
  const grid = (x: number, withMarks: boolean) => {
    let s = `<rect x="${x}" y="${y0}" width="${gridW}" height="${gridW}" fill="#fff" stroke="#334155" stroke-width="3"/>`;
    for (let i = 1; i < n; i++) s += `<line x1="${x + i*cell}" y1="${y0}" x2="${x + i*cell}" y2="${y0 + gridW}" stroke="#94a3b8" stroke-width="2"/><line x1="${x}" y1="${y0 + i*cell}" x2="${x + gridW}" y2="${y0 + i*cell}" stroke="#94a3b8" stroke-width="2"/>`;
    if (withMarks) for (const m of marks) {
      const cx = x + (m.c + .5) * cell, cy = y0 + (m.r + .5) * cell;
      if (m.type === 1) s += `<circle cx="${cx}" cy="${cy}" r="${cell*.22}" fill="#2563eb"/>`;
      else s += `<line x1="${cx-cell*.2}" y1="${cy-cell*.2}" x2="${cx+cell*.2}" y2="${cy+cell*.2}" stroke="#f59e0b" stroke-width="7"/><line x1="${cx+cell*.2}" y1="${cy-cell*.2}" x2="${cx-cell*.2}" y2="${cy+cell*.2}" stroke="#f59e0b" stroke-width="7"/>`;
    }
    return s;
  };
  return `<text x="620" y="402" text-anchor="middle" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="24" font-weight="700" fill="#1e40af">انقل العلامات إلى الخلايا المناظرة</text>
  <text x="${srcX + gridW/2}" y="525" text-anchor="middle" direction="rtl" font-family="Arial" font-size="22" font-weight="700" fill="#475569">النموذج</text>${grid(srcX,true)}
  <text x="${dstX + gridW/2}" y="525" text-anchor="middle" direction="rtl" font-family="Arial" font-size="22" font-weight="700" fill="#475569">النسخة</text>${grid(dstX,false)}
  <text x="620" y="${y0 + gridW + 80}" text-anchor="middle" direction="rtl" font-family="Arial" font-size="20" fill="#475569">اعمل صفًا بعد صف، ثم راجع الصف والعمود قبل الانتقال.</text>`;
}

function renderEyeHand(a: VisualMotorActivity) {
  const rand = rng(a.seed);
  const pairs = a.level <= 1 ? 2 : a.level <= 3 ? 3 : 4;
  const top = 490, bottom = 1360;
  const band = (bottom - top) / pairs;
  const startX = 1080, goalX = 160;
  const symbols = ['★', '●', '▲', '◆'];
  let s = `<text x="620" y="402" text-anchor="middle" direction="rtl" font-family="Arial, Tahoma, sans-serif" font-size="24" font-weight="700" fill="#1e40af">صِل كل رمز بمثيله دون لمس العوائق</text>`;
  for (let p = 0; p < pairs; p++) {
    const cy = top + band * (p + .5);
    const sym = symbols[p];
    s += `<circle cx="${startX}" cy="${cy}" r="34" fill="#dbeafe" stroke="#2563eb" stroke-width="4"/><text x="${startX}" y="${cy+10}" text-anchor="middle" font-family="Arial" font-size="28" fill="#1e3a8a">${sym}</text>`;
    s += `<circle cx="${goalX}" cy="${cy + (p%2?22:-22)}" r="34" fill="#fef3c7" stroke="#d97706" stroke-width="4"/><text x="${goalX}" y="${cy + (p%2?22:-22)+10}" text-anchor="middle" font-family="Arial" font-size="28" fill="#92400e">${sym}</text>`;
    const obstacleCount = 3 + a.level;
    for (let i = 0; i < obstacleCount; i++) {
      const x = 280 + rand() * 680;
      const safeY = cy + Math.sin((x / 110) + p) * 35;
      let y = top + p*band + 35 + rand()*(band-70);
      if (Math.abs(y - safeY) < 55) y += (y < safeY ? -1 : 1) * 80;
      y = Math.max(top + p*band + 35, Math.min(top + (p+1)*band - 35, y));
      const rr = 22 + rand()*18;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}" fill="#fee2e2" stroke="#ef4444" stroke-width="3"/><text x="${x.toFixed(1)}" y="${(y+7).toFixed(1)}" text-anchor="middle" font-family="Arial" font-size="19" fill="#991b1b">×</text>`;
    }
    if (p < pairs - 1) s += `<line x1="100" y1="${top + (p+1)*band}" x2="1140" y2="${top + (p+1)*band}" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="8 10"/>`;
  }
  return s;
}

export function renderVisualMotorWorksheet(a: VisualMotorActivity) {
  const body = a.taskType === 'path-tracing' ? renderPathTracing(a)
    : a.taskType === 'maze' ? renderMaze(a)
    : a.taskType === 'dot-to-dot' ? renderDotToDot(a)
    : a.taskType === 'shape-copying' ? renderShapeCopying(a)
    : a.taskType === 'grid-copying' ? renderGridCopying(a)
    : renderEyeHand(a);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(a.title)}">${header(a)}${body}${footer(a)}</svg>`;
}
