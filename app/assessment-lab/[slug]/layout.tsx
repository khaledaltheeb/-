import type { ReactNode } from 'react';

// Assessment Lab detail pages are fully generated from versioned local data.
// Keep them out of request-time rendering on Cloudflare/OpenNext so a deployed
// page never depends on runtime regeneration or an incremental-cache write.
export const dynamic = 'force-static';
export const revalidate = false;

export default function AssessmentLabDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
