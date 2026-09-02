import type { LegacyPreservedPage } from '@/lib/legacy-preserved-page';

type Block = { type?: unknown; text?: unknown; ordered?: unknown; items?: unknown; level?: unknown };
export type DailyToolField = { label: string; kind: 'range' | 'date' | 'time' | 'textarea' | 'text' };
export type DailyToolSpec = { steps: string[]; fields: DailyToolField[] };
export type DailyToolDirectoryItem = {
  title: string;
  href: string;
  description: string;
  category: string;
  duration: string;
};

function blocks(page: LegacyPreservedPage): Block[] {
  const body = page.body_json && typeof page.body_json === 'object' && !Array.isArray(page.body_json) ? page.body_json as { blocks?: unknown } : {};
  return Array.isArray(body.blocks) ? body.blocks as Block[] : [];
}

function text(value: unknown): string { return typeof value === 'string' ? value.trim() : ''; }

function fieldKind(label: string): DailyToolField['kind'] {
  const value = label.replace(/\s+/g, ' ').trim();
  if (/(شدة|مستوى|طاقة|جودة|قدرة|استعداد)/.test(value)) return 'range';
  if (/تاريخ/.test(value)) return 'date';
  if (/^(وقت|موعد)\s/.test(value)) return 'time';
  if (/(ملاحظ|وصف|^ما\s|خطة|رسالة|جملة|أفكار|علامات|خطوات|أسباب)/.test(value)) return 'textarea';
  return 'text';
}

function genericLinkTitle(value: string) {
  return /^(?:فتح|ابدأ|استخدم|جرّب|جرب)\s+(?:الأداة|الاداة)/u.test(value) || value.length < 4;
}

function categoryFor(value: string) {
  if (/(نوم|استيقاظ|مساء|ليل|أرق|ارق|راحة)/u.test(value)) return 'النوم والراحة';
  if (/(قلق|توتر|ضغط|تنفس|تهدئة|هدوء|ground|تثبيت|انفعال)/iu.test(value)) return 'الهدوء وتنظيم الانفعال';
  if (/(تركيز|انتباه|مهمة|تسويف|دراسة|عمل|أولوية|اولوية|قرار)/u.test(value)) return 'التركيز والتنظيم';
  if (/(فكر|أفكار|افكار|مزاج|مشاعر|امتنان|يومية|تأمل|تامل)/u.test(value)) return 'الأفكار والمشاعر';
  if (/(حدود|تواصل|حوار|خلاف|علاقة|رسالة|رفض|طلب)/u.test(value)) return 'العلاقات والتواصل';
  if (/(طفل|أسرة|اسرة|والد|والدة|مراهق|تربية|روتين عائلي)/u.test(value)) return 'الأسرة والتربية';
  if (/(موعد|طبيب|معالج|مساعدة|دعم|مقدم رعاية|رعاية|سلامة|خطة أمان|خطة امان)/u.test(value)) return 'الدعم والرعاية';
  if (/(مدرسة|تعلم|تعليم|دامج|احتياجات|حسي|روتين بصري)/u.test(value)) return 'التعلم والتربية الدامجة';
  return 'العناية اليومية';
}

function durationFor(value: string) {
  if (/(دقيقة|سريع|فوري|الآن|الان|تنفس|تثبيت)/u.test(value)) return '3–5 دقائق';
  if (/(خطة|سجل|مراجعة|تحضير|روتين|خريطة)/u.test(value)) return '10–15 دقيقة';
  return '5–10 دقائق';
}

export function deriveDailyToolSpec(page: LegacyPreservedPage): DailyToolSpec | null {
  const source = blocks(page);
  const stepBlock = source.find((block) => block.type === 'list' && block.ordered === true && Array.isArray(block.items) && text(block.items[0]).startsWith('الخطوة '));
  const steps = Array.isArray(stepBlock?.items)
    ? stepBlock.items.map((item) => text(item).replace(/^الخطوة\s+\d+\s*:\s*/, '')).filter(Boolean)
    : [];
  const fieldsBlock = source.find((block) => block.type === 'paragraph' && text(block.text).startsWith('تشمل حقول المتابعة:'));
  const fieldsLine = text(fieldsBlock?.text);
  const list = fieldsLine
    ? fieldsLine.replace(/^تشمل حقول المتابعة:\s*/, '').split(/\.\s+اقرأها\b/, 1)[0].replace(/[.،\s]+$/, '').split('،').map((item) => item.trim()).filter(Boolean)
    : [];
  const fields = list.map((label) => ({ label, kind: fieldKind(label) }));
  if (steps.length < 4 || fields.length < 3) return null;
  return { steps, fields };
}

export function deriveDailyToolDirectory(page: LegacyPreservedPage): DailyToolDirectoryItem[] {
  const source = blocks(page);
  const headingEntries: Array<{ title: string; description: string }> = [];
  for (let index = 0; index < source.length - 1; index += 1) {
    const current = source[index];
    const next = source[index + 1];
    if (current.type !== 'heading' || Number(current.level) !== 2 || next.type !== 'paragraph') continue;
    const title = text(current.text);
    const description = text(next.text);
    if (title && description) headingEntries.push({ title, description });
  }

  const bodyLinks = Array.isArray(page.internal_links_json) ? page.internal_links_json : [];
  const linkRows: Array<{ title: string; pathname: string }> = [];
  const seen = new Set<string>();
  for (const value of bodyLinks) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const row = value as Record<string, unknown>;
    const rawUrl = text(row.url ?? row.href);
    if (!rawUrl) continue;
    let pathname = '';
    try { pathname = new URL(rawUrl, 'https://healthrenewal.org').pathname; } catch { continue; }
    if (!/^\/daily-tools\/[^/]+\/?$/.test(pathname)) continue;
    pathname = pathname.endsWith('/') ? pathname : `${pathname}/`;
    if (seen.has(pathname)) continue;
    seen.add(pathname);
    linkRows.push({ title: text(row.title ?? row.label), pathname });
  }

  // The preserved hub stores CTA labels such as "فتح الأداة" in internal_links_json.
  // Tool names/descriptions live in the H2 + paragraph pairs. Align the final N pairs
  // with the N tool URLs so generic CTA text never becomes a card heading again.
  const alignedHeadings = headingEntries.length >= linkRows.length
    ? headingEntries.slice(headingEntries.length - linkRows.length)
    : headingEntries;

  return linkRows.map((row, index) => {
    const preserved = alignedHeadings[index];
    const title = row.title && !genericLinkTitle(row.title) ? row.title : preserved?.title || row.title || 'أداة يومية';
    const description = preserved?.description || 'أداة عملية تساعدك على تنظيم خطوة يومية واضحة داخل المتصفح.';
    const searchable = `${title} ${description}`;
    return {
      title,
      href: row.pathname,
      description,
      category: categoryFor(searchable),
      duration: durationFor(searchable),
    };
  });
}
