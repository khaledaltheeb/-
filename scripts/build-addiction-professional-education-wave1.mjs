import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'data', 'addiction-professional-education');
const migrationPath = path.join(root, 'supabase', 'migrations', '20260903233500_addiction_professional_education_wave1_drafts.sql');

const landing = JSON.parse(fs.readFileSync(path.join(dataDir, 'addiction-education.json'), 'utf8'));
const coreText = [1,2,3,4,5].map((n) => fs.readFileSync(path.join(dataDir, `addiction-education-core-competencies.part${n}.txt`), 'utf8')).join('');
const core = JSON.parse(coreText);
const pages = [landing, core];

const fail = (msg) => { throw new Error(msg); };
const blocks = (p) => p?.body_json?.blocks ?? [];
const refs = (p) => p?.references_json ?? [];
const https = (v) => typeof v === 'string' && /^https:\/\//.test(v);
const exact = new Map([
  ['addiction-education', { route:'/addiction/education/', type:'landing_page', category:'addiction-professional-education', minBlocks:30 }],
  ['addiction-education-core-competencies', { route:'/addiction/education/core-competencies/', type:'learning_path', category:'addiction-education-core-competencies', minBlocks:80 }],
]);

if (pages.length !== 2) fail('expected exactly two wave1 pages');
for (const p of pages) {
  const x = exact.get(p.slug); if (!x) fail(`unexpected slug ${p.slug}`);
  if (p.canonical_url !== x.route || p.content_type !== x.type || p.category_slug !== x.category) fail(`${p.slug}: route/type/category mismatch`);
  if (blocks(p).length < x.minBlocks) fail(`${p.slug}: sparse structured body`);
  if (refs(p).length < 10 || refs(p).some((r) => !https(r.url))) fail(`${p.slug}: references invalid`);
  if (p.schema_json?.publication_ready !== false) fail(`${p.slug}: draft must not be publication-ready`);
  if (p.schema_json?.endorsement_status !== 'none-claimed') fail(`${p.slug}: endorsement guard missing`);
  if (!String(p.schema_json?.rights_note ?? '').includes('Original Arabic')) fail(`${p.slug}: rights guard missing`);
}
if (core.schema_json?.competency_domains !== 16) fail('core competency domain count must be 16');

function q(value) {
  if (value == null) return 'null';
  const s = String(value);
  let tag = '$rawafid$'; let n = 0;
  while (s.includes(tag)) tag = `$rawafid${++n}$`;
  return `${tag}${s}${tag}`;
}
function json(value) { return `${q(JSON.stringify(value))}::jsonb`; }
function textArray(value) { return `array[${value.map(q).join(',')}]::text[]`; }
function flattenBody(page) {
  const out=[];
  for (const b of blocks(page)) {
    if (b.type === 'heading' || b.type === 'paragraph') out.push(b.text ?? '');
    else if (b.type === 'callout') out.push([b.title,b.text].filter(Boolean).join('\n'));
    else if (b.type === 'list') out.push((b.items ?? []).join('\n'));
    else if (b.type === 'table') { out.push(b.caption ?? ''); out.push((b.headers ?? []).join(' | ')); for (const r of b.rows ?? []) out.push(r.join(' | ')); }
    else if (b.type === 'resource') out.push([b.label,b.description,b.url].filter(Boolean).join('\n'));
    else if (b.type === 'faq') for (const item of b.items ?? []) out.push(`${item.question}\n${item.answer}`);
  }
  return out.filter(Boolean).join('\n\n');
}

const statements = ['begin;'];
for (const p of pages) {
  const disclaimer = 'محتوى تعليمي مهني عام لا يشخّص حالة فردية ولا يمنح ترخيصًا أو اعتمادًا. القرارات السريرية والصلاحيات والتوفر القانوني والخدمات المحلية يجب التحقق منها في السياق المهني والوطني المناسب.';
  statements.push(`
insert into public.content (
 slug,title,excerpt,body_json,body_text,content_type,sector_id,category_id,audience,status,
 seo_title,seo_description,canonical_url,robots_index,robots_follow,schema_json,
 primary_keyword,secondary_keywords,semantic_terms,search_intent,author_display_name,references_json,
 medical_disclaimer,published_at,last_reviewed_at
)
select
 ${q(p.slug)},${q(p.title)},${q(p.excerpt)},${json(p.body_json)},${q(flattenBody(p))},${q(p.content_type)},
 s.id,c.id,${textArray(p.audience)},'draft'::public.content_status,
 ${q(p.seo_title)},${q(p.seo_description)},${q(p.canonical_url)},false,false,${json(p.schema_json)},
 ${q(p.primary_keyword)},${textArray(p.secondary_keywords)},${textArray(p.semantic_terms)},${q(p.search_intent)},${q('منصة روافد')},${json(p.references_json)},
 ${q(disclaimer)},null,null
from public.sectors s
join public.categories c on c.sector_id=s.id and c.slug=${q(p.category_slug)}
where s.slug='addiction-recovery'
on conflict (slug) do update set
 title=excluded.title, excerpt=excluded.excerpt, body_json=excluded.body_json, body_text=excluded.body_text,
 content_type=excluded.content_type, sector_id=excluded.sector_id, category_id=excluded.category_id,
 audience=excluded.audience, status='draft'::public.content_status, seo_title=excluded.seo_title,
 seo_description=excluded.seo_description, canonical_url=excluded.canonical_url, robots_index=false,
 robots_follow=false, schema_json=excluded.schema_json, primary_keyword=excluded.primary_keyword,
 secondary_keywords=excluded.secondary_keywords, semantic_terms=excluded.semantic_terms,
 search_intent=excluded.search_intent, author_display_name=excluded.author_display_name,
 references_json=excluded.references_json, medical_disclaimer=excluded.medical_disclaimer,
 published_at=null, last_reviewed_at=null, updated_at=now();

insert into public.content_categories(content_id,category_id,is_primary)
select x.id,c.id,true from public.content x join public.categories c on c.slug=${q(p.category_slug)} where x.slug=${q(p.slug)}
on conflict (content_id,category_id) do update set is_primary=excluded.is_primary;
`);
}
statements.push(`
insert into public.content_categories(content_id,category_id,is_primary)
select x.id,c.id,false from public.content x join public.categories c on c.slug='addiction-professional-education'
where x.slug='addiction-education-core-competencies'
on conflict (content_id,category_id) do update set is_primary=excluded.is_primary;

do $$
declare v_count integer; v_active integer;
begin
  select count(*) into v_count from public.content
  where slug in ('addiction-education','addiction-education-core-competencies') and status='draft' and robots_index=false and published_at is null;
  if v_count <> 2 then raise exception 'professional education wave1 expected 2 private drafts, found %', v_count; end if;
  select count(*) into v_active from public.categories c join public.sectors s on s.id=c.sector_id
  where s.slug='addiction-recovery' and (c.slug='addiction-professional-education' or c.slug like 'addiction-education-%') and c.is_active=true;
  if v_active <> 0 then raise exception 'professional education taxonomy must remain inactive during wave1'; end if;
end $$;
commit;
`);

fs.writeFileSync(migrationPath, statements.join('\n'), 'utf8');
console.log(JSON.stringify({
  pages: pages.map((p) => ({ slug:p.slug, blocks:blocks(p).length, refs:refs(p).length, bodyChars:flattenBody(p).length })),
  migrationPath,
}, null, 2));
