function visibleText(body: string) {
  return body
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp|#\d+|#x[0-9a-f]+);/gi, ' ')
    .trim();
}

export function ensureExplicitRtlText(svg: string) {
  return svg.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/gi, (full, attrs: string, body: string) => {
    if (/\bdirection\s*=/.test(attrs)) return full;
    const text = visibleText(body);
    const direction = /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';
    const bidi = /\bunicode-bidi\s*=/.test(attrs) ? '' : ' unicode-bidi="plaintext"';
    return `<text direction="${direction}"${bidi}${attrs}>${body}</text>`;
  });
}
