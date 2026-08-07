# Rawafid V3 Architecture

## قاعدة العمل

هذه المنصة تُبنى من الصفر. لا يتم إدخال محتوى من المستودع القديم قبل اكتمال الثيم، البنية، الحسابات، الصلاحيات، CMS، SEO، الاختبارات والنشر التجريبي.

## Core

- Accounts & Identity
- Role Based Access Control
- Content CMS + Versions
- Scientific / Editorial / SEO / Accessibility workflow
- Specialist Directory + Verification
- Center Directory
- Messaging
- Appointments
- Search
- Maps
- Notifications
- Redirects
- Audit Trail
- SEO + Structured Data
- PWA

## الأدوار

owner, admin, editor, scientific_reviewer, seo_manager, specialist, center_manager, user.

## مبدأ ترحيل المحتوى لاحقًا

Old repository → content extraction → normalization → deduplication → taxonomy mapping → SEO mapping → import into Rawafid CMS.

يُمنع نقل CSS/Layout/Components/Header/Footer أو أي ثيم قديم.
