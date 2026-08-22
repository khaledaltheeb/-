import fs from 'node:fs';
const read=(file)=>fs.readFileSync(file,'utf8');
const fail=(message)=>{console.error(`FINAL HARDENING FAILED: ${message}`);process.exitCode=1;};
const requireText=(file,needles)=>{if(!fs.existsSync(file)){fail(`missing ${file}`);return;}const body=read(file);for(const needle of needles)if(!body.includes(needle))fail(`${file} missing ${needle}`);};
const numericConstant=(body,name)=>{const match=body.match(new RegExp(`const\\s+${name}\\s*=\\s*(\\d+)`));return match?Number(match[1]):null;};

requireText('lib/content-editor-payload.ts',["'image'","'faq'",'alt.length < 3','version:3']);
requireText('app/admin/content/block-editor.tsx',["image: 'صورة داخل المحتوى'","faq: 'أسئلة شائعة'",'Alt Text إلزامي']);
requireText('components/content-renderer.tsx',["type === 'image'","type === 'faq'",'content-inline-image','content-faq']);
requireText('app/content/[slug]/page.tsx',['FAQPage','MedicalCondition','visibleFaq']);
requireText('supabase/migrations/20260807190000_content_scheduling_restore.sql',['schedule_content','publish_due_content','restore_content_version','rawafid-publish-due-content']);
requireText('app/admin/content/schedule-form.tsx',['datetime-local','toISOString']);
requireText('app/admin/content/actions.ts',['schedule_content','restore_content_version']);
requireText('supabase/migrations/20260807190500_content_relations_tags.sql',['admin_upsert_tag','set_content_relations','admin_delete_tag_safe']);
requireText('app/admin/tags/page.tsx',['الوسوم الدلالية']);
requireText('app/admin/content/[id]/relations/page.tsx',['category_ids','tag_ids']);
requireText('lib/sitemap-xml.ts',['sitemapIndexResponse','sitemapindex']);
requireText('app/sitemap.xml/route.ts',['sitemapIndexResponse','content.xml?page=']);
requireText('app/sitemaps/content.xml/route.ts',['DB_BATCH_SIZE','for (let batchStart = pageStart','.range(batchStart, batchEnd)','.eq(\'robots_index\', true)']);

const sitemapIndex=read('app/sitemap.xml/route.ts');
for(const name of ['PAGE_SIZE','QUICK_INFO_PAGE_SIZE','ENCYCLOPEDIA_PAGE_SIZE']){
  const value=numericConstant(sitemapIndex,name);
  if(value===null) fail(`app/sitemap.xml/route.ts missing numeric ${name}`);
  else if(value<1||value>50000) fail(`app/sitemap.xml/route.ts ${name} must stay within the Sitemap protocol limit (1..50000), got ${value}`);
}

const contentSitemap=read('app/sitemaps/content.xml/route.ts');
const contentPageSize=numericConstant(contentSitemap,'PAGE_SIZE');
const dbBatchSize=numericConstant(contentSitemap,'DB_BATCH_SIZE');
if(contentPageSize===null) fail('content sitemap missing numeric PAGE_SIZE');
else if(contentPageSize<1||contentPageSize>50000) fail(`content sitemap PAGE_SIZE must stay within 1..50000, got ${contentPageSize}`);
if(dbBatchSize===null) fail('content sitemap missing numeric DB_BATCH_SIZE');
else if(dbBatchSize<1||dbBatchSize>1000) fail(`content sitemap DB_BATCH_SIZE must stay within the safe Supabase read window 1..1000, got ${dbBatchSize}`);
if(contentPageSize!==null&&dbBatchSize!==null&&contentPageSize%dbBatchSize!==0) fail('content sitemap PAGE_SIZE must be divisible by DB_BATCH_SIZE for deterministic batching');

if(fs.existsSync('app/sitemap.ts'))fail('monolithic app/sitemap.ts must not coexist with sitemap index');
if(!process.exitCode)console.log('Rawafid final hardening regression contract passed.');
