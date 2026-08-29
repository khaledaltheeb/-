'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { DailyToolDirectoryItem } from '@/lib/daily-tools-preserved';

const INITIAL_LIMIT = 12;
function norm(value:string){return value.toLocaleLowerCase('ar').replace(/[إأآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim();}

export default function DailyToolsDirectory({items}:{items:DailyToolDirectoryItem[]}){
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('الكل');
  const [limit,setLimit]=useState(INITIAL_LIMIT);
  const categories=useMemo(()=>['الكل',...Array.from(new Set(items.map(item=>item.category)))],[items]);
  const filtered=useMemo(()=>{
    const q=norm(query);
    return items.filter(item=>{
      const categoryMatch=category==='الكل'||item.category===category;
      const queryMatch=!q||norm(`${item.title} ${item.description} ${item.category}`).includes(q);
      return categoryMatch&&queryMatch;
    });
  },[items,query,category]);
  const visible=filtered.slice(0,limit);
  const updateCategory=(value:string)=>{setCategory(value);setLimit(INITIAL_LIMIT);};
  const updateQuery=(value:string)=>{setQuery(value);setLimit(INITIAL_LIMIT);};

  return <section className="daily-tools-directory" aria-labelledby="daily-tools-directory-title">
    <div className="daily-tools-intro">
      <div>
        <span className="daily-tools-kicker">150 أداة عملية</span>
        <h2 id="daily-tools-directory-title">اختر ما تحتاجه الآن، لا ما يشبه اسم المشكلة</h2>
        <p>ابحث بالكلمة أو اختر مجالًا. لا تُرسل عبارة البحث إلى الخادم، وتظهر لك مجموعة صغيرة أولًا بدل إغراقك بـ150 خيارًا.</p>
      </div>
      <div className="daily-tools-privacy-note" aria-label="خصوصية الأدوات">
        <strong>خصوصية محلية</strong>
        <span>البحث والتصفية يعملان داخل المتصفح.</span>
      </div>
    </div>

    <div className="daily-tools-search-panel">
      <label htmlFor="daily-tools-search">
        <span>ما الذي تحتاج مساعدة فيه؟</span>
        <input id="daily-tools-search" type="search" value={query} onChange={e=>updateQuery(e.target.value)} placeholder="مثال: نوم، قلق، حدود، تركيز، موعد، دعم" maxLength={100}/>
      </label>
      <div className="daily-tools-category-list" aria-label="تصفية الأدوات حسب المجال">
        {categories.map(value=><button key={value} type="button" className={category===value?'is-active':''} aria-pressed={category===value} onClick={()=>updateCategory(value)}>{value}</button>)}
      </div>
    </div>

    <div className="daily-tools-results-bar">
      <p aria-live="polite"><strong>{filtered.length.toLocaleString('ar')}</strong> أداة مطابقة</p>
      {(query||category!=='الكل')?<button type="button" onClick={()=>{setQuery('');setCategory('الكل');setLimit(INITIAL_LIMIT);}}>مسح التصفية</button>:null}
    </div>

    {visible.length ? <div className="daily-tools-grid">
      {visible.map(item=><article className="daily-tool-card" key={item.href}>
        <div className="daily-tool-card-meta"><span>{item.category}</span><span>{item.duration}</span><span>بدون تسجيل</span></div>
        <h3><Link href={item.href}>{item.title}</Link></h3>
        <p>{item.description}</p>
        <Link className="daily-tool-card-action" href={item.href} aria-label={`فتح أداة ${item.title}`}>ابدأ الأداة <span aria-hidden="true">←</span></Link>
      </article>)}
    </div> : <div className="daily-tools-empty" role="status"><h3>لم نجد أداة بهذه العبارة</h3><p>جرّب كلمة أوسع مثل «نوم»، «توتر»، «تركيز»، «تواصل» أو اختر مجالًا من الأعلى.</p></div>}

    {visible.length<filtered.length?<div className="daily-tools-more"><button type="button" onClick={()=>setLimit(current=>current+12)}>عرض 12 أداة إضافية</button><span>يظهر الآن {visible.length.toLocaleString('ar')} من {filtered.length.toLocaleString('ar')}</span></div>:null}
  </section>;
}
