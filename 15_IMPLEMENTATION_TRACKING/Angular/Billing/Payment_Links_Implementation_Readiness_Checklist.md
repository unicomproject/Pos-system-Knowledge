<!-- title: Payment Links Implementation Readiness Checklist -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# Payment Links — Implementation Readiness Checklist

Tracks prerequisites for PayHere Payment Links (`RELEASE_1_MANDATORY` / `PLANNED_NOT_STARTED`). Mark items only when supported by verified evidence. Decision: [[SA-P1_Payment_Links_Release_1_Scope_And_Sequencing]].

## Product

| Item | Status | Evidence |
|---|---|---|
| Release 1 MVP approved | [x] | Sequencing decision 2026-07-20 |
| Explicit exclusions approved | [x] | Decision doc exclusions list |
| Expiry rule approved | [x] | Entity `expires_at` + domain design |
| Retry rule approved | [ ] | Not formally documented |
| Revoke rule approved | [x] | Domain `Revoke()`; API not built |
| Chargeback rule approved | [ ] | Not documented |

## Billing

| Item | Status | Evidence |
|---|---|---|
| Issue Invoice verified | [x] | [[Platform_Billing_UI_Implementation_Status]] |
| PENDING status verified | [x] | Billing API + UI tests |
| OVERDUE status verified | [x] | Derived/display status in billing flow |
| Mark Paid verified | [x] | POST mark-paid + Angular suite |
| Outstanding amount stable | [x] | `balance_due` in billing contract |
| Currency source confirmed | [x] | Invoice-scoped currency in schema |

## PayHere

| Item | Status | Evidence |
|---|---|---|
| Sandbox account available | [ ] | Not configured in repo |
| Merchant ID available | [ ] | Not configured |
| Merchant Secret available | [ ] | Not configured |
| Checkout access confirmed | [ ] | No adapter |
| Public callback URL available | [ ] | Not provisioned |
| Sandbox webhook tested | [ ] | No handler |

## Security

| Item | Status | Evidence |
|---|---|---|
| Token generation approved | [x] | Decision requires secure random token |
| Token hashing approved | [x] | Schema stores hash only |
| Signature verification approved | [x] | Decision requires PayHere webhook verify |
| Idempotency approved | [ ] | Design not implemented |
| Replay protection approved | [ ] | Design not implemented |
| Secret storage approved | [ ] | Awaiting ops/product approval |
| Rate limiting approved | [ ] | Public route not designed |

## Technical

| Item | Status | Evidence |
|---|---|---|
| Payment attempt architecture approved | [ ] | Generic webhook tables only |
| Gateway abstraction approved | [ ] | Not implemented |
| API contract approved | [ ] | No controller endpoints |
| Public route approved | [ ] | No public pay page |
| Migration approach approved | [x] | Existing `subscription_payment_links` migration |
| Audit events approved | [ ] | No link lifecycle audit pipeline |

## Operations

| Item | Status | Evidence |
|---|---|---|
| Reconciliation process approved | [ ] | Not documented |
| Failure process approved | [ ] | Not documented |
| Chargeback process approved | [ ] | Not documented |
| Support process approved | [ ] | Not documented |
| Rollout plan approved | [ ] | Sequencing only — no rollout doc |

## Summary

**Ready to implement:** No — database/schema foundations only. Complete non-payment Super Admin gaps and PayHere/ops prerequisites first.

## Related Files

- [[SA-P1_Payment_Links_Release_1_Scope_And_Sequencing]]
- [[Platform_Billing_UI_Implementation_Status]]
- [[04_Platform_Billing_Functional_Specification]]
