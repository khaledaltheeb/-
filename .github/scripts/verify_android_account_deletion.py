#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        raise SystemExit(f"[FAIL] missing required file: {path}")
    return target.read_text(encoding="utf-8")


def require(text: str, tokens: list[str], label: str) -> None:
    missing = [token for token in tokens if token not in text]
    if missing:
        raise SystemExit(f"[FAIL] {label}: missing {missing}")


manifest = read("android/app/src/main/AndroidManifest.xml")
account_ui = read("android/app/src/main/java/org/healthrenewal/rawafid/CircleAccountActivity.kt")
delete_ui = read("android/app/src/main/java/org/healthrenewal/rawafid/AccountDeletionActivity.kt")
delete_api = read("android/app/src/main/java/org/healthrenewal/rawafid/RawafidAccountDeletionApi.kt")
edge = read("supabase/functions/rawafid-delete-account/index.ts")
config = read("supabase/config.toml")
web_page = read("app/account/delete/page.tsx")
web_actions = read("app/account/delete/actions.ts")
security_page = read("app/account/security/page.tsx")

require(
    manifest,
    ['android:name=".AccountDeletionActivity"', 'android:exported="false"', 'android:excludeFromRecents="true"'],
    "private deletion activity manifest",
)
require(
    account_ui,
    ["AccountDeletionActivity::class.java", "حذف الحساب والبيانات", "MaterialTheme.colorScheme.error"],
    "account deletion discovery",
)
require(
    delete_ui,
    [
        "WindowManager.LayoutParams.FLAG_SECURE",
        "var password by remember {",
        "var mfaCode by remember {",
        "حذف حسابي نهائيًا",
        "RawafidAccountDeletionApi.deleteCurrentAccount",
        "AccountDeletionStage.REAUTH",
        "AccountDeletionStage.MFA",
        "AccountDeletionStage.CONFIRM",
    ],
    "secure staged Android deletion flow",
)
if "var password by rememberSaveable" in delete_ui or "var mfaCode by rememberSaveable" in delete_ui:
    raise SystemExit("[FAIL] deletion credentials/MFA codes must not enter saved-state bundles")

require(
    delete_api,
    [
        "/functions/v1/rawafid-delete-account",
        "DELETE_MY_RAWAFID_ACCOUNT",
        'Authorization", "Bearer ${session.getString("access_token")}',
        "RawafidCircleApi.clearSession(context)",
    ],
    "authenticated Android deletion client",
)
for forbidden in ("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY", "service_role"):
    if forbidden in delete_api:
        raise SystemExit(f"[FAIL] Android deletion client contains server-only credential marker: {forbidden}")

require(
    config,
    ["[functions.rawafid-delete-account]", "verify_jwt = true"],
    "Supabase JWT verification",
)
require(
    edge,
    [
        "withSupabase({ auth: 'user' }",
        "MAX_SESSION_AGE_SECONDS = 10 * 60",
        "body.confirmation !== CONFIRMATION",
        "normalizeEmail(body.email) !== accountEmail",
        "ctx.supabase.auth.mfa.listFactors()",
        "aal !== 'aal2'",
        "MANAGED_ROLES",
        "groupedStorage",
        "admin.storage.from(bucket).remove(chunk)",
        "community_comments",
        "community_posts",
        "media_assets",
        "specialists",
        "community_profiles",
        "admin.auth.admin.deleteUser(userId, false)",
    ],
    "server-side deletion hardening",
)

require(
    web_page,
    [
        "حذف حساب روافد والبيانات",
        "reauthenticateForDeletion",
        "deleteAccountPermanently",
        "حذف حسابي نهائيًا",
        "/login?next=%2Faccount%2Fdelete",
    ],
    "external web deletion surface",
)
require(
    web_actions,
    [
        "supabase.auth.signInWithPassword",
        "supabase.auth.mfa.listFactors",
        "getAuthenticatorAssuranceLevel",
        "rawafid-delete-account",
        "DELETE_MY_RAWAFID_ACCOUNT",
    ],
    "web deletion reauthentication contract",
)
require(
    security_page,
    ["حذف الحساب والبيانات", 'href="/account/delete"', "إعادة تحقق مستقلة"],
    "web account-security deletion discovery",
)

print("Rawafid account deletion contract OK: discoverable, reauthenticated, MFA-aware, JWT-verified, storage-cleaning and server-authoritative")
