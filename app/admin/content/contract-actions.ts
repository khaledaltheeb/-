'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_RE = /^[0-9a-f]{64}$/;

function field(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}

function integer(formData: FormData, key: string, fallback = 0) {
  const parsed = Number(field(formData, key, 30));
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function decimal(formData: FormData, key: string, fallback = 0) {
  const parsed = Number(field(formData, key, 30));
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
}

function lines(formData: FormData, key: string, max: number, maxItems: number) {
  return field(formData, key, max).split('\n').map((line) => line.trim()).filter(Boolean).slice(0, maxItems);
}

function sourceVersions(formData: FormData) {
  const rows = lines(formData, 'source_versions', 50000, 100);
  const parsed = rows.map((line) => {
    const [path = '', sha256 = '', ...decisionParts] = line.split('|').map((part) => part.trim());
    return { path: path.slice(0, 1200), sha256: sha256.toLowerCase(), decision: decisionParts.join(' | ').slice(0, 4000) };
  });
  return parsed.every((row) => row.path && SHA256_RE.test(row.sha256) && row.decision) ? parsed : null;
}

function claimMap(formData: FormData) {
  const rows = lines(formData, 'claim_source_map', 50000, 150);
  const parsed = rows.map((line) => {
    const [claim = '', ...idParts] = line.split('|').map((part) => part.trim());
    const reference_ids = idParts.join('|').split(',').map((id) => id.trim()).filter(Boolean).slice(0, 20);
    return { claim: claim.slice(0, 6000), reference_ids };
  });
  return parsed.every((row) => row.claim && row.reference_ids.length) ? parsed : null;
}

export async function updateContentContractV6(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner', 'admin', 'editor', 'scientific_reviewer', 'seo_manager', 'specialist'].includes(profile.role)) redirect('/account');
  const editorPath = profile.role === 'specialist' ? '/specialist/content' : '/admin/content';

  const id = field(formData, 'id', 60);
  const slug = field(formData, 'slug', 140);
  const versions = sourceVersions(formData);
  const claims = claimMap(formData);
  if (!UUID_RE.test(id) || versions === null || claims === null) redirect(`${editorPath}/${id}?error=invalid-v6-contract`);

  const pageKind = field(formData, 'page_kind', 30);
  const strategic = field(formData, 'strategic_scientific_value', 30);
  const migrationPhase = field(formData, 'migration_phase', 40);
  const privacyMode = field(formData, 'privacy_mode', 40);
  if (!['editorial', 'interactive'].includes(pageKind)
    || !['standard', 'high'].includes(strategic)
    || !['standard', 'encyclopedia-last'].includes(migrationPhase)
    || !['local-only', 'anonymous-no-storage'].includes(privacyMode)) {
    redirect(`${editorPath}/${id}?error=invalid-v6-contract`);
  }

  const contract = {
    content_contract_version: 6,
    page_kind: pageKind,
    strategic_scientific_value: strategic,
    disclaimer_url: '/disclaimer',
    disclaimer_label: 'إخلاء المسؤولية والتنبيهات',
    search_intent_questions: lines(formData, 'search_intent_questions', 12000, 40),
    source_versions_reviewed: versions,
    claim_source_map: claims,
    page_mechanism: {
      purpose: field(formData, 'mechanism_purpose', 2000),
      audience: field(formData, 'mechanism_audience', 2000),
      interaction_model: field(formData, 'mechanism_interaction', 2000),
      content_model: field(formData, 'mechanism_content', 2000),
    },
    rewrite_method: 'evidence-led-rewrite',
    taxonomy_reviewed: formData.get('taxonomy_reviewed') === 'on',
    classification_confidence: decimal(formData, 'classification_confidence'),
    classification_rationale: field(formData, 'classification_rationale', 5000),
    originality_report: {
      passed: formData.get('originality_passed') === 'on',
      longest_verbatim_run_words: integer(formData, 'longest_verbatim_run_words'),
      legacy_sentence_reuse_ratio: decimal(formData, 'legacy_sentence_reuse_ratio'),
    },
    uniqueness_rationale: field(formData, 'uniqueness_rationale', 6000),
    interactive_quality: {
      contract_version: 1,
      engine_tested: formData.get('engine_tested') === 'on',
      generated_trials: integer(formData, 'generated_trials'),
      accepted_correct_answers: integer(formData, 'accepted_correct_answers'),
      rejected_wrong_answers: integer(formData, 'rejected_wrong_answers'),
      error_count: integer(formData, 'error_count'),
      privacy_mode: privacyMode,
    },
    migration_phase: migrationPhase,
    encyclopedia_release_authorized: formData.get('encyclopedia_release_authorized') === 'on',
  };

  const { error } = await supabase.rpc('set_content_contract_v6', { p_id: id, p_contract: contract });
  if (error) redirect(`${editorPath}/${id}?error=v6-contract-save-failed`);
  revalidatePath(`${editorPath}/${id}`);
  if (slug) revalidatePath(`/content/${slug}`);
  redirect(`${editorPath}/${id}?ok=v6-contract-saved`);
}
