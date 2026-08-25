import fs from 'node:fs';
const read=(file)=>fs.readFileSync(file,'utf8');
const fail=(message)=>{console.error(`FINAL HARDENING FAILED: ${message}`);process.exitCode=1;};
const requireText=(file,needles)=>{if(!fs.existsSync(file)){fail(`missing ${file}`);return;}const body=read(file);for(const needle of needles)if(!body.includes(needle))fail(`${file} missing ${needle}`);};
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
requireText('app/sitemap.xml/route.ts',[
  'const PAGE_SIZE = 5000',
  'const QUICK_INFO_PAGE_SIZE = 5000',
  'const ENCYCLOPEDIA_PAGE_SIZE = 5000',
  'getPsychEncyclopediaReleaseIndex',
  'sitemapIndexResponse',
  'content.xml?page=',
  'quick-info.xml?page=',
  'encyclopedia.xml?page=',
  'encyclopediaTotal',
]);
requireText('app/sitemaps/content.xml/route.ts',[
  'const PAGE_SIZE = 5000',
  'const DB_BATCH_SIZE = 1000',
  '.range(batchStart, batchEnd)',
  ".order('id', { ascending: true })",
]);
requireText('app/sitemaps/quick-info.xml/route.ts',[
  'const PAGE_SIZE = 5000',
  'const DB_BATCH_SIZE = 1000',
  '.range(batchStart, batchEnd)',
  'publicationApproved',
]);
requireText('app/sitemaps/encyclopedia.xml/route.ts',[
  'const PAGE_SIZE = 5000',
  'const DB_BATCH_SIZE = 1000',
  '.range(batchStart, batchEnd)',
  'releaseSlugs',
  'databaseCapacity',
]);
if(fs.existsSync('app/sitemap.ts'))fail('monolithic app/sitemap.ts must not coexist with sitemap index');
if(!process.exitCode)console.log('Rawafid final hardening regression contract passed.');
