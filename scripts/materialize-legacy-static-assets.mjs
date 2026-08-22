import { assembleChunk05 } from './legacy-static-assets-v3-chunk05.mjs';

const cleanup = assembleChunk05();
try {
  const { materialize } = await import('./legacy-static-assets-v3.mjs');
  materialize();
} finally {
  cleanup();
}
