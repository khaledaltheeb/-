import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function backendKey(): string | null {
  const modern = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (modern) {
    try {
      const parsed = JSON.parse(modern);
      if (typeof parsed?.default === "string" && parsed.default) return parsed.default;
    } catch {
      // Fall through to the legacy service-role key during the transition period.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
}

async function queryEmbedding(input: string): Promise<number[] | null> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-large",
        dimensions: 512,
        input,
        encoding_format: "float",
      }),
    });

    if (!response.ok) {
      console.warn("query embedding unavailable", { status: response.status });
      return null;
    }

    const payload = await response.json();
    const vector = payload?.data?.[0]?.embedding;
    if (!Array.isArray(vector) || vector.length !== 512) return null;
    return vector as number[];
  } catch (error) {
    console.warn("query embedding failed", {
      name: error instanceof Error ? error.name : "unknown",
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: { q?: unknown; limit?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const q = String(body.q ?? "").trim().replace(/\s+/g, " ").slice(0, 160);
  const requested = Number(body.limit ?? 20);
  const limit = Number.isFinite(requested)
    ? Math.max(1, Math.min(Math.trunc(requested), 50))
    : 20;
  if (q.length < 2) return json({ error: "query_too_short" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKey = backendKey();
  if (!supabaseUrl || !secretKey) {
    return json({ error: "search_backend_unavailable" }, 503);
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-rawafid-component": "hybrid-search-v2" } },
  });

  const started = performance.now();
  const embedding = await queryEmbedding(q);

  if (embedding) {
    const vectorLiteral = `[${embedding.join(",")}]`;
    const { data, error } = await supabase.rpc("search_platform_v2_hybrid", {
      p_query: q,
      p_query_embedding: vectorLiteral,
      p_limit: limit,
      p_lexical_weight: 1.15,
      p_semantic_weight: 1.0,
      p_rrf_k: 50,
    });

    if (!error) {
      return json({
        query: q,
        mode: "hybrid",
        result_count: data?.length ?? 0,
        elapsed_ms: Math.round(performance.now() - started),
        results: data ?? [],
      });
    }

    console.warn("hybrid rpc failed; falling back", { code: error.code });
  }

  const { data, error } = await supabase.rpc("search_platform_v2_lexical", {
    p_query: q,
    p_limit: limit,
  });
  if (error) {
    console.error("lexical rpc failed", { code: error.code });
    return json({ error: "search_unavailable" }, 503);
  }

  return json({
    query: q,
    mode: "lexical-fallback",
    result_count: data?.length ?? 0,
    elapsed_ms: Math.round(performance.now() - started),
    results: data ?? [],
  });
});
