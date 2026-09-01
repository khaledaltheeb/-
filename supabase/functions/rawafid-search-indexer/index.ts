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
      // Fall through during the platform transition.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
}

type ChunkJob = {
  id: number;
  title: string;
  heading: string | null;
  content_text: string;
  content_hash: string;
};

async function embedBatch(apiKey: string, jobs: ChunkJob[]): Promise<number[][]> {
  const inputs = jobs.map((job) => {
    const heading = job.heading ? `\nالقسم: ${job.heading}` : "";
    return `العنوان: ${job.title}${heading}\n\n${job.content_text}`;
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-large",
        dimensions: 512,
        input: inputs,
        encoding_format: "float",
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`embedding_provider_${response.status}:${body.slice(0, 160)}`);
    }

    const payload = await response.json();
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    rows.sort((a: { index: number }, b: { index: number }) => a.index - b.index);
    const vectors = rows.map((row: { embedding?: unknown }) => row.embedding);
    if (
      vectors.length !== jobs.length ||
      vectors.some((vector: unknown) => !Array.isArray(vector) || vector.length !== 512)
    ) {
      throw new Error("embedding_provider_invalid_shape");
    }
    return vectors as number[][];
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return json({
      error: "embedding_provider_not_configured",
      detail: "OPENAI_API_KEY is intentionally required before external embedding work begins.",
    }, 503);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKey = backendKey();
  if (!supabaseUrl || !secretKey) return json({ error: "search_backend_unavailable" }, 503);

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-rawafid-component": "search-indexer-v2" } },
  });

  let requestedBatch = 32;
  try {
    const body = await req.json();
    const parsed = Number(body?.batch_size ?? 32);
    if (Number.isFinite(parsed)) requestedBatch = Math.max(1, Math.min(Math.trunc(parsed), 64));
  } catch {
    // Empty body is valid.
  }

  const started = performance.now();

  const { data: indexedRows, error: indexError } = await supabase.rpc("search_v2_process_index_jobs", {
    p_limit: 20,
  });
  if (indexError) {
    console.error("index job processing failed", { code: indexError.code });
    return json({ error: "index_job_processing_failed" }, 503);
  }

  const { data: claimed, error: claimError } = await supabase.rpc("search_v2_claim_embedding_batch", {
    p_limit: requestedBatch,
  });
  if (claimError) {
    console.error("embedding claim failed", { code: claimError.code });
    return json({ error: "embedding_claim_failed" }, 503);
  }

  const jobs = (claimed ?? []) as ChunkJob[];
  if (jobs.length === 0) {
    return json({
      status: "idle",
      reindexed_pages: indexedRows?.length ?? 0,
      embedded_chunks: 0,
      elapsed_ms: Math.round(performance.now() - started),
    });
  }

  try {
    const vectors = await embedBatch(apiKey, jobs);
    const items = jobs.map((job, index) => ({
      id: job.id,
      content_hash: job.content_hash,
      embedding: vectors[index],
    }));

    const { data: stored, error: storeError } = await supabase.rpc("search_v2_store_embedding_batch", {
      p_items: items,
      p_model: "text-embedding-3-large:512",
      p_version: 1,
    });
    if (storeError) throw new Error(`embedding_store_${storeError.code}`);

    return json({
      status: "ok",
      reindexed_pages: indexedRows?.length ?? 0,
      claimed_chunks: jobs.length,
      embedded_chunks: Number(stored ?? 0),
      elapsed_ms: Math.round(performance.now() - started),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "embedding_batch_failed";
    await supabase.rpc("search_v2_fail_embedding_batch", {
      p_ids: jobs.map((job) => job.id),
      p_error: message,
    });
    console.error("embedding batch failed", { message: message.slice(0, 180) });
    return json({ error: "embedding_batch_failed" }, 503);
  }
});
