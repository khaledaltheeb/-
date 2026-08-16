'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { DailyToolDirectoryItem } from '@/lib/daily-tools-preserved';

function norm(value:string){return value.toLocaleLowerCase('ar').replace(/[إأآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim();}
export default function DailyToolsDirectory({items}:{items:DailyToolDirectoryItem[]}){
 const [query,setQuery]=useState('');
 const visible=useMemo(()=>{const q=norm(query);return q?items.filter(item=>norm(`${item.title} ${item.description}`).includes(q)):items;},[items,query]);
 return <section className="section" aria-labelledby="daily-tools-directory-title"><div className="section-heading"><span>150 أداة عملية</span><h2 id="daily-tools-directory-title">ابحث عن الأداة بحسب الحاجة</h2><p>البحث محلي داخل قائمة الأدوات ولا يرسل الكلمات التي تكتبها إلى الخادم.</p></div><label className="field" htmlFor="daily-tools-search">بحث في الأدوات<input id="daily-tools-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="مثال: نوم، حدود، تركيز، دعم" maxLength={100}/></label><p aria-live="polite">{visible.length.toLocaleString('ar')} أداة ظاهرة من {items.length.toLocaleString('ar')}</p><div className="related-content-grid">{visible.map(item=><article key={item.href}><h3><Link href={item.href}>{item.title}</Link></h3>{item.description?<p>{item.description}</p>:null}<Link href={item.href}>فتح الأداة ←</Link></article>)}</div></section>;
}
