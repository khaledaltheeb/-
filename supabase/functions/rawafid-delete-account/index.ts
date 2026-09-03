import { withSupabase } from 'npm:@supabase/server@^1'

type DeleteBody = {
  confirmation?: string
  email?: string
}

type StorageObject = {
  bucket: string
  path: string
}

const CONFIRMATION = 'DELETE_MY_RAWAFID_ACCOUNT'
const MAX_SESSION_AGE_SECONDS = 10 * 60
const MANAGED_ROLES = new Set(['owner', 'admin', 'editor'])

function fail(message: string, status = 400, code = 'invalid_request') {
  return Response.json({ ok: false, code, message }, { status })
}

function normalizeEmail(value: unknown) {
  return String(value ?? '').trim().toLowerCase()
}

async function removeStorageObjects(admin: any, objects: StorageObject[]) {
  const grouped = new Map<string, string[]>()
  for (const object of objects) {
    if (!object.bucket || !object.path) continue
    const paths = grouped.get(object.bucket) ?? []
    if (!paths.includes(object.path)) paths.push(object.path)
    grouped.set(object.bucket, paths)
  }

  for (const [bucket, paths] of grouped) {
    for (let index = 0; index < paths.length; index += 100) {
      const chunk = paths.slice(index, index + 100)
      const { error } = await admin.storage.from(bucket).remove(chunk)
      if (error) throw new Error(`storage_cleanup_failed:${bucket}`)
    }
  }
}

async function requireDelete(query: PromiseLike<{ error: { message?: string } | null }>, label: string) {
  const { error } = await query
  if (error) throw new Error(`${label}:${error.message ?? 'unknown'}`)
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return fail('POST required.', 405, 'method_not_allowed')

    let body: DeleteBody
    try {
      body = await req.json()
    } catch {
      return fail('Invalid JSON body.')
    }

    if (body.confirmation !== CONFIRMATION) {
      return fail('Deletion confirmation is missing.', 400, 'confirmation_required')
    }

    const userId = String(ctx.userClaims?.id ?? ctx.jwtClaims?.sub ?? '').trim()
    const accountEmail = normalizeEmail(ctx.userClaims?.email ?? ctx.jwtClaims?.email)
    if (!userId || !accountEmail) return fail('Authenticated user identity is incomplete.', 401, 'identity_missing')
    if (normalizeEmail(body.email) !== accountEmail) return fail('Email confirmation does not match.', 400, 'email_mismatch')

    const issuedAt = Number(ctx.jwtClaims?.iat ?? 0)
    const nowSeconds = Math.floor(Date.now() / 1000)
    if (!Number.isFinite(issuedAt) || issuedAt <= 0 || nowSeconds - issuedAt > MAX_SESSION_AGE_SECONDS) {
      return fail('Sign in again before deleting the account.', 403, 'reauth_required')
    }

    const { data: factorData, error: factorError } = await ctx.supabase.auth.mfa.listFactors()
    if (factorError) return fail('Unable to verify account protection.', 503, 'mfa_check_failed')
    const verifiedFactors = [
      ...(factorData?.totp ?? []),
      ...(factorData?.phone ?? []),
    ].filter((factor: any) => factor?.status === 'verified')
    const aal = String(ctx.jwtClaims?.aal ?? 'aal1')
    if (verifiedFactors.length > 0 && aal !== 'aal2') {
      return fail('Complete multi-factor authentication before deleting the account.', 403, 'mfa_required')
    }

    const admin = ctx.supabaseAdmin
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
    if (profileError) return fail('Unable to verify account role.', 503, 'profile_check_failed')
    if (MANAGED_ROLES.has(String(profile?.role ?? ''))) {
      return fail('Managed privileged accounts require an administrative handover before deletion.', 409, 'managed_account')
    }

    const { data: verificationDocs, error: verificationError } = await admin
      .from('provider_verification_documents')
      .select('object_path')
      .eq('user_id', userId)
    if (verificationError) return fail('Unable to inventory private verification files.', 503, 'verification_inventory_failed')

    const { data: mediaAssets, error: mediaError } = await admin
      .from('media_assets')
      .select('bucket_id,object_path')
      .eq('uploader_id', userId)
    if (mediaError) return fail('Unable to inventory uploaded media.', 503, 'media_inventory_failed')

    const storageObjects: StorageObject[] = [
      ...(verificationDocs ?? []).map((row: any) => ({ bucket: 'provider-verification', path: String(row.object_path ?? '') })),
      ...(mediaAssets ?? []).map((row: any) => ({ bucket: String(row.bucket_id ?? ''), path: String(row.object_path ?? '') })),
    ]

    try {
      // Storage has no database cascade. Remove private/user-owned objects first.
      await removeStorageObjects(admin, storageObjects)

      // These tables intentionally have RESTRICT or retain independently published personal profiles.
      // Cleanup is idempotent so a failed final Auth deletion can be safely retried.
      await requireDelete(admin.from('community_reports').delete().eq('reporter_id', userId), 'community_reports_cleanup_failed')
      await requireDelete(admin.from('community_comments').delete().eq('author_id', userId), 'community_comments_cleanup_failed')
      await requireDelete(admin.from('community_posts').delete().eq('author_id', userId), 'community_posts_cleanup_failed')
      await requireDelete(admin.from('media_assets').delete().eq('uploader_id', userId), 'media_assets_cleanup_failed')
      await requireDelete(admin.from('specialists').delete().eq('user_id', userId), 'specialist_profile_cleanup_failed')
      await requireDelete(admin.from('community_profiles').delete().eq('user_id', userId), 'community_profile_cleanup_failed')

      // Legacy ownership columns are nullable and are not protected by foreign keys.
      await requireDelete(admin.from('api_partner_keys').update({ created_by: null }).eq('created_by', userId), 'api_partner_keys_anonymize_failed')
      await requireDelete(admin.from('api_partners').update({ created_by: null }).eq('created_by', userId), 'api_partners_anonymize_failed')

      // auth.users owns profiles and all Rawafid Circle user relations through ON DELETE CASCADE.
      const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId, false)
      if (deleteUserError) throw new Error(`auth_delete_failed:${deleteUserError.message}`)
    } catch (error) {
      console.error('rawafid-delete-account failed', error instanceof Error ? error.message : 'unknown')
      return fail('Account deletion could not be completed. It is safe to retry.', 500, 'delete_failed')
    }

    return Response.json(
      { ok: true },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    )
  }),
}
