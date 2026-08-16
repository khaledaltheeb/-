'use client';
import { useMemo, useState } from 'react';
import type { TerminologyToolTerm } from '@/lib/terminology-tools';
import styles from '@/app/tools/tools.module.css';

export default function TermQuiz({ terms }: { terms: TerminologyToolTerm[] }) {
  const pool=useMemo(()=>terms.filter((term)=>term.excerpt).slice(0,24),[terms]); const [index,setIndex]=useState(0); const [selected,setSelected]=useState<string>(''); const [score,setScore]=useState(0);
  if(pool.length<4)return <div className={styles.panel}><p>نحتاج أربعة مصطلحات منشورة على الأقل لتشغيل الاختبار.</p></div>;
  const correct=pool[index%pool.length]; const options=[correct,...Array.from({length:3},(_,offset)=>pool[(index+offset+1)%pool.length])].sort((a,b)=>((a.slug.charCodeAt(0)+index)%7)-((b.slug.charCodeAt(0)+index)%7)); const answered=Boolean(selected); const isCorrect=selected===correct.slug;
  function choose(slug:string){if(answered)return;setSelected(slug);if(slug===correct.slug)setScore((value)=>value+1)}
  function next(){setIndex((value)=>(value+1)%pool.length);setSelected('')}
  return <div className={styles.panel}><span className={styles.eyebrow}>السؤال {index+1} · نتيجة الجلسة {score}</span><h2>أي مصطلح يطابق هذا الوصف؟</h2><p>{correct.excerpt}</p><div className={styles.quizOptions}>{options.map((option)=><button type="button" key={option.slug} onClick={()=>choose(option.slug)} disabled={answered}>{option.title}</button>)}</div>{answered&&<div className={styles.status}>{isCorrect?<strong>إجابة صحيحة.</strong>:<><strong>الإجابة الأقرب: {correct.title}.</strong><p>هذه لعبة تعلم؛ الخطأ لا يحمل أي معنى نفسي أو معرفي عن المستخدم.</p></>}<div><button className={styles.button} type="button" onClick={next}>السؤال التالي</button></div></div>}</div>;
}
