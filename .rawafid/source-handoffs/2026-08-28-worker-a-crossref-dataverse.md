# Worker A public-source handoff — Crossref + Dataverse

Date: 2026-08-28
Owner: Rawafid Outreach Worker A
Scope: public-source handoff only. No private email body, credentials, attachments, or non-public links are included.

## 1) Crossref REST API

- Status: VERIFIED
- Organization: Crossref
- Resource title: REST API
- Canonical URL: https://www.crossref.org/documentation/retrieve-metadata/rest-api/
- Type: scholarly metadata API documentation
- Topic/Sector: evidence discovery; DOI resolution; citation metadata; research integrity
- Evidence/value note: Crossref's official documentation describes a public REST API exposing bibliographic metadata and fields including funding, licenses, post-publication updates, ORCID/ROR identifiers and abstracts. It supports query/filter/sample operations and JSON output. This is suitable for a Rawafid evidence-discovery layer that resolves DOI records and preserves source provenance.
- Rights note: Crossref states that almost none of the metadata is subject to copyright and may be used for any purpose, but some abstracts contained in metadata may be copyrighted by publishers or authors. Rawafid must therefore treat metadata reuse separately from protected full text/abstract reuse.
- Recommended Rawafid destination: internal evidence-discovery and citation-resolution tooling; governance documentation for metadata provenance.
- Discovered from: institutional correspondence; canonical public documentation independently verified on 2026-08-28.

## 2) Crossref REST API access and authentication

- Status: VERIFIED
- Organization: Crossref
- Resource title: Access and authentication
- Canonical URL: https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/
- Type: API access / operational best-practice documentation
- Topic/Sector: metadata retrieval; API governance; reliability
- Evidence/value note: Official documentation states that the REST API can be accessed without signup, recommends the polite route using an email in the `mailto` parameter or agent header, and recommends caching, identification and backoff/response-code handling.
- Rights / operational note: public linking/documentation use. Implementation must respect current Crossref request and concurrency limits and should not hard-code stale limits without rechecking the official documentation.
- Recommended Rawafid destination: evidence ingestion client defaults and engineering documentation.
- Discovered from: institutional correspondence; canonical public documentation independently verified on 2026-08-28.

## 3) Crossref REST API filters

- Status: VERIFIED
- Organization: Crossref
- Resource title: REST API filters
- Canonical URL: https://www.crossref.org/documentation/retrieve-metadata/rest-api/rest-api-filters/
- Type: API reference
- Topic/Sector: metadata updates; identifiers; licenses; research provenance
- Evidence/value note: Official filter documentation supports precise retrieval by identifiers and metadata properties and includes date-related filters useful for incremental update workflows. Rawafid can use this to detect metadata changes more efficiently instead of repeatedly fetching entire corpora.
- Rights note: public linking/documentation use; retrieved record fields remain subject to field-specific rights boundaries described by Crossref.
- Recommended Rawafid destination: internal evidence ingestion/update jobs.
- Discovered from: institutional correspondence; canonical public documentation independently verified on 2026-08-28.

## 4) Crossref Public Data File

- Status: VERIFIED
- Organization: Crossref
- Resource title: Crossref Public Data File
- Canonical URL: https://www.crossref.org/services/metadata-retrieval/public-data-file/
- Type: bulk scholarly metadata dataset
- Topic/Sector: large-scale evidence discovery; metadata corpus
- Evidence/value note: Crossref's official 2026 page describes the annual public data file containing Crossref records in JSON-lines format. This is a more appropriate route than high-volume REST calls when Rawafid ever needs corpus-scale local processing.
- Rights / operational note: public metadata corpus; storage/download costs and current delivery mechanics must be checked before operational adoption. Do not infer rights to publisher full text from the metadata file.
- Recommended Rawafid destination: future high-volume metadata architecture only if scale justifies it; not required for routine page research.
- Discovered from: institutional correspondence; canonical public documentation independently verified on 2026-08-28.

## 5) Dataverse Dataset + File Management — Terms

- Status: VERIFIED
- Organization: Dataverse Project / IQSS
- Resource title: Dataset + File Management — Terms
- Canonical URL: https://guides.dataverse.org/en/latest/user/dataset-management.html
- Type: research-data rights / user documentation
- Topic/Sector: datasets; licensing; access restrictions; citation; provenance
- Evidence/value note: Current Dataverse 6.11 documentation explains that dataset terms may use an available standard license or custom terms, and restricted files may carry terms of access. It also distinguishes legal licensing from scholarly citation norms.
- Rights rule for Rawafid: never infer reuse permission from public visibility or from the Dataverse platform itself. Check the license/custom terms and access restrictions of the specific dataset before reuse. Record dataset-level rights separately from metadata/provenance.
- Recommended Rawafid destination: source/permissions registry rules; evidence ingestion guardrails; dataset citation workflow.
- Discovered from: institutional correspondence; canonical public documentation independently verified on 2026-08-28.

## 6) Dataverse API Guide

- Status: VERIFIED
- Organization: Dataverse Project / IQSS
- Resource title: API Guide
- Canonical URL: https://guides.dataverse.org/en/latest/api/index.html
- Type: API documentation
- Topic/Sector: research-data discovery; persistent identifiers; metadata APIs
- Evidence/value note: Current Dataverse documentation identifies API facilities for search, data access, native operations, metrics and other integrations. It is suitable as the canonical technical reference if Rawafid adds Dataverse discovery into its evidence workflow.
- Rights note: API availability is not a reuse license for dataset contents. Dataset-specific terms remain authoritative.
- Recommended Rawafid destination: internal source-discovery tooling.
- Discovered from: institutional correspondence; canonical public documentation independently verified on 2026-08-28.

## 7) Dataverse Academic Credit / Data Citation

- Status: VERIFIED
- Organization: Dataverse Project
- Resource title: Academic Credit
- Canonical URL: https://dataverse.org/best-practices/academic-credit
- Type: data citation best-practice guidance
- Topic/Sector: research-data citation; persistent identifiers; attribution
- Evidence/value note: Official guidance identifies the core components of a Dataverse data citation, including authors, year, title, DOI/Handle, publisher/repository and version, supporting stronger provenance on Rawafid research-data references.
- Rights note: citation is distinct from reuse permission. Cite datasets even where a license permits broad reuse.
- Recommended Rawafid destination: evidence-data governance and citation templates.
- Discovered from: institutional correspondence; canonical public page independently verified on 2026-08-28.

## Site/source-agent implementation rule

Before any page is created from these sources, search the production site/repository for an existing page satisfying the same user intent. Prefer enriching the strongest existing page. A new page is justified only by a real content/search gap. For health content, Crossref/Dataverse are discovery/provenance infrastructure rather than independent clinical authorities; clinical claims must still be grounded in appropriate primary guidelines, systematic reviews, consensus statements or other high-quality domain evidence.
