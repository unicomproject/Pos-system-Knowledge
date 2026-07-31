<!-- title: POS Popular Product Discovery Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-31 -->

# POS Popular Product Discovery Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 21 — POS Operations |
| Feature | Popular Product Discovery |
| Feature Type | Workflow / Integration |
| API Endpoint | `GET /api/v1/pos/products?segment=popular` |
| Application Service | `PosProductCatalogService` / `CollectionService` |
| Required Permission | `products.view` / `catalog.collections.update` |
| Tenant Scoped | Yes |
| Idempotency Required | Yes (for assignments replace) |
| Criticality | High |

---

## Preconditions

- Tenant A and Tenant B exist and are active.
- Cashier user is authenticated with `products.view`.
- Tenant Admin user is authenticated with `catalog.collections.manage`.
- Device context is verified and active.

---

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| POS-POPULAR-001 | Fetch popular products when none are configured | API | High | Returns HTTP 200 with empty list |
| POS-POPULAR-002 | Bootstrap and assign products to POS_POPULAR | Integration | High | Mappings persisted in custom sequence order |
| POS-POPULAR-003 | Reorder assigned popular products | Integration | High | `sort_order` values are updated transactionally |
| POS-POPULAR-004 | Fetch popular products from POS Client | API | High | Return products in correct sort order |
| POS-POPULAR-005 | Exclude inactive/deleted products from result | Unit | High | Return active popular products only |
| POS-POPULAR-006 | Tenant isolation enforcement | Integration | High | Tenant A cannot view or assign Tenant B's products |
| POS-POPULAR-007 | Missing view permission | API | High | Returns HTTP 403 Forbidden |

---

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| POS-POPULAR-SUCCESS-001 | Setup default Popular products and fetch | Tenant Admin has permissions | Products A, B, C | Admin configures and saves list; Cashier loads New Sale | Products returned in requested order | Not Started |

---

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| POS-POPULAR-VALIDATION-001 | Assign inactive product | Inactive Product ID | 400 validation response | Not Started |
| POS-POPULAR-VALIDATION-002 | Assign cross-tenant product | Tenant B Product ID | 400 validation response | Not Started |

---

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| POS-POPULAR-PERMISSION-001 | Cashier has products.view | Allowed | Fetches popular segment successfully | Not Started |
| POS-POPULAR-PERMISSION-002 | Cashier lacks products.view | Missing permission | 403 forbidden | Not Started |
| POS-POPULAR-PERMISSION-003 | Admin lacks collections.update | Missing permission | 403 forbidden on save | Not Started |

---

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| POS-POPULAR-TENANT-001 | Tenant A fetches popular list | Mappings exist for A and B | Only Tenant A's popular products returned | Not Started |
| POS-POPULAR-TENANT-002 | Tenant A updates Tenant B's popular list | Wrong tenant ID in context | 403 or 404 response, no modification | Not Started |

---

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| POS-POPULAR-DB-001 | Mappings saved transactionally | `product_collections` contains exact new mappings and correct `sort_order` | Not Started |
| POS-POPULAR-DB-002 | Reserved collection preserved | `POS_POPULAR` is not deleted or duplicate-created | Not Started |

---

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Not Run |
| Integration Tests | Not Run |
| API Tests | Not Run |
| Manual Verification | Not Done |
| Known Gaps | - |
