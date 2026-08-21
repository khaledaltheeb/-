# Pediatric Oncology Clinical Expansion — Wave 3 — 2026-08-21

## Purpose

This wave expands the Rawafid pediatric-oncology clinical-reference corpus with four major tumor families that were not adequately represented by standalone evidence-led Arabic care guides.

Every page was designed as an independent search intent, reviewed against the current corpus before insertion, built from authoritative disease-specific sources, and routed through the pediatric-oncology release preflight rather than bypassing the database quality guards.

## 1. Pediatric rhabdomyosarcoma

Slug: `pediatric-rhabdomyosarcoma-clinical-guide`

Title: `الساركوما العضلية المخططة عند الأطفال: FOXO1، الخطورة والعلاج والمتابعة`

Key clinical scope:
- anatomic presentation and site-specific symptoms
- MRI/PET and nodal evaluation
- biopsy planning
- PAX3::FOXO1 / PAX7::FOXO1 and fusion-positive vs fusion-negative disease
- MYOD1 and selected molecular findings
- Stage versus Clinical Group
- favorable and unfavorable primary sites
- systemic chemotherapy principles without patient-specific dosing
- surgery, delayed primary excision and radiotherapy
- parameningeal, orbital, genitourinary, extremity and paratesticular disease
- regional lymph nodes
- metastatic disease
- maintenance therapy in the appropriate protocol context
- relapse/re-irradiation
- fertility, speech/swallowing, craniofacial and functional late effects

Final quality-gate profile before release:
- 2,617 useful Arabic words
- 35 H2
- 4 H3
- 8 structured FAQ items
- 10 references
- 8 claim-source mappings

Core source hierarchy:
- NCI Childhood Rhabdomyosarcoma PDQ
- WHO Paediatric Tumours / Soft Tissue and Bone Tumours
- COG/EpSSG/CWS international molecular-testing consensus
- FOXO1 cooperative-group risk studies
- INSTRuCT local-control consensus
- metastatic-site radiotherapy consensus
- COG Long-Term Follow-Up Guidelines v6

## 2. Pediatric retinoblastoma

Slug: `pediatric-retinoblastoma-clinical-guide`

Title: `الورم الأرومي الشبكي عند الأطفال: التشخيص، RB1 وإنقاذ العين والمتابعة`

The page explicitly follows the clinical priority sequence: **save life first, then preserve the eye when safe, then preserve useful vision**.

Key scope:
- leukocoria and strabismus
- examination under anesthesia, fundus photography, ultrasound and MRI
- why intraocular biopsy is usually avoided
- eye grouping versus systemic staging
- enucleation and high-risk pathology
- intra-arterial chemotherapy
- intravitreal chemotherapy for vitreous seeds
- laser/cryotherapy/systemic chemotherapy
- limits of eye-salvage strategies
- RB1 germline disease and mosaicism
- familial testing and early examination of at-risk children
- trilateral retinoblastoma
- extraocular disease
- vision and amblyopia
- prosthetic-eye and psychosocial care
- second-cancer risk and lifelong hereditary surveillance

A weak non-retinoblastoma-specific proton/CNS reference was removed rather than retained merely to increase the reference count. Hereditary and subsequent-neoplasm statements are instead anchored to RB1-specific predisposition literature, GeneReviews and COG survivorship guidance.

Core source hierarchy:
- NCI Retinoblastoma PDQ
- WHO Paediatric Tumours
- GeneReviews: Retinoblastoma
- 2025 pediatric cancer-predisposition update for retinoblastoma
- systematic reviews/meta-analyses of intra-arterial and intravitreal therapy
- current peer-reviewed retinoblastoma treatment review
- COG LTFU v6

## 3. Pediatric hepatoblastoma and liver tumors

Slug: `pediatric-hepatoblastoma-liver-tumors-clinical-guide`

Title: `الورم الأرومي الكبدي عند الأطفال: PRETEXT، العلاج والجراحة وزراعة الكبد`

Key scope:
- hepatoblastoma versus pediatric HCC and fibrolamellar carcinoma
- age-adjusted AFP interpretation
- ultrasound / MRI / CT and chest staging
- PRETEXT I–IV and POSTTEXT
- PRETEXT annotation factors
- CHIC international risk stratification
- pathology and biopsy principles
- cisplatin-based treatment principles without dosing
- SIOPEL-6 sodium thiosulfate otoprotection evidence and its limits
- timing of partial hepatectomy
- early liver-transplant referral for unresectable disease
- pulmonary metastases
- AFP kinetics
- DNAJB1::PRKACA context in fibrolamellar carcinoma
- Beckwith-Wiedemann spectrum and APC/FAP predisposition
- hearing, renal and cardiac toxicity
- transplant immunosuppression and post-transplant survivorship
- relapse

Core source hierarchy:
- NCI Childhood Liver Cancer PDQ
- WHO Paediatric Tumours
- CHIC risk-stratification study
- 2017 PRETEXT / PHITT radiologic staging framework
- SIOPEL-6 randomized sodium-thiosulfate trial (PMID: 29924955)
- GeneReviews for Beckwith-Wiedemann spectrum and APC-associated polyposis
- COG LTFU v6

## 4. Pediatric extracranial germ-cell tumors

Slug: `pediatric-extracranial-germ-cell-tumors-guide`

Title: `أورام الخلايا الجرثومية خارج القحف عند الأطفال: العلامات، AFP والعلاج والخصوبة`

This page deliberately excludes CNS germ-cell tumors, which belong to the pediatric CNS-tumor reference cluster.

Key scope:
- germ-cell tumor biology across infancy, childhood and adolescence
- mature/immature teratoma, yolk-sac tumor, dysgerminoma/seminoma-type disease, embryonal carcinoma, choriocarcinoma and mixed GCT
- age-adjusted AFP and beta-hCG interpretation
- gonadal, sacrococcygeal, mediastinal and retroperitoneal sites
- testicular and ovarian surgery with fertility preservation when oncologically safe
- sacrococcygeal tumor resection including coccyx principles
- mediastinal-mass anesthesia risk
- MaGIC international risk classification
- platinum-based systemic therapy principles without dosing
- residual masses and marker interpretation
- growing-teratoma syndrome
- relapse and salvage principles
- Klinefelter association with mediastinal malignant GCT
- hearing, renal, pulmonary and fertility late effects
- transition to adult survivorship care

Core source hierarchy:
- NCI Childhood Extracranial Germ Cell Tumors PDQ
- NCI Childhood Cancer Genomics PDQ
- WHO Paediatric Tumours
- MaGIC / cooperative-group risk evidence
- pediatric growing-teratoma literature
- mediastinal GCT / Klinefelter evidence
- COG LTFU v6

## Editorial / scientific review provenance

Released material uses the visible label:

`تمت المراجعة من قبل فريق روافد.`

Recorded reviewer metadata:
- `reviewer_display_name = فريق روافد`
- `reviewer_credentials = مراجعة علمية وتحريرية داخلية`
- `independent_external_review_claimed = false`

No physician identity, specialist credential or independent external medical-review claim was fabricated.

## Release discipline

- No patient-specific doses were added.
- Disease-specific molecular claims are separated from exploratory biomarkers.
- Conservative surgery and organ/vision/fertility preservation are described only when oncologically appropriate.
- Search-intent separation was enforced to avoid cannibalization with existing CNS, bone-sarcoma, leukemia, transplant and survivorship pages.
- Staging sitemap verification remains an environment-level deployment boundary and must not be falsely marked passed while sitemap emission is disabled on staging.
