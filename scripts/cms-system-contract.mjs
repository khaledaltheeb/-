import fs from 'node:fs';

const read=(path)=>fs.readFileSync(path,'utf8');
const fail=(message)=>{console.error(`CMS SYSTEM CONTRACT FAILED: ${message}`);process.exitCode=1;};
const requireFile=(path)=>{if(!fs.existsSync(path))fail(`missing ${path}`);};
const requireText=(path,needles)=>{const source=read(path);for(const needle of needles)if(!source.includes(needle))fail(`${path} missing ${needle}`);return source;};

const requiredFiles=[
  'app/admin/content/page.tsx',
  'app/admin/content/new/page.tsx',
  'app/admin/content/[id]/page.tsx',
  'app/admin/content/actions.ts',
  'app/admin/content/seo-actions.ts',
  'app/admin/content/release-actions.ts',
  'app/admin/content/release-contract-form.tsx',
  'app/admin/layout.tsx',
  'lib/supabase/proxy.ts',
  'supabase/migrations/20260821113049_cms_audit_integrity_hardening.sql',
  'supabase/migrations/20260821154825_cms_release_contract_editor_hardening.sql',
];
for(const path of requiredFiles)requireFile(path);

const callback=read('app/auth/callback/route.ts');
if(!callback.includes("value.includes('\\\\')"))fail('auth callback must reject backslash redirects');

const layout=requireText('app/admin/layout.tsx',[
  "new Set(['editor','scientific_reviewer','seo_manager'])",
  "x-rawafid-pathname",
  "pathname==='/admin'",
  "redirect('/admin/content')",
  'isContentPath(pathname)',
]);
if(!layout.includes("if(editorial&&!fullAdmin&&!isContentPath(pathname))redirect('/account')"))fail('editorial roles must stay scoped to /admin/content');

requireText('lib/supabase/proxy.ts',["headers.set('x-rawafid-pathname', trustedPathname)",'forwardedHeaders()']);
requireText('app/admin/content/new/page.tsx',["['owner', 'admin', 'editor']"]);
requireText('app/admin/content/page.tsx',["new Set(['owner','admin','editor','scientific_reviewer','seo_manager'])",'canCreate']);

const actions=requireText('app/admin/content/actions.ts',['requireContentStaff','requireContentEditor','scheduleContent','restoreVersion']);
if(!actions.includes("const CONTENT_EDITORS = new Set(['owner','admin','editor'])"))fail('body editing role boundary missing');

const editor=read('app/admin/content/[id]/page.tsx');
for(const marker of ['ReleaseContractForm','updateReleaseContract','schema_json','transitionsFor','EDITOR_BODY_STATES','authorityEditable','canRestore'])if(!editor.includes(marker))fail(`content editor missing ${marker}`);
if(editor.includes('name="medical_disclaimer"'))fail('page-specific medical disclaimer editor must not exist');
if(!editor.includes('/disclaimer')||!editor.includes('إخلاء المسؤولية والتنبيهات'))fail('central disclaimer notice missing from CMS');
if(!editor.includes('source_type')||!editor.includes('authority_tier'))fail('reference V6 source metadata missing from editor');

const seo=read('app/admin/content/seo-actions.ts');
for(const marker of ['SOURCE_TYPES','AUTHORITY_TIERS','source_type','authority_tier','p_medical_disclaimer: null'])if(!seo.includes(marker))fail(`SEO V6 source contract missing ${marker}`);

const releaseAction=read('app/admin/content/release-actions.ts');
for(const marker of ['set_content_release_contract_v6','search_intent_questions','claim_source_map','source_versions_reviewed','taxonomy_reviewed','classification_confidence','evidence-led-rewrite','originality_report','page_mechanism','interactive_quality'])if(!releaseAction.includes(marker))fail(`release action missing ${marker}`);

const releaseForm=read('app/admin/content/release-contract-form.tsx');
for(const marker of ['search_intent_questions','claim_source_map','source_versions_reviewed','classification_rationale','mechanism_purpose','mechanism_audience','mechanism_interaction_model','mechanism_content_model','originality_passed','strategic_scientific_value'])if(!releaseForm.includes(marker))fail(`release form missing ${marker}`);

const migration=read('supabase/migrations/20260821154825_cms_release_contract_editor_hardening.sql');
for(const marker of [
  'private.set_content_release_contract_v6',
  'content_contract_version',
  "'disclaimer_url','/disclaimer'",
  "'disclaimer_label','إخلاء المسؤولية والتنبيهات'",
  'medical_disclaimer=null',
  'content_release_contract_v6_update',
  'grant execute on function public.set_content_release_contract_v6(uuid,jsonb) to authenticated, service_role',
  "content_contract_version','') ~ '^[0-9]+$'",
]) if(!migration.includes(marker))fail(`V6 migration missing ${marker}`);

const auditMigration=read('supabase/migrations/20260821113049_cms_audit_integrity_hardening.sql');
for(const marker of ['live or scheduled content must be explicitly withdrawn','content_seo_authority_update','revoke truncate, references, trigger','revoke maintain'])if(!auditMigration.includes(marker))fail(`audit migration sync missing ${marker}`);

if(!process.exitCode)console.log('Rawafid CMS workflow, V6 release contract, role boundary and integrity contract passed.');
