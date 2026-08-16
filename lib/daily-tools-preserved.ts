import type { LegacyPreservedPage } from '@/lib/legacy-preserved-page';

type Block = { type?: unknown; text?: unknown; ordered?: unknown; items?: unknown };
export type DailyToolField = { label: string; kind: 'range' | 'date' | 'time' | 'textarea' | 'text' };
export type DailyToolSpec = { steps: string[]; fields: DailyToolField[] };
export type DailyToolDirectoryItem = { title: string; href: string; description: string };

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
  const descriptions = new Map<string, string>();
  for (let index = 0; index < source.length - 1; index += 1) {
    const current = source[index];
    const next = source[index + 1];
    if (current.type !== 'heading' || Number((current as { level?: unknown }).level) !== 2 || next.type !== 'paragraph') continue;
    const heading = text(current.text);
    const description = text(next.text);
    if (heading && description) descriptions.set(heading, description);
  }
  const bodyLinks = Array.isArray(page.internal_links_json) ? page.internal_links_json : [];
  const seen = new Set<string>();
  const items: DailyToolDirectoryItem[] = [];
  for (const value of bodyLinks) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const row = value as Record<string, unknown>;
    const title = text(row.title ?? row.label);
    const rawUrl = text(row.url ?? row.href);
    if (!title || !rawUrl) continue;
    let pathname = '';
    try { pathname = new URL(rawUrl, 'https://healthrenewal.org').pathname; } catch { continue; }
    if (!/^\/daily-tools\/[^/]+\/?$/.test(pathname) || seen.has(pathname)) continue;
    seen.add(pathname);
    items.push({ title, href: pathname.endsWith('/') ? pathname : `${pathname}/`, description: descriptions.get(title) ?? '' });
  }
  return items;
}
