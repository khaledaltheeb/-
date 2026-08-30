import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FIREBASE_PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID") ?? "";
const FIREBASE_CLIENT_EMAIL = Deno.env.get("FIREBASE_CLIENT_EMAIL") ?? "";
const FIREBASE_PRIVATE_KEY = (Deno.env.get("FIREBASE_PRIVATE_KEY") ?? "").replace(/\\n/g, "\n");
const VERSION = "2026-08-30.5";

type PushDevice = { device_id: string; token: string };
type Claim = {
  notification_id: string;
  user_id: string;
  kind: string;
  already_delivered: boolean;
  devices: PushDevice[];
};

let cachedAccessToken = "";
let cachedAccessTokenExpiresAt = 0;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function base64Url(input: Uint8Array | string): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function pkcs8FromPem(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function firebaseAccessToken(): Promise<string> {
  const nowMs = Date.now();
  if (cachedAccessToken && cachedAccessTokenExpiresAt > nowMs + 60_000) {
    return cachedAccessToken;
  }
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error("firebase_secrets_missing");
  }

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pkcs8FromPem(FIREBASE_PRIVATE_KEY),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    iss: FIREBASE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const signingInput = `${header}.${payload}`;
  const signature = new Uint8Array(await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  ));
  const assertion = `${signingInput}.${base64Url(signature)}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const tokenBody = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || typeof tokenBody?.access_token !== "string") {
    throw new Error(`firebase_oauth_${tokenResponse.status}`);
  }
  cachedAccessToken = tokenBody.access_token;
  cachedAccessTokenExpiresAt = Date.now() + Number(tokenBody.expires_in ?? 3600) * 1000;
  return cachedAccessToken;
}

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error("supabase_runtime_secrets_missing");
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE,
      authorization: `Bearer ${SERVICE_ROLE}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(args),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`rpc_${name}_${response.status}:${text.slice(0, 240)}`);
  }
  return (text ? JSON.parse(text) : null) as T;
}

async function sendWake(
  token: string,
  notificationId: string,
): Promise<{ ok: boolean; invalid: boolean; error?: string }> {
  const accessToken = await firebaseAccessToken();
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(FIREBASE_PROJECT_ID)}/messages:send`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          data: {
            scope: "circle",
            type: "circle_wake",
            notification_id: notificationId,
          },
          android: {
            priority: "HIGH",
            ttl: "300s",
          },
        },
      }),
    },
  );

  const body = await response.text();
  if (response.ok) return { ok: true, invalid: false };
  const invalid = response.status === 404 ||
    body.includes("UNREGISTERED") ||
    body.includes("registration-token-not-registered") ||
    body.includes("INVALID_ARGUMENT");
  return {
    ok: false,
    invalid,
    error: `fcm_${response.status}:${body.slice(0, 300)}`,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "GET") {
    return json({
      ok: true,
      version: VERSION,
      firebase_configured: Boolean(
        FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY
      ),
      supabase_runtime_configured: Boolean(SUPABASE_URL && SERVICE_ROLE),
    });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const notificationId = typeof body?.notification_id === "string"
      ? body.notification_id
      : "";
    const nonce = typeof body?.nonce === "string" ? body.nonce : "";
    if (!notificationId || !nonce) {
      return json({ error: "invalid_payload" }, 400);
    }

    const claim = await rpc<Claim | null>("circle_push_claim", {
      p_notification_id: notificationId,
      p_nonce: nonce,
    });
    if (!claim) return json({ error: "invalid_or_expired_nonce" }, 403);
    if (claim.already_delivered) return json({ ok: true, duplicate: true });

    const devices = Array.isArray(claim.devices) ? claim.devices.slice(0, 10) : [];
    if (devices.length === 0) {
      await rpc("circle_push_complete", {
        p_notification_id: notificationId,
        p_nonce: nonce,
        p_success: false,
        p_error: "no_active_push_device",
        p_disable_tokens: [],
      });
      return json({ ok: true, delivered: 0, reason: "no_active_push_device" });
    }

    const results = await Promise.all(devices.map(async (device) => ({
      device,
      result: await sendWake(device.token, notificationId),
    })));
    const delivered = results.filter((entry) => entry.result.ok).length;
    const invalidTokens = results
      .filter((entry) => entry.result.invalid)
      .map((entry) => entry.device.token);
    const errors = results
      .filter((entry) => !entry.result.ok)
      .map((entry) => entry.result.error ?? "fcm_error");

    await rpc("circle_push_complete", {
      p_notification_id: notificationId,
      p_nonce: nonce,
      p_success: delivered > 0,
      p_error: errors.length ? errors.join(" | ").slice(0, 1200) : null,
      p_disable_tokens: invalidTokens,
    });

    return json({
      ok: true,
      delivered,
      attempted: devices.length,
      invalidated: invalidTokens.length,
    });
  } catch (error) {
    console.error("rawafid-circle-push", error);
    return json({
      error: error instanceof Error ? error.message : "push_failed",
    }, 500);
  }
});
