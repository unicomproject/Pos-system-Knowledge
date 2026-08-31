# OO-06 — Ready for Collection Production-Level Prototype

This package is the production-style HTML/CSS/JS prototype for the **Ready for Collection** screen.

## Component boundaries

| Component | Responsibility |
|---|---|
| `AppShell` | Approved OneVerz POS header, responsive context strip, bottom navigation |
| `SummaryMetrics` | Items / Picked / Remaining / Units |
| `ReadyHero` | Success state, next steps, notification/print/share actions |
| `OrderSummary` | Order/customer/collection/progress/ready status |
| `ScreenState` | Loading / Error / Permission / Entitlement states |
| `PrototypeQaPanel` | Prototype-only QA controls |
| `ReadyCollectionScreen` | Screen composition and capability gates |

## Canonical entitlement + permissions

- `click_collect`
- `commerce.online_order.orders.access`
- `commerce.online_order.orders.view`
- `commerce.online_order.collection.view_ready`
- `commerce.online_order.collection.notify_customer`

### Important permission rule

No unsupported permission was invented for:
- Print Collection Slip
- Share Collection Info

Those remain prototype actions until their authority is explicitly defined elsewhere in Second Brain.

## Responsive behavior

- **Large Desktop >= 1440** — full two-column layout
- **Desktop 1200–1439** — compact two-column layout
- **Tablet Landscape 1024–1199** — compact two-column
- **Tablet Portrait 768–1023** — single main flow; summary adapts internally
- **Phone <= 767** — stacked layout, 2×2 metric grid, vertical next-step flow
- **Small Phone <= 420** — tighter layout and safe wrapping

## State coverage

QA panel supports:
- Normal
- Loading
- Error
- Notification idle / success / error
- Stress long content
- Permission / entitlement toggles

## Business flow position

`OO-05 Review & Pack`
→ `OO-06 Ready for Collection`
→ notify customer
→ wait for customer
→ collection verification / handover flow

## Production handoff

This HTML/CSS/JS package is a prototype/reference only.

Flutter production implementation should preserve:
- component ownership
- responsive behavior
- canonical permission/entitlement gates
- notification success/failure behavior
- readiness state
- navigation order

and reuse the existing POS shell and canonical shared widgets before introducing new feature widgets.
