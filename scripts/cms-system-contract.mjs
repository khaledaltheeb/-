import fs from 'node:fs';

const read=(path)=>fs.readFileSync(path,'utf8');
const fail=(message)=>{console.error(`CMS SYSTEM CONTRACT FAILED: ${message}`);process.exitCode=1;};
const requireFile=(path)=>{if(!fs.existsSync(path))fail(`missing ${path}`);};
const requireText=(path,needles)=>{const source=read(path);for(const needle of needles)if(!source.includes(needle))fail(`${path} missing ${needle}`);return source;};

const requiredFiles=[
  'app/admin/content/page.tsx',
  'app/admin/content/new/page.tsx',
  'app/admin/content/[id]/page.tsx',
  'app/admin/content/[id]/relations/page.tsx',
  'app/admin/content/actions.ts',
  'app/admin/content/seo-actions.ts',
  'app/admin/content/release-actions.ts',
  'app/admin/content/release-contract-form.tsx',
  'app/admin/content/revision-actions.ts',
  'app/admin/content/content-form.tsx',
  'app/admin/layout.tsx',
  'lib/supabase/proxy.ts',
  'supabase/migrations/20260818154018_replace_legacy_promoter_with_release_contract_tag.sql',
  'supabase/migrations/20260818154221_centralize_legacy_authoritative_reference_domains.sql',
  'supabase/migrations/20260821113049_cms_audit_integrity_hardening.sql',
  'supabase/migrations/20260821154825_cms_release_contract_editor_hardening.sql',
  'supabase/migrations/20260821155526_cms_release_contract_rpc_least_privilege.sql',
  'supabase/migrations/20260821160036_reconcile_legacy_promoted_draft_publish_state.sql',
  'supabase/migrations/20260821160229_guard_referenced_media_deletion.sql',
  'supabase/migrations/20260821160526_published_content_zero_downtime_revisions.sql',
  'supabase/migrations/20260821161620_version_content_relations_and_revision_concurrency.sql',
  'supabase/migrations/20260821162055_content_revision_fingerprint_concurrency_guard.sql',
  'supabase/migrations/20260821162411_complete_content_version_relation_snapshots.sql',
  'supabase/migrations/20260821162804_reconcile_content_primary_category_relations.sql',
];
for(const path of requiredFiles)requireFile(path);
if(fs.existsSync('supabase/migrations/20260818154000_legacy_release_pipeline_repair.sql'))fail('stale combined legacy migration must not diverge from production migration history');

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
requireText('app/admin/content/page.tsx',["new Set(['owner','admin','editor','scientific_reviewer','seo_manager'])",'canCreate','نسخة تحريرية','revisionTarget','RELATION_EDITABLE']);

const actions=requireText('app/admin/content/actions.ts',['requireContentStaff','requireContentEditor','scheduleContent','restoreVersion']);
if(!actions.includes("const CONTENT_EDITORS = new Set(['owner','admin','editor'])"))fail('body editing role boundary missing');

const editor=read('app/admin/content/[id]/page.tsx');
for(const marker of ['ReleaseContractForm','updateReleaseContract','schema_json','transitionsFor','EDITOR_BODY_STATES','authorityEditable','canRestore','beginPublishedRevision','applyPublishedRevision','Zero-Downtime Revision','revisionMode={isRevision}','contains(\'schema_json\',{revision_of:record.id})','fullAdmin&&editable'])if(!editor.includes(marker))fail(`content editor missing ${marker}`);
if(editor.includes('name="medical_disclaimer"'))fail('page-specific medical disclaimer editor must not exist');
if(!editor.includes('/disclaimer')||!editor.includes('إخلاء المسؤولية والتنبيهات'))fail('central disclaimer notice missing from CMS');
if(!editor.includes('source_type')||!editor.includes('authority_tier'))fail('reference V6 source metadata missing from editor');
if(!editor.includes("record.status==='approved'&&!isRevision"))fail('revisions must never use the normal scheduling UI');

const relationsPage=read('app/admin/content/[id]/relations/page.tsx');
for(const marker of ['const EDITABLE=new Set','relations-require-editable-revision','هذه العلاقات تخص النسخة التحريرية فقط','حفظ العلاقات كنسخة جديدة'])if(!relationsPage.includes(marker))fail(`relation editor missing ${marker}`);

const contentForm=read('app/admin/content/content-form.tsx');
for(const marker of ['revisionMode=false','readOnly={revisionMode}','نسخة التحرير Noindex دائماً','الـCanonical ثابت أثناء Revision'])if(!contentForm.includes(marker))fail(`revision content form missing ${marker}`);

const revisionActions=read('app/admin/content/revision-actions.ts');
for(const marker of ['create_published_content_revision','apply_published_content_revision',"new Set(['owner','admin','editor'])",'revision-apply-failed'])if(!revisionActions.includes(marker))fail(`revision server action missing ${marker}`);

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

const leastPrivilege=read('supabase/migrations/20260821155526_cms_release_contract_rpc_least_privilege.sql');
for(const marker of [
  'revoke execute on function public.set_content_release_contract_v6(uuid,jsonb) from anon',
  'revoke execute on function private.set_content_release_contract_v6(uuid,jsonb) from anon',
  'grant execute on function public.set_content_release_contract_v6(uuid,jsonb) to authenticated, service_role',
]) if(!leastPrivilege.includes(marker))fail(`V6 least-privilege migration missing ${marker}`);

const auditMigration=read('supabase/migrations/20260821113049_cms_audit_integrity_hardening.sql');
for(const marker of ['live or scheduled content must be explicitly withdrawn','content_seo_authority_update','revoke truncate, references, trigger','revoke maintain'])if(!auditMigration.includes(marker))fail(`audit migration sync missing ${marker}`);

const stateReconcile=read('supabase/migrations/20260821160036_reconcile_legacy_promoted_draft_publish_state.sql');
for(const marker of ['PROMOTED_DRAFT','legacy_promoted_draft_state_reconciled','content_published_requires_published_at',"status <> 'published'::public.content_status or published_at is not null"])if(!stateReconcile.includes(marker))fail(`published-state integrity migration missing ${marker}`);

const mediaGuard=read('supabase/migrations/20260821160229_guard_referenced_media_deletion.sql');
for(const marker of ['media asset is referenced by content','media asset is referenced by a profile','media asset is referenced by a center','featured_image_url','body_json','schema_json'])if(!mediaGuard.includes(marker))fail(`referenced-media guard missing ${marker}`);

const revisionMigration=read('supabase/migrations/20260821160526_published_content_zero_downtime_revisions.sql');
for(const marker of [
  'private.content_revision_state_guard',
  'private.create_published_content_revision',
  'private.apply_published_content_revision',
  'content revisions cannot be scheduled or published directly',
  'revision_source_updated_at',
  'live content changed after this revision started; start a fresh revision before applying',
  'published revision cannot change canonical identity',
  "status='published'::public.content_status",
  'published_at=v_live.published_at',
  'published_revision_applied',
  'revoke all on function public.create_published_content_revision(uuid) from public,anon',
  'revoke all on function public.apply_published_content_revision(uuid) from public,anon',
]) if(!revisionMigration.includes(marker))fail(`zero-downtime revision migration missing ${marker}`);

const relationMigration=read('supabase/migrations/20260821161620_version_content_relations_and_revision_concurrency.sql');
for(const marker of [
  'private.content_snapshot_with_relations',
  "'_relations'",
  'live or scheduled content relations must be changed through an editable revision',
  'content relations can only be changed in an editable workflow state',
  'taxonomy_relations_updated',
  "v_relations:=v_snapshot->'_relations'",
  'relations_restored',
  'private.content_snapshot_with_relations(v_target_id)',
]) if(!relationMigration.includes(marker))fail(`relation versioning migration missing ${marker}`);

const fingerprintMigration=read('supabase/migrations/20260821162055_content_revision_fingerprint_concurrency_guard.sql');
for(const marker of [
  'private.content_revision_fingerprint',
  'private.content_snapshot_with_relations(p_content_id)',
  'revision_source_fingerprint',
  'v_current_fingerprint',
  'revision_workflow_version',
  'live content changed after this revision started; start a fresh revision before applying',
]) if(!fingerprintMigration.includes(marker))fail(`revision fingerprint migration missing ${marker}`);

const completeSnapshots=read('supabase/migrations/20260821162411_complete_content_version_relation_snapshots.sql');
for(const marker of [
  'private.sync_content_primary_category_relation',
  'zz_generic_content_primary_category_sync',
  'private.enrich_content_version_snapshot_relations',
  'content_versions_relations_snapshot_guard',
  "new.snapshot - '_relations'",
  "'categories'",
  "'tags'",
]) if(!completeSnapshots.includes(marker))fail(`complete version snapshot migration missing ${marker}`);

const primaryReconcile=read('supabase/migrations/20260821162804_reconcile_content_primary_category_relations.sql');
for(const marker of [
  'primary_category_relation_reconciled',
  'previous_primary_relations_preserved_as_secondary',
  'private.content_snapshot_with_relations',
  'cc.category_id=c.category_id and cc.is_primary=true',
]) if(!primaryReconcile.includes(marker))fail(`primary category reconciliation migration missing ${marker}`);

const historicalPromoter=read('supabase/migrations/20260818154018_replace_legacy_promoter_with_release_contract_tag.sql');
if(!historicalPromoter.includes("'migration_release_contract_version',1"))fail('production-aligned legacy promoter release tag missing');
const historicalGate=read('supabase/migrations/20260818154221_centralize_legacy_authoritative_reference_domains.sql');
for(const marker of ['private.is_recognized_authoritative_reference_url','private.content_release_gate_legacy'])if(!historicalGate.includes(marker))fail(`production-aligned legacy gate missing ${marker}`);

if(!process.exitCode)console.log('Rawafid CMS workflow, V6 release contract, zero-downtime revisions, fingerprint concurrency, complete relation snapshots, primary category reconciliation, role boundary and integrity contract passed.');
