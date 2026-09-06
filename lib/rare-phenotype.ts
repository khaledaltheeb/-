export const HPO_ID_PATTERN = /^HP:\d{7}$/;

export function cleanPhenotypes(value: unknown, limit = 30) {
  if (!Array.isArray(value)) return [] as string[];
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit) || 30));
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && HPO_ID_PATTERN.test(item)).slice(0, safeLimit))];
}
