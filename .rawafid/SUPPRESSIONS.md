# Rawafid Outreach Suppressions

Internal operational registry for Rawafid correspondence agents. This file is not public-facing content.

## Mandatory rule
Before any new outreach, search this registry in addition to Hostinger `Sent` history. Do not send new outreach to an exact suppressed address. Where the reason indicates a whole domain is invalid or explicitly do-not-contact, suppress the domain as well. A different verified public address at the same organization may be used only when the failure is clearly address-specific and a legitimate new route exists; organization-level Sent deduplication still applies.

## Permanent / current suppressions

| Date | Address / route | Scope | Reason | Action |
|---|---|---|---|---|
| 2026-08-28 | `info@autism.com.qa` | exact address / unresolved domain route | Permanent DNS / domain resolution failure after outreach | Do not retry; use only a newly verified official route if one appears |
| 2026-08-28 | `macroscopesupport@service.usepylon.com` | exact support alias | DNS / requested record unavailable | Do not use alias; `contact@macroscope.com` may be used only for a legitimate future need and after Sent dedupe |
| 2026-08-28 | `eira@health.sdu.dk` | exact address | Permanent SMTP 550 rejection | Do not retry |
| 2026-08-28 | `President@coged.org` / IACEP forwarding route | exact route | Forwarded destination ultimately rejected / blocked | Do not retry this route; require a newly verified public contact path |
| 2026-08-28 | `contactus@hamad.qa` | exact address | SMTP 550 5.4.1 recipient/access denied | Do not retry this address; require a newly verified public external-contact route |
| 2026-08-28 | `acamh@acamh.org` | exact address | Microsoft 365 group rejects external senders (550 5.7.133) | Do not retry; use an externally published contact address only if independently verified and needed |
| 2026-08-28 | `contact@cpint.org` | exact route | Address forwards to another mailbox; final delivery blocked with permanent 550 5.7.1 | Do not retry this route |
| 2026-08-28 | `Development@Amputee-Coalition.org` | exact group address | Google Group does not exist or does not permit external posting | Do not retry; require a different verified public contact route |
| 2026-08-26 | `info@nextmedtech.net` | exact address | Recipient does not exist | Do not retry |
| 2026-08-26 | address ending in `gmail.con` | exact malformed address | Invalid typo / non-existent mail domain | Never retry malformed address; verify the correct published address instead |

## Temporary / non-permanent failures
Do not convert temporary delivery failures into permanent suppressions without current evidence. A transient rejection may be retried only when the canonical protocol permits it and after checking the latest mailbox history.

## Opt-outs and relationship closure
Any explicit unsubscribe, do-not-contact request, abuse complaint, or clear human request to stop correspondence must be added here immediately with `DO_NOT_CONTACT` scope and must override throughput targets.
