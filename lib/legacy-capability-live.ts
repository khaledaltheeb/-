import { createClient } from '@/lib/supabase/server';
import type { CapabilityRecord } from '@/lib/capabilities';

export async function getPublishedLegacyCapabilityRecord(routeSlug: string): Promise<CapabilityRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select(
      'id,slug,title,excerpt,body_json,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json',
    )
    .eq('slug', `legacy-capability-${routeSlug}`)
    .eq('canonical_url', `/capabilities/${routeSlug}/`)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  return (data as CapabilityRecord | null) ?? null;
}
