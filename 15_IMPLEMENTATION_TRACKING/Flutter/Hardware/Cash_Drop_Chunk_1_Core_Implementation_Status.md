<!-- title: Cash Drop Chunk 1 Core Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# Cash Drop Chunk 1 — Core Financial Implementation

**Status:** `PASS — CASH DROP CHUNK 1 FULLY CLOSED` (including concurrent OUT over-drop)  
**Chunk 2 / production:** see [[POS_Cash_Drop_Chunk_2_Production_Acceptance_2026-08-16]] — live authenticated E2E still blocked.

## Objective

Extend the verified Cash In generic cash-movement engine to support
`Direction = OUT` (Cash Drop) with available-cash validation, OUT type catalog,
canonical Flutter wiring, and idempotency — without new Drop tables/APIs/modules.

## Gaps closed

| Gap | Resolution |
|---|---|
| OUT type seeds | Migration `20260816034300_CanonicalizeCashDropMovementTypes` |
| GET types OUT rejected | Service accepts `IN` \| `OUT` |
| POST OUT rejected | Repository accepts IN/OUT; direction from type |
| Available cash server check | OUT + affects_expected_cash → amount ≤ summary expected |
| Flutter legacy Drop POST | Canonical `movementTypeId` + stable `requestId` |
| Hardcoded Drop reasons | Catalog-driven; `CashDropReason` deprecated stub |

## Seeded OUT system types

| Code | Name |
|---|---|
| `CASH_DROP` | Safe Drop |
| `BANK_DEPOSIT` | Bank Deposit |
| `CASH_PICKUP` | Cash Pickup |
| `SECURITY_TRANSFER` | Security Transfer |
| `OUT_CASH_CORRECTION` | Cash Correction |
| `OUT_OTHER` | Other |

## Validation evidence

- Backend Release build: PASS
- Integration `PosCashDrawerFinancial*`: **16 passed**
- Unit `PosCashDrawerService*`: **18 passed**
- ApiTests `PosCashDrawer*`: **7 passed**
- Flutter analyze `cash_drawer`: **No issues**
- Flutter `test/features/cash_drawer`: **47 passed**

## Financial example (automated)

```text
Expected Cash Before: 10000
Drop Amount: 2500 (CASH_DROP / OUT)
Expected Cash After: 7500
Persistence: cash_movements only (no till_cash_movements dual-write)
```

## Concurrent over-drop (Chunk 1 closure)

```text
Opening 10000; concurrent OUT 7000 + 7000; distinct requestIds
→ exactly one success; one insufficient_expected_cash; final expected 3000; one row
PostgreSQL test: CreateOutMovement_ConcurrentOverDrop_AllowsExactlyOneAndLeavesExpectedCashCorrect
```

## Remaining after Chunk 1

Live authenticated production E2E (API must be up) + optional slip print.
Tracked in [[POS_Cash_Drop_Chunk_2_Production_Acceptance_2026-08-16]].

## Related

- [[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/07_Cash_Drop_Feature]]
- [[POS_Cash_Drop_Second_Brain_Canonicalization_2026-08-16]]
- [[POS_Cash_Drop_Chunk_2_Production_Acceptance_2026-08-16]]
