<!-- title: Flutter Cashier New Sale Implementation -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-26 -->


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
| Sale checkout / payment / receipt | Cash path wired to backend checkout + receipt print audit |
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
| 6 | Search / chips / product tap | Client filter; product name is the primary search key; variant terms refine matching products only; add to `posNewSaleCartProvider` |
| 7 | Proceed to Payment | Backend checkout summary loads billing totals and payment methods |
| 8 | Confirm Cash Payment | Backend creates sale/payment/receipt and returns receipt data |

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
| `posNewSaleSearchQueryProvider` | Search (needs `products.search`); reset on fresh `/pos/new-sale` entry only |
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
| `POST /api/v1/pos/cart/calculate` | Backend endpoint available |
| `POST /api/v1/pos/checkout/summary` | Yes |
| `POST /api/v1/pos/checkout/start-payment` | Yes (cash) |
| `GET /api/v1/pos/receipts/{saleId}` | Backend endpoint available; Flutter print preview does not call it yet |
| `POST /api/v1/pos/receipts/{saleId}/print` | Yes |

API failure → `pos_catalog_fallback_data.dart` seed products.

## Development Merchandise Catalog Seed (2026-06-26)

Development POS catalog seed `DevelopmentPosCatalogSampleProductsSeedData.cs`
now replaces the prior mixed demo catalog with merchandise store products.

Old seeded demo products such as tickets, services, memberships, event food, and
generic retail examples are overwritten or archived inside the deterministic
development seed range. The seed does not delete active sale history in `UpSql`;
stale development variants are archived so New Sale excludes them through the
existing active-status filters.

Seeded active categories:

| Category | Scope |
|---|---|
| Clothing | T-shirt, hoodie, polo shirt, denim jacket, sports cap |
| Footwear | Running shoes, casual sneakers, sandals |
| Accessories | Wallet, sunglasses, wrist watch, keychain |
| Bags | Tote bag, backpack, gift bag |
| Gifts | Gift box, greeting card, ceramic mug |
| Stationery | Notebook, pen set, pencil case |
| Snacks | Bottled water, coffee, snack pack |

Variant structure:

| Area | Variant approach |
|---|---|
| Clothing | Size `S/M/L/XL`, colour `Black/White/Navy/Grey/Blue`, material where useful |
| Footwear | Size `39/40/41/42/43`, colour `Black/White/Blue` |
| Accessories | Colour/material variants where useful; simple variant for keychain |
| Bags | Size/colour or package-type variants |
| Gifts and stationery | Simple or package variants depending on product |
| Snacks | Simple variants only |

Product images are seeded through existing `product_images.storage_key` rows
using generic HTTPS `placehold.co` URLs. No local image files are downloaded or
committed. Flutter maps backend `imageStorageKey` as an image URL for New Sale
tiles and keeps the existing category icon fallback when a URL is missing or
fails.

Backend local product image upload is available through
`POST /api/v1/pos/products/{productId}/image?deviceId={deviceId}` with multipart
form field `image` and optional `altText`. The API stores files under
`wwwroot/uploads/products`, serves them through ASP.NET static files, and writes
the public URL back to `product_images.storage_key` as the product primary image.
Allowed upload formats are JPG, PNG, and WEBP with a 5 MB limit.

Backend product image URL update is available through
`PUT /api/v1/pos/products/{productId}/image-url?deviceId={deviceId}` with JSON
body fields `imageUrl` and optional `altText`. The API validates an absolute
HTTP/HTTPS URL and writes it to the same `product_images.storage_key` primary
image row, so New Sale consumes URL images and uploaded local images through the
same catalog response field.

Seed behavior remains idempotent: fixed IDs are reused, products/categories/
variants/prices/stock/images are upserted, and repeated seed runs should not
duplicate catalog rows. New Sale should show only active merchandise products
through `GET /api/v1/pos/products`; product-name search remains primary,
variant-only search remains restricted, and exact SKU/barcode remains direct.

Needs Verification:

| Item | Note |
|---|---|
| Existing databases | Run the development seed/migration path and confirm archived stale variants no longer appear in New Sale. |
| Image loading | Confirm the POS runtime can reach external HTTPS placeholder image URLs in the target environment. |
| Local uploads | Confirm uploaded `wwwroot/uploads/products` files are backed up or persisted outside transient deployment storage. |

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

- UI cart line key: `variantId ?? productId`; max qty from variant `stockQty`.
  Checkout summary/start-payment lines must send real backend `variantId` only.
  Product summary responses include `variantId` for simple/non-variant products;
  variant-parent products get `variantId` from the product detail variant sheet.
- Cash confirmation creates sale, payment allocation, receipt, and print audit
  can be recorded from Print Receipt. Card/QR/split remain placeholders.
- Payment method selection is backed by checkout summary permissions.
- Print Receipt preview uses checkout success state (`receiptNumber`,
  `barcodeValue`, totals, and items), not `GET /api/v1/pos/receipts/{saleId}` yet.
- Email Receipt route/screen exists, but email send is not implemented.

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

## Not Implemented / Partial

| Area | Current State |
|---|---|
| Backend cart calculate | Endpoint exists; New Sale totals still come from local cart state until payment summary. |
| Cash checkout/payment/receipt | Wired through backend checkout start-payment. |
| Receipt detail GET in Flutter | Backend endpoint exists; print preview does not call it yet. Needs Verification before marking complete. |
| Physical printing | Not implemented; print action records audit and shows local not-implemented message. |
| Card/QR/split payments | Placeholder screens. |
| Park/recall | Placeholder/stub. |
| Barcode lookup | Not wired to lookup API. |
| API category chips | Datasource exists; chips remain static. |
| Offline queue | Not implemented. |
| Real customer/returns/cash-drawer screens | Placeholder routes. |

## Developer Notes

1. Wire search to `GET /api/v1/pos/products?search=` and barcode to catalog lookup.
2. Call `POST /api/v1/pos/cart/calculate` before showing tax/discount.
3. Cash checkout currently uses `POST /api/v1/pos/checkout/start-payment`; do not use `/pos/sales/checkout` as the paid checkout completion endpoint because it creates a draft sale only.
4. Reconcile [[Flutter_Routing_Guards]] with `/pos/*` paths.
5. Align [[Permission_Code_List]] POS examples with seeded `sales.*` / `products.*` codes.

## Product Search Rule

- New Sale product search treats the product name as the primary match.
- Variant terms such as size or colour refine a product-name search only when at least one query term matches the product name.
- Variant-only search does not return products unless the searched word is part of the product name.
- Exact SKU/barcode search remains a direct match path.
- When a product-name + variant query opens a variant product, matching variant attributes are preselected in the variant sheet where possible.
- Reopening `/pos/new-sale` clears the search query/filter; this does not clear `posNewSaleCartProvider`.

## Related Files

- [[Flutter_Routing_Guards]]
- [[Flutter_State_Management_Riverpod]]
- [[Flutter_API_Integration]]
- [[Permission_Code_List]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Start_Sale_UI_Implementation_Status]]
