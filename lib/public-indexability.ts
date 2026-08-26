const EXPLICIT_NOINDEX_PREFIXES = [
  '/assessments/',
  '/en/',
] as const;

export function normalizePublicPath(value: string): string {
  const raw = value.trim();
  if (!raw) return '/';
  let pathname = raw;
  try {
    pathname = new URL(raw, 'https://healthrenewal.org').pathname;
  } catch {
    pathname = raw.split(/[?#]/, 1)[0] || '/';
  }
  try {
    pathname = decodeURIComponent(pathname).normalize('NFC');
  } catch {
    pathname = pathname.normalize('NFC');
  }
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length) return '/';
  const normalized = `/${parts.join('/')}`;
  return normalized.toLowerCase().endsWith('.html') ? normalized : `${normalized}/`;
}

export function isExplicitNoindexPath(value: string): boolean {
  const path = normalizePublicPath(value);
  return EXPLICIT_NOINDEX_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix));
}

export function shouldIndexPreservedPublishedPage(input: {
  sourceFamily: string | null | undefined;
  route: string;
}): boolean {
  return input.sourceFamily === 'published-content' && !isExplicitNoindexPath(input.route);
}
