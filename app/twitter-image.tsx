import OpenGraphImage, { alt, size, contentType } from './opengraph-image';

export const runtime = 'edge';
export { alt, size, contentType };

export default function TwitterImage() {
  return OpenGraphImage();
}
