<!-- title: POS Customer Management Flutter Implementation Status -->
<!-- status: Partially Implemented -->
<!-- system: OneVerz POS Release 1 -->
<!-- last_updated: 2026-08-09 -->

# POS Customer Management Flutter Implementation Status

## Status

**PARTIALLY IMPLEMENTED — CORE FLUTTER AND AUTHENTICATED MASTER/DETAIL RUNTIME VERIFIED; CONTROLLED MUTATION E2E REMAINS.**

The approved route is `/pos/customers`, opened from the permission-aware
Customers bottom-navigation item. Backend Customer Step 1 remains complete and
was not changed by this Flutter step.

## Implemented Flutter Scope

| Area | Current result |
|---|---|
| Component structure | Screen, provider, toolbar/filters, table, detail, recent orders, actions and dialogs remain separated by responsibility |
| Initial layout | `selectedCustomerId == null`: detail is absent and the table uses the full content width |
| Selected layout | Same route; selected row is highlighted; list/detail use approximately 64/36 width; tapping the selected row clears selection |
| Search | Server query, page reset, shared 300 ms debounce, Dio cancellation and request-sequence stale-response protection |
| Filters | ALL/ACTIVE/INACTIVE/BLOCKED and ALL/POS/ECOMMERCE/CLICK_AND_COLLECT/MANUAL/IMPORT |
| Pagination | Server-side page/pageSize/totalCount/totalPages with boundary states; four fixed rows per page and no internal customer-table scrollbar |
| Detail | Profile, status, contact, source, joined date, total orders/spend, derived AOV, last purchase and recent orders |
| Recent orders | Existing customer orders API; Flutter now maps and presents backend `tillName` |
| Mutations | Existing create/update/attach APIs retained; Add Customer is a create-only orange modal with exactly name/phone/email and no search/list; explicit permission-aware Deactivate-to-INACTIVE action added |
| Attach persistence | Recalled editable sales preserve backend `saleId`; attach sends it instead of silently using local-only cart state |
| Release exclusions | No loyalty, membership, points, tier or store-credit loyalty UI added |

## Automated Verification

- `dart format` passed for changed Customer files/tests.
- Focused Customer widget/provider/permission suite: **21/21 passed**.
- Parked-sale/cart regression suite: **16/16 passed**.
- `flutter analyze`: no errors or Customer-step warnings. Two unrelated,
  pre-existing warnings remain in Sale Summary and a POS header test.
- `git diff --check`: passed for the Flutter repository.

## Authenticated Runtime Evidence — 2026-08-08

- API: repository-approved `dotnet run` profile, listening on local port 5150;
  database-backed POS requests completed.
- Flutter: current workspace build launched with `flutter run` on Pixel Tablet,
  Android 15, physical 2560×1600.
- Existing authenticated Cashier session, trusted device and open till were
  preserved; no authentication bypass was used.
- Bottom Navigation → Customers loaded 12 real backend records.
- Initial screen showed no selected customer and no reserved detail panel.
- Selecting real customer `CUS000001` highlighted the row and rendered the
  non-overlay right detail panel on the same route.
- View Purchase History, Edit Customer and Deactivate Customer were visible for
  the effective Cashier permissions. Summary cards and the duplicate header
  action remain removed. A single orange, permission-aware `Add Customer`
  toolbar action is restored for users with `customers.create`; it opens the
  dedicated create-only modal. Attach to Sale correctly reflected the absence
  of a current editable sale context.
- No yellow/black overflow stripe, clipping or overlapping primary control was
  observed at 2560×1600.
- Evidence:
  - `C:\tmp\customer-step2-initial.png`
  - `C:\tmp\customer-step2-selected.png`
  - `C:\tmp\customer-step2-initial.xml`
  - `C:\tmp\customer-step2-selected.xml`
  - `C:\tmp\customer-step2-api.log`
  - `C:\tmp\customer-step2-flutter.log`

## Remaining Acceptance Blockers

Step 2 must not be marked Complete until one controlled authenticated run
verifies Add → Edit → Deactivate persistence, paginated View All, real editable
sale attachment/read-back, rejection UI, search by each supported field, all
filters/reset/pagination, and selected/unselected layout at the remaining
approved tablet sizes (approximately 1280×800 and 1680×1050 equivalents).

## Related Files

- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_POS_Customer_Management]]
- [[../../../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Customer_Management_Test_Cases]]
- [[../../Backend/ECommerce/Customer_Profile_Pos_Customer_Implementation_Status]]
- [[../../Full_Feature_Status_Index]]
