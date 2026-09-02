const LEGACY_ARCHIVE_URL = 'https://www.fsd.uni-lj.si/mma/Soustvarjanje_podpore_v_skupnosti_-_Angleska_izdaja.pdf/2015081211140160/?m=1439370841';
const DIRECTLY_SHARED_LJUBLJANA_URL = 'https://www.fsd.uni-lj.si/mma/-/2016091213042605/';

export const SOCIAL_WORK_PROVENANCE_REPAIR_RELEASE = '2026-09-03';

/**
 * Repairs a historical attribution mistake in recovered Social Work HTML.
 * The Slovenian Association directly shared the 201609... University of Ljubljana
 * resource. The 201508... archive link is retained only as an independently
 * identified companion/archive link and must never be labelled as the exact
 * link supplied by the Association.
 */
export function repairSocialWorkSourceProvenance(inputHtml: string) {
  return inputHtml
    .replaceAll(
      '<strong>الرابط الأصلي الذي شاركته الجهة المهنية معنا</strong> — Families with Multiple Challenges: Co-creating Support in the Community',
      '<strong>رابط أكاديمي/أرشيفي مكمل حددته روافد للتحقق</strong> — ليس الرابط الذي أرسلته الجمعية السلوفينية مباشرة'
    )
    .replaceAll(
      'exact link shared by the professional association',
      'independently identified companion/archive link'
    )
    .replaceAll(
      'Received from Slovenian Association of Social Workers by email on 2026-08-30',
      'Identified independently by Rawafid; the Association directly shared the 2016091213042605 University of Ljubljana resource'
    )
    .replaceAll(
      `href="${LEGACY_ARCHIVE_URL}" target="_blank" rel="noopener noreferrer"><strong>الرابط الأصلي الذي شاركته الجهة المهنية معنا</strong>`,
      `href="${LEGACY_ARCHIVE_URL}" target="_blank" rel="noopener noreferrer"><strong>رابط أكاديمي/أرشيفي مكمل حددته روافد للتحقق</strong>`
    )
    .replaceAll(
      'المصدر الذي شاركته الجهة المهنية معنا مباشرة',
      `المصدر الذي شاركته الجهة المهنية معنا مباشرة: ${DIRECTLY_SHARED_LJUBLJANA_URL}`
    );
}
