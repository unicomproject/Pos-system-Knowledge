# OO-04 — Pick Order Componentized Prototype

This package is the componentized HTML/CSS/JS prototype for the **Pick Order** screen.

## Included prototype behavior

- Corrected OneVerz POS header and bottom navigation
- Responsive desktop / tablet / phone layout
- Canonical OO-04 stepper:
  1. Pick Items
  2. Review & Pack
  3. Ready for Collection
- Picking list cards
- Order progress card
- Picking tips
- Add Picking Note
- Scan Item Barcode
- Review & Pack CTA
- Permission + entitlement gating
- Prototype QA panel for states and toggles

## Component breakdown

| Component | Responsibility |
|---|---|
| `AppShell` | OneVerz POS header + footer shell |
| `PickOrderScreen` | Main OO-04 layout and sections |
| `PrototypeQaPanel` | Prototype-only controls |
| `PermissionService` | Simulated permission / entitlement toggles |

## Permission coverage

Underlying screen access:
- `click_collect`
- `commerce.online_order.orders.access`
- `commerce.online_order.picking.view`

Screen capability coverage:
- `commerce.online_order.picking.pick`
- `commerce.online_order.picking.scan`
- `commerce.online_order.picking.notes.manage`
- `commerce.online_order.packing.pack`

## State coverage

Available in the QA panel:
- Normal
- Loading
- Error
- All items picked
- Stress long content
- Permission/entitlement on/off

## Responsive behavior

- **Desktop:** two-column layout matching the design reference
- **Tablet:** stacked major sections, optimized cards
- **Phone:** single-column layout, compressed header, preserved shell, readable item cards

## Production handoff note

This prototype is a visual/interaction reference only.

Production Flutter should:
1. reuse the existing POS shell/navigation widgets,
2. reuse canonical cards/buttons/status widgets,
3. keep permission checks server-authoritative,
4. move logic to providers/use-cases/repositories,
5. navigate from **OO-04 Pick Order** to **OO-05 Review & Pack** only after all picking requirements pass.
