import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_ORIGINS = new Set([
  "https://healthrenewal.org",
  "https://www.healthrenewal.org",
  "https://rawafid-platform-staging.khaledaltheeb.workers.dev",
]);
const MAX_QUERY = 160;
const MAX_RESULTS = 20;
const RATE_LIMIT = 60;
const RATE_WINDOW_SECONDS = 60;

function cors(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://healthrenewal.org";
  return {
    "access-control-allow-origin": allowed,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type, apikey, authorization, x-client-info",
    "access-control-max-age": "600",
    "vary": "Origin",
  };
}

function json(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(origin),
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    },
  });
}

async function digestBucket(req: Request, serviceRole: string) {
  const forwarded = req.headers.get("cf-connecting-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  const ua = (req.headers.get("user-agent") || "unknown").slice(0, 160);
  const bytes = new TextEncoder().encode(`${serviceRole}:${forwarded}:${ua}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function rpc<T>(url: string, serviceRole: string, name: string, body: Record<string, unknown>): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept": "application/json",
        "apikey": serviceRole,
        "authorization": `Bearer ${serviceRole}`,
      },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    if (!response.ok) return { data: null, error: `HTTP ${response.status}: ${text.slice(0, 240)}` };
    return { data: (text ? JSON.parse(text) : null) as T, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "rpc_failure" };
  }
}

type SearchRow = { entity_id?: string };
type EvidenceRow = {
  entity_id: string;
  destination: string;
  title: string;
  heading: string;
  evidence_text: string;
  evidence_score: number;
};

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: "origin_not_allowed" }, 403, origin);

  let payload: { q?: unknown; limit?: unknown };
  try { payload = await req.json(); }
  catch { return json({ error: "invalid_json" }, 400, origin); }

  const q = String(payload.q ?? "").trim().replace(/\s+/g, " ").slice(0, MAX_QUERY);
  const rawLimit = Number(payload.limit ?? 10);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(Math.trunc(rawLimit), MAX_RESULTS)) : 10;
  if (q.length < 2) return json({ error: "query_too_short" }, 400, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRole) return json({ error: "server_configuration_error" }, 503, origin);

  const bucket = await digestBucket(req, serviceRole);
  const budget = await rpc<boolean>(supabaseUrl, serviceRole, "consume_public_search_budget", {
    p_bucket_key: bucket,
    p_limit: RATE_LIMIT,
    p_window_seconds: RATE_WINDOW_SECONDS,
  });
  if (budget.error) return json({ error: "rate_limit_unavailable" }, 503, origin);
  if (budget.data !== true) return json({ error: "rate_limited" }, 429, origin);

  const started = performance.now();
  const search = await rpc<SearchRow[]>(supabaseUrl, serviceRole, "search_platform_v3_lexical", {
    p_query: q,
    p_limit: limit,
  });
  if (search.error) {
    console.error("rawafid-public-search", search.error);
    return json({ error: "search_unavailable" }, 503, origin);
  }

  const results = Array.isArray(search.data) ? search.data : [];
  const entityIds = results
    .map((row) => String(row?.entity_id ?? ""))
    .filter((value) => /^[0-9a-f-]{36}$/i.test(value))
    .slice(0, Math.min(limit, 8));

  let evidence: EvidenceRow[] = [];
  if (entityIds.length) {
    const evidenceRpc = await rpc<EvidenceRow[]>(supabaseUrl, serviceRole, "search_platform_v4_evidence_for_pages", {
      p_query: q,
      p_entity_ids: entityIds,
      p_limit: Math.min(6, entityIds.length),
    });
    if (!evidenceRpc.error && Array.isArray(evidenceRpc.data)) evidence = evidenceRpc.data;
  }

  return json({
    query: q,
    count: results.length,
    mode: "v4-zero-api-extractive",
    elapsed_ms: Math.round(performance.now() - started),
    evidence,
    results,
  }, 200, origin);
});
