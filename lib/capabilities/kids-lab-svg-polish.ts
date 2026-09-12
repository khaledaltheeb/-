const ARABIC_TEXT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

function setAttribute(openTag: string, name: string, value: string) {
  const pattern = new RegExp(`\\s${name}=(['\"])[^'\"]*\\1`, 'i');
  if (pattern.test(openTag)) return openTag.replace(pattern, ` ${name}="${value}"`);
  return openTag.replace(/>$/, ` ${name}="${value}">`);
}

function hasArabicText(body: string) {
  const plainText = body
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi, ' ');
  return ARABIC_TEXT.test(plainText);
}

/**
 * Normalize Arabic text inside generated Kids Lab SVGs.
 *
 * In SVG, text-anchor follows the inline progression direction. For RTL text,
 * `start` is the visual right edge and `end` is the visual left edge. Several
 * legacy worksheets used `direction="rtl"` together with `text-anchor="end"`
 * while positioning x at the right edge of a card, which made the text grow to
 * the right and escape its intended box. This normalizer fixes that contract at
 * the final SVG boundary without changing centered text or non-Arabic labels.
 */
export function normalizeKidsLabSvgText(svg: string) {
  return svg.replace(/<text\b[^>]*>[\s\S]*?<\/text>/gi, (tag) => {
    const match = tag.match(/^(<text\b[^>]*>)([\s\S]*)(<\/text>)$/i);
    if (!match) return tag;

    const [, originalOpenTag, body, closeTag] = match;
    if (!hasArabicText(body)) return tag;

    let openTag = setAttribute(originalOpenTag, 'direction', 'rtl');
    openTag = setAttribute(openTag, 'unicode-bidi', 'plaintext');

    // For RTL text, `start` anchors the visual right edge. Convert the legacy
    // LTR-style right alignment that incorrectly used `end`.
    openTag = openTag.replace(/\stext-anchor=(['"])end\1/i, ' text-anchor="start"');

    return `${openTag}${body}${closeTag}`;
  });
}

// Backwards-compatible export used by the existing final render wrappers.
export function ensureExplicitRtlText(svg: string) {
  return normalizeKidsLabSvgText(svg);
}
