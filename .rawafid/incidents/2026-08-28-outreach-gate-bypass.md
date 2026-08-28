# Rawafid Outreach Send-Gate Bypass Incident — 2026-08-28

Internal operational incident record. This file is not public-facing content and must not contain private email bodies.

## Summary
A containment condition was confirmed in the Rawafid outreach system on 2026-08-28. Several messages appeared in the canonical Hostinger `INBOX.Sent` folder without corresponding rows in `automation.outreach_send_reservations`, meaning they bypassed the mandatory shared Supabase send gate defined in `.rawafid/AGENTS.md`.

The shared control row was set to `new_outreach_enabled=false` at approximately 2026-08-28 15:52:47 UTC after the initial bypass was detected. A further unreserved outbound message appeared after containment was active. New outreach must remain disabled until the legacy/external sender path is identified and stopped or otherwise isolated.

## Confirmed unreserved outbound messages
The following Hostinger Sent messages were observed without matching send-gate reservations:

| Hostinger Sent UID | Time (UTC) | Recipient | Subject / context | Reservation status |
|---|---|---|---|---|
| 710 | 15:49:06 | `sandy.laham@rarediseasesint.org` | RDI / Arabic rare-disease knowledge follow-up | No matching reservation found |
| 711 | 15:49:18 | `international@kentalis.nl` | Kentalis / Arabic accessibility follow-up | No matching reservation found |
| 712 | 15:49:29 | `mhin@lshtm.ac.uk` | MHPSS Jordan / Arabic-MENA follow-up | No matching reservation found |
| 713 | 15:49:39 | `elinda.lee@curtin.edu.au` | Tuberculosis research collaboration context | No matching reservation found |
| 714 | 15:49:48 | `mhin@lshtm.ac.uk` | Additional MHPSS follow-up | No matching reservation found |
| 718 | 15:54:11 | `ibbyjordan@gmail.com` | Arabic reading-accessibility / IBBY Jordan outreach | No matching reservation found |

UID 718 is especially significant because it was sent after the shared control row had already disabled new outreach.

## Canonical-queue mismatch
`ibbyjordan@gmail.com` / IBBY Jordan was searched against the canonical `rawafid_1000_verified_emails.xlsx` queue (`Ready_1000`, `Master_1000_Contacts`, and `All_Verified_Emails`) and was not found. Therefore UID 718 must not be counted as legitimate Worker A or Worker B activity from the canonical 1,000-contact queue.

## What was ruled out
### Supabase pg_cron
The active Supabase cron jobs were inspected. The relevant jobs are content-publication / pediatric-oncology release-control jobs. The implementation of `private.publish_due_content` was inspected and does not send outreach email. Supabase `pg_cron` is therefore not the source of UIDs 710–714 or 718.

### Coordinated outreach agent runs
Recent rows in `automation.agent_runs` show compliant workers with explicit run keys and send-gate activity. No corresponding agent run was found around the 15:49–15:54 UTC bypass window that explains the unreserved sends.

### Shared email-event log
`automation.email_events` was inspected for the bypass period. It contains inbound-processing/event information but does not attribute the unreserved outbound messages to a coordinated sender process.

### RFC822 headers
Raw message source for representative bypass messages (UID 710 and UID 718) was inspected. The messages use the normal Hostinger delivery path, but the available headers do not expose a reliable sender-process identifier such as a useful `User-Agent` or `X-Mailer`. The headers therefore do not support naming a specific automation or client.

## Current root-cause status
**Root sender process: UNIDENTIFIED.**

Evidence is consistent with a legacy/external process, stale scheduled prompt, or another caller that can invoke the Hostinger send path directly without using `automation.reserve_outreach_send`. This is an evidence-based containment hypothesis, not an attribution to a specific worker or task.

Do not disable an arbitrary automation or revoke/rotate credentials based only on this hypothesis.

## Containment
- `automation.outreach_send_control.new_outreach_enabled=false` remains the correct containment state.
- Coordinated Worker A must send **zero new outreach** while this flag is false.
- Human-thread replies may continue only through the mandatory reply reservation/finalization gate.
- Do not compensate for the pause with BCC, another sender, another worker, or a higher later burst.
- Continue inbox handling, bounce/suppression processing, source verification, queue reconciliation, content-gap work, and other non-sending tasks.

## Security / account decision requiring Khaled
Do **not** automatically rotate, revoke, or narrow Hostinger credentials because that is a security/account change that may affect legitimate integrations. If the bypass continues, Khaled should decide whether to audit and revoke legacy Hostinger API access after dependencies are identified. The immediate safe state is already achieved by keeping coordinated new outreach disabled.

## Re-enable criteria
New outreach should not be re-enabled until all of the following are true:
1. No further unreserved outbound messages are observed over an appropriate observation window.
2. The legacy/external sender path is identified and stopped, or Hostinger access is otherwise isolated so all outreach must pass through the Supabase gate.
3. Any scheduler/worker responsible is updated to the current `.rawafid/AGENTS.md` protocol.
4. A test send demonstrates `reserve -> provider send -> finalize` with an idempotency key and no bypass.
5. Suppression and Sent-history deduplication remain enforced.

## Counting rule
Unreserved bypass messages must not be used to claim compliant Worker A throughput. They do, however, remain part of authoritative Hostinger Sent history for future organization/address deduplication, because recipients have in fact been contacted.
