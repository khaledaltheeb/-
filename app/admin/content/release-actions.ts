'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const CONTENT_STAFF = new Set(['owner','admin','editor','scientific_reviewer','seo_manager']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function field(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}
function lines(formData: FormData, key: string, maxItems: number, maxItemLength: number) {
  return field(formData, key, 50000)
    .split('\n')
    .map((value) => value.trim().replace(/\s+/g, ' ').slice(0, maxItemLength))
    .filter(Boolean)
    .slice(0, maxItems);
}
function claims(formData: FormData) {
  return lines(formData, 'claim_source_map', 200, 2500).flatMap((line) => {
    const separator = line.indexOf('|');
    if (separator < 1) return [];
    const claim = line.slice(0, separator).trim().slice(0, 1600);
    const sources = line.slice(separator + 1).split(/[،,;]/).map((value) => value.trim().slice(0, 500)).filter(Boolean).slice(0, 20);
    return claim && sources.length ? [{ claim, sources }] : [];
  });
}
function count(formData: FormData, key: string) {
  const raw = field(formData, key, 12);
  if (!raw) return 0;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 && value <= 10_000_000 ? value : -1;
}

async function requireContentStaff() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !CONTENT_STAFF.has(profile.role)) redirect('/account');
  return supabase;
}

export async function updateReleaseContract(formData: FormData) {
  const supabase = await requireContentStaff();
  const id = field(formData, 'id', 60);
  const slug = field(formData, 'slug', 140);
  if (!UUID_RE.test(id)) redirect('/admin/content?error=invalid-input');

  const confidenceRaw = field(formData, 'classification_confidence', 12);
  const confidence = confidenceRaw ? Number(confidenceRaw) : 0;
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) redirect(`/admin/content/${id}?error=invalid-classification-confidence`);

  const generatedTrials = count(formData, 'generated_trials');
  const acceptedCorrect = count(formData, 'accepted_correct_answers');
  const rejectedWrong = count(formData, 'rejected_wrong_answers');
  const errorCount = count(formData, 'error_count');
  if ([generatedTrials, acceptedCorrect, rejectedWrong, errorCount].some((value) => value < 0)) redirect(`/admin/content/${id}?error=invalid-interactive-quality`);

  const pageKindRaw = field(formData, 'page_kind', 20);
  const pageKind = pageKindRaw === 'interactive' ? 'interactive' : 'editorial';
  const privacyModeRaw = field(formData, 'privacy_mode', 40);
  const privacyMode = ['local-only','anonymous-no-storage'].includes(privacyModeRaw) ? privacyModeRaw : '';

  const contract = {
    content_contract_version: 6,
    search_intent_questions: lines(formData, 'search_intent_questions', 100, 1000),
    claim_source_map: claims(formData),
    source_versions_reviewed: lines(formData, 'source_versions_reviewed', 100, 1000),
    taxonomy_reviewed: formData.get('taxonomy_reviewed') === 'on',
    classification_confidence: confidence,
    classification_rationale: field(formData, 'classification_rationale', 8000),
    rewrite_method: formData.get('evidence_led_rewrite') === 'on' ? 'evidence-led-rewrite' : null,
    originality_report: {
      passed: formData.get('originality_passed') === 'on',
      notes: field(formData, 'originality_notes', 4000),
    },
    page_mechanism: {
      purpose: field(formData, 'mechanism_purpose', 4000),
      audience: field(formData, 'mechanism_audience', 4000),
      interaction_model: field(formData, 'mechanism_interaction_model', 4000),
      content_model: field(formData, 'mechanism_content_model', 4000),
    },
    disclaimer_url: '/disclaimer',
    disclaimer_label: 'إخلاء المسؤولية والتنبيهات',
    page_kind: pageKind,
    strategic_scientific_value: field(formData, 'strategic_scientific_value', 20) === 'high' ? 'high' : 'standard',
    uniqueness_rationale: field(formData, 'uniqueness_rationale', 8000),
    interactive_quality: {
      engine_tested: formData.get('engine_tested') === 'on',
      generated_trials: generatedTrials,
      accepted_correct_answers: acceptedCorrect,
      rejected_wrong_answers: rejectedWrong,
      error_count: errorCount,
      privacy_mode: privacyMode || null,
    },
  };

  const { error } = await supabase.rpc('set_content_release_contract_v6', { p_id: id, p_contract: contract });
  if (error) redirect(`/admin/content/${id}?error=release-contract-update-failed`);

  revalidatePath(`/admin/content/${id}`);
  revalidatePath('/admin/content');
  if (slug) revalidatePath(`/content/${slug}`);
  redirect(`/admin/content/${id}?ok=release-contract-saved`);
}
