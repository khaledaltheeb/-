import { staticOgRedirect } from '@/lib/static-og-assets';

export function GET(request: Request) {
  return staticOgRedirect(request, 'comparisons');
}
