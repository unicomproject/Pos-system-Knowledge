<!-- title: SA-P1 Payment Links Release 1 Scope And Sequencing -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# SA-P1 — Platform Admin Payment Links (Release 1 Scope And Sequencing)

## Final decision

**Payment Links are mandatory for Release 1**, but implementation is **intentionally scheduled as the final major Super Admin feature** after all remaining **non-payment** Super Admin gaps are completed.

| Dimension | Status |
|---|---|
| Release scope | `RELEASE_1_MANDATORY` |
| Development state | `PLANNED_NOT_STARTED` |
| Implementation order | `FINAL_MAJOR_SUPER_ADMIN_FEATURE` |
| Technical readiness | `DATABASE_PREPARED_APPLICATION_NOT_STARTED` |
| Risk | `HIGH_SECURITY_AND_EXTERNAL_DEPENDENCY` |

**Supersedes:** [[SA-P1_Payment_Links_Scope_And_Readiness_Decision]] (2026-07-20 — Release 2 deferral reversed; not a cancellation).

**Gateway (approved MVP):** PayHere — Merchant Secret backend-only; server-side hash; verified webhook.

---

## Approved Release 1 MVP journey

```text
Platform Admin Login → Billing → Open PENDING or OVERDUE Invoice
→ Generate Payment Link → Choose Expiry → Copy or Share Link
→ Customer Opens Public Payment Page → Customer Pays through PayHere
→ PayHere Sends Verified Webhook → Payment Stored Once
→ Invoice Automatically Marked PAID → Payment Link Marked USED
→ Platform Admin Sees Updated Billing Status
```

### Required in Release 1

Generate link for eligible subscription invoice; secure random public token; token hash in DB; link expiry/status/revoke/history; public invoice payment summary; PayHere Checkout; server-side PayHere hash; verified webhook; amount/currency validation; idempotent processing; automatic invoice settlement; `platform.billing.manage` enforcement; audit trail; sandbox verification; production-readiness checklist.

### Explicitly excluded

Recurring auto-debit; saved cards; automatic monthly charging; partial invoice payment; installments; multiple gateway switching; automated SMS reminders; advanced reconciliation dashboard; automatic refunds.

---

## Current technical status (verified)

| Layer | Status |
|---|---|
| `subscription_payment_links` table | **Exists** |
| Entity / EF configuration | **Exists** |
| Token hash and expiry design | **Exists** |
| Application service | **Not implemented** |
| Platform Admin APIs | **Not implemented** |
| Public APIs | **Not implemented** |
| PayHere adapter | **Not implemented** |
| Webhook handler | **Not implemented** |
| Idempotent settlement | **Not implemented** |
| Platform Admin UI | **Not implemented** |
| Public payment page | **Not implemented** |
| Runtime tests | **Not implemented** |

**Summary:** `DATABASE_PREPARED / IMPLEMENTATION_NOT_STARTED` — do not claim planned APIs or flows exist.

Issue Invoice + Mark Paid remain **Release Ready** for operator-side settlement until Payment Links ship.

---

## Security requirements (MVP)

Merchant Secret backend-only; server-side hash generation; signature verification; amount/currency validation; replay prevention; rate limiting; audit logging; no raw token storage; no secret logging. See [[Payment_Links_Implementation_Readiness_Checklist]].

---

## Implementation entry criteria

Do **not** start until:

- Remaining Super Admin **non-payment** P0 gaps complete.
- Remaining required **non-payment** P1 gaps complete or formally deferred.
- Issue Invoice journey verified; Mark Paid journey verified.
- Invoice statuses, outstanding amount logic, and currency source stable.
- PayHere sandbox account, Merchant ID, and approved Merchant Secret storage available.
- Public HTTPS webhook URL available; payment-attempt persistence approved.
- Idempotency and webhook validation designs approved; staging environment available.
- Dedicated implementation branches created.

**Open non-payment P1 before Payment Links:** domains (SA-P1-03), password reset (SA-P1-06), soft-delete (SA-P1-07), audit depth (SA-P1-05), docs truth (SA-P1-08).

---

## Future implementation sequence

1. Final scope and contract freeze → 2. Schema review → 3. Payment attempt persistence → 4. Payment Link application service → 5. Token generation/hashing → 6. Gateway abstraction → 7. PayHere adapter → 8. Checkout initiation → 9. Public payment summary API → 10. Webhook verification → 11. Idempotent settlement → 12. Invoice PAID transition → 13. Public payment page → 14. Platform Admin generate/copy/revoke UI → 15. Tests → 16. PayHere sandbox E2E → 17. Staging verification → 18. Production checklist.

**Future branches (do not create now):**

| Repo | Branch |
|---|---|
| Platform Admin | `feature/platform-billing-payment-links` |
| Unified-Commerce | `feature/platform-billing-payment-links` |
| Second Brain | `docs/platform-billing-payment-links-implementation` |

---

## Score impact

| Metric | Before scope correction | After scope correction | Notes |
|---|---:|---:|---|
| Release 1 Super Admin | **84%** | **83%** | Reverses +1 from R2 deferral; links back in R1 denominator |
| Full planned Super Admin | **66%** | **66%** | Open mandatory gap unchanged |
| Documentation accuracy | Partial | **Improved** | Does not increase implementation completion |

Payment Links remain an **open mandatory Release 1 gap** — not complete.

---

## Related Files

- [[SA-P1_Payment_Links_Scope_And_Readiness_Decision]] (superseded deferral evidence)
- [[Payment_Links_Implementation_Readiness_Checklist]]
- [[Included_Features]]
- [[04_Platform_Billing_Functional_Specification]]
- [[10_Billing_Flow]]
- [[Super_Admin_Current_Status_Audit]]
