<!-- title: Tenant Admin Shared Header Footer FE BE Signoff -->
<!-- status: Signed off — FE shell complete; BE no new chrome API needed -->
<!-- system: TM-EPOS MVP / OneVerz POS -->
<!-- module: Tenant Admin Shared Header + Footer -->
<!-- platform: Flutter Tenant Admin + Backend (existing APIs) -->
<!-- last_updated: 2026-07-28 -->

# Tenant Admin Shared Header + Footer — Full FE/BE Sign-off

## Verdict (2026-07-28)

| Layer | Status | Notes |
|---|---|---|
| **Frontend (Flutter)** | **OK / Done** | Shared black header + footer on **all** `/tenant-admin/*` pages via reusable components |
| **Backend (Unified-Commerce)** | **OK / No new chrome API** | Header/footer shell needs **no new backend endpoints**. Uses existing auth session, till session, tenant admin context, permissions |

**Bottom line:** Header + footer work is complete for Tenant Admin shell. Frontend components shipped. Backend already provides the data the header reads; no dedicated header/footer backend module was required.

---

## Product Decision (locked)

1. **Host:** Current Tenant Admin office shell (`TenantAdminLayout`) — sidebar stays on wide screens.
2. **Scope:** Every `/tenant-admin/*` page shows shared black **header** + fixed black **footer**.
3. **Components:** Reusable only — do not copy-paste header/footer into feature pages.
4. **Responsive:** Desktop/tablet and mobile both use the same components with compact behaviour.
5. **No hardcoded fake context:** Do not hardcode "Main Outlet", "Till 01", or fake notification counts.

**Supersedes:** earlier guidance that the black footer was Settings-area-only.

---

## Frontend — What Was Built (OK)

### Components

| Component | File | Role |
|---|---|---|
| `TenantAdminAppHeader` | `lib/features/tenant_admin/presentation/layout/tenant_admin_app_header.dart` | Black OneVerz top bar |
| `TenantAdminFooterNavigation` | `lib/features/tenant_admin/presentation/layout/tenant_admin_footer_navigation.dart` | Black bottom nav |
| `TenantAdminLayout` | `lib/features/tenant_admin/presentation/layout/tenant_admin_layout.dart` | Wires header + sidebar/drawer + content + footer on all TA routes |
| Theme tokens | `lib/features/tenant_admin/presentation/theme/tenant_admin_theme.dart` | Breakpoints, footer height, header tokens |

### Header contents (matches approved UI)

- OneVerz POS logo/brand mark
- Till Session chip: **OPEN** (green) / **CLOSED** from `tillProvider`
- Outlet chip: from till session / tenant outlet scope (not hardcoded)
- Till chip: from till session name/code (falls back to "No till" when none)
- Notifications bell: gated by `viewNotifications` permission; count = `0` until notifications API is wired (not a fake "3")
- Mobile: menu button opens drawer

### Footer contents (matches approved UI)

| Item | Route / behaviour |
|---|---|
| Home | `/pos/home` (permission-gated) |
| New Sale | `/pos/new-sale` (permission-gated) |
| Orders | Unavailable snackbar (route not ready) |
| Customers | `/pos/customers` (permission-gated) |
| Settings | `/tenant-admin/settings`; **active (gold)** on settings/catalog paths |

### Settings-active path helper

`isTenantAdminSettingsAreaPath` marks Settings tab active for segments:

`settings`, `brands`, `products`, `categories`, `stock`, `staff`, `variant-templates`, `import`

Dashboard and other non-settings TA pages still show the footer, but Settings is **not** active there.

### Responsive layout

| Breakpoint | Layout |
|---|---|
| Wide (≥ tablet) | Header → Row(Sidebar + Content) → Footer |
| Mobile (< tablet) | Header(+menu) → Content → Footer; sidebar in drawer |

### Flutter verification done

- `flutter analyze` on layout: **no errors** (only prefer_const infos on notification Badge)
- `test/features/tenant_admin/brands/brand_mvp_test.dart`: **passed** (includes settings-area path helper)

---

## Backend — Status for Header/Footer (OK)

### Why backend is "OK" without new chrome APIs

The header/footer are **UI shell chrome**. They do not CRUD their own entities.

| Header field | Backend / provider source | New BE needed? |
|---|---|---|
| Auth / permissions | Existing session + permission codes | No |
| Till session OPEN/CLOSED | Existing till session APIs → `tillProvider` | No |
| Outlet label | Till session outlet name / tenant admin outlet scope | No |
| Till label | Till session till name/code | No |
| Notifications count | Future notifications module | Deferred (show 0 until ready) |
| Footer nav | Client routing + permission checks only | No |

### Related Brands MVP backend (separate, already OK)

If tracking catalog work that shipped in the same effort:

| Item | Status |
|---|---|
| Brand CRUD + logo upload | Already existed |
| `SortOrder` + migration `20260728103522_AddBrandSortOrder` | Done |
| `ProductCount` projection (exclude DELETED) | Done |
| Permissions `catalog.brands.*` / Flutter aliases | Done |
| Targeted unit / API / integration Brand tests | Passed |

Detail: [[Brand_Collection_CRUD_Implementation_Status]]

---

## Remaining gaps (not blockers for header/footer sign-off)

1. Live visual E2E after hot restart (user to confirm in Chrome)
2. Orders footer route still missing
3. `/tenant-admin/settings` still placeholder
4. Outlet/till header chips are display-only (chevrons, no selector UX yet)
5. Notification badge count API not wired yet (shows 0)
6. Full Flutter suite / full analyze across whole app not re-run in this pass

---

## Related docs

- [[Flutter_Tenant_Admin_Layout]]
- [[Tenant_Admin_Settings_Shared_Layout_Architecture]]
- [[Tenant_Admin_Settings_Responsive_Design]]
- [[Tenant_Admin_Settings_Component_Catalogue]]
- [[Tenant_Admin_Settings_Layout_Implementation_Status]]
- [[Tenant_Admin_UI_Rules]]
- [[Brand_Collection_CRUD_Implementation_Status]]
- [[Brands_Management_Screen_Specification]]


## Superseding note (2026-07-29) — Shared shell architecture decision

A later product decision refined the shared Tenant Admin shell:

- Sidebar must be **white/light** (dark-blue full sidebar is **not** the final approved design)
- Approved top-level order includes Online Store, Hardware, Inventory, Products (nested), Settings last
- Target shell name: `TenantAdminSharedShell`

**Truthful code status:** header/footer components may already exist in Flutter, but the **white sidebar + approved menu order + full shared-shell component catalogue are not marked complete**.

Prefer:

- [[Tenant_Admin_Settings_Shared_Layout_Architecture]]
- [[Tenant_Admin_Sidebar_Navigation]]
- [[Tenant_Admin_Settings_Layout_Implementation_Status]]

Do not treat this older FE/BE sign-off note as proof that the white sidebar architecture is fully implemented.


## Backend contract verification 2026-07-29

Verified against running Unified-Commerce (`http://localhost:5150`) with Oneverce tenant admin:

| Contract | Result |
|---|---|
| `GET /api/v1/tenant-admin/context` | Pass — tenant, user, roles, outlets (5), effective permissions (141), subscription, timezone, currency, locale |
| Feature entitlements | Pass — returns empty when subscription status is `NONE` (seed tenant) |
| Brand CRUD + SortOrder + ProductCount | Pass |
| Brand logo upload/replace `POST /api/v1/brands/{id}/logo` → `BrandResponse` envelope | Pass (requires Azurite with `--skipApiVersionCheck`) |
| Brand authorization / unauthenticated | Pass (401) |
| Tills / till-session / notification unread on context | Not provided by this endpoint (remaining gap; Flutter till providers separate) |
| Online Store / Hardware FE routes | Still unavailable in Flutter; no duplicate backend APIs added |
| Inventory dual nav | Same inventory backend capability; FE labels only |

Detail: [[Brand_Collection_CRUD_Implementation_Status]]
