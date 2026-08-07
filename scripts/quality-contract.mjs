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

for(const file of ['app/messages/page.tsx','app/messages/[id]/page.tsx','app/messages/new/page.tsx','app/appointments/page.tsx','app/appointments/new/page.tsx','app/notifications/page.tsx']){
 requireText(file,['robots:{index:false','noarchive:true']);
}

requireText('lib/supabase/proxy.ts',["'/messages'","'/appointments'","'/notifications'",".from('redirects')"]);
requireText('public/sw.js',["'/messages'","'/appointments'","'/notifications'","'/admin'","'/account'"]);

const manifest=JSON.parse(read('public/manifest.webmanifest'));
for(const key of ['name','short_name','start_url','scope','display','theme_color','background_color','icons']){if(!manifest[key])fail(`manifest missing ${key}`);}
if(!Array.isArray(manifest.icons)||manifest.icons.length===0)fail('manifest requires at least one icon');
if(!manifest.share_target?.action)fail('manifest share_target missing');

for(const file of [
 'supabase/migrations/20260807173000_messaging_core_hardening.sql',
 'supabase/migrations/20260807174000_appointments_core_hardening.sql',
 'supabase/migrations/20260807175000_admin_audit_redirect_hardening.sql',
 'supabase/migrations/20260807176000_messaging_recent_window_fix.sql',
 'supabase/migrations/20260807177000_audit_redirect_least_privilege.sql',
]){
 if(!fs.existsSync(path.join(root,file)))fail(`missing migration ${file}`);
}

requireText('supabase/migrations/20260807173000_messaging_core_hardening.sql',['start_conversation','send_message','set_user_block','report_conversation','revoke all on public.conversations']);
requireText('supabase/migrations/20260807174000_appointments_core_hardening.sql',['request_appointment','provider_update_appointment','requester_cancel_appointment']);
requireText('supabase/migrations/20260807175000_admin_audit_redirect_hardening.sql',['redirect loop detected','admin_audit_log','admin_upsert_redirect']);

if(!process.exitCode)console.log('Rawafid architecture/privacy/PWA quality contract passed.');
