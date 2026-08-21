'use client';

import { useMemo, useState } from 'react';
import { requestAppointment } from '../actions';

type Props = {
  specialistId?: string;
  centerId?: string;
  conversationId?: string;
  remote: boolean;
  inPerson: boolean;
};

function toLocalInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function AppointmentRequestForm({ specialistId, centerId, conversationId, remote, inPerson }: Props) {
  const [localStart, setLocalStart] = useState('');
  const [startsAtUtc, setStartsAtUtc] = useState('');
  const [timeError, setTimeError] = useState('');
  const minimumLocal = useMemo(() => toLocalInputValue(new Date(Date.now() + 20 * 60_000)), []);

  function syncTime(value: string) {
    setLocalStart(value);
    if (!value) {
      setStartsAtUtc('');
      setTimeError('اختر وقتًا مقترحًا للموعد.');
      return;
    }
    const parsed = new Date(value);
    if (!Number.isFinite(parsed.getTime())) {
      setStartsAtUtc('');
      setTimeError('الوقت المحدد غير صالح.');
      return;
    }
    if (parsed.getTime() < Date.now() + 15 * 60_000) {
      setStartsAtUtc('');
      setTimeError('اختر موعدًا يبعد 15 دقيقة على الأقل عن الوقت الحالي.');
      return;
    }
    setStartsAtUtc(parsed.toISOString());
    setTimeError('');
  }

  return (
    <form action={requestAppointment} className="communication-form appointment-form">
      {specialistId && <input type="hidden" name="specialist_id" value={specialistId} />}
      {centerId && <input type="hidden" name="center_id" value={centerId} />}
      {conversationId && <input type="hidden" name="conversation_id" value={conversationId} />}
      <input type="hidden" name="starts_at_utc" value={startsAtUtc} />
      <input type="hidden" name="client_timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'} />
      <label>
        الوقت المقترح حسب توقيت جهازك
        <input
          type="datetime-local"
          required
          min={minimumLocal}
          value={localStart}
          onChange={(event) => syncTime(event.currentTarget.value)}
          aria-invalid={Boolean(timeError)}
          aria-describedby={timeError ? 'appointment-time-error' : undefined}
        />
      </label>
      {timeError && <div id="appointment-time-error" className="system-message error" role="alert">{timeError}</div>}
      <label>
        نمط الموعد
        <select name="mode" required defaultValue={remote ? 'remote' : inPerson ? 'in_person' : 'other'}>
          {remote && <option value="remote">عن بُعد</option>}
          {inPerson && <option value="in_person">حضوري</option>}
          <option value="phone">هاتف</option>
          <option value="other">يُحدد لاحقًا</option>
        </select>
      </label>
      <label>
        ملاحظة للجهة
        <textarea name="note" rows={5} maxLength={2000} placeholder="سبب التواصل أو أي معلومة لازمة لترتيب الموعد، دون معلومات حساسة غير ضرورية." />
      </label>
      <button className="primary-action" type="submit" disabled={!startsAtUtc || Boolean(timeError)}>إرسال طلب الموعد</button>
      <small>يحوّل النظام الوقت المحلي المحدد إلى UTC قبل التخزين، ثم يعرضه لاحقًا حسب منطقة المستخدم. الوقت المقترح لا يصبح موعدًا مؤكدًا إلا بعد قبول الجهة.</small>
    </form>
  );
}
