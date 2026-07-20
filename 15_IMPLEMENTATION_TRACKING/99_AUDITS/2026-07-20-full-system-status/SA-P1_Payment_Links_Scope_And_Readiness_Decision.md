<!-- title: SA-P1 Payment Links Scope And Readiness Decision -->
<!-- status: Superseded -->
<!-- superseded_by: SA-P1_Payment_Links_Release_1_Scope_And_Sequencing -->
<!-- superseded_date: 2026-07-20 -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# SA-P1 — Platform Admin Payment Links Scope And Readiness Decision

> **SUPERSEDED (2026-07-20):** Release 2 deferral reversed. Payment Links are **Release 1 mandatory** but scheduled as the **final major Super Admin feature**. Current decision: [[SA-P1_Payment_Links_Release_1_Scope_And_Sequencing]]. Technical readiness findings below are preserved.

## Final decision (historical)

**OPTION B — FORMALLY DEFER TO RELEASE 2** *(superseded)*

Payment Links must **not** be implemented as a Release 1 MVP. The approved Release 1 Platform Admin billing journey is **Issue Invoice + Mark Paid** (operator-side settlement). Customer-facing payment-link collection is Release 2 pending gateway, webhook, and public-payment foundations.

## Decision reason (summary)

1. Active billing functional spec and journeys explicitly classify payment links as **Planned Future Scope**.
2. Backend readiness is **schema-only** — no Application service, API, webhook handler, or gateway adapter for subscription payment links.
3. Frontend has **zero** payment-link routes, actions, or API services.
4. Security-sensitive public payment flow (token issuance, public endpoint, webhook verification, idempotency) is **not implemented**.
5. Release 1 demo and operator workflows are already satisfied by verified Platform Billing **Mark Paid**.
6. `Included_Features.md` aspirational “payment link” wording conflicts with active billing spec; this decision resolves that conflict in favour of the functional spec and `Release_1_Scope.md` table-alone rule.

---

## Scope evidence table

| Document | Current Claim | Active/Superseded | Conflict | Required Decision |
| -------- | ------------- | ----------------- | -------- | ----------------- |
| `04_Platform_Billing_Functional_Specification.md` | Payment links **Planned Future Scope**; not in current API | **Active** | None | Defer |
| `10_Billing_Flow.md` | Issue/Mark Paid **RELEASE READY**; payment links future | **Active** | None | Defer |
| `12_Subscription_Billing_Management_Flow.md` | Payment links listed under **Unsupported Future Scope** | **Active** | None | Defer |
| `Platform_Billing_UI_Implementation_Status.md` | Billing **Release Ready** without payment-link actions | **Active** | None | Defer |
| `03_Technical_Contract.md` | `/api/v1/billing/payment-links` future group | **Active** | None | Defer |
| `01_Module_Overview.md` (Subscription Billing) | Schema includes links; target API future | **Active** | None | Defer |
| `Release_1_Scope.md` | DB table alone ≠ active MVP scope | **Active** | Resolves Included_Features conflict | Defer |
| `Included_Features.md` | “billing summary/**payment link**” in platform setup | **Active** | **Yes** — aspirational | Amend to Release 2 prep |
| `Super_Admin_Current_Status_Audit.md` | Payment links **DATABASE_ONLY** open P1 | **Active** | None | Mark deferred, not complete |
| `06_Recommended_Implementation_Order.md` (audit pack) | Item 4 payment links or defer | Reference | None | Decision = defer |

---

## Implementation by layer

| Layer | Existing Implementation | Status | Missing Work |
| ----- | ----------------------- | ------ | ------------ |
| Database | `subscription_payment_links` table, FKs, unique token hash, expiry/reminder constraints | **READY (schema)** | None for schema |
| Backend entity/config | `SubscriptionPaymentLink` domain + EF configuration + migration | **PARTIAL** | Application orchestration |
| Backend service | **None** in `E_POS.Application` | **MISSING** | Create/revoke/list, token generation, gateway call |
| Backend API | **None** — no controller endpoints | **MISSING** | Platform Admin + public pay endpoints |
| Permissions | `platform.billing.manage` reserved in docs; no link-specific codes | **PARTIAL** | Optional dedicated codes if product requires |
| Frontend UI | **None** — no routes/actions/services | **MISSING** | Billing page actions, copy link, history |
| Gateway integration | Generic integration webhook tables exist; **no subscription link provider adapter** | **MISSING** | Provider selection, link creation, callback |
| Tests | Domain primitive + persistence tests only | **PARTIAL** | API, service, security, E2E |
| Documentation | Functional spec already defers; Included_Features conflict | **PARTIAL** | Scope alignment (this doc) |

---

## Intended user journey (approved target — Release 2)

From billing module docs and database design (not yet implemented end-to-end):

```text
Platform Login → Billing → Select PENDING invoice → Generate Payment Link
→ Copy/share URL (email optional) → Customer opens public/gateway URL
→ Payment completes → Webhook/callback verified → Invoice PAID
→ Payment history / audit updated
```

| Question | Approved answer (from SB + schema) |
|----------|-------------------------------------|
| Who generates? | Platform Admin with `platform.billing.manage` |
| Who pays? | External customer/tenant billing contact |
| Relates to? | Existing **subscription invoice** (not arbitrary amount) |
| Gateway | **TBD / configurable** — `provider_name`, `provider_payment_link_id`, `payment_url` columns |
| Success confirmation | Provider webhook + idempotent transaction write (not built) |
| Expiry | Yes — `expires_at` required on entity create |
| Cancel/revoke | Domain `Revoke()` exists; no API |
| Reuse | Status transitions ACTIVE → USED / REVOKED |
| Multi-currency | Via invoice currency (invoice-scoped) |
| Email | Optional (`sent_to_email`, `sent_at`); not required for MVP definition |
| MVP copy/share | Manual copy likely sufficient for first release when implemented |

---

## MVP readiness table

| MVP Requirement | Status | Evidence | Estimated Size |
| --------------- | ------ | -------- | -------------- |
| Create link for unpaid invoice | **MISSING** | No service/API | L |
| Cryptographic secure token + hash storage | **PARTIAL** | Domain expects `tokenHash`; no generator service | M |
| Expiry date | **READY** | Entity + DB constraint | — |
| ACTIVE/USED/REVOKED status | **PARTIAL** | Domain methods; no API | S |
| Public payment landing / gateway redirect | **MISSING** | No public endpoint | L |
| Payment confirmation | **MISSING** | No webhook handler for links | L |
| Webhook signature + idempotency | **MISSING** | Generic webhook tables only | L |
| Tenant + invoice isolation | **PARTIAL** | FK schema; no runtime enforcement path | M |
| Link list/history in Platform Admin | **MISSING** | No FE/BE | M |
| Copy link action | **MISSING** | No FE | S |
| Permission enforcement | **PARTIAL** | Billing.manage reserved | S |
| Audit event | **MISSING** | No link audit pipeline | M |
| Automated tests (API/E2E) | **MISSING** | Domain tests only | L |
| **Overall Release 1 MVP safe?** | **NO** | Multiple security/external deps | **XL overall** |

---

## Security readiness

| Control | Status |
|---------|--------|
| Secure token generation | **MISSING** (no service) |
| Token stored hashed only | **READY** (schema + domain) |
| Non-sequential public ID | **MISSING** (no public route) |
| Expiry enforcement | **PARTIAL** (field exists; no runtime) |
| Single-use rule | **PARTIAL** (MarkUsed domain; no enforcement path) |
| Invoice ownership validation | **MISSING** |
| Amount/currency tamper prevention | **MISSING** (no public checkout) |
| Replay prevention | **MISSING** |
| Webhook signature validation | **MISSING** for payment links |
| Idempotent payment processing | **MISSING** for link flow |
| Rate limiting on public endpoint | **MISSING** |
| Audit logging | **MISSING** |
| Safe error responses | **N/A** (no endpoint) |

**Conclusion:** Security foundations are insufficient for a rushed Release 1 public payment surface.

---

## Dependency status

| Dependency | Current Status | Blocks MVP? | Required First |
| ---------- | -------------- | ----------- | -------------- |
| Subscription invoice generation | Invoices exist (draft/pending/paid) | No for deferral | Already sufficient for Mark Paid |
| Issue invoice flow | **COMPLETE** | No | — |
| Manual Mark Paid | **COMPLETE** | No | — |
| Payment gateway provider | **NOT SELECTED / NOT WIRED** for subscription links | **Yes** | Product + integration design |
| Webhook processing | Generic tables only | **Yes** | Provider-specific handler |
| Email sending | Not required for deferral | No | Optional for R2 |
| Public frontend / pay page | **MISSING** | **Yes** | Hosted page or gateway redirect |
| Domain configuration | DATABASE_ONLY / deferred | No for R1 | For white-label links in R2 |
| Background jobs (expiry/reminders) | **MISSING** | No for minimal R2 MVP | Later enhancement |
| Platform settings (provider config) | Partial integration framework | **Yes** | Provider credentials management |
| Audit logging | Login audit only for platform | Partial | Link lifecycle events |

---

## Release 1 alternative flow (approved now)

```text
Platform Login → Billing → View PENDING/OVERDUE invoice
→ Issue (if DRAFT) → Mark Paid (operator confirms payment received)
→ Invoice PAID → Dashboard attention counts update
```

This flow is **implemented, tested, and Release Ready** per `Platform_Billing_UI_Implementation_Status.md`.

---

## Release 2 prerequisites (when implementing)

1. Payment provider selection and credential storage.
2. Application service: create/revoke/list links for `PENDING` invoices.
3. Secure token generation + hash persistence (never store raw token).
4. Public anonymous pay endpoint or provider-hosted redirect URL.
5. Webhook handler with signature validation + idempotent `subscription_payment_transactions` writes.
6. Platform Admin API under verified contract (extend `/api/v1/platform-admin/billing` or documented new group).
7. Angular Billing actions: Generate, Copy, Revoke; link status display.
8. API + integration + security test suite.

Recommended branches when approved: `feature/platform-billing-payment-links` (FE + BE).

---

## Score impact

| Scope | Before | After Decision | After Implementation (if R2 approved) |
| ----- | -----: | -------------: | ------------------------------------: |
| Release 1 Super Admin | 83% | **84%** | 84% (unchanged until R2 scope) |
| Full planned Super Admin | 66% | **66%** | ~72% (estimate when MVP shipped) |

**R1 +1 rationale:** Payment links removed from Release 1 missing-functional penalty; billing remains **scoped COMPLETE** for R1. Not marked complete — formally deferred.

**Full planned unchanged:** Payment links remain an open full-product gap.

---

## Files changed (this task)

- `SA-P1_Payment_Links_Scope_And_Readiness_Decision.md` (this file)
- `Super_Admin_Current_Status_Audit.md`
- `Super_Admin_Current_Status_Audit_Detail.md`
- `Included_Features.md`
- `06_Recommended_Implementation_Order.md` (tracked audit folder)

## Commits

Second Brain only — no frontend/backend application commits.

## Next recommended development item

**Domain readiness (white-label / tenant domains)** or **Platform user password reset** — per open P1 list. Payment links: **after** remaining non-payment P1 gaps — see [[SA-P1_Payment_Links_Release_1_Scope_And_Sequencing]].

## Related

- [[SA-P1_Payment_Links_Release_1_Scope_And_Sequencing]] (current)
- [[04_Platform_Billing_Functional_Specification]]
- [[10_Billing_Flow]]
- [[Platform_Billing_UI_Implementation_Status]]
