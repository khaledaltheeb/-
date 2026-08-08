export const RAWAFID_BRAND_NAME = 'منصة روافد';
export const RAWAFID_BRAND_SHORT = 'روافد';

const sectorAccentAliases: Record<string, string> = {
  teal: '#0b8f92',
  turquoise: '#16c6c7',
  blue: '#3d78bd',
  lilac: '#7564c9',
  coral: '#d8604c',
  green: '#4f9d69',
  gold: '#f4b942',
};

export function resolveSectorAccent(value?: string | null, fallback = '#0b8f92') {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (sectorAccentAliases[normalized]) return sectorAccentAliases[normalized];
  if (/^#[0-9a-f]{3,8}$/i.test(normalized)) return normalized;
  if (/^(rgb|hsl)a?\(/i.test(normalized)) return normalized;
  return fallback;
}
