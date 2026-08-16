'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { TerminologyToolTerm } from '@/lib/terminology-tools';
import styles from '@/app/tools/tools.module.css';
const KEY='rawafid:term-favorites:v1';

export default function TermFavorites({ terms }: { terms: TerminologyToolTerm[] }) {
  const [favorites,setFavorites]=useState<string[]>([]); const [selected,setSelected]=useState(terms[0]?.slug??'');
  const bySlug=useMemo(()=>new Map(terms.map((term)=>[term.slug,term])),[terms]);
  useEffect(()=>{try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(value))setFavorites(value.filter((x):x is string=>typeof x==='string'&&bySlug.has(x)).slice(0,100))}catch{}},[bySlug]);
  function persist(next:string[]){setFavorites(next);try{localStorage.setItem(KEY,JSON.stringify(next))}catch{}}
  function add(){if(selected&&!favorites.includes(selected))persist([...favorites,selected].slice(0,100))}
  return <div className={styles.panel}><div className={styles.form}><label>اختر مصطلحًا<select value={selected} onChange={(event)=>setSelected(event.target.value)}>{terms.map((term)=><option value={term.slug} key={term.slug}>{term.title}</option>)}</select></label><button type="button" onClick={add}>إضافة إلى المحفوظات</button></div><div className={styles.privacy}><strong>الخصوصية:</strong> يُحفظ فقط معرّف المصطلح داخل localStorage في هذا المتصفح. لا تُرسل قائمة المحفوظات إلى روافد ولا ترتبط بحسابك.</div><h2>المصطلحات المحفوظة</h2>{favorites.length?<ul className={styles.favoriteList}>{favorites.map((slug)=>{const term=bySlug.get(slug);return term?<li key={slug}><Link className={styles.link} href={term.canonicalUrl}>{term.title}</Link><button type="button" onClick={()=>persist(favorites.filter((item)=>item!==slug))}>إزالة</button></li>:null})}</ul>:<p>لا توجد محفوظات على هذا الجهاز بعد.</p>}</div>;
}
