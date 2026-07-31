<!-- title: POS Frequently Sold Product Discovery Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-31 -->

# POS Frequently Sold Product Discovery Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 21 — POS Operations |
| Feature | Frequently Sold Product Discovery |
| Feature Type | Workflow / Integration |
| API Endpoint | `GET /api/v1/pos/products?segment=frequently-sold` |
| Application Service | `PosProductCatalogService` |
| Required Permission | `products.view` |
| Tenant Scoped | Yes |
| Idempotency Required | No |
| Criticality | Medium |

---

## Preconditions

- Tenant A and Tenant B exist and are active.
- Cashier user is authenticated with `products.view`.
- Device context is verified and active.
- Completed sales orders exist in the database.

---

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| POS-FREQUENT-001 | Fetch frequently sold products with no sales history | API | High | Returns HTTP 200 with empty list |
| POS-FREQUENT-002 | Calculate ranking correctly based on completed orders | Integration | High | Products ranked by Net Quantity descending |
| POS-FREQUENT-003 | Deduct returned and cancelled quantities | Unit | High | Net quantity subtracts cancelled/returned lines |
| POS-FREQUENT-004 | Exclude non-completed statuses (draft, incomplete) | Unit | High | Orders not in COMPLETED state are ignored |
| POS-FREQUENT-005 | Exclude inactive/deleted products | Integration | High | Products marked inactive/deleted are excluded |
| POS-FREQUENT-006 | Enforce rolling 30-day lookback window | Integration | High | Orders older than 30 days are excluded |
| POS-FREQUENT-007 | Enforce limit of 20 products | Unit | High | List count capped at 20 |
| POS-FREQUENT-008 | Outlet isolation | Integration | High | Only sales in the device's outlet contribute to ranking |
| POS-FREQUENT-009 | Tenant isolation | Integration | High | Tenant A cannot view or rank Tenant B's sales |

---

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| POS-FREQUENT-SUCCESS-001 | Dynamic ranking computation | Active sales orders exist | Completed orders | Cashier requests frequently sold segment | Return products ranked by calculated net quantity | Not Started |

---

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| POS-FREQUENT-PERMISSION-001 | Cashier has products.view | Allowed | Fetches frequently-sold segment successfully | Not Started |
| POS-FREQUENT-PERMISSION-002 | Cashier lacks products.view | Missing permission | 403 forbidden | Not Started |

---

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| POS-FREQUENT-TENANT-001 | Tenant A fetches frequently sold list | Sales exist for A and B | Returns Tenant A's sales rankings only | Not Started |

---

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Not Run |
| Integration Tests | Not Run |
| API Tests | Not Run |
| Manual Verification | Not Done |
| Known Gaps | - |
