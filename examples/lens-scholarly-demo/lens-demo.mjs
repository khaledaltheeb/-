#!/usr/bin/env node

const token = process.env.LENS_SCHOLARLY_API_TOKEN?.trim();
if (!token) {
  console.error('Set LENS_SCHOLARLY_API_TOKEN before running this demo.');
  process.exit(2);
}

const query = process.argv.slice(2).join(' ').trim() || 'autism evidence-based intervention';
const response = await fetch('https://api.lens.org/scholarly/search', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({
    query,
    size: 5,
    sort: [{ year_published: 'desc' }],
    include: ['lens_id','title','year_published','external_ids','authors.affiliations.name','authors.affiliations.name_original','authors.affiliations.ids'],
  }),
});

if (!response.ok) {
  console.error(`Lens Scholarly API returned HTTP ${response.status}.`);
  process.exit(1);
}

const payload = await response.json();
const records = (payload.data || []).map((record) => ({
  lens_id: record.lens_id,
  title: record.title,
  year_published: record.year_published,
  external_ids: record.external_ids || [],
  affiliations: (record.authors || []).flatMap((author) => (author.affiliations || []).map((affiliation) => ({
    name: affiliation.name || affiliation.name_original || null,
    ror: (affiliation.ids || []).find((id) => String(id.type || '').toLowerCase() === 'ror')?.value || null,
  }))),
}));

console.log(JSON.stringify({ query, total: payload.total ?? null, records }, null, 2));
