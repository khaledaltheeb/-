import { assembleChunk05 } from './legacy-static-assets-v3-chunk05.mjs';

const cleanup = assembleChunk05();
try {
  const { validateContract } = await import('./legacy-static-assets-v3.mjs');
  validateContract();
} finally {
  cleanup();
}
