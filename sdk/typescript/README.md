# Rawafid TypeScript API client

A dependency-free reference client for the versioned Rawafid Public & Partner API.

## Usage

```ts
import { RawafidClient } from './rawafid-api';

const rawafid = new RawafidClient();
const latest = await rawafid.listContent({ limit: 10 });
const sources = await rawafid.sources({ publisher: 'WHO', limit: 25 });
```

Institutional partners can pass an issued API key. Keep it on the server; do not expose it in browser bundles.

```ts
const rawafid = new RawafidClient({
  apiKey: process.env.RAWAFID_API_KEY,
  userAgent: 'example-institution/1.0',
});
```

The client exposes discovery, content, typed collections, search, changes, stats, the normalized source registry, and per-content provenance. API failures throw `RawafidApiError` with HTTP status, API error code, request ID, and `Retry-After` when present.

## Compatibility

This client targets `/api/v1` and is intentionally dependency-free. Additive response fields may appear without a major API version change; consumers must ignore unknown fields. See `docs/API_VERSIONING_AND_DEPRECATION.md` for the compatibility contract.
