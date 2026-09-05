import '../cognitive-lab.css';

// Cognitive Lab uses versioned local data, but the production OpenNext setup
// does not currently provide an incremental-cache binding. Render this segment
// on request so Cloudflare does not rely on the SSG/ISR cache path that can
// surface HTTP 500 responses for otherwise valid pre-rendered routes.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CognitiveLabLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
