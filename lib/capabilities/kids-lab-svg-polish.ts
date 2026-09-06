export function ensureExplicitRtlText(svg: string) {
  return svg.replace(
    /<text\b(?![^>]*\bdirection=)/g,
    '<text direction="rtl" unicode-bidi="plaintext"'
  );
}
