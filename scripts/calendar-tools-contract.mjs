import fs from 'node:fs';const read=(p)=>fs.readFileSync(p,'utf8');let failed=false;const fail=(m)=>{console.error(`CALENDAR TOOLS CONTRACT FAILED: ${m}`);failed=true};const student=read('components/student-calendar-planner.tsx');const women=read('components/women-calendar-tracker.tsx');const sp=read('app/sectors/calendars/students/page.tsx');const wp=read('app/sectors/calendars/women/page.tsx');
if(!student.includes("rawafid:student-calendar:v1")||!student.includes('reviewDays=[1,3,7,14,30]')||!student.includes('rawafid-study-calendar.ics'))fail('student planner must restore local tasks, spaced review and ICS export');
if(student.includes('fetch('))fail('student planner must not transmit student data');
if(!sp.includes('تقويم الطلاب التفاعلي')||!sp.includes('المراجعة المتباعدة'))fail('student historical route must contain transferred functionality and learning context');
if(!women.includes("rawafid:women-calendar:v1")||!women.includes("pain:number")||!women.includes("bleeding:'none'|'light'|'moderate'|'heavy'"))fail('women tracker must restore the historical local tracking dimensions');
if(women.includes('fetch('))fail('women tracker must not transmit sensitive tracking data');
if(!wp.includes('لا تتنبأ الصفحة بالإباضة أو الحمل')||!wp.includes('لا ترسل بيانات المتابعة'))fail('women route must state non-prediction and privacy limits');
if(failed)process.exit(1);console.log('Calendar tools contract passed: student planning and women tracking restored locally without network transmission.');
