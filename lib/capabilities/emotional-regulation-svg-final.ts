import type { EmotionalRegulationActivity } from './emotional-regulation-lab';
import { renderEmotionalRegulationSvg as renderBase } from './emotional-regulation-svg';

export function renderEmotionalRegulationSvg(a: EmotionalRegulationActivity) {
  let svg = renderBase(a);
  if (a.kind !== 'test') return svg;

  if (a.taskType === 'body-signals') {
    svg = svg
      .replaceAll('☐ لا  ☐ قليل  ☐ واضح','☐ الآن  ☐ في موقف آخر  ☐ يختلف عندي')
      .replaceAll('☐ لا ألاحظ  ☐ خفيف  ☐ واضح  ☐ قوي','☐ الآن  ☐ قبل قليل  ☐ في موقف آخر  ☐ يختلف عندي');
  } else if (a.taskType === 'emotion-intensity') {
    svg = svg.replace('لماذا اخترت هذه الدرجة؟','اختر الدرجة ثم قارنها بموقف آخر: ما الذي تغيّر؟');
  } else if (a.taskType === 'regulation-strategy-choice') {
    svg = svg
      .replace('تنفس ببطء أو خفف سرعة الجسم','خيار من عندي: __________________')
      .replace('اطلب استراحة أو مكانًا أهدأ','بديل آخر: ______________________');
  }
  return svg;
}
