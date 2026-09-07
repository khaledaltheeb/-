import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260907114800_lens_scholarly_quota_guard.sql';
if (!fs.existsSync(migrationPath)) throw new Error('Lens quota migration is missing.');

const sql = fs.readFileSync(migrationPath, 'utf8');
const required = [
  'create or replace function private.acquire_lens_scholarly_quota_internal()',
  'security definer',
  "set search_path=''",
  'create or replace function public.acquire_lens_scholarly_quota()',
  'security invoker',
  'select private.acquire_lens_scholarly_quota_internal();',
  'revoke all on function private.acquire_lens_scholarly_quota_internal() from public, anon, authenticated;',
  'revoke all on function public.acquire_lens_scholarly_quota() from public, anon, authenticated;',
  'grant usage on schema private to service_role;',
  'grant execute on function private.acquire_lens_scholarly_quota_internal() to service_role;',
  'grant execute on function public.acquire_lens_scholarly_quota() to service_role;',
  'pg_advisory_xact_lock',
  'v_minute_used >= 10',
  'v_month_used >= 20000',
];

for (const marker of required) {
  if (!sql.includes(marker)) throw new Error(`Lens database security invariant missing: ${marker}`);
}

const publicFunctionMatch = sql.match(/create or replace function public\.acquire_lens_scholarly_quota\(\)[\s\S]*?\$\$;/i);
if (!publicFunctionMatch) throw new Error('Lens public RPC definition is missing.');
if (/security\s+definer/i.test(publicFunctionMatch[0])) throw new Error('Lens public RPC must never be SECURITY DEFINER.');
if (!/security\s+invoker/i.test(publicFunctionMatch[0])) throw new Error('Lens public RPC must explicitly remain SECURITY INVOKER.');

console.log('lens-security-contract: PASS');
