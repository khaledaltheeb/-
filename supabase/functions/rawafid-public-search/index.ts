import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

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

async function digestBucket(req: Request) {
  const forwarded = req.headers.get("cf-connecting-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  const ua = (req.headers.get("user-agent") || "unknown").slice(0, 160);
  const salt = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "rawafid-search";
  const bytes = new TextEncoder().encode(`${salt}:${forwarded}:${ua}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return json({ error: "origin_not_allowed" }, 403, origin);
  }

  let payload: { q?: unknown; limit?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400, origin);
  }

  const q = String(payload.q ?? "").trim().replace(/\s+/g, " ").slice(0, MAX_QUERY);
  const rawLimit = Number(payload.limit ?? 10);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(Math.trunc(rawLimit), MAX_RESULTS)) : 10;
  if (q.length < 2) return json({ error: "query_too_short" }, 400, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRole) return json({ error: "server_configuration_error" }, 503, origin);

  const sb = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
  const bucket = await digestBucket(req);
  const { data: allowed, error: budgetError } = await sb.rpc("consume_public_search_budget", {
    p_bucket_key: bucket,
    p_limit: RATE_LIMIT,
    p_window_seconds: RATE_WINDOW_SECONDS,
  });
  if (budgetError) return json({ error: "rate_limit_unavailable" }, 503, origin);
  if (allowed !== true) return json({ error: "rate_limited" }, 429, origin);

  const started = performance.now();
  const { data, error } = await sb.rpc("search_platform_v3_lexical", {
    p_query: q,
    p_limit: limit,
  });
  if (error) {
    console.error("rawafid-public-search", error.message);
    return json({ error: "search_unavailable" }, 503, origin);
  }

  return json({
    query: q,
    count: Array.isArray(data) ? data.length : 0,
    mode: "v4-indexed-lexical",
    elapsed_ms: Math.round(performance.now() - started),
    results: data ?? [],
  }, 200, origin);
});
