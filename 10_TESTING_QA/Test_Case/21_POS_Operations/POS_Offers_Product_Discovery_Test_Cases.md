<!-- title: POS Offers Product Discovery Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-31 -->

# POS Offers Product Discovery Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 21 — POS Operations |
| Feature | Offers Product Discovery |
| Feature Type | Workflow / Integration |
| API Endpoint | `GET /api/v1/pos/products?segment=offers` |
| Application Service | `PosProductCatalogService` / `DiscountEligibilityService` |
| Required Permission | `products.view` / `discount.policy.create` / `discount.policy.activate` |
| Tenant Scoped | Yes |
| Idempotency Required | No |
| Criticality | High |

---

## Preconditions

- Tenant A and Tenant B exist and are active.
- Cashier user is authenticated with `products.view`.
- Device context is verified and active.
- Discount Policies and Price List Items are configured.

---

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| POS-OFFERS-001 | Fetch offers when no discounts exist | API | High | Returns HTTP 200 with empty list |
| POS-OFFERS-002 | Product with active targeted discount policy appears | Integration | High | Product returned with correct `discountLabel` and `offerPrice` |
| POS-OFFERS-003 | Product with special compare-at price appears | Integration | High | Special price list item mapped correctly as an offer |
| POS-OFFERS-004 | Target excludes take precedence | Unit | High | Excluded products are omitted from the Offers segment |
| POS-OFFERS-005 | Filter by outlet and channel eligibility | Integration | High | Offers targeting other outlets or channels are excluded |
| POS-OFFERS-006 | Future or expired policies are excluded | Unit | High | Only currently active policies are returned |
| POS-OFFERS-007 | Multiple offers display priority resolution | Unit | High | Lowest effective price policy resolved as display offer |
| POS-OFFERS-008 | Conditional offer formatting | Unit | High | Sets `requiresCartValidation = true` and neutral label |
| POS-OFFERS-009 | Manager approval offer formatting | Unit | High | Sets `requiresManagerApproval = true` |
| POS-OFFERS-010 | Tenant isolation | Integration | High | Tenant A cannot view Tenant B's active offers |

---

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| POS-OFFERS-SUCCESS-001 | Fetch active offers list | Active policies exist | Get segment = offers | Cashier loads Offers tab | Products returned with correct originalPrice/sellingPrice/offerPrice/badge | Not Started |

---

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| POS-OFFERS-PERMISSION-001 | Cashier has products.view | Allowed | Fetches offers successfully | Not Started |
| POS-OFFERS-PERMISSION-002 | Cashier lacks products.view | Missing permission | 403 forbidden | Not Started |

---

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| POS-OFFERS-TENANT-001 | Tenant A fetches offers list | Policies exist for A and B | Returns Tenant A's eligible offers only | Not Started |

---

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Not Run |
| Integration Tests | Not Run |
| API Tests | Not Run |
| Manual Verification | Not Done |
| Known Gaps | - |
