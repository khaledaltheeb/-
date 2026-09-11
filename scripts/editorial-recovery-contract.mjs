import fs from 'node:fs';

let failed=false;
const fail=(message)=>{console.error(`EDITORIAL_RECOVERY: ${message}`);failed=true;};
const read=(path)=>fs.readFileSync(path,'utf8');
const exists=(path)=>fs.existsSync(path);

for(const path of ['app/media/page.tsx','app/external-review/page.tsx','app/external-review/addiction-safety/page.tsx','lib/editorial-evidence-guides.ts','lib/external-review-program.ts','lib/evidence-guides.ts']){
 if(!exists(path)) fail(`missing recovered file: ${path}`);
}

const editorial=read('lib/editorial-evidence-guides.ts');
const guideCount=(editorial.match(/\bmake\(\{/g)||[]).length;
if(guideCount!==13) fail(`expected exactly 13 repository editorial evidence guides, found ${guideCount}`);
if(!editorial.includes('review_state:\'editorial-published-no-external-review-claim\'')) fail('repository guides lost the no-external-review-claim provenance marker');
if(!editorial.includes('export function findEditorialEvidenceGuide')) fail('repository guide lookup helper is missing');

const evidence=read('lib/evidence-guides.ts');
for(const marker of [
 "import { editorialEvidenceGuides, findEditorialEvidenceGuide } from '@/lib/editorial-evidence-guides'",
 'for(const item of localGuides) merged.set(routeKey(item),item);',
 'for(const item of remote) merged.set(routeKey(item),item);',
 'return mergeGuideItems(rows);',
 'const local=findEditorialEvidenceGuide(safe) as EvidenceGuideRecord|null;'
]) if(!evidence.includes(marker)) fail(`evidence guide fallback/merge contract lost marker: ${marker}`);
if(evidence.indexOf('for(const item of remote) merged.set(routeKey(item),item);')<evidence.indexOf('for(const item of localGuides) merged.set(routeKey(item),item);')) fail('live remote records must retain precedence over repository fallback records');
if(evidence.indexOf('if(r&&isPublishedNow(r.published_at)) return r;')>evidence.indexOf('const local=findEditorialEvidenceGuide(safe) as EvidenceGuideRecord|null;')) fail('detail lookup must prefer a live REST record before repository fallback');

const program=read('lib/external-review-program.ts');
const trackCount=(program.match(/\n \{\n  id:'/g)||[]).length;
if(trackCount!==5) fail(`expected 5 external-review tracks, found ${trackCount}`);
for(const marker of [
 'لا تُعرض أي جهة بوصفها شريكًا أو مراجعًا أو معتمدًا قبل وجود مراجعة أو اتفاق موثق.',
 'لا توجد دعوى بأن ISAM راجعت أو اعتمدت المحتوى حتى الآن.',
 'RDI مذكورة كشبكة مرجعية وهدف استشارة خارجية محتملة، لا كشريك أو مراجع حالي.',
 'ENAT مصدر ومجتمع خبرة مناسب للمراجعة؛ لا توجد دعوى اعتماد أو شراكة.',
 'هذا مسار اختبار مستخدمين مخطط، ولا يوصف بأنه مكتمل قبل جلسة موثقة مع الجمهور المستهدف.'
]) if(!program.includes(marker)) fail(`external-review claims boundary lost: ${marker}`);

const media=read('app/media/page.tsx');
if(!media.includes("path:'/media/'")||!media.includes('ليس معرض صور')) fail('/media route lost its public-purpose boundary');
const review=read('app/external-review/page.tsx');
if(!review.includes("path:'/external-review/'")||!review.includes('اسم جهة مرجعية في هذه الصفحة لا يعني شراكة أو اعتمادًا')) fail('/external-review route lost its transparency boundary');
const addictionReview=read('app/external-review/addiction-safety/page.tsx');
if(!addictionReview.includes("path: '/external-review/addiction-safety'")||!addictionReview.includes('وجود اسم مراجع أو مؤسسة في مراسلة أو دعوة لا يعني اعتمادًا أو شراكة أو تأييدًا')) fail('addiction review package lost its scope/claims boundary');

const footer=read('components/site-footer.tsx');
for(const marker of [
 "{ href: '/all-pages', label: 'فهرس المحتوى المنشور' }",
 "{ href: '/institutions', label: 'للجهات والمؤسسات' }",
 "{ href: '/media', label: 'مركز الوسائط والمواد العملية' }",
 "{ href: '/external-review', label: 'سجل المراجعة الخارجية' }"
]) if(!footer.includes(marker)) fail(`footer discovery lost marker: ${marker}`);

if(failed) process.exit(1);
console.log('EDITORIAL_RECOVERY OK: 13 repository guides, 5 transparent review tracks, scoped addiction review package, media/review routes and remote-first fallback semantics are preserved.');
