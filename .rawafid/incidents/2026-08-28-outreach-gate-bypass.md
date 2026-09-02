# Rawafid Outreach Send-Gate Transition Incident — 2026-08-28

Internal operational incident record. This file is not public-facing content and must not contain private email bodies.

## Corrected summary
Several messages appeared in the canonical Hostinger `INBOX.Sent` folder without corresponding rows in `automation.outreach_send_reservations` during the transition from the former per-worker outreach contract to the new mandatory global Supabase send gate.

The first investigation treated these messages as a potentially unidentified legacy/external sender. A later cross-check against the central `automation.opportunities` investigation record and the repository history corrected that attribution: the unreserved messages are attributable to the **current manually-invoked correspondence cycle during the send-gate rollout**, not evidence of a confirmed external compromise.

The root policy defect was the legacy `.rawafid/AGENTS.md` contract that allowed high per-worker throughput without one atomic global quota. Commit `f0cc697ea8145f76c775daf2cdb51d023f903de7` (`fix: enforce one global atomic outreach quota`) changed that contract at 2026-08-28 15:49:09 UTC. The first unreserved messages followed seconds later while the active correspondence cycle had not yet fully adopted the newly introduced guard.

The shared control row was set to `new_outreach_enabled=false` at approximately 2026-08-28 15:52:47 UTC as containment. New outreach remains disabled while the corrected guard is observed and verified.

## Confirmed unreserved messages during rollout
The following Hostinger Sent messages have no matching send-gate reservation:

| Hostinger Sent UID | Time (UTC) | Recipient | Context | Central attribution |
|---|---|---|---|---|
| 710 | 15:49:20 | `sandy.laham@rarediseasesint.org` | Arabic rare-disease information follow-up | Current manually-invoked correspondence cycle during guard rollout |
| 711 | 15:49:31 | `international@kentalis.nl` | Arabic inclusive deaf-education follow-up | Current manually-invoked correspondence cycle during guard rollout |
| 712 | 15:49:40 | `mhin@lshtm.ac.uk` | Arabic global-mental-health knowledge-exchange follow-up | Current manually-invoked correspondence cycle during guard rollout |
| 713 | 15:49:48 | `elinda.lee@curtin.edu.au` | Curtin autism research-translation follow-up | Current manually-invoked correspondence cycle during guard rollout |
| 714 | 15:49:55 | `international@kentalis.nl` | Correction to use the Health Renewal official domain | Current manually-invoked correspondence cycle during guard rollout |
| 718 | 15:54:11 | `ibbyjordan@gmail.com` | Arabic reading-accessibility / IBBY Jordan outreach | Current correspondence cycle before that cycle inspected and obeyed the active circuit-breaker state |

UIDs 710–714 must not be interpreted as evidence that Supabase pg_cron or a hidden external sender bypassed a mature guard. They occurred during the rollout boundary itself. UID 718 was sent after the control row had been disabled, but the central investigation records it as attributable to the same current correspondence cycle before that cycle inspected the new breaker state. No further new outreach was sent by that cycle after discovering the breaker.

## Canonical-queue mismatch
`ibbyjordan@gmail.com` / IBBY Jordan was searched against the canonical `rawafid_1000_verified_emails.xlsx` queue (`Ready_1000`, `Master_1000_Contacts`, and `All_Verified_Emails`) and was not found. UID 718 therefore must not be counted as legitimate Worker A or Worker B canonical-queue throughput. It still remains authoritative Sent history for future organization/address deduplication because the recipient was actually contacted.

## Root-cause evidence
### Repository transition
Commit `f0cc697ea8145f76c775daf2cdb51d023f903de7` changed `.rawafid/AGENTS.md` from the earlier per-worker throughput model to:
- one shared Supabase reservation/finalization gate before every outbound message;
- a global rolling 60-minute limit;
- explicit prohibition on sending first and recording later;
- global circuit-breaker behavior.

This commit timestamp precedes UID 710 by only seconds, consistent with an already-running/manual correspondence cycle crossing the policy transition boundary.

### Central automation investigation
The durable `automation.opportunities` incident record identifies:
- root cause: legacy `.rawafid/AGENTS.md` contract permitting high per-worker outreach;
- root-cause fix commit: `f0cc697ea8145f76c775daf2cdb51d023f903de7`;
- UIDs 710–714 attribution: current manually-invoked correspondence cycle;
- UID 718 attribution: current correspondence cycle before inspection of the active breaker;
- `verified_unknown_post_fix_bypass=false`;
- no provider-level hard block or confirmed external compromise.

### Supabase pg_cron
Active Supabase cron jobs were inspected. They are content-publication / pediatric-oncology release-control jobs. The implementation of `private.publish_due_content` does not send outreach email. Supabase `pg_cron` is not the source of these messages.

### Coordinated agent / event records
Compliant outreach workers have explicit reservation/finalization rows. `automation.email_events` and `automation.agent_runs` did not provide a separate hidden sender identity for the rollout messages; this is consistent with their manual-cycle attribution rather than evidence of a second coordinated worker.

### RFC822 headers
Raw source for representative messages did not expose a useful `User-Agent` / `X-Mailer` process identifier. The headers therefore do not independently identify a client, but they also do not contradict the corrected central attribution.

## Current containment state
- `automation.outreach_send_control.new_outreach_enabled=false` remains in force.
- Coordinated Worker A sends **zero new outreach** while it is false.
- Human-thread replies may continue only through `reserve -> provider send -> finalize` and do not consume the new-outreach quota.
- Do not use another worker/tool/sender to compensate for the pause.
- Continue inbox handling, source verification, suppression processing, content work, and queue reconciliation.

## Observation after correction
At the 2026-08-28 16:19 UTC closing check:
- latest pre-reply Sent item remained UID 718;
- no additional unreserved new outreach appeared after UID 718;
- a substantive Transifex human follow-up was then handled through the mandatory gate and became Sent UID 719 with a finalized `human_reply` reservation.

This is evidence that the corrected reply path is operating as designed. It is **not** by itself authorization to re-enable new outreach.

## Security/account conclusion
Current evidence does **not** justify rotating/revoking Hostinger credentials or disabling an arbitrary scheduler as an automatic action. No such security/account change was made. If genuinely unexplained unreserved sends recur after all active workers are known to be on the new protocol, then account-access audit/revocation becomes a separate Khaled decision.

## Re-enable criteria
New outreach should remain disabled until the coordinator is satisfied that:
1. no new unreserved new-outreach message appears after the rollout incident;
2. active outreach workers are using the current `.rawafid/AGENTS.md` contract;
3. a controlled new-outreach self-test demonstrates `reserve -> provider send -> finalize` and the ninth concurrent/rolling action is denied according to the global limit;
4. suppression and authoritative Sent-history deduplication remain enforced.

## Counting rule
The rollout messages must not be used to claim compliant gated Worker A throughput. They remain part of authoritative Sent history for deduplication because the recipients were contacted in fact.
