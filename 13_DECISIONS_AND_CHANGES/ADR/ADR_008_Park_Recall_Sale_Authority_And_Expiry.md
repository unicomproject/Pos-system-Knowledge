<!-- title: ADR 008 Park Recall Sale Authority And Expiry -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# ADR 008 Park Recall Sale Authority And Expiry

## Context

Flutter currently keeps Parked Sales independently in device secure storage while the backend already exposes Holds create/list/recall/cancel operations. The two stores can diverge across devices, users, stock, pricing, lifecycle and expiry. Current backend references use `HOLD-######`, and create accepts optional client `ExpiresAt`.

## Decision

- Backend is authoritative for online Park/Recall.
- Cashier UI uses Park Sale, Parked Sales and Recall Sale; backend route/internal Hold names remain.
- Reference is generated after successful backend creation in `PS-{YYYY}-{NNNNN}` style.
- Standard expiry is backend server time plus 24 hours; Flutter provides no editable expiry.
- Park modal contains one optional short note of at most 250 characters.
- Customer is inherited from the active cart or omitted.
- Cart clears only after confirmed 201 success.
- Current tenant + till + holding-user scope remains until another approved decision.
- Offline/outbox/sync is a separate implementation contract with backend final authority.

## Alternatives Rejected

| Alternative | Reason |
|---|---|
| Device-local storage as final authority | Cannot provide reliable cross-device lifecycle, tenant enforcement or backend recalculation |
| Client-generated/reserved reference | Can fabricate or collide before persistence succeeds |
| Client-selected expiry | Client clock and policy are not authoritative |
| Free-text customer inside modal | Duplicates New Sale customer selection and creates ambiguous identity |
| Two merged authoritative lists | Creates unresolved conflict and duplicate semantics |
| Rename `/holds` immediately | No product value; introduces unnecessary compatibility work |

## Consequences

Backend sequence, expiry contract and permission seed evidence must be aligned first. Flutter requires typed API integration and legacy-local migration handling. Automated and authenticated runtime evidence are required before completion. Offline Park is not implicitly delivered by online integration.

## Current Implementation Gaps

- Backend uses `HOLD-######` and optional client expiry.
- Canonical permission constants/checks exist; catalogue insertion and Cashier assignment are unproven.
- Flutter uses `pos.parked_sales`, client references and local recall/delete.
- Backend API is disconnected from Flutter.
- Migration source contains `pos_order_holds`; runtime application must be recorded per environment.

## Related Files

- [[../../04_MODULE_KNOWLEDGE/21_POS_Operations/08_Park_Recall_Sale_Feature]]
- [[../../03_USER_JOURNEYS/Cashier/12_Park_Recall_Sale_Flow]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Park_Recall_Sale_Implementation_Specification]]
