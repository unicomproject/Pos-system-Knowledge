<!-- title: Flutter Cashier New Sale Implementation -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-18 -->


# Flutter Cashier New Sale Implementation

## Purpose

This file documents the **implemented** cashier POS shell, home dashboard, and New
Sale UI in the Flutter app as of branch `pos-home-dashboard`.

It separates what works today from planned Release 1 scope in journey files.

Use [[04_Start_Sale_Flow]] for target business rules.

Use this file for current code behavior.

## Feature Overview

| Area | Current state |
|---|---|
| POS shell (sidebar, top bar, guards) | Implemented |
| POS home dashboard | Implemented (API + shell fallback) |
| New Sale screen (catalog + local cart) | Partially implemented |
| Backend sale checkout / payment | Not wired in Flutter |
| Barcode scan | Not implemented in Flutter |
| Park / recall sale | Placeholder routes only |
| Customer attach on New Sale | UI stub only |

Cashier work lives under `lib/features/pos_shell`, `lib/features/sale`, and
`lib/features/cart`. Session bootstrap (`lib/shared/pos_session`) runs before POS
routes when the user has device/till permissions.

## User Flow (Implemented Steps)

| Step | Action | Result today |
|---:|---|---|
| 1 | Staff signs in at `/tenant-login` | Session restored; bootstrap at `/pos/boot` when POS permissions require device/till |
| 2 | Redirect to `/pos/home` for cashier users | Home loads API dashboard or shell fallback while loading |
| 3 | Tap **Start New Sale** (if enabled) | Navigates to `/pos/new-sale` |
| 4 | Filter products (category chips, top-bar search on New Sale) | Client-side filter on loaded catalog |
| 5 | Tap product tile | Adds to local cart, or opens variant bottom sheet |
| 6 | Adjust qty / remove in cart panel | Local `posNewSaleCartProvider` updates |
| 7 | Tap **Proceed to Payment** | Bottom sheet lists allowed payment methods; closes sheet only (no API) |

Steps requiring backend sale creation, payment capture, receipt, park, or customer
attach are **not completed** in the current UI.

## Screens and Routes

| Route | Screen | Notes |
|---|---|---|
| `/pos/boot` | `PosSessionBootScreen` | Device/till hydration gate |
| `/pos/home` | `PosHomeScreen` | Dashboard |
| `/pos/new-sale` | `PosNewSaleScreen` | Catalog + cart |
| `/pos/customers` | `PosPlaceholderScreen` | Placeholder |
| `/pos/returns-refunds` | `PosPlaceholderScreen` | Placeholder |
| `/pos/parked-sales` | `PosPlaceholderScreen` | Placeholder |
| `/pos/cash-drawer` | `PosPlaceholderScreen` | Placeholder |
| `/pos/profile` | `PosPlaceholderScreen` | Placeholder (no sidebar entry) |

### Doc conflict: planned vs actual routes

[[Flutter_Routing_Guards]] lists `/pos-home`, `/checkout`, `/held-sales`, etc.
**Current code uses `/pos/home`, `/pos/new-sale`, `/pos/parked-sales`.** Treat
this file as the route source for implemented cashier work until guards doc is
reconciled.

## Folder Structure

```text
lib/features/pos_shell/
  pos_shell_router.dart
  data/datasources/pos_home_remote_datasource.dart
  presentation/screens/pos_home_screen.dart
  presentation/providers/pos_home_dashboard_provider.dart
  presentation/widgets/home/*
  presentation/widgets/common/pos_shell_scaffold.dart
lib/features/sale/presentation/
  screens/pos_new_sale_screen.dart
  widgets/new_sale/*
lib/features/cart/
  data/datasources/pos_catalog_remote_datasource.dart
  data/datasources/pos_catalog_fallback_data.dart
  domain/entities/pos_catalog_models.dart
  presentation/providers/pos_new_sale_cart_provider.dart
  presentation/providers/pos_catalog_provider.dart
  presentation/widgets/pos_empty_cart_panel.dart
lib/core/access/pos_access_codes.dart
lib/shared/pos_session/pos_session_bootstrap_provider.dart
```

## Components and Widgets

| Widget | Role |
|---|---|
| `PosShellScaffold`, `PosSidebar`, top bars | Shell layout |
| `PosHomeHeader`, `PosHomeTopGrid`, `PosStartSaleHeroCard` | Home dashboard |
| `PosNewSaleScreen`, `PosProductGrid`, `PosProductCategoryChips` | Catalog |
| `PosProductVariantSheet` | Variant pick / cart line edit |
| `PosEmptyCartPanel` | Cart list, totals, proceed button |
| `PosNewSaleActionBar` | Add customer / discount / park buttons (disabled) |

## State Management

| Provider | Responsibility |
|---|---|
| `posSessionBootstrapProvider` | Device + till hydration gate |
| `posHomeDashboardProvider` | Home API payload → dashboard state |
| `posNewSaleCatalogProvider` | Product list (`GET /api/v1/pos/products`) |
| `posProductDetailProvider` | Variant detail (`GET /api/v1/pos/products/{id}`) |
| `posNewSaleCartProvider` | Local cart lines and totals |
| `posNewSaleSearchQueryProvider` | Shared search (top bar + grid) |
| `posNewSaleSelectedCategoryProvider` | Category chip filter |
| `deviceActivationProvider`, `tillProvider` | POS context for home/catalog |

Cart discount and tax are hard-coded to `0` in `PosNewSaleCartState`. No
`cartProvider` from [[Flutter_State_Management_Riverpod]] exists yet; use
`posNewSaleCartProvider` instead.

## API Integration (Flutter)

| Endpoint | Used by cashier UI? |
|---|---|
| `GET /api/v1/pos/home` | Yes (`posHomeDashboardProvider`) |
| `GET /api/v1/pos/products` | Yes (`posNewSaleCatalogProvider`) |
| `GET /api/v1/pos/products/{id}` | Yes (variant sheet) |
| `GET /api/v1/pos/catalog/categories` | Datasource exists; chips use static list |
| `GET /api/v1/devices/current` | Bootstrap / catalog context |
| `GET /api/v1/tills/current-session` | Bootstrap / home enablement |
| `POST /api/v1/pos/cart/*` | No |
| `POST /api/v1/pos/sales` | No |
| `POST /api/v1/pos/payments` | No |
| `GET /api/v1/pos/catalog/products/lookup` (barcode) | No |

Catalog falls back to `pos_catalog_fallback_data.dart` when session/device is
missing or the products API fails.

## Backend Dependencies

Backend modules used indirectly today:

- `PosHomeController` — dashboard card enablement and metrics
- `PosProductsController` — product summaries and detail
- Device and till APIs — session bootstrap

Backend sale/cart/payment controllers exist but are **not called** from the
current New Sale UI.

## Permissions and Session Rules

Permission codes are in `lib/core/access/pos_access_codes.dart`.

| UI area | Permission codes (examples) |
|---|---|
| View home | `pos.home.view` |
| Open New Sale route | `pos.new_sale.view` |
| View / add products | `products.view`, `sales.cart.add_item` |
| Cart update/remove/clear | `sales.cart.update_item`, `sales.cart.remove_item`, `sales.cart.clear` |
| Checkout button | `sales.checkout` + payment accept permissions |
| Action bar stubs | `customers.create`, `sales.discount.apply`, `sales.park.create` |

Home **Start New Sale** also requires trusted device and open till session
(`PosHomeDashboardState.accessFor`). Router shows `TenantAdminForbiddenScreen`
when `pos.new_sale.view` is missing.

## Cart Behavior

- Cart is **in-memory only** (Riverpod notifier).
- Line key: `variantId ?? productId`.
- Totals: subtotal sum of line prices; discount/tax always zero.
- Max quantity enforced when variant `stockQty` is known.
- Clearing cart requires `sales.cart.clear` permission.

## Payment / Proceed Behavior

- Button enabled when cart has items, user has `sales.checkout`, and at least one
  payment permission (`payments.cash.accept`, `payments.card.accept`, etc.).
- Opens modal bottom sheet; selecting a method only closes the sheet.
- No sale creation, payment API, or receipt flow runs.

## Error, Loading, and Empty States

| State | Behavior |
|---|---|
| Home loading | Shell dashboard + inline loading banner |
| Home API error | Shell dashboard + retry banner |
| Catalog loading | Grid `CircularProgressIndicator` |
| Catalog API failure | Silent fallback to seed products |
| No product permission | Locked grid message |
| Empty search/filter | "No products found" |
| Empty cart | "No items added" illustration |

## Implemented Now

- POS shell navigation and permission-gated routes
- POS home with backend-driven card enablement
- New Sale layout (responsive product grid + cart panel)
- Product search (client-side) and static category chips
- Variant selection sheet with stock checks
- Local cart add/update/remove/clear with permission gates
- Payment method picker UI (non-functional)
- Widget tests in `test/widget_test.dart` for home, New Sale, cart, permissions

## Not Implemented Yet

- Barcode / SKU scan flow
- API-backed category chips
- Backend cart calculate / validate / discount APIs
- Customer attach, discount apply, park sale actions
- Sale checkout, payment capture, receipt
- Parked sales, returns, cash drawer screens (placeholders)
- Orders sidebar destination (no route)
- Offline sale queue

## Developer Notes

1. Wire catalog search to `GET /api/v1/pos/products?search=` before adding more
   client-only filters.
2. Replace static `posNewSaleCategories` with `GET /api/v1/pos/catalog/categories`.
3. Integrate `POST /api/v1/pos/cart/calculate` before showing tax/discount totals.
4. Checkout must call `POST /api/v1/pos/sales` then payment endpoints; do not
   treat local cart totals as authoritative.
5. Reconcile [[Flutter_Routing_Guards]] route table with `/pos/*` paths.
6. Branch reference: `Nytroz-POS-App` `pos-home-dashboard`.

## Related Files

- [[Flutter_Routing_Guards]]
- [[Flutter_State_Management_Riverpod]]
- [[Flutter_API_Integration]]
- [[04_Start_Sale_Flow]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Start_Sale_UI_Implementation_Status]]
