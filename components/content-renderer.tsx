import Image from 'next/image';

type UnknownRecord = Record<string, unknown>;
type ContentRendererProps = { bodyJson: unknown; bodyText?: string | null; recordId: string };

function asRecord(value: unknown): UnknownRecord | null { return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : null; }
function text(value: unknown, max = 20000) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }
function stringArray(value: unknown, limit = 100, itemMax = 2000) { return Array.isArray(value) ? value.slice(0, limit).map((item) => text(item, itemMax)).filter(Boolean) : []; }
function validHttpsUrl(value: unknown) { const url = text(value, 2000); return /^https:\/\//i.test(url) ? url : ''; }
function dimension(value: unknown, fallback: number) { const number=Number(value); return Number.isFinite(number)&&number>=100&&number<=4000?Math.round(number):fallback; }
function sectionAnchor(index: number) { return `section-${index + 1}`; }
function countWords(value: string) { return value.split(/\s+/).filter((token) => /[A-Za-z0-9\u0600-\u06ff]/.test(token)).length; }
function normalizeComparable(value: string) { return value.toLocaleLowerCase('ar').replace(/\s+/g, ' ').trim(); }

function blockTextContent(blockValue: unknown) {
  const block = asRecord(blockValue); if (!block) return '';
  const type = text(block.type, 40).toLowerCase();
  if (type === 'paragraph' || type === 'heading') return text(block.text);
  if (type === 'definition' || type === 'answer') return [text(block.term ?? block.title ?? block.question, 500), text(block.definition ?? block.answer ?? block.text, 6000)].filter(Boolean).join(' ');
  if (type === 'list') return stringArray(block.items, 100, 1000).join(' ');
  if (type === 'steps') return [text(block.title, 500), ...stringArray(block.items ?? block.steps, 50, 1500)].filter(Boolean).join(' ');
  if (type === 'quote') return [text(block.text, 5000), text(block.cite, 500)].filter(Boolean).join(' ');
  if (type === 'callout') return [text(block.title, 300), text(block.text, 7000)].filter(Boolean).join(' ');
  if (type === 'table') {
    const headers = stringArray(block.headers, 12, 300);
    const rows = (Array.isArray(block.rows) ? block.rows.slice(0, 100) : []).flatMap((row) => stringArray(row, 12, 1000));
    return [text(block.caption, 300), ...headers, ...rows].filter(Boolean).join(' ');
  }
  if (type === 'resource') return [text(block.label, 500), text(block.description, 2000)].filter(Boolean).join(' ');
  if (type === 'image') return [text(block.alt, 500), text(block.caption, 1000)].filter(Boolean).join(' ');
  if (type === 'faq') {
    const raw = Array.isArray(block.items) ? block.items.slice(0, 40) : [];
    return raw.flatMap((item) => {
      const entry = asRecord(item); if (!entry) return [];
      return [text(entry.question, 500), text(entry.answer, 6000)].filter(Boolean);
    }).join(' ');
  }
  return '';
}

function structuredBodyIsIncomplete(blocks: unknown[], bodyText?: string | null) {
  const fullText = String(bodyText ?? '').trim();
  const fullWords = countWords(fullText);
  if (fullWords < 120 || blocks.length === 0) return false;
  const structuredWords = countWords(blocks.map(blockTextContent).filter(Boolean).join(' '));
  return structuredWords + 40 < fullWords && structuredWords < Math.ceil(fullWords * 0.7);
}

function renderBodyText(bodyText: string | null | undefined, recordId: string) {
  const paragraphs = String(bodyText ?? '').split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return paragraphs.map((paragraph, index) => {
    const lines = paragraph.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const first = lines[0] ?? '';
    const rest = lines.slice(1).join(' ');
    const headingLike = /^(?:\d+[.)]\s+.+|أسئلة شائعة|مراجع|المراجع)$/.test(first);
    if (headingLike && rest) return <section key={`${recordId}-${index}`}><h2>{first}</h2><p>{rest}</p></section>;
    return <p key={`${recordId}-${index}`}>{paragraph}</p>;
  });
}

function renderBlock(blockValue: unknown, index: number) {
  const block = asRecord(blockValue); if (!block) return null;
  const type = text(block.type, 40).toLowerCase(); const key = `${type || 'block'}-${index}`;
  if (type === 'paragraph') { const value = text(block.text); return value ? <p key={key}>{value}</p> : null; }
  if (type === 'heading') {
    const value = text(block.text, 500); const level = Number(block.level); const id = sectionAnchor(index);
    if (!value) return null;
    if (level === 3) return <h3 id={id} key={key}>{value}</h3>;
    if (level === 4) return <h4 id={id} key={key}>{value}</h4>;
    return <h2 id={id} key={key}>{value}</h2>;
  }
  if (type === 'definition' || type === 'answer') {
    const term = text(block.term ?? block.title ?? block.question, 500);
    const value = text(block.definition ?? block.answer ?? block.text, 6000);
    if (!value) return null;
    return <section className="content-definition" key={key} aria-labelledby={term ? `${sectionAnchor(index)}-definition` : undefined}>
      {term && <h2 id={`${sectionAnchor(index)}-definition`}>{term}</h2>}
      <p>{value}</p>
    </section>;
  }
  if (type === 'list') { const items = stringArray(block.items, 100, 1000); if (!items.length) return null; return block.ordered === true ? <ol key={key}>{items.map((item, i) => <li key={`${key}-${i}`}>{item}</li>)}</ol> : <ul key={key}>{items.map((item, i) => <li key={`${key}-${i}`}>{item}</li>)}</ul>; }
  if (type === 'steps') {
    const title = text(block.title, 500);
    const items = stringArray(block.items ?? block.steps, 50, 1500);
    if (!items.length) return null;
    return <section className="content-steps" key={key} aria-labelledby={title ? `${sectionAnchor(index)}-steps` : undefined}>
      {title && <h2 id={`${sectionAnchor(index)}-steps`}>{title}</h2>}
      <ol>{items.map((item, i) => <li key={`${key}-${i}`}>{item}</li>)}</ol>
    </section>;
  }
  if (type === 'quote') { const value = text(block.text, 5000); const cite = text(block.cite, 500); return value ? <blockquote key={key}><p>{value}</p>{cite && <cite>{cite}</cite>}</blockquote> : null; }
  if (type === 'callout') { const value = text(block.text, 7000); const title = text(block.title, 300); const tone = ['info', 'success', 'warning', 'danger'].includes(text(block.tone, 20)) ? text(block.tone, 20) : 'info'; if (!value && !title) return null; return <aside key={key} className={`content-callout ${tone}`}>{title && <strong>{title}</strong>}{value && <p>{value}</p>}</aside>; }
  if (type === 'table') { const headers = stringArray(block.headers, 12, 300); const rawRows = Array.isArray(block.rows) ? block.rows.slice(0, 100) : []; const rows = rawRows.map((row) => stringArray(row, 12, 1000)).filter((row) => row.length); if (!headers.length && !rows.length) return null; return <div className="content-table-wrap" key={key} role="region" aria-label={text(block.caption, 300) || 'جدول معلومات'} tabIndex={0}><table>{text(block.caption, 300) && <caption>{text(block.caption, 300)}</caption>}{headers.length > 0 && <thead><tr>{headers.map((header, i) => <th key={`${key}-h-${i}`} scope="col">{header}</th>)}</tr></thead>}{rows.length > 0 && <tbody>{rows.map((row, rowIndex) => <tr key={`${key}-r-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${key}-c-${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>}</table></div>; }
  if (type === 'resource') { const label = text(block.label, 500); const description = text(block.description, 2000); const href = validHttpsUrl(block.url); if (!label || !href) return null; return <a className="content-resource-card" href={href} target="_blank" rel="noopener noreferrer" key={key}><strong>{label}</strong>{description && <span>{description}</span>}<small>فتح المصدر الخارجي ↗</small></a>; }
  if (type === 'image') {
    const src=validHttpsUrl(block.src); const alt=text(block.alt,500); const caption=text(block.caption,1000); if(!src||alt.length<3)return null;
    return <figure className="content-inline-image" key={key}><Image src={src} alt={alt} width={dimension(block.width,1200)} height={dimension(block.height,675)} sizes="(max-width: 900px) 100vw, 860px" unoptimized />{caption&&<figcaption>{caption}</figcaption>}</figure>;
  }
  if (type === 'faq') {
    const raw=Array.isArray(block.items)?block.items.slice(0,40):[];
    const items=raw.flatMap((item)=>{const entry=asRecord(item); if(!entry)return[]; const question=text(entry.question,500); const answer=text(entry.answer,6000); return question.length>=3&&answer.length>=3?[{question,answer}]:[];});
    if (!items.length) return null;
    const headingId = `${sectionAnchor(index)}-faq`;
    return <section className="content-faq" key={key} aria-labelledby={headingId}>
      <h2 id={headingId}>أسئلة شائعة</h2>
      {items.map((item,i)=><article key={`${key}-${i}`} className="content-faq-item">
        <h3>{item.question}</h3>
        <p>{item.answer}</p>
      </article>)}
    </section>;
  }
  if (type === 'divider') return <hr className="content-divider" key={key} />;
  return null;
}

export default function ContentRenderer({ bodyJson, bodyText, recordId }: ContentRendererProps) {
  const root = asRecord(bodyJson);
  const blocks = Array.isArray(root?.blocks) ? root.blocks.slice(0, 1000) : [];
  const renderedBlocks = blocks.map(renderBlock).filter(Boolean);
  const fullText = String(bodyText ?? '').trim();
  const structuredIncomplete = renderedBlocks.length > 0 && structuredBodyIsIncomplete(blocks, fullText);

  if (renderedBlocks.length > 0 && !structuredIncomplete) return <>{renderedBlocks}</>;

  const renderedBodyText = renderBodyText(fullText, recordId);
  if (renderedBodyText.length > 0) {
    if (!structuredIncomplete) return <>{renderedBodyText}</>;

    const normalizedBody = normalizeComparable(fullText);
    const supplementalBlocks = blocks
      .map((block, index) => ({ block, index, comparable: normalizeComparable(blockTextContent(block)) }))
      .filter(({ comparable }) => !comparable || !normalizedBody.includes(comparable))
      .map(({ block, index }) => renderBlock(block, index))
      .filter(Boolean);

    return <>{renderedBodyText}{supplementalBlocks}</>;
  }

  if (renderedBlocks.length > 0) return <>{renderedBlocks}</>;
  return <p>لا يتوفر نص منشور لهذه الصفحة.</p>;
}
