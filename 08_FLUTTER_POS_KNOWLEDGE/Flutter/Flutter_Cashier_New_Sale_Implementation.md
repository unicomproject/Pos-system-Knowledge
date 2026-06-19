<!-- title: Flutter Cashier New Sale Implementation -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-18 -->


# Flutter Cashier New Sale Implementation

## Purpose

Documents **implemented** cashier POS session, shell, home, and New Sale UI on
`Nytroz-POS-App` branch `pos-home-dashboard`.

Target journeys: [[04_Start_Sale_Flow]], [[02_Device_Activation_Flow]],
[[03_Till_Open_Flow]]. This file reflects **current code**, not planned scope.

## Feature Overview

| Area | State |
|---|---|
| Login → bootstrap → device/till gate | Implemented |
| POS shell (sidebar, top bar, guards) | Implemented |
| POS home dashboard | Implemented (API + shell fallback) |
| New Sale catalog + local cart | Partial |
| Sale checkout / payment / receipt | Not wired in Flutter |
| Barcode scan | UI hint only; no lookup API call |
| Park / customer / discount on New Sale | Buttons visible; `onPressed: null` |
| Returns / parked / cash drawer screens | Placeholder routes |

## End-to-End Flow (Implemented)

| Step | Route / action | Result |
|---:|---|---|
| 1 | `/tenant-login` | JWT session; permissions on `AuthSession` |
| 2 | `/pos/boot` | Bootstrap when `requiresPosDeviceBootstrap` |
| 3 | `/pos/device-activation` or `/pos/open-till` | Post-login resolver when device untrusted or till closed |
| 4 | `/pos/home` | Dashboard; `GET /api/v1/pos/home` after bootstrap |
| 5 | Start New Sale → `/pos/new-sale` | Catalog + cart when permitted and till open |
| 6 | Search / chips / product tap | Client filter; add to `posNewSaleCartProvider` |
| 7 | Proceed to Payment | Payment-method sheet only; no backend call |

`postLoginRouteProvider` picks device activation, open till, POS home, or tenant
admin dashboard. `canActivatePosDevice` checks `tenant.till.manage` (not a POS-only
code). `canOpenPosTill` checks `pos.till.open`.

## Routes

| Route | Screen | State |
|---|---|---|
| `/pos/boot` | `PosSessionBootScreen` | Implemented |
| `/device-activation`, `/pos/device-activation` | `DeviceActivationScreen` | Implemented |
| `/open-till`, `/till-open`, `/pos/open-till` | `TillOpenScreen` | Implemented |
| `/pos/home` | `PosHomeScreen` | Implemented |
| `/pos/new-sale` | `PosNewSaleScreen` | Implemented |
| `/pos/customers` | Placeholder | Stub |
| `/pos/returns-refunds` | Placeholder | Stub |
| `/pos/parked-sales` | Placeholder | Stub |
| `/pos/cash-drawer` | Placeholder | Stub |
| `/pos/profile` | Placeholder | Menu only |

**Conflict:** [[Flutter_Routing_Guards]] target names (`/pos-home`, `/checkout`)
differ from implemented `/pos/*` paths. Use this file for cashier routes today.

## Sidebar Navigation

From `pos_shell_nav_destinations.dart`. Visibility = permission on session.

| Label | Route | Permission gate |
|---|---|---|
| Home | `/pos/home` | `pos.home.view` |
| New Sale | `/pos/new-sale` | `pos.new_sale.view` |
| Orders | — | `orders.view` (no route; snackbar) |
| Customers | `/pos/customers` | `customers.view` or `customers.create` |
| Return & Refund | `/pos/returns-refunds` | `returns.view` or `refunds.view` |
| Cash Drawer | `/pos/cash-drawer` | `cash_drawer.view` |

## Folder Structure (Cashier)

```text
lib/features/pos_shell/          # router, home API, shell widgets
lib/features/sale/presentation/  # New Sale screen + catalog widgets
lib/features/cart/               # catalog datasource, cart provider, cart panel
lib/features/device_activation/  # device context (bootstrap dependency)
lib/features/till/               # till session (bootstrap dependency)
lib/core/access/pos_access_codes.dart
lib/shared/pos_session/          # bootstrap, boot screen, posSessionContextProvider
lib/app/router/app_router.dart   # guards + route merge
```

## Key Widgets

| Widget | Role |
|---|---|
| `PosShellScaffold`, `PosSidebar`, top bars | Layout; search on New Sale only |
| `PosHomeHeader`, top/bottom grids, hero card | Home dashboard |
| `PosProductGrid`, `PosProductCategoryChips` | Catalog |
| `PosProductVariantSheet` | Variants + cart line edit |
| `PosEmptyCartPanel` | Cart, totals, proceed button |
| `PosNewSaleActionBar` | Customer / discount / park (disabled) |
| `PosPlaceholderScreen` | Stub screens (customers, returns, etc.) |

Home cards: returns, customer, parked sales, cash drawer use summary card widgets
with API-driven counts when home payload loads.

Additional home widgets: `PosOnlineOrdersSummaryCard`, `PosStatusChip`,
`PosHomeActionCard`, `PosMetricTile`, `PosDashboardCardContainer`.
`PosHomeHeader` shows greeting, optional notification bell (`onPressed: null`),
till status chip (`till.session.view`), and live date/time.

`PosNewSaleHeader` exists but renders `SizedBox.shrink()` (unused stub).

## Shell Layout Behavior

| Rule | Implementation |
|---|---|
| Sidebar vs mobile | Sidebar when width ≥ 700px; mobile `AppBar` otherwise |
| Top bar on home | Hidden on `/pos/home` (`shouldShowPosTopBar`) |
| Desktop search | `PosDesktopTopBar` — only on `/pos/new-sale`, needs `products.search` |
| Mobile search | Not on `PosMobileTopBar`; search is desktop top-bar only today |
| Mobile top bar actions | Notification and menu icons present; `onPressed: empty` |
| Sidebar logout | User menu → `/tenant-login` after `authSessionProvider.clear()` |

## New Sale Layout Behavior

| Breakpoint | Layout |
|---|---|
| Width &lt; tablet | Product area expanded (flex 6) + fixed-height cart panel (360px or 390px) |
| Width ≥ tablet | Row: expanded product area + cart column (330px or 360px width) |
| Product grid columns | 2 (&lt;500px), 3 (&lt;700px), 4 (otherwise); tile height 152px |
| Category chips | Static list in `posNewSaleCategories` (not API-driven) |
| Section header | Dynamic title with filter count; **Sort by: Popular** is display-only |
| Action bar | Below product grid on New Sale only |

## Product and Variant Behavior

- Grid tap without variants: direct `addToCart` with qty 1.
- Grid tap with variants: `PosProductVariantSheet` loads `posProductDetailProvider`.
- Variant sheet: option chips disable combinations that only match out-of-stock SKUs.
- Submit label: **Add to Cart** or **Update Cart** when editing a cart line.
- Cart row tap reopens variant sheet with `existingCartItem`.
- `ApiEndpoints.posProductVariants` is defined but **not called**; detail endpoint
  returns variant groups and variants.

## Cart Panel Layout and Behavior

`PosEmptyCartPanel` uses a fixed three-part column:

1. **Header** (`_CartHeader`) — cart title + optional clear (`sales.cart.clear`).
2. **Body** (`Expanded` + `ListView`) — scrollable line items only.
3. **Footer** (`_CartSummaryFooter`) — subtotal/discount/tax/total + Proceed button.

Footer totals stay fixed while items scroll. Discount and tax always show `LKR 0.00`.
Cart lines stored in `Map<String, PosNewSaleCartItem>`; new SKUs append at end.
Re-adding the same line key updates quantity in place (list order unchanged).
Line tap opens edit sheet.

## State and Models

| Provider / type | Role |
|---|---|
| `posSessionBootstrapProvider` | Device + till hydration |
| `postLoginRouteProvider` | Post-login destination |
| `posHomeDashboardProvider` | Home API → `PosHomeDashboardState` |
| `posNewSaleCatalogProvider` | Product list |
| `posProductDetailProvider` | Variant detail |
| `posNewSaleCartProvider` | Local cart (`PosNewSaleCartState`) |
| `posNewSaleSearchQueryProvider` | Search (needs `products.search`) |
| `posShellGrantedPermissionsProvider` | Sidebar visibility |
| `posSessionContextProvider` | Device/till/outlet display for activation/open-till screens |
| `posCatalogRemoteDatasourceProvider` | Catalog HTTP client |
| `PosCatalogProductSummary`, `toCartProduct()` | Catalog → cart mapping |

Discount/tax hard-coded `0`. Cart is in-memory only.

## API Usage (Flutter)

| Endpoint | Wired? |
|---|---|
| `GET /api/v1/pos/home` | Yes |
| `GET /api/v1/pos/products` | Yes (`deviceId` query) |
| `GET /api/v1/pos/products/{id}` | Yes |
| `GET /api/v1/devices/current` | Bootstrap |
| `GET /api/v1/tills/current-session` | Bootstrap |
| `POST /api/v1/tills/open` | Till open screen |
| `POST /api/v1/devices/activate` | Device activation |
| `GET /api/v1/pos/catalog/categories` | Datasource only; chips static |
| `GET /api/v1/pos/catalog/products/lookup` | No (barcode) |
| `POST /api/v1/pos/cart/*` | No |
| `POST /api/v1/pos/sales` | No |
| `POST /api/v1/pos/payments` | No |

API failure → `pos_catalog_fallback_data.dart` seed products.

## Permissions (New Sale UI)

Flutter constants in `pos_access_codes.dart`. Dev seed:
`DevelopmentPosNewSalePermissionsSeedData.cs`.

| UI | Permission |
|---|---|
| Home | `pos.home.view` |
| New Sale route | `pos.new_sale.view` |
| Product grid | `products.view` |
| Top-bar search | `products.search` |
| Add to cart | `sales.cart.add_item` |
| Qty / remove / clear | `sales.cart.update_item`, `remove_item`, `clear` |
| Proceed to Payment | `sales.checkout` + `payments.*.accept` |
| Start Sale on home | + trusted device + open till session |
| Notifications icon | `notifications.view` |
| Home till status chip | `till.session.view` |

Router forbidden screen when route permission missing.

## Cart and Payment Behavior

- Line key: `variantId ?? productId`; max qty from variant `stockQty`.
- Proceed opens bottom sheet; tap method closes sheet only.
- No sale record, payment capture, or receipt.

## Error / Loading / Empty States

| Case | UI |
|---|---|
| Home loading / error | Shell fallback + banner + retry |
| Catalog loading | Spinner |
| Catalog error | Fallback products (silent) |
| No `products.view` | Locked grid |
| Empty filter | "No products found" |
| Empty cart | "No items added" |
| Disabled Start Sale | Button disabled + message from home access rules |
| Variant invalid / OOS | Red message in variant sheet |
| Notification taps | No action (stub handlers) |

## Router Guards (Implemented)

From `app_router.dart` redirect (not all target routes exist yet):

| Condition | Redirect |
|---|---|
| Unauthenticated on POS/till/device routes | `/tenant-login` |
| Authenticated, bootstrap not ready | `/pos/boot` |
| Bootstrap ready on boot route | `postLoginRouteProvider.path` |
| Authenticated on login | boot route or post-login route |
| POS route ≠ post-login route for restricted users | post-login route |
| Tenant admin while POS user | post-login POS route |

Forbidden route builders use `TenantAdminForbiddenScreen` when session lacks
route permission (e.g. missing `pos.new_sale.view`).

## Tests (Present)

`test/widget_test.dart`: home hero, reference cards, online orders omission,
sidebar visibility/permissions, home loading/error shells, New Sale navigation,
search, categories, cart totals, variant flow, disabled start sale, phone top bar
(hidden on home / shown on New Sale), sidebar scroll on short desktop, scroll
constraints for grid and cart list, auth header before home API.

`test/features/auth/post_login_navigation_test.dart`: post-login routes,
bootstrap failure.

`test/features/till/*`, `test/features/device_activation/*`: till open and device
activation forms/use cases.

## Not Implemented

Backend cart calculate/checkout, payment, receipt, park/recall, barcode lookup,
API category chips, offline queue, real customer/returns/cash-drawer screens.

## Developer Notes

1. Wire search to `GET /api/v1/pos/products?search=` and barcode to catalog lookup.
2. Call `POST /api/v1/pos/cart/calculate` before showing tax/discount.
3. Checkout: `POST /api/v1/pos/sales` then payments; never trust local totals.
4. Reconcile [[Flutter_Routing_Guards]] with `/pos/*` paths.
5. Align [[Permission_Code_List]] POS examples with seeded `sales.*` / `products.*` codes.

## Related Files

- [[Flutter_Routing_Guards]]
- [[Flutter_State_Management_Riverpod]]
- [[Flutter_API_Integration]]
- [[Permission_Code_List]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Start_Sale_UI_Implementation_Status]]
