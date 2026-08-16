export const historicalCognitiveTestMap={
 'digit-span':'digit-span-forward','matrix-reasoning':'matrix-patterns','n-back':'two-back','number-series':'number-series','reaction-time':'simple-reaction','spatial-rotation':'mental-rotation','stroop':'stroop-basic','verbal-analogies':'verbal-analogy'
} as const;
export type HistoricalCognitiveSlug=keyof typeof historicalCognitiveTestMap;
export function currentCognitiveSlug(slug:string){return historicalCognitiveTestMap[slug as HistoricalCognitiveSlug]??null;}
