import type { MathLogicActivity } from './math-logic-lab';
import { renderMathLogicSvg as renderBase } from './math-logic-svg';

export function renderMathLogicSvg(a: MathLogicActivity) {
  if (a.kind !== 'test' || (a.seriesNumber !== 57 && a.seriesNumber !== 58)) return renderBase(a);
  if (a.seriesNumber === 57 && a.level >= 4) {
    let svg=renderBase({ ...a, seed: a.seed + 1 });
    const prompt=a.level===4
      ? '<text x="397" y="900" text-anchor="middle" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="17" font-weight="700" fill="#334155">بعد الإدراج: اكتب العدد الذي سيأتي بعد البطاقة الجديدة: ______</text>'
      : '<text x="397" y="900" text-anchor="middle" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="17" font-weight="700" fill="#334155">بعد إكمال الفراغ: اكتب العنصر السابق له أيضًا: ______</text>';
    svg=svg.replace('<line x1="42" y1="1032"',`${prompt}<line x1="42" y1="1032"`);
    return svg;
  }
  if (a.seriesNumber === 58 && a.level === 4) return renderBase({ ...a, seed: a.seed + 1 });
  return renderBase({ ...a, seed: a.seed + 3001 + a.level * 53 });
}
