import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const fail=(message)=>{console.error(`QUALITY CONTRACT FAILED: ${message}`);process.exitCode=1;};
const requireText=(file,needles)=>{const body=read(file);for(const needle of needles){if(!body.includes(needle))fail(`${file} missing ${needle}`);}};

const sensitiveTables=['conversations','conversation_participants','messages','appointments','notifications','user_blocks','conversation_reports'];
const scanDirs=['app','components','lib'];
function walk(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(entry=>{const rel=path.join(dir,entry.name);return entry.isDirectory()?walk(rel):[rel];});}
for(const file of scanDirs.flatMap(walk).filter(file=>/\.(ts|tsx|js|mjs)$/.test(file))){
 const body=read(file);
 for(const table of sensitiveTables){
   const patterns=[`.from('${table}')`,`.from("${table}")`];
   if(patterns.some(pattern=>body.includes(pattern)))fail(`${file} accesses sensitive table ${table} directly; use RPC boundary`);
 }
}

for(const file of ['app/messages/page.tsx','app/messages/[id]/page.tsx','app/messages/new/page.tsx','app/appointments/page.tsx','app/appointments/new/page.tsx','app/notifications/page.tsx','app/specialist/content/page.tsx','app/specialist/content/new/page.tsx','app/specialist/content/[id]/page.tsx']){
 requireText(file,['robots:{index:false','noarchive:true']);
}

requireText('lib/supabase/proxy.ts',["'/messages'","'/appointments'","'/notifications'",".from('redirects')"]);
requireText('public/sw.js',["'/messages'","'/appointments'","'/notifications'","'/admin'","'/account'"]);

const manifest=JSON.parse(read('public/manifest.webmanifest'));
for(const key of ['name','short_name','start_url','scope','display','theme_color','background_color','icons']){if(!manifest[key])fail(`manifest missing ${key}`);}
if(!Array.isArray(manifest.icons)||manifest.icons.length<2)fail('manifest requires PNG PWA icons');
if(!manifest.icons.some((icon)=>icon?.type==='image/png'&&icon?.sizes==='192x192'))fail('manifest missing 192x192 PNG icon');
if(!manifest.icons.some((icon)=>icon?.type==='image/png'&&icon?.sizes==='512x512'&&String(icon?.purpose||'').includes('maskable')))fail('manifest missing 512x512 maskable PNG icon');
if(!manifest.share_target?.action)fail('manifest share_target missing');

for(const file of [
 'supabase/migrations/20260807173000_messaging_core_hardening.sql',
 'supabase/migrations/20260807174000_appointments_core_hardening.sql',
 'supabase/migrations/20260807175000_admin_audit_redirect_hardening.sql',
 'supabase/migrations/20260807176000_messaging_recent_window_fix.sql',
 'supabase/migrations/20260807177000_audit_redirect_least_privilege.sql',
 'supabase/migrations/20260807182000_structured_content_editor.sql',
 'supabase/migrations/20260807182500_content_draft_delete.sql',
 'supabase/migrations/20260807183000_content_release_gate.sql',
]){
 if(!fs.existsSync(path.join(root,file)))fail(`missing migration ${file}`);
}

requireText('supabase/migrations/20260807173000_messaging_core_hardening.sql',['start_conversation','send_message','set_user_block','report_conversation','revoke all on public.conversations']);
requireText('supabase/migrations/20260807174000_appointments_core_hardening.sql',['request_appointment','provider_update_appointment','requester_cancel_appointment']);
requireText('supabase/migrations/20260807175000_admin_audit_redirect_hardening.sql',['redirect loop detected','admin_audit_log','admin_upsert_redirect']);
requireText('supabase/migrations/20260807182000_structured_content_editor.sql',['create_content_draft_v3','update_content_draft_v3','validate_content_body_v3']);
requireText('supabase/migrations/20260807182500_content_draft_delete.sql',['only drafts can be permanently deleted','delete_content_draft']);
requireText('supabase/migrations/20260807183000_content_release_gate.sql',['meta description must be 150-160 characters','scientific reviewer is required for YMYL content','featured image alt text is required','content_release_gate']);

// Empty-theme contract: the UI must not smuggle demo taxonomy/content into a clean database.
const home=read('app/page.tsx');
if(home.includes('fallbackPillars')) fail('homepage must not contain fallback/demo sectors');
for(const needle of ['sectors.length > 0','rawafid-empty','getPublicSectors']) if(!home.includes(needle)) fail(`homepage empty-theme behavior missing ${needle}`);
requireText('app/theme-preview/page.tsx',['index: false','follow: false','Design System V3']);
requireText('app/not-found.tsx',['الصفحة غير موجودة','SiteHeader','SiteFooter']);
requireText('app/loading.tsx',['system-loading-shell','aria-busy']);
requireText('app/error.tsx',["'use client'",'إعادة المحاولة']);
requireText('components/content-renderer.tsx',["type === 'heading'","type === 'list'","type === 'table'","type === 'callout'","type === 'resource'"]);
requireText('app/content/[slug]/page.tsx',['body_json','ContentRenderer']);
requireText('app/admin/content/block-editor.tsx',['body_json','body_text','إضافة وحدة','table','callout']);
requireText('app/admin/content/content-form.tsx',['BlockEditor','bodyJson={record?.body_json}','allowedTypes']);
requireText('lib/content-editor-payload.ts',['sanitizeBody','SITE_URL','SPECIALIST_CONTENT_TYPES','buildContentPayload']);
requireText('app/admin/content/actions.ts',['buildContentPayload','create_content_draft_v3','update_content_draft_v3','delete_content_draft']);
requireText('app/specialist/content/actions.ts',['SPECIALIST_CONTENT_TYPES','create_content_draft_v3','update_content_draft_v3','delete_content_draft','scientific_review']);
requireText('app/specialist/page.tsx',['/specialist/content','/messages','/appointments','/notifications']);
requireText('app/center/page.tsx',['/messages','/appointments','/notifications']);
requireText('app/account/page.tsx',['/messages','/appointments','/notifications']);
requireText('app/admin/layout.tsx',['admin-sidebar','/admin/integrity','/admin/audit','/admin/redirects']);
requireText('app/specialists/[slug]/page.tsx',['verified-label','license-card','can_contact_provider']);
requireText('app/centers/[slug]/page.tsx',['license-card','can_contact_provider','get_public_center']);
requireText('app/community/[slug]/page.tsx',['community-badge','لا تمنح صاحبها صفة مختص مرخص']);
requireText('lib/pwa-icon.ts',['ImageResponse','Cache-Control']);
requireText('app/pwa-icon-180/route.ts',['createPwaIcon(180)']);
requireText('app/pwa-icon-192/route.ts',['createPwaIcon(192)']);
requireText('app/pwa-icon-512/route.ts',['createPwaIcon(512)']);
if(read('app/opengraph-image.tsx').includes("runtime = 'edge'")||read('app/twitter-image.tsx').includes("runtime = 'edge'")) fail('deprecated Edge runtime must not be used for social image routes');
requireText('app/layout.tsx',["'./theme-empty.css'","'./dashboard-v3.css'","'./theme-preview.css'","'./public-modules-v3.css'","'./system-states.css'","'./content-v3.css'","'./structured-content.css'","'./block-editor-v3.css'","'./profile-v3.css'","'./admin-shell-v3.css'","/pwa-icon-180"]);
requireText('.env.example',['NEXT_PUBLIC_SITE_URL=https://healthrenewal.org','NEXT_PUBLIC_ALLOW_INDEXING=false']);
requireText('lib/seo.ts',["'https://healthrenewal.org'"]);

if(!process.exitCode)console.log('Rawafid architecture/privacy/PWA/theme quality contract passed.');
