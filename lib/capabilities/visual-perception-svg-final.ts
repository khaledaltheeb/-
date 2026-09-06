import type { VisualPerceptionActivity } from './visual-perception-lab';
import { renderVisualPerceptionWorksheet as renderBase } from './visual-perception-svg';

const needsIndependentStimulus = new Set(['visual-discrimination','form-constancy','mental-rotation']);

function rotateStimulusPalette(svg:string){
  const map:Record<string,string>={'#2563EB':'__C1__','#EC4899':'__C2__','#F59E0B':'__C3__','#10B981':'__C4__','#8B5CF6':'__C5__','#06B6D4':'__C6__','#EF4444':'__C7__'};
  for(const [from,tmp] of Object.entries(map)) svg=svg.replaceAll(from,tmp);
  const rotated=['#06B6D4','#8B5CF6','#10B981','#F59E0B','#EC4899','#EF4444','#2563EB'];
  Object.values(map).forEach((tmp,i)=>{svg=svg.replaceAll(tmp,rotated[i]);});
  return svg;
}

export function renderVisualPerceptionWorksheet(a: VisualPerceptionActivity) {
  if (a.kind !== 'test' || !needsIndependentStimulus.has(a.taskType)) return renderBase(a);
  if (a.taskType === 'visual-discrimination' && (a.level === 1 || a.level === 4)) {
    const svg=renderBase({ ...a, seed: a.seed + 1, variant: (a.variant + 1) % 7 });
    return rotateStimulusPalette(svg);
  }
  const adjusted: VisualPerceptionActivity = {
    ...a,
    seed: a.seed + 1009 + a.level * 37,
    variant: (a.variant + 3 + a.level) % 11,
  };
  return renderBase(adjusted);
}
