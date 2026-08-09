import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import ContentDisclaimerLink from '@/components/content-disclaimer-link';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;
type ReferenceItem = { title?: string; url?: string; publisher?: string; year?: string | number };
type RelatedItem = { id: string; slug: string; title: string; excerpt: string | null; content_type: string; score: number };
type JsonRecord = Record<string,unknown>;
type FaqItem = { question:string; answer:string };

async function getPublished(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('content').select('id,slug,title,excerpt,body_json,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,search_intent,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,sector_id,category_id,sectors(slug,name_ar),categories(slug,name_ar)').eq('slug', slug).eq('status', 'published').lte('published_at', new Date().toISOString()).maybeSingle();
  return data;
}
function asRecord(value:unknown):JsonRecord|null{return value&&typeof value==='object'&&!Array.isArray(value)?value as JsonRecord:null;}
function safeReferences(value: unknown): ReferenceItem[] { if (!Array.isArray(value)) return []; return value.slice(0,100).flatMap((item)=>{ if(!item||typeof item!=='object'||Array.isArray(item))return[]; const ref=item as Record<string,unknown>; const url=typeof ref.url==='string'&&/^https:\/\//i.test(ref.url)?ref.url:undefined; const title=typeof ref.title==='string'?ref.title.slice(0,400):undefined; const publisher=typeof ref.publisher==='string'?ref.publisher.slice(0,240):undefined; const year=typeof ref.year==='string'||typeof ref.year==='number'?ref.year:undefined; return title||url?[{title,url,publisher,year}]:[]; }); }
function visibleFaq(value:unknown):FaqItem[]{const root=asRecord(value);const blocks=Array.isArray(root?.blocks)?root.blocks:[];return blocks.flatMap((block)=>{const item=asRecord(block);if(!item||item.type!=='faq'||!Array.isArray(item.items))return[];return item.items.flatMap((entry)=>{const row=asRecord(entry);const question=typeof row?.question==='string'?row.question.trim().slice(0,500):'';const answer=typeof row?.answer==='string'?row.answer.trim().slice(0,6000):'';return question.length>=3&&answer.length>=3?[{question,answer}]:[];});}).slice(0,40);}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params; const record = await getPublished(slug); if (!record) return {};
  const title = record.seo_title || record.title; const canonical = record.canonical_url || `/content/${record.slug}`;
  const keywords = [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? []).slice(0, 10)].filter(Boolean) as string[];
  return buildSeoMetadata({ title, description: record.seo_description || record.excerpt, path: canonical, index: record.robots_index, follow: record.robots_follow, type: ['article','guide','research','news','condition','protocol','intervention','assessment'].includes(record.content_type) ? 'article' : 'website', image: record.featured_image_url, keywords, publishedTime: record.published_at, modifiedTime: record.updated_at, authors: record.author_display_name ? [{ name: record.author_display_name }] : undefined });
}

export default async function PublishedContentPage({ params }: { params: Params }) {
  const { slug } = await params; const record = await getPublished(slug); if (!record) notFound();
  const supabase = await createClient(); const { data: relatedData } = await supabase.rpc('related_public_content', { p_content_id: record.id, p_limit: 6 });
  const related = (Array.isArray(relatedData) ? relatedData : []) as RelatedItem[];
  const sector = Array.isArray(record.sectors) ? record.sectors[0] : record.sectors; const category = Array.isArray(record.categories) ? record.categories[0] : record.categories;
  const audiences = Array.isArray(record.audience) ? record.audience.map((item: unknown) => String(item)) : []; const references = safeReferences(record.references_json);
  const canonical = record.canonical_url || `/content/${record.slug}`; const url = canonical.startsWith('https://') ? canonical : `${SITE_URL}${canonical}`;
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' },...(sector ? [{ name: sector.name_ar, path: `/sectors/${sector.slug}` }] : []),...(category ? [{ name: category.name_ar, path: `/sections/${category.slug}` }] : []),{ name: record.title, path: canonical }]);
  const medicalTypes = new Set(['condition','protocol','intervention','assessment']); const schemaType = medicalTypes.has(record.content_type) ? 'MedicalWebPage' : ['article','guide','research','news'].includes(record.content_type) ? 'Article' : 'WebPage';
  const conditionId=`${url}#condition`;
  const termId=`${url}#defined-term`;
  const contentSchema:Record<string,unknown> = { '@context': 'https://schema.org', '@type': schemaType, '@id': `${url}#content`, url, headline: record.title, description: record.seo_description || record.excerpt || undefined, inLanguage: 'ar', datePublished: record.published_at || undefined, dateModified: record.updated_at || undefined, lastReviewed: record.last_reviewed_at || undefined, author: record.author_display_name ? { '@type': 'Person', name: record.author_display_name } : { '@id': `${SITE_URL}/#organization` }, reviewedBy: record.reviewer_display_name ? { '@type': 'Person', name: record.reviewer_display_name, description: record.reviewer_credentials || undefined } : undefined, publisher: { '@id': `${SITE_URL}/#organization` }, image: record.featured_image_url || undefined, keywords: [record.primary_keyword, ...(record.secondary_keywords ?? [])].filter(Boolean).join(', ') || undefined, isPartOf: { '@id': `${SITE_URL}/#website` } };
  const conditionSchema=record.content_type==='condition'?{'@context':'https://schema.org','@type':'MedicalCondition','@id':conditionId,name:record.title,description:record.seo_description||record.excerpt||undefined,url,alternateName:(record.secondary_keywords??[]).slice(0,8)}:null;
  const termSchema=record.content_type==='glossary_term'?{'@context':'https://schema.org','@type':'DefinedTerm','@id':termId,name:record.title,description:record.seo_description||record.excerpt||undefined,url,inLanguage:'ar',alternateName:[...(record.secondary_keywords??[]),...(record.semantic_terms??[])].slice(0,12),...(category?{inDefinedTermSet:{'@type':'DefinedTermSet','@id':`${SITE_URL}/sections/${category.slug}#termset`,name:category.name_ar,url:`${SITE_URL}/sections/${category.slug}`}}:{})}:null;
  if(conditionSchema)contentSchema.about={'@id':conditionId};
  if(termSchema)contentSchema.about={'@id':termId};
  const faqItems=visibleFaq(record.body_json);
  const faqSchema=faqItems.length?{'@context':'https://schema.org','@type':'FAQPage','@id':`${url}#faq`,mainEntity:faqItems.map((item)=>({'@type':'Question',name:item.question,acceptedAnswer:{'@type':'Answer',text:item.answer}}))}:null;
  const schemas=[breadcrumbs,contentSchema,...(conditionSchema?[conditionSchema]:[]),...(termSchema?[termSchema]:[]),...(faqSchema?[faqSchema]:[])];

  return <><SiteHeader /><main className="article-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} /><nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link>{sector && <><span>/</span><Link href={`/sectors/${sector.slug}`}>{sector.name_ar}</Link></>}{category && <><span>/</span><Link href={`/sections/${category.slug}`}>{category.name_ar}</Link></>}<span>/</span><span aria-current="page">{record.title}</span></nav><article><header className="article-hero"><span className="eyebrow">{record.content_type}</span><h1>{record.title}</h1>{record.excerpt && <p>{record.excerpt}</p>}<div className="article-meta">{record.author_display_name && <span>إعداد: {record.author_display_name}</span>}{record.reviewer_display_name && <span>مراجعة: {record.reviewer_display_name}{record.reviewer_credentials ? ` — ${record.reviewer_credentials}` : ''}</span>}{record.published_at && <span>نُشر {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.published_at))}</span>}{record.last_reviewed_at && <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.last_reviewed_at))}</span>}</div>{audiences.length > 0 && <div className="tag-list">{audiences.map((audience) => <span key={audience}>{audience}</span>)}</div>}</header><div className="article-body">{record.featured_image_url && <figure className="article-featured-image"><Image src={record.featured_image_url} alt={record.featured_image_alt || record.title} width={1200} height={675} sizes="(max-width: 900px) 100vw, 900px" priority unoptimized /><figcaption className="sr-only">{record.featured_image_alt || record.title}</figcaption></figure>}<ContentRenderer bodyJson={record.body_json} bodyText={record.body_text} recordId={record.id} /></div><ContentDisclaimerLink />{related.length > 0 && <section className="article-related" aria-labelledby="related-title"><div className="section-mini-heading"><div><span className="eyebrow">Topical Authority</span><h2 id="related-title">محتوى مرتبط</h2></div><span>اختيار دلالي حسب القسم والقطاع والمصطلحات</span></div><div className="related-content-grid">{related.map((item) => <article key={item.id}><span>{item.content_type}</span><h3><Link href={`/content/${item.slug}`}>{item.title}</Link></h3>{item.excerpt && <p>{item.excerpt}</p>}<Link href={`/content/${item.slug}`}>متابعة القراءة ←</Link></article>)}</div></section>}{references.length > 0 && <section className="article-references" aria-labelledby="references-title"><h2 id="references-title">المصادر والمراجع</h2><ol>{references.map((reference, index) => <li key={`${reference.url || reference.title}-${index}`}>{reference.url ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title || reference.url}</a> : <span>{reference.title}</span>}{reference.publisher && <small>{reference.publisher}</small>}{reference.year && <small>{String(reference.year)}</small>}</li>)}</ol></section>}</article></main><SiteFooter /></>;
}
