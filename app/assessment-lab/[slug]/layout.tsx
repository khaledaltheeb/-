import type { ReactNode } from 'react';

// Assessment Lab detail pages use only versioned local data, but the production
// OpenNext deployment does not currently provide an incremental-cache binding.
// Render this segment on request so Cloudflare does not need the SSG/ISR cache
// path; the page remains fully server-rendered HTML and keeps its SEO metadata.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AssessmentLabDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
