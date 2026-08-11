'use client';

import { useMemo, useState } from 'react';

type BlockType = 'paragraph' | 'heading' | 'list' | 'quote' | 'callout' | 'table' | 'resource' | 'image' | 'faq' | 'divider';
type FaqItem = { question: string; answer: string };
type EditorBlock = {
  id: string;
  type: BlockType;
  text?: string;
  level?: 2 | 3 | 4;
  ordered?: boolean;
  items?: string[];
  faqItems?: FaqItem[];
  cite?: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  caption?: string;
  headers?: string[];
  rows?: string[][];
  label?: string;
  url?: string;
  description?: string;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
};

type Props = { bodyJson?: unknown; bodyText?: string | null };

const labels: Record<BlockType, string> = {
  paragraph: 'فقرة', heading: 'عنوان فرعي', list: 'قائمة', quote: 'اقتباس', callout: 'معلومة بارزة', table: 'جدول', resource: 'مصدر خارجي', image: 'صورة داخل المحتوى', faq: 'أسئلة شائعة', divider: 'فاصل',
};

function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function asObject(value: unknown): Record<string, unknown> | null { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function toText(value: unknown) { return typeof value === 'string' ? value : ''; }
function toStrings(value: unknown) { return Array.isArray(value) ? value.map(toText).filter(Boolean) : []; }
function toNumber(value: unknown, fallback: number) { const number=Number(value); return Number.isFinite(number)&&number>=100&&number<=4000?Math.round(number):fallback; }
function toFaq(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => { const entry=asObject(item); if(!entry)return[]; const question=toText(entry.question); const answer=toText(entry.answer); return question||answer?[{question,answer}]:[]; });
}

function normalizeBlock(value: unknown): EditorBlock | null {
  const block = asObject(value); if (!block) return null;
  const type = toText(block.type) as BlockType;
  if (!Object.hasOwn(labels, type)) return null;
  if (type === 'paragraph') return { id: uid(), type, text: toText(block.text) };
  if (type === 'heading') return { id: uid(), type, text: toText(block.text), level: [2,3,4].includes(Number(block.level)) ? Number(block.level) as 2|3|4 : 2 };
  if (type === 'list') return { id: uid(), type, ordered: block.ordered === true, items: toStrings(block.items) };
  if (type === 'quote') return { id: uid(), type, text: toText(block.text), cite: toText(block.cite) };
  if (type === 'callout') { const tone = ['info','success','warning','danger'].includes(toText(block.tone)) ? toText(block.tone) as EditorBlock['tone'] : 'info'; return { id: uid(), type, title: toText(block.title), text: toText(block.text), tone }; }
  if (type === 'table') { const rows = Array.isArray(block.rows) ? block.rows.map((row) => toStrings(row)) : []; return { id: uid(), type, caption: toText(block.caption), headers: toStrings(block.headers), rows }; }
  if (type === 'resource') return { id: uid(), type, label: toText(block.label), url: toText(block.url), description: toText(block.description) };
  if (type === 'image') return { id:uid(),type,src:toText(block.src),alt:toText(block.alt),caption:toText(block.caption),width:toNumber(block.width,1200),height:toNumber(block.height,675) };
  if (type === 'faq') return { id:uid(),type,faqItems:toFaq(block.items) };
  return { id: uid(), type: 'divider' };
}

function initialBlocks(bodyJson: unknown, bodyText?: string | null) {
  const root = asObject(bodyJson);
  const blocks = Array.isArray(root?.blocks) ? root.blocks.map(normalizeBlock).filter(Boolean) as EditorBlock[] : [];
  if (blocks.length) return blocks;
  const paragraphs = String(bodyText ?? '').split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  return paragraphs.length ? paragraphs.map((text) => ({ id: uid(), type: 'paragraph' as const, text })) : [{ id: uid(), type: 'paragraph' as const, text: '' }];
}

function clean(block: EditorBlock) {
  const { id: _id, faqItems, ...rest } = block; void _id;
  if (block.type === 'table') return { ...rest, headers: block.headers ?? [], rows: block.rows ?? [] };
  if (block.type === 'list') return { ...rest, items: block.items ?? [] };
  if (block.type === 'faq') return { type:'faq', items:faqItems ?? [] };
  return rest;
}
function asPlainText(blocks: EditorBlock[]) {
  return blocks.flatMap((block) => {
    if (block.type === 'list') return block.items ?? [];
    if (block.type === 'table') return [block.caption ?? '', ...(block.headers ?? []), ...(block.rows ?? []).flat()];
    if (block.type === 'resource') return [block.label ?? '', block.description ?? ''];
    if (block.type === 'image') return [block.alt ?? '',block.caption ?? ''];
    if (block.type === 'faq') return (block.faqItems ?? []).flatMap((item)=>[item.question,item.answer]);
    if (block.type === 'divider') return [];
    return [block.title ?? '', block.text ?? '', block.cite ?? ''];
  }).map((value) => value.trim()).filter(Boolean).join('\n\n');
}
function faqText(items:FaqItem[]|undefined){return (items??[]).map((item)=>`${item.question} | ${item.answer}`).join('\n');}
function parseFaq(value:string):FaqItem[]{return value.split('\n').slice(0,40).map((line)=>{const split=line.indexOf('|');return split<0?{question:line.trim(),answer:''}:{question:line.slice(0,split).trim(),answer:line.slice(split+1).trim()};});}

function newBlock(type: BlockType): EditorBlock {
  if (type === 'heading') return { id: uid(), type, level: 2, text: '' };
  if (type === 'list') return { id: uid(), type, ordered: false, items: [''] };
  if (type === 'quote') return { id: uid(), type, text: '', cite: '' };
  if (type === 'callout') return { id: uid(), type, tone: 'info', title: '', text: '' };
  if (type === 'table') return { id: uid(), type, caption: '', headers: ['العنوان 1','العنوان 2'], rows: [['','']] };
  if (type === 'resource') return { id: uid(), type, label: '', url: '', description: '' };
  if (type === 'image') return { id:uid(),type,src:'',alt:'',caption:'',width:1200,height:675 };
  if (type === 'faq') return { id:uid(),type,faqItems:[{question:'',answer:''}] };
  if (type === 'divider') return { id: uid(), type };
  return { id: uid(), type: 'paragraph', text: '' };
}

export default function BlockEditor({ bodyJson, bodyText }: Props) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => initialBlocks(bodyJson, bodyText));
  const [newType, setNewType] = useState<BlockType>('paragraph');
  const serialized = useMemo(() => JSON.stringify({ version: 3, format: 'blocks', blocks: blocks.map(clean) }), [blocks]);
  const plain = useMemo(() => asPlainText(blocks), [blocks]);
  const patch = (id: string, change: Partial<EditorBlock>) => setBlocks((current) => current.map((block) => block.id === id ? { ...block, ...change } as EditorBlock : block));
  const move = (index: number, delta: number) => setBlocks((current) => { const target = index + delta; if (target < 0 || target >= current.length) return current; const copy = [...current]; [copy[index], copy[target]] = [copy[target], copy[index]]; return copy; });
  const remove = (id: string) => setBlocks((current) => current.length === 1 ? current : current.filter((block) => block.id !== id));

  return <section className="block-editor" aria-labelledby="block-editor-title">
    <input type="hidden" name="body_json" value={serialized} /><input type="hidden" name="body_text" value={plain} />
    <div className="block-editor-heading"><div><h2 id="block-editor-title">محتوى الصفحة</h2><p>ابنِ الصفحة من وحدات منظمة. لا HTML ولا JSON يدوي. الصور داخل المحتوى تتطلب رابط HTTPS وAlt واضحًا.</p></div><span>{blocks.length} وحدة</span></div>
    <div className="block-editor-list">
      {blocks.map((block, index) => <article className="editor-block" key={block.id}>
        <header><div><span className="block-number">{index + 1}</span><strong>{labels[block.type]}</strong></div><div className="block-controls"><button type="button" onClick={() => move(index,-1)} disabled={index===0} aria-label="تحريك لأعلى">↑</button><button type="button" onClick={() => move(index,1)} disabled={index===blocks.length-1} aria-label="تحريك لأسفل">↓</button><button className="danger" type="button" onClick={() => remove(block.id)} disabled={blocks.length===1}>حذف</button></div></header>
        {block.type === 'paragraph' && <textarea rows={6} value={block.text ?? ''} onChange={(event) => patch(block.id,{ text:event.target.value })} maxLength={20000} placeholder="اكتب الفقرة..." />}
        {block.type === 'heading' && <div className="block-inline"><select value={block.level ?? 2} onChange={(event) => patch(block.id,{ level:Number(event.target.value) as 2|3|4 })}><option value={2}>H2</option><option value={3}>H3</option><option value={4}>H4</option></select><input value={block.text ?? ''} onChange={(event) => patch(block.id,{ text:event.target.value })} maxLength={500} placeholder="عنوان القسم" /></div>}
        {block.type === 'list' && <><label className="block-check"><input type="checkbox" checked={block.ordered ?? false} onChange={(event) => patch(block.id,{ ordered:event.target.checked })} /> قائمة مرقمة</label><textarea rows={6} value={(block.items ?? []).join('\n')} onChange={(event) => patch(block.id,{ items:event.target.value.split('\n') })} placeholder="عنصر واحد في كل سطر" /></>}
        {block.type === 'quote' && <div className="block-stack"><textarea rows={4} value={block.text ?? ''} onChange={(event) => patch(block.id,{ text:event.target.value })} maxLength={5000} placeholder="نص الاقتباس" /><input value={block.cite ?? ''} onChange={(event) => patch(block.id,{ cite:event.target.value })} maxLength={500} placeholder="المصدر أو القائل — اختياري" /></div>}
        {block.type === 'callout' && <div className="block-stack"><div className="block-inline"><select value={block.tone === 'success' ? 'success' : 'info'} onChange={(event) => patch(block.id,{ tone:event.target.value as EditorBlock['tone'] })}><option value="info">معلومة</option><option value="success">نصيحة</option></select><input value={block.title ?? ''} onChange={(event) => patch(block.id,{ title:event.target.value })} maxLength={300} placeholder="عنوان المعلومة" /></div><textarea rows={4} value={block.text ?? ''} onChange={(event) => patch(block.id,{ text:event.target.value })} maxLength={7000} placeholder="النص" /></div>}
        {block.type === 'table' && <div className="block-stack"><input value={block.caption ?? ''} onChange={(event) => patch(block.id,{ caption:event.target.value })} maxLength={300} placeholder="عنوان الجدول — اختياري" /><input value={(block.headers ?? []).join(' | ')} onChange={(event) => patch(block.id,{ headers:event.target.value.split('|').map((item)=>item.trim()) })} placeholder="رأس 1 | رأس 2 | رأس 3" /><textarea rows={6} value={(block.rows ?? []).map((row)=>row.join(' | ')).join('\n')} onChange={(event) => patch(block.id,{ rows:event.target.value.split('\n').map((row)=>row.split('|').map((cell)=>cell.trim())) })} placeholder={'قيمة 1 | قيمة 2 | قيمة 3\nقيمة 1 | قيمة 2 | قيمة 3'} /><small>استخدم | للفصل بين الأعمدة وسطرًا جديدًا لكل صف.</small></div>}
        {block.type === 'resource' && <div className="block-stack"><input value={block.label ?? ''} onChange={(event) => patch(block.id,{ label:event.target.value })} maxLength={500} placeholder="اسم المصدر" /><input dir="ltr" type="url" value={block.url ?? ''} onChange={(event) => patch(block.id,{ url:event.target.value })} maxLength={2000} placeholder="https://" /><textarea rows={3} value={block.description ?? ''} onChange={(event) => patch(block.id,{ description:event.target.value })} maxLength={2000} placeholder="وصف مختصر للمصدر — اختياري" /></div>}
        {block.type === 'image' && <div className="block-stack"><input dir="ltr" type="url" value={block.src ?? ''} onChange={(event)=>patch(block.id,{src:event.target.value})} maxLength={2000} placeholder="https:// رابط الصورة من مكتبة الوسائط" /><input value={block.alt ?? ''} onChange={(event)=>patch(block.id,{alt:event.target.value})} maxLength={500} required placeholder="Alt Text إلزامي: ماذا تعرض الصورة؟" /><input value={block.caption ?? ''} onChange={(event)=>patch(block.id,{caption:event.target.value})} maxLength={1000} placeholder="تعليق الصورة — اختياري" /><div className="block-inline"><label>العرض<input type="number" min={100} max={4000} value={block.width ?? 1200} onChange={(event)=>patch(block.id,{width:Number(event.target.value)})}/></label><label>الارتفاع<input type="number" min={100} max={4000} value={block.height ?? 675} onChange={(event)=>patch(block.id,{height:Number(event.target.value)})}/></label></div></div>}
        {block.type === 'faq' && <div className="block-stack"><textarea rows={9} value={faqText(block.faqItems)} onChange={(event)=>patch(block.id,{faqItems:parseFaq(event.target.value)})} maxLength={120000} placeholder={'ما هو السؤال؟ | الإجابة الواضحة الظاهرة للمستخدم\nسؤال آخر؟ | إجابة أخرى'} /><small>سؤال واحد في كل سطر. افصل السؤال والإجابة بعلامة |. تُنشأ FAQ Schema فقط من الأسئلة المكتملة الظاهرة هنا.</small></div>}
        {block.type === 'divider' && <div className="block-divider-preview"><span /></div>}
      </article>)}
    </div>
    <div className="block-add"><label>إضافة وحدة<select value={newType} onChange={(event) => setNewType(event.target.value as BlockType)}>{Object.entries(labels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><button type="button" className="secondary-action" onClick={() => setBlocks((current) => [...current,newBlock(newType)])}>+ إضافة</button></div>
    <p className="block-editor-note">يُنشئ النظام نسخة نصية تلقائيًا للبحث وإمكانية الاسترجاع، بينما يبقى العرض النهائي مبنيًا من الوحدات المنظمة.</p>
  </section>;
}
