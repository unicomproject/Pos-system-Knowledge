# OO-05 — Review & Pack Production-Level Prototype

This package is the production-style HTML/CSS/JS prototype for the **Review & Pack** screen.

## Component boundaries

| Component | Responsibility |
|---|---|
| `AppShell` | OneVerz POS header, responsive context strip, bottom navigation |
| `SummaryMetrics` | Items / Picked / Remaining / Units |
| `PickedItemsList` | Picked-item verification list |
| `PackingNotes` | Optional packing notes with 200-character limit |
| `OrderSummary` | Order/customer/collection/progress/readiness CTA |
| `ScreenState` | Loading / Error / Permission / Entitlement |
| `PrototypeQaPanel` | Prototype-only QA controls |
| `ReviewPackScreen` | Screen composition and capability gates |

## Canonical entitlement + permissions used

- `click_collect`
- `commerce.online_order.orders.access`
- `commerce.online_order.packing.view`
- `commerce.online_order.packing.pack`
- `commerce.online_order.collection.mark_ready`

No role name is embedded in permission codes.

## Responsive behavior

- **Large Desktop >= 1440** — full two-column workspace
- **Desktop 1200–1439** — full two-column compact proportions
- **Tablet Landscape 1024–1199** — compact two-column
- **Tablet Portrait 768–1023** — main one-column flow; order summary adapts internally
- **Phone <= 767** — fully stacked layout; item rows become compact cards
- **Small Phone <= 420** — tighter card/item layout and safe wrapping

## State coverage

QA panel supports:
- Normal
- Loading
- Error
- CommandError
- All items picked / incomplete
- Stress long content
- Permission / entitlement toggles

## Ready transition

Primary action:

`POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/ready`

Success:
`OO-05 Review & Pack → Ready for Collection`

The backend remains authoritative for:
- order/outlet validity
- fulfilment state
- picked/packed quantities
- concurrency
- permission
- entitlement
- readiness rules

## Production handoff

This is a prototype/reference, not production Flutter code.

Flutter implementation should preserve:
- component responsibilities
- responsive rules
- permission/entitlement gates
- state handling
- interaction order

and should reuse existing canonical POS shell, buttons, status, dialog, form and state widgets before creating new feature widgets.
