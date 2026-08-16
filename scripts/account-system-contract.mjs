import fs from 'node:fs';

const read=(path)=>fs.readFileSync(path,'utf8');
const fail=(message)=>{console.error(`ACCOUNT SYSTEM CONTRACT FAILED: ${message}`);process.exitCode=1;};
const requireFile=(path)=>{if(!fs.existsSync(path))fail(`missing ${path}`);};
const requireText=(path,needles)=>{const source=read(path);for(const needle of needles)if(!source.includes(needle))fail(`${path} missing ${needle}`);return source;};

for(const path of [
 'app/register/page.tsx','app/register/actions.ts','app/login/page.tsx','app/login/actions.ts',
 'app/forgot-password/page.tsx','app/forgot-password/actions.ts','app/reset-password/page.tsx','app/reset-password/actions.ts','app/auth/callback/route.ts',
 'app/mfa/page.tsx','components/mfa-challenge.tsx','components/mfa-settings.tsx',
 'app/account/security/page.tsx','app/account/security/actions.ts','app/account/verification-documents/page.tsx','components/provider-document-manager.tsx',
 'app/admin/verification-documents/[userId]/page.tsx','app/admin/verification-documents/actions.ts','app/account-system-v1.css',
 'supabase/migrations/20260808210545_provider_verification_documents.sql','supabase/migrations/20260808210851_provider_verification_fk_index.sql',
 'supabase/migrations/20260808211225_provider_verification_rpc_wrapper_security.sql','supabase/migrations/20260808211521_provider_verification_private_rpc_grants.sql',
 'supabase/migrations/20260808214027_harden_provider_verification_storage_boundary.sql','supabase/migrations/20260816113014_mfa_opt_in_enforcement.sql'
]) requireFile(path);

requireText('app/register/actions.ts',['full_name','emailRedirectTo','signUp','safeNext']);
requireText('app/register/page.tsx',['confirm_password','/login?next=','robots: { index: false']);
requireText('app/login/actions.ts',['signInWithPassword','safeNext','getAuthenticatorAssuranceLevel','/mfa?next=','redirect(next)']);
if(read('app/login/actions.ts').includes('signUp('))fail('login action must not contain registration logic');
requireText('app/forgot-password/actions.ts',['resetPasswordForEmail','/auth/callback','/reset-password','encodeURIComponent']);
requireText('app/reset-password/actions.ts',["updateUser({ password",'password_mismatch']);
requireText('app/auth/callback/route.ts',['exchangeCodeForSession','safeNext']);
requireText('app/mfa/page.tsx',['getAuthenticatorAssuranceLevel','currentLevel','nextLevel','MfaChallenge','robots: { index: false']);
requireText('components/mfa-challenge.tsx',['listFactors','challengeAndVerify','one-time-code','nextPath']);
requireText('components/mfa-settings.tsx',['mfa.enroll','challengeAndVerify','mfa.unenroll','refreshSession','qr_code','one-time-code']);
requireText('app/account/security/actions.ts',['getUser','signInWithPassword','updateUser','current_password']);
requireText('app/account/security/page.tsx',['current_password','new_password','confirm_password','/forgot-password','MfaSettings','/mfa?next=%2Faccount%2Fsecurity']);
requireText('app/account/page.tsx',['/account/security','/account/verification-documents']);
requireText('app/join/specialist/page.tsx',['/register?next=%2Fjoin%2Fspecialist','/account/verification-documents']);
requireText('app/join/center/page.tsx',['/register?next=%2Fjoin%2Fcenter','/account/verification-documents']);
requireText('components/provider-document-manager.tsx',["storage.from('provider-verification')","rpc('register_provider_verification_document'","rpc('delete_provider_verification_document'",'10 * 1024 * 1024']);
requireText('app/admin/verification-documents/actions.ts',["rpc('admin_review_provider_verification_document'",'note-required']);
requireText('app/admin/specialists/page.tsx',['/admin/verification-documents/']);
requireText('app/admin/centers/page.tsx',['/admin/verification-documents/']);

const migration=read('supabase/migrations/20260808210545_provider_verification_documents.sql');
for(const marker of [
 "provider_verification_documents","provider-verification","values('provider-verification','provider-verification',false","register_provider_verification_document",
 "delete_provider_verification_document","admin_review_provider_verification_document","provider_verification_storage_insert",
 "provider_verification_storage_select","provider_verification_storage_delete","private.is_admin()","10485760"
]) if(!migration.includes(marker))fail(`verification migration missing ${marker}`);
if(migration.includes("values('provider-verification','provider-verification',true"))fail('provider verification bucket must never be public');
requireText('supabase/migrations/20260808210851_provider_verification_fk_index.sql',['provider_verification_documents_reviewer_idx','reviewed_by']);
requireText('supabase/migrations/20260808211225_provider_verification_rpc_wrapper_security.sql',['register_provider_verification_document','delete_provider_verification_document','admin_review_provider_verification_document','security definer']);
requireText('supabase/migrations/20260808211521_provider_verification_private_rpc_grants.sql',['security invoker','grant execute on function private.register_provider_verification_document','grant execute on function private.delete_provider_verification_document','grant execute on function private.admin_review_provider_verification_document']);
const storageBoundary=read('supabase/migrations/20260808214027_harden_provider_verification_storage_boundary.sql');
for(const marker of ['provider_verification_upload_allowed','private.provider_application_exists','< 20','array_length(storage.foldername(name),1)','not exists(','provider_verification_documents d']) if(!storageBoundary.includes(marker)) fail(`storage boundary migration missing ${marker}`);

const mfaMigration=read('supabase/migrations/20260816113014_mfa_opt_in_enforcement.sql');
for(const marker of [
  'private.mfa_session_allowed','auth.mfa_factors',"f.status = 'verified'","auth.jwt()->>'aal'","= 'aal2'",
  'private.require_active_user','private."current_role"','as restrictive','profiles_mfa_opt_in_guard','provider_verification_documents_mfa_opt_in_guard',
  'specialists_mfa_private_read_guard','centers_mfa_private_read_guard','storage_provider_verification_mfa_select_guard','storage_sensitive_mfa_insert_guard',
  "bucket_id not in ('provider-verification','rawafid-media')"
]) if(!mfaMigration.includes(marker)) fail(`MFA migration missing ${marker}`);
if(!mfaMigration.includes('grant execute on function private.mfa_session_allowed() to authenticated')) fail('MFA helper must be callable by authenticated RLS evaluation');

requireText('lib/supabase/proxy.ts',["'/account'","'/admin'","'/mfa'",'getAuthenticatorAssuranceLevel',"nextLevel === 'aal2'","url.pathname = '/mfa'"]);
requireText('scripts/smoke.mjs',["'/register'","'/account/security'","'/account/verification-documents'","'/mfa'"]);
requireText('app/theme-admin-v4.css',["@import './account-system-v1.css';"]);

if(!process.exitCode)console.log('Rawafid complete account/auth/provider-verification/MFA system contract passed.');
