# OO-04b — Pick Item Production-Level Prototype v2

This is the corrected, production-style prototype for the **Pick Item** screen.

## Fixed in v2

- Responsive behavior is explicit for:
  - large desktop
  - desktop
  - tablet landscape
  - tablet portrait
  - phone
  - small phone
- No desktop-only fixed layout is forced onto smaller devices.
- Header and bottom navigation remain consistent with the approved OneVerz POS shell.
- Long-content handling is included.
- Permission names were aligned to the canonical Online Order permission family already defined in Second Brain.
- No new role-based permission codes are introduced.

## Component breakdown

| Component | Responsibility |
|---|---|
| `AppShell` | OneVerz POS header, responsive context strip, bottom navigation |
| `SummaryMetrics` | Items / Picked / Remaining / Units |
| `ScannerPanel` | Barcode scan state + manual barcode entry |
| `ProductPanel` | Product visual + canonical location projection |
| `QuantityPanel` | Quantity to pick / picked / remaining / mark picked |
| `OrderSidebar` | Order/customer/collection/progress/next items |
| `ScreenState` | Loading / Error / Entitlement / Permission states |
| `PrototypeQaPanel` | Prototype-only stress and permission validation |
| `PickItemScreen` | Screen composition and capability gates |

## Canonical entitlement + permissions

- `click_collect`
- `commerce.online_order.orders.access`
- `commerce.online_order.picking.view`
- `commerce.online_order.picking.scan`
- `commerce.online_order.picking.manual_entry`
- `commerce.online_order.picking.pick`
- `commerce.online_order.picking.report_issue`

## Responsive matrix

### Large Desktop — >= 1440
- Two-column workspace
- Scanner + product side-by-side
- Order sidebar remains fixed as the secondary column
- Full header context visible

### Desktop — 1200–1439
- Two-column workspace
- Scanner + product still side-by-side
- Slightly tighter proportions

### Tablet Landscape — 1024–1199
- Main workspace remains two-column
- Scanner and product stack vertically inside primary panel
- Terminal context collapses from the header
- No horizontal page overflow

### Tablet Portrait — 768–1023
- Main screen becomes one column
- Scanner/product may remain split when width allows
- Order sidebar becomes a responsive two-region layout
- Header context moves partly into the context strip

### Phone — <= 767
- Single-column flow
- Summary cards become 2 × 2
- Scanner first, product second
- Quantity becomes 2 × 2
- Order sidebar becomes vertical
- Header/footer preserved
- Context preserved in horizontal strip

### Small Phone — <= 420
- Quantity sections become one-per-row
- Manual entry becomes full width
- Long values wrap safely

## Production handoff

The HTML/CSS/JS is a prototype only.

Production Flutter should preserve:
- component responsibilities
- responsive rules
- permission/entitlement gates
- state coverage
- interaction order

But implementation must use:
- Flutter widgets
- providers/use-cases/repositories
- canonical backend APIs
- backend-authoritative validation and permission checks
