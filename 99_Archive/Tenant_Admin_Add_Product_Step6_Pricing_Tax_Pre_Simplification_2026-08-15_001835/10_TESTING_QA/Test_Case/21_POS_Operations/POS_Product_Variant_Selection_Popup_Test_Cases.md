<!-- title: POS Product Variant Selection Popup Test Cases -->
<!-- status: Draft -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-01 -->

# POS Product Variant Selection Popup Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | POS Operations |
| Feature | Product Variant Selection Popup |
| Feature Type | Read / Workflow / Integration |
| API Endpoints | POS product detail, recommendations, cart calculation |
| Required Permission | Established POS product/sale/cart permissions; no new code |
| Tenant Scoped | Yes |
| Idempotency Required | Yes for logical multi-line add/retry |
| Criticality | High |

## Purpose And Preconditions

Validate [[../../../04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]]. Cashier, entitlement, permissions, trusted device, tenant/outlet/POS channel, open till, catalog, price and inventory data are configured.

## Backend Unit Tests

| ID | Scenario | Expected Result | Status |
|---|---|---|---|
| PVP-BU-001 | Tenant/device/outlet/product/channel validation | Invalid context rejected safely | Not Started |
| PVP-BU-002 | ID-based option mapping yields zero/one/multiple exact matches | Unavailable/resolved/integrity outcomes are deterministic | Not Started |
| PVP-BU-003 | Valid and invalid default variant | Auto-select only when fully eligible | Not Started |
| PVP-BU-004 | Price effective dates, currency, UOM and decimal precision | Correct authoritative price or no-price result | Not Started |
| PVP-BU-005 | Stock formula, cart quantity and fractional/UOM rules | Correct availability and quantity validation | Not Started |
| PVP-BU-006 | Note trim/null/500-character validation | Normalized note returned; overflow rejected | Not Started |
| PVP-BU-007 | Recommendation self-link/duplicate/tenant/date rules | Invalid relationship rejected | Not Started |
| PVP-BU-008 | Cart merge identity | Variant/UOM/note/modifier identity controls merge | Not Started |

## API Integration Tests

| ID | Scenario | Expected Result | Status |
|---|---|---|---|
| PVP-API-001 | Product detail with dynamic variants and one image | Complete typed target response; no gallery required | Not Started |
| PVP-API-002 | Frequently Bought Together read | At most three eligible manual links; no preselection | Not Started |
| PVP-API-003 | Cart calculation with main and recommendations | Atomic logical result; no partial mutation on failure | Not Started |
| PVP-API-004 | Checkout, supported hold/recall, order and receipt | Normalized line note and line identity persist | Not Started |
| PVP-API-005 | Price or stock changes after detail load | Safe conflict with refreshed authority | Not Started |
| PVP-API-006 | Cross-tenant identifiers | Rejected without leakage | Not Started |
| PVP-API-007 | Missing permission, untrusted device or closed till | Standard access/business rejection | Not Started |

## Flutter Tests

| ID | Scenario | Expected Result | Status |
|---|---|---|---|
| PVP-FL-001 | Exact resolved scan/SKU vs configurable product | Direct add vs popup follows routing rules | Not Started |
| PVP-FL-002 | Dynamic groups, disabled values and selection reset | Only viable ID combinations remain | Not Started |
| PVP-FL-003 | Variant changes | SKU, backend price, stock and same image slot update | Not Started |
| PVP-FL-004 | Quantity/manual/fractional validation | Step/min/max/UOM rules enforced | Not Started |
| PVP-FL-005 | Note normalization | Trim, empty-to-null and 500 limit enforced | Not Started |
| PVP-FL-006 | Recommendation selection/configurable recommendation | Explicit separate lines; nested variant resolved | Not Started |
| PVP-FL-007 | Loading/error/retry/conflict and recommendation-only failure | Safe recoverable states | Not Started |
| PVP-FL-008 | Repeated Add and cancel/back/Escape | One submission; cancel causes no mutation | Not Started |
| PVP-FL-009 | Desktop/tablet/mobile, keyboard, screen reader and overflow | Responsive accessible layout with 44x44 targets | Not Started |

## End-To-End Test

`tile/search/scan -> popup where required -> variant -> quantity/note/recommendations -> cart -> payment -> completed sale -> receipt` must preserve backend-authoritative totals and the line note without partial additions.

## Current Automated Test Coverage

No automated test completion is claimed for the production feature. Existing variant-sheet/scanner tests are regression inputs only.

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Not Run |
| Integration/API Tests | Not Run |
| Flutter Tests | Not Run |
| E2E / Physical Validation | Not Done |

## Completion Checklist

- [ ] Backend unit/API/integration tests implemented and passing.
- [ ] Flutter unit/widget/accessibility/no-overflow tests passing.
- [ ] Atomicity, idempotency, price and stock conflicts verified.
- [ ] Tenant/permission/device/till isolation verified.
- [ ] Physical tablet matrix completed.

## Related Standards

- [[../../Testing_Strategy]]
- [[../../API_Testing_Standards]]
- [[../../Permission_Test_Cases]]
- [[../../Tenant_Isolation_Test_Cases]]
- [[../../Idempotency_Test_Cases]]
