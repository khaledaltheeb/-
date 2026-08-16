'use client';
import {useMemo,useState} from 'react';
import type {HistoricalAssessment} from '@/lib/historical-assessments';
export default function HistoricalAssessmentRunner({instrument}:{instrument:HistoricalAssessment}){
 const [answers,setAnswers]=useState<Array<number|null>>(()=>instrument.items.map(()=>null));
 const complete=answers.every(v=>v!==null);const score=useMemo(()=>answers.reduce<number>((sum,v)=>sum+(v??0),0),[answers]);
 const safety=instrument.safetyItem!==undefined&&(answers[instrument.safetyItem]??0)>0;
 return <section className="section" aria-labelledby="historical-assessment-title"><div className="section-heading"><span>فحص ذاتي محلي</span><h2 id="historical-assessment-title">{instrument.period}</h2><p>اختر إجابة لكل بند. الحساب يتم في المتصفح فقط؛ لا تُرسل الإجابات ولا تُحفظ تلقائيًا.</p></div>
 <fieldset><legend className="sr-only">{instrument.title}</legend>{instrument.items.map((item,index)=><div className="assessment-question" key={item}><p><strong>{(index+1).toLocaleString('ar')}. {item}</strong></p><div className="assessment-options">{instrument.options.map(option=><label key={option.value}><input type="radio" name={`${instrument.slug}-${index}`} checked={answers[index]===option.value} onChange={()=>setAnswers(current=>current.map((value,i)=>i===index?option.value:value))}/><span>{option.label}</span></label>)}</div></div>)}</fieldset>
 {safety?<aside className="medical-disclaimer"><strong>هذا البند يحتاج اهتمامًا مباشرًا</strong><p>وجود أفكار عن الموت أو إيذاء النفس لا يُفسَّر عبر مجموع رقمي فقط. إذا كان هناك خطر فوري أو احتمال تصرف وشيك، استخدم خدمات الطوارئ المحلية أو اطلب مساعدة مباشرة من شخص مؤهل وقريب منك.</p></aside>:null}
 <div className="content-callout info" aria-live="polite"><strong>{complete?'النتيجة':'أكمل جميع البنود لعرض النتيجة'}</strong>{complete?<p>{instrument.scoreNote(score)}</p>:<p>أُجيب عن {answers.filter(v=>v!==null).length.toLocaleString('ar')} من {instrument.items.length.toLocaleString('ar')} بنود.</p>}</div>
 <div className="actions"><button type="button" className="button" onClick={()=>window.print()}>طباعة الصفحة</button><button type="button" className="button" onClick={()=>setAnswers(instrument.items.map(()=>null))}>مسح الإجابات</button></div>
 <p><strong>المصدر:</strong> <a href={instrument.sourceUrl} target="_blank" rel="noopener noreferrer">{instrument.source}</a></p><p>{instrument.licenseNote}</p></section>;
}