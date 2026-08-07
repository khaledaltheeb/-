const base=process.env.SMOKE_BASE_URL||'http://127.0.0.1:3000';
const publicRoutes=['/','/theme-preview','/search','/specialists','/centers','/community','/about','/offline','/share','/manifest.webmanifest','/sw.js','/robots.txt'];
const protectedRoutes=['/messages','/appointments','/notifications','/account','/admin'];
let failed=false;
for(const route of publicRoutes){try{const response=await fetch(`${base}${route}`,{redirect:'manual'});if(response.status<200||response.status>=400){console.error(`PUBLIC ${route}: ${response.status}`);failed=true;}else console.log(`PUBLIC ${route}: ${response.status}`);}catch(error){console.error(`PUBLIC ${route}:`,error);failed=true;}}
for(const route of protectedRoutes){try{const response=await fetch(`${base}${route}`,{redirect:'manual'});const location=response.headers.get('location')||'';if(![301,302,303,307,308].includes(response.status)||!location.includes('/login')){console.error(`PROTECTED ${route}: expected login redirect, got ${response.status} ${location}`);failed=true;}else console.log(`PROTECTED ${route}: ${response.status} -> login`);}catch(error){console.error(`PROTECTED ${route}:`,error);failed=true;}}
if(failed)process.exit(1);console.log('Rawafid production HTTP smoke checks passed.');
