import fs from 'node:fs';

const read=(path)=>fs.readFileSync(path,'utf8');
const requireText=(path,needles)=>{const source=read(path);for(const needle of needles){if(!source.includes(needle)){console.error(`PROVIDER SYSTEM CONTRACT FAILED: ${path} missing ${needle}`);process.exitCode=1;}}return source;};
const requireFile=(path)=>{if(!fs.existsSync(path)){console.error(`PROVIDER SYSTEM CONTRACT FAILED: missing ${path}`);process.exitCode=1;}};

for(const path of [
  'app/join/page.tsx','app/join/specialist/page.tsx','app/join/center/page.tsx','app/join/actions.ts','app/dashboard/page.tsx',
  'components/location-map.tsx','app/system-portals-v1.css','supabase/migrations/20260808222000_provider_application_workflow.sql',
  'supabase/migrations/20260808223000_provider_application_read_boundary.sql'
]) requireFile(path);

requireText('app/join/actions.ts',['submit_specialist_application','submit_center_application','requireStandardUser']);
requireText('app/join/specialist/page.tsx',["rpc('get_my_specialist_application'"]);
requireText('app/join/center/page.tsx',["rpc('get_my_center_application'"]);
requireText('app/account/page.tsx',["rpc('get_my_specialist_application'","rpc('get_my_center_application'"]);
requireText('app/admin/specialists/page.tsx',['admin_specialist_queue_v2','verification_note']);
requireText('app/admin/centers/page.tsx',['admin_center_queue_v2','verification_note']);
requireText('app/admin/specialists/actions.ts',['set_specialist_verification_v2','note-required']);
requireText('app/admin/centers/actions.ts',['set_center_verification_v2','note-required']);
requireText('app/login/actions.ts',['safeNext','emailRedirectTo','redirect(next)']);
requireText('app/login/page.tsx',['name="next"','/join']);
requireText('lib/supabase/proxy.ts',["'/dashboard'","'/center'","'/specialist'","url.searchParams.set('next'"]);
requireText('app/messages/actions.ts',["rpc('start_conversation'","rpc('send_message'","rpc('report_conversation'"]);
requireText('app/appointments/actions.ts',["rpc('request_appointment'","rpc('requester_cancel_appointment'","rpc('provider_update_appointment'"]);
requireText('app/centers/[slug]/page.tsx',['LocationMap','public_latitude','public_longitude']);
requireText('app/specialists/[slug]/page.tsx',['LocationMap','public_latitude','public_longitude']);
requireText('app/theme-admin-v4.css',["@import './system-portals-v1.css';"]);

for(const path of ['app/messages/actions.ts','app/appointments/actions.ts']){
  const source=read(path);
  for(const table of ["from('messages')","from('conversations')","from('conversation_participants')","from('appointments')"]){
    if(source.includes(table)){console.error(`PROVIDER SYSTEM CONTRACT FAILED: ${path} bypasses RPC boundary with ${table}`);process.exitCode=1;}
  }
}
for(const path of ['app/join/specialist/page.tsx','app/join/center/page.tsx','app/account/page.tsx']){
  const source=read(path);
  for(const privateColumn of ["from('specialists')","from('centers')"]){
    if(source.includes(privateColumn)){console.error(`PROVIDER SYSTEM CONTRACT FAILED: ${path} bypasses private provider application read RPC`);process.exitCode=1;}
  }
}

const migration=read('supabase/migrations/20260808222000_provider_application_workflow.sql');
for(const marker of ['verification_note','submit_specialist_application','submit_center_application','set_specialist_verification_v2','set_center_verification_v2']){
  if(!migration.includes(marker)){console.error(`PROVIDER SYSTEM CONTRACT FAILED: migration missing ${marker}`);process.exitCode=1;}
}
const readBoundary=read('supabase/migrations/20260808223000_provider_application_read_boundary.sql');
for(const marker of ['get_my_specialist_application','get_my_center_application','revoke all','grant execute']){
  if(!readBoundary.includes(marker)){console.error(`PROVIDER SYSTEM CONTRACT FAILED: read-boundary migration missing ${marker}`);process.exitCode=1;}
}

if(!process.exitCode) console.log('Rawafid provider/auth/messaging/appointments system contract passed.');
