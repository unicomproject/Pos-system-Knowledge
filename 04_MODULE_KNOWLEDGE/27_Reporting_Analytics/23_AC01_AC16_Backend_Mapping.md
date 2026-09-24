# 23 AC-01 to AC-16 Backend Mapping

| AC | Approved Requirement | Source Evidence | Test Evidence | Evidence Level | Final Current Status | Gap |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AC-01** | Sale + Tax reporting | `TenantAdminReportsRepository` queries `SalesOrders` & `SalesOrderLines`, filtering by `OrderStatus == Completed`. Formulas include standard Tax Amount summations. | `SalesOrder` creation unit tests exist. | SOURCE VERIFIED | **PARTIAL** | None |
| **AC-02** | Split Payment / multiple tenders without duplicate sale | `TenantAdminReportsRepository.BuildPaymentsResultAsync` joins `SalesOrders` to `SalesPayment` preserving individual tender rows. Does not duplicate sale counts. | Unit tests verify multiple payments insertion. | SOURCE VERIFIED | **PARTIAL** | None |
| **AC-03** | Cash Tender / Change reporting | `SalesPayment` records exact `TenderedAmount` and `ChangeAmount`. Reporting calculates `PaidAmount` = `TenderedAmount - ChangeAmount`. | `PosCheckoutService` payment completion unit tests cover this. | SOURCE VERIFIED | **PARTIAL** | None |
| **AC-04** | Paid Online Order / Collection without duplicate sale/payment | `SalesOrder.FulfilmentStatus` handles `Collected`. Backend prevents double payment. Inventory `StockMovement` is bypassed on collection (Issue: Inventory remains reserved). | `OnlineOrder` fulfillment unit tests. | SOURCE VERIFIED | **PARTIAL** | Online Order Collection fails to deduct `OnHand` inventory (Batch 7). |
| **AC-05** | Unpaid Online Order / Outstanding Amount | Order tracked in Reporting. `OutstandingAmount` calculated as `TotalAmount - PaidAmount`. Unpaid orders do not generate `SalesPayment` receipts. | Order tracking unit tests exist. | SOURCE VERIFIED | **PARTIAL** | None |
| **AC-06** | Return + Pending/Failed Refund separation | `SalesReturn` created via `CompleteReturnAsync`. Refund gateway errors do not delete return. | Return creation unit tests. | SOURCE VERIFIED | **PARTIAL** | Pending/Failed refund states not persisted; backend endpoints do not handle intermediate refund states. |
| **AC-07** | Till Expected Cash / Counted Cash / Difference | Till `ClosingTime` incorrectly defaults to `OpenedAt`. Variance calculation happens prematurely. | Missing specific test for variance lock. | SOURCE VERIFIED | **FAIL** | Till Closing bugs. Variance calculated early. |
| **AC-08** | Stock Opening ? Movements ? Closing reconciliation | `StockMovement` records exist but `BuildStockMovementResultAsync` does not calculate Opening/Closing period bounds. | No tests for period calculation. | SOURCE VERIFIED | **FAIL** | Stock period reconciliation logic missing. |
| **AC-09** | Retry / Webhook / Offline duplicate protection | `IdempotencyKey` + `TenantId` unique DB indexes enforce duplicate protection on Sales, Payments, Stock, Returns. | Tests verify duplicate webhook drops. | SOURCE VERIFIED | **PARTIAL** | None |
| **AC-10** | Business Timezone / Midnight boundary | Mixed timezone usage: Payments use UTC `DateTime.UtcNow`, while Sales use tenant timezone offsets inconsistently. | No tests for midnight boundaries. | SOURCE VERIFIED | **FAIL** | Timezone filters are mismatched across models. |
| **AC-11** | Historical Product / Price / Tax integrity | `SalesOrderLine` & `SalesOrderTax` persist snapshots (`SkuSnapshot`, `TaxClassCodeSnapshot`, `UnitPrice`). | Tests cover line creation. | SOURCE VERIFIED | **PARTIAL** | None |
| **AC-12** | Export complete filtered dataset / snapshot consistency | `CreateExportAsync` API is a dummy stub returning an in-memory dictionary mock. No CSV generation logic exists. | TEST COVERAGE MISSING | SOURCE VERIFIED | **PARTIAL** | PARTIAL - EXPORT SCOPE REQUIRES PRODUCT DECISION. Implemented securely for Sales Transactions, but full scope requirements are ambiguous due to missing primary source. |
| **AC-13** | Tenant / Outlet / Till authorization and isolation | `GetAccessibleOutletIdsAsync` leaks all outlets if roles are empty. Till scoping missing. Entitlements are dead code. | `TenantUserStaffCodePostgreSqlTests` failed. | SOURCE VERIFIED | **FAIL** | CROSS-OUTLET AUTHORIZATION FAILURE. |
| **AC-14** | No Results vs Error / Unavailable distinction | Backend distinguishes DB errors (500) vs valid empty lists (200 OK + `[]`). | Checked in basic endpoint tests. | SOURCE VERIFIED | **PARTIAL** | None |
| **AC-15** | Non-inventory Product + Return in later reporting period | RPT-05/RPT-06 select Returns based on Original Sale Date instead of Return Date. | Missing test for Return Date filtering. | SOURCE VERIFIED | **FAIL** | Return Accounting selects wrong reporting period. |
| **AC-16** | Late Sync after Till Session close | `SyncBatch` supports late offline receipts. However, Reporting APIs do not flag incomplete syncs (Provisional). | Offline tests run. | SOURCE VERIFIED | **PARTIAL** | Reporting API does not expose provisional/completeness metadata for pending or unknown offline sync state. |

## P3-A Security Update

### Outlet/Till security
* tenant isolation implemented
* outlet scope implemented
* till scope implemented
* selected Till isolation verified
* no-access scopes fail closed
* Till outside authorized Outlet rejected
* null-Till order hidden from SELECTED_TILLS
* inactive TenantUser fails closed

### Reporting query isolation
Verified for:
* Sales
* Payments
* Product Sales
* Filter Options
* Till/Session path
* Sales Transaction Detail IDOR
* Cross-Tenant isolation

### Entitlement / Permission
Record:
Sales permission × entitlement matrix — PASS
Stock permission × entitlement matrix — PASS
Export authorization permission × entitlement matrix — PASS
Dashboard entitlement — PASS
Filter Options entitlement — PASS

### Test evidence
ReportingSecurityTests:
20 Passed / 0 Failed

ReportingEntitlementSecurityTests:
15 Passed / 0 Failed

### PostgreSQL
POSTGRESQL RELATIONAL SECURITY VERIFICATION — PENDING P3-H



