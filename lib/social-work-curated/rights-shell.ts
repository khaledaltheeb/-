export type CuratedSource = {
  kind: string;
  title: string;
  publisher?: string;
  href: string;
  note: string;
};

type PageArgs = {
  slug: string;
  title: string;
  description: string;
  kicker: string;
  lead: string;
  evidence: string;
  body: string;
  sources: CuratedSource[];
  limit: string;
  related?: Array<{ href: string; label: string }>;
};

const style = `<style>
:root{--bg:#f4f8f7;--ink:#14251f;--muted:#536760;--line:#cfddd8;--brand:#075d4d;--soft:#e7f3ef;--warm:#fff8e9;--warn:#fff3d8}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Tahoma,Arial,sans-serif;line-height:1.95}a{color:var(--brand);text-underline-offset:.15em}header,main,footer{max-width:1120px;margin:auto;padding:1rem clamp(1rem,3vw,2rem)}.hero,.panel,.note,.sources,.tool,.case{background:#fff;border:1px solid var(--line);border-radius:20px;padding:clamp(1rem,2.4vw,1.5rem);margin:1rem 0}.hero{background:linear-gradient(135deg,var(--soft),#fff 68%,var(--warm))}.kicker{font-weight:800;color:var(--brand);margin:0 0 .35rem}.lead{font-size:1.08rem}.meta,.small{color:var(--muted)}h1{font-size:clamp(2rem,5vw,3.2rem);line-height:1.3;margin:.25rem 0 .7rem}h2{color:var(--brand);line-height:1.45}h3{line-height:1.5}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:.8rem}.card{background:#fbfdfc;border:1px solid var(--line);border-radius:15px;padding:1rem}.card h3{color:var(--brand);margin-top:0}.note{border-inline-start:6px solid #8a4f0b;background:var(--warm)}.caution{border-inline-start:6px solid #9a4c00;background:var(--warn)}.tool{background:#f8fbfa}.case{background:#fffdf7}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;margin:.8rem 0}th,td{border:1px solid var(--line);padding:.72rem;vertical-align:top;text-align:right}th{background:var(--soft);color:#06473c}li{margin:.45rem 0}.links{display:flex;flex-wrap:wrap;gap:.55rem}.links a{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:.35rem .7rem;background:#fff}.source{padding:.85rem 0;border-bottom:1px solid var(--line)}.source:last-child{border-bottom:0}.source-kind{font-weight:800;color:var(--brand)}code{font-family:inherit;background:#eef5f2;border-radius:6px;padding:.1rem .35rem}@media(max-width:720px){table{min-width:720px}.lead{font-size:1rem}}
</style>`;

function sourceHtml(source: CuratedSource) {
  return `<div class="source"><div class="source-kind">${source.kind}</div><p><strong>${source.title}</strong>${source.publisher ? ` — ${source.publisher}` : ''}</p><p>${source.note}</p><p><a href="${source.href}" target="_blank" rel="noopener noreferrer">فتح المصدر</a></p></div>`;
}

export function curatedRightsPage(args: PageArgs) {
  const canonical = `https://healthrenewal.org/evidence-guides/social-work/${args.slug}/`;
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${args.title} | روافد</title><meta name="description" content="${args.description}"><link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">${style}</head><body><header><a href="/"><strong>منصة روافد | Health Renewal</strong></a> · <a href="/evidence-guides/social-work/">العمل الاجتماعي والأسرة والمجتمع</a></header><main data-rawafid-curated-page="2026-09-03"><section class="hero"><p class="kicker">${args.kicker}</p><h1>${args.title}</h1><p class="lead">${args.lead}</p><p class="meta"><strong>موضع الدليل:</strong> ${args.evidence}</p></section>${args.body}${args.related?.length ? `<section class="panel"><h2>صفحات مرتبطة</h2><div class="links">${args.related.map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}</div></section>` : ''}<section class="sources"><h2>المصادر ومنهج الاستدلال</h2>${args.sources.map(sourceHtml).join('')}<div class="note"><strong>حد الاستنتاج:</strong> ${args.limit}</div></section></main><footer>روافد | Health Renewal · مراجعة تحريرية مؤسسية: 3 سبتمبر 2026</footer></body></html>`;
}
