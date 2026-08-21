import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const fragmentNames = [
  'legacy-static-assets-v3.chunk05a.b64',
  'legacy-static-assets-v3.chunk05b1.b64',
  'legacy-static-assets-v3.chunk05b21a.b64',
  'legacy-static-assets-v3.chunk05b21b1.b64',
  'legacy-static-assets-v3.chunk05b21b2.b64',
  'legacy-static-assets-v3.chunk05b22.b64',
];
const expectedLength = 5000;
const expectedSha256 = '224c075680a3ebb385de6e7cd57cf42e4e1b03a2bb8600eda164789c7677706c';

export function assembleChunk05() {
  const content = fragmentNames.map((name) => {
    const file = path.join(root, 'data', name);
    if (!fs.existsSync(file)) throw new Error(`LEGACY STATIC ASSETS FAILED: chunk05 fragment missing: data/${name}`);
    return fs.readFileSync(file, 'utf8').trim();
  }).join('');

  if (content.length !== expectedLength) throw new Error(`LEGACY STATIC ASSETS FAILED: chunk05 length mismatch: expected ${expectedLength}, got ${content.length}`);
  const digest = crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  if (digest !== expectedSha256) throw new Error(`LEGACY STATIC ASSETS FAILED: chunk05 sha256 mismatch: expected ${expectedSha256}, got ${digest}`);

  const target = path.join(root, 'data', 'legacy-static-assets-v3.chunk05.b64');
  fs.writeFileSync(target, content, 'utf8');
  return () => {
    if (fs.existsSync(target)) fs.unlinkSync(target);
  };
}
