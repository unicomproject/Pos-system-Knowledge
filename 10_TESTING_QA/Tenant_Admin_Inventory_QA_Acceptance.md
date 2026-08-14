<!-- title: Tenant Admin Inventory QA Acceptance — 29-Screen Scope -->
<!-- status: Canonical -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Tenant Admin Inventory QA Acceptance (29 Screens)

**QA ACCEPTANCE CONTRACT: LOCKED** for the current 29-screen Inventory implementation. QA Execution: NOT STARTED.

## Contract lock

```text
Inventory Contract Version: v1.0
Status: LOCKED
Prototype: APPROVED
Implementation Audit: PASS
UI/UX Contract: LOCKED
Implementation Contract: LOCKED
Frontend Implementation: NOT STARTED
Backend Implementation: NOT STARTED
QA Execution: NOT STARTED
```

Canonical lock: [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Lock_Manifest]]

No automated tests in this phase. Coverage required before production lock of implementation (separate from this audit).

## Happy paths

| ID | Journey | Criterion |
|---|---|---|
| INV-QA-001 | TA-UJ-045 | Dashboard KPIs match quantity-model definitions |
| INV-QA-002 | TA-UJ-045 | Current stock lists SIMPLE/VARIANT tracked SKUs only |
| INV-QA-003 | TA-UJ-045 | Product detail shows location balances and recent movements panel |
| INV-QA-004 | TA-UJ-063 | Opening post increases on-hand; review did not |
| INV-QA-005 | TA-UJ-046 | Confirm receive increases on-hand; draft/review did not |
| INV-QA-006 | TA-UJ-047 | Posted decrease/increase matches reason direction |
| INV-QA-007 | TA-UJ-064 | Confirm allocation does not change on-hand; limits persist |
| INV-QA-008 | Visual | Production content matches approved prototype composition (shell may differ) |

## Validation / domain

| ID | Criterion |
|---|---|
| INV-QA-010 | Opening quantity 0 / negative rejected |
| INV-QA-011 | Duplicate posted opening → 409 OPENING_STOCK_ALREADY_POSTED |
| INV-QA-012 | Opening after existing movements → 409 OPENING_STOCK_NOT_ELIGIBLE |
| INV-QA-013 | Receiving confirm without required supplier/invoice rejected |
| INV-QA-014 | Serial count ≠ qty → SERIAL_COUNT_MISMATCH |
| INV-QA-015 | Duplicate serial → DUPLICATE_SERIAL |
| INV-QA-016 | Adjustment decrease below reserved → INSUFFICIENT_STOCK |
| INV-QA-017 | On-hand never negative after adjustment |
| INV-QA-018 | Allocation sum + buffer > available → ALLOCATION_EXCEEDS_AVAILABLE |
| INV-QA-019 | BUNDLE cannot be opened/received/adjusted/allocated |
| INV-QA-020 | Untracked product excluded from stock lists and posts |

## Security

| ID | Criterion |
|---|---|
| INV-QA-030 | Missing permission → 403; UI hides actions |
| INV-QA-031 | Cross-tenant product/location id → 404 |
| INV-QA-032 | Entitlement off → 403 FEATURE_DISABLED |
| INV-QA-033 | Frontend hide alone is insufficient (API still 403) |

## Reliability

| ID | Criterion |
|---|---|
| INV-QA-040 | Double-click confirm with same Idempotency-Key does not double-post |
| INV-QA-041 | Same key different payload → IDEMPOTENCY_CONFLICT |
| INV-QA-042 | Two users adjust same SKU: one 409 CONCURRENT_UPDATE |
| INV-QA-043 | Failed post leaves no partial movement/balance change |
| INV-QA-044 | Channel confirm concurrent available change → 409 |

## UX states

| ID | Criterion |
|---|---|
| INV-QA-050 | Pagination pageSize default 20 |
| INV-QA-051 | Search by name/SKU/barcode |
| INV-QA-052 | Empty, loading, error, permission-denied states exist |
| INV-QA-053 | Stock Count tile does not open a stocktake wizard |
| INV-QA-054 | Allocation details show sales channels, not outlet names as channels |
| INV-QA-055 | Production uses Tenant Admin black sidebar; Inventory is top-level |
| INV-QA-056 | Responsive: tablet/desktop primary; tables scroll; no prototype chrome required |

## Deferred (must not fail the 29-screen release)

Stock Out, Transfer, Stocktake wizard, full alerts page, full movement history, Marketplace Beta allocation, Mark as Sold serial action, pending-approval adjustment queue.
