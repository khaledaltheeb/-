import type { InstrumentCrosswalkRecord } from '@/lib/core-outcome-sets/instrument-crosswalk';
import { addictionInstrumentMappings } from '@/lib/core-outcome-sets/instrument-crosswalk-wave2-addiction';
import { autismInstrumentMappings } from '@/lib/core-outcome-sets/instrument-crosswalk-wave2-autism';
import { childhoodCancerInstrumentMappings } from '@/lib/core-outcome-sets/instrument-crosswalk-wave2-childhood-cancer';

export const instrumentCrosswalkWave2Seed: readonly InstrumentCrosswalkRecord[] = [
  ...addictionInstrumentMappings,
  ...autismInstrumentMappings,
  ...childhoodCancerInstrumentMappings,
];
