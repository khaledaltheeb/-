'use client';

import { useState } from 'react';
import { scheduleContent } from './actions';

export default function ScheduleForm({id,slug}:{id:string;slug:string}){
  const [local,setLocal]=useState('');
  const iso=local&&!Number.isNaN(new Date(local).getTime())?new Date(local).toISOString():'';
  return <form action={scheduleContent} className="schedule-content-form">
    <input type="hidden" name="id" value={id}/><input type="hidden" name="slug" value={slug}/><input type="hidden" name="scheduled_at" value={iso}/>
    <label>موعد النشر<input type="datetime-local" required value={local} onChange={(event)=>setLocal(event.target.value)}/></label>
    <button className="workflow-button publish" type="submit" disabled={!iso}>جدولة النشر</button>
    <small>يحوّل المتصفح الوقت المحلي المختار إلى UTC قبل الحفظ.</small>
  </form>;
}
