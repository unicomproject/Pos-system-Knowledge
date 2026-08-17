<!-- title: Tenant Admin Brand Management Canonical UI Contract -->
<!-- status: Active canonical target; implementation not verified -->
<!-- last_updated: 2026-08-12 -->
# Tenant Admin Brand Management — Canonical UI Contract

## Truth labels

- **CURRENT SOURCE:** Flutter is NOT READY. The list is mounted in `TenantAdminPageScaffold`; Add/Edit opens a desktop `showGeneralDialog` with dark barrier or a responsive bottom sheet. There is no `selectedBrandId`, permanent details region, no-selection state, row selection, or pagination UI. Edit receives incomplete list-summary data. The black/orange sidebar exists, but the footer marks Brand as Settings-active.
- **TARGET CONTRACT:** Rules below are mandatory future behavior.
- **IMPLEMENTATION STATUS:** TARGET — TO BE IMPLEMENTED. Flutter must align with a verified Backend/DB contract.

## Final workspace and shell

Use one continuous white workspace with two internal regions separated only by a subtle 1px divider. Do not use two Cards, a detachable panel, modal, dialog, drawer, floating surface, separate right Scaffold, shadow, large gutter, or dark barrier on desktop/laptop.

The shared shell is black with white text/icons and orange active state. Product and Brand are active; Settings is not active. Product children are exactly: Add Product; Categories & Subcategories; Brand.

### First region ownership

1. Breadcrumb: `Product / Brand / Brand Management`.
2. Header: `Brands Management` at left and orange `+ Add Brand` at right, wholly before the divider.
3. `Search brands...`.
4. Brand table.
5. Pagination.

### Second region ownership

Permanent heading: `Brand Details`. Initial state is `selectedBrandId = null`; list load must not select a row or call detail automatically. Center a Brand-specific neutral icon, `No brand selected`, and `Select a brand from the list to view its details.` without an extra Card.

Row click sets the ID, highlights only that row with a restrained orange tint, calls `GET /api/v1/brands/{id}`, and shows loading/error only in the second region while retaining the list. No navigation or modal.

## Add, edit, cancel and delete

- Add switches the existing second region to Create mode with empty Name/Code, null/empty Description, SortOrder 0, no image, ACTIVE. Cancel returns to no selection.
- Edit must use full detail, never list summary. Field order is Name*, Code*, Description, Sort Order, Brand Image, Status, Cancel/Save Brand. The permanent desktop region has no X.
- Cancel Edit restores persisted detail and retains selection.
- After deleting the selected Brand: clear selection, refresh list, do not select another row, and restore no-selection wording.
- Delete dialog: Cancel orange outlined; Delete orange filled; include Brand name, loading state and duplicate-submit prevention.

## Table contract

Exactly: Brand Logo; Brand Name; Code; Product Count; Status; Updated On; Actions. Exclude Sort Order, Description, Slug, Created On and ID. All desktop/tablet headers and cell contents are centered. Widths are proportional: Logo small; Name/Code medium; Product Count/Status/Actions medium-small; Updated On wider. Mobile cards are exempt.

## Form contracts

| Field | Target |
|---|---|
| Brand Name | required, trimmed, max 150 |
| Code | required, trimmed, max 80, canonical uppercase, tenant-unique; allowed characters, deleted-code reuse and restore semantics unresolved |
| Description | optional, max 255, `0/255` counter, returned by detail and preserved on unrelated edit |
| Sort Order | integer, default 0, >=0, helper `Lower numbers appear first`; form only |
| Image | JPEG/JPG or PNG, max 2 MB, recommended 400×200px; preview/change; explicit partial-success error |
| Status | ACTIVE or INACTIVE only; DELETED internal |

## Search and pagination

Server search Name+Code with 300–500ms/shared debounce, stale-response protection, clear behavior and reset to page 1. Initial size 10. Footer: `Showing X to Y of Z brands` left; `[10 ▼] [‹] [1] [›]` right, orange current page. Size/search reset page 1; deletion from an invalid final page moves to the previous valid page.

## Responsive and accessibility

Verify 1920×1080, 1600×900, 1440×900, 1366×768, 1280×720, 1180×820 and 1024×768. Desktop/laptop shows both regions. Tablet may use the approved responsive sheet pattern when necessary. Provide row-selection semantics, accessible Add/Change Image/pagination labels, Edit/Delete tooltips, keyboard/focus behavior, text scaling, non-color-only status and approximately 44×44 targets.
