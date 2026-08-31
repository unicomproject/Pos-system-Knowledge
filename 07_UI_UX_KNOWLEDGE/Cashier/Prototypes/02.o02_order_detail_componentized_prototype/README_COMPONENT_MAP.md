# OO-02 Order Detail — Componentized Prototype

This package is the production-style **prototype/reference** for the Online Order detail screen.

## Main component boundaries

| Component | Responsibility | Canonical capability / rule |
|---|---|---|
| `AppShell` | OneVerz POS header, responsive mobile context strip, bottom navigation | Reuse existing POS shell in Flutter |
| `OrderHero` | Back action, order identity, customer, collect-by, Start Fulfilment CTA | `orders.view`, `fulfilment.start` |
| `OrderSummaryCards` | Collection / Payment / Items summaries | View projection only |
| `OrderItemsList` | Product image placeholder, variant, SKU, quantity, pick entry point | View projection; picking is next workflow |
| `StartFulfilmentModal` | Prototype confirmation before start command | `commerce.online_order.fulfilment.start` |
| `ScreenState` | Loading / Error / Permission Denied / Feature Not Entitled | Canonical NFR states |
| `PrototypeQaPanel` | Prototype-only permission and stress simulation | Never copy to production |

## Permission + entitlement gates

- `click_collect`
- `commerce.online_order.orders.access`
- `commerce.online_order.orders.view`
- `commerce.online_order.fulfilment.start`

If `fulfilment.start` is missing, the screen remains visible but **Start Fulfilment is disabled** and shows the required permission. If `orders.access` or `orders.view` is missing, the screen becomes a permission-denied state.

## Responsive behavior

- **Desktop >= 1200px:** hero is 3-column; three summary cards in one row; full product-row presentation.
- **Tablet 768–1199px:** order identity + collect-by share row; Start Fulfilment moves full width; product rows compress.
- **Phone <= 767px:** order hero stacks, summary cards become single-column, item rows become compact two-column cards, header/footer are preserved and POS context moves to a horizontal strip.

## Stress coverage

The Prototype QA control can enable:
- long order ID
- long customer classification
- long outlet name
- very large amount
- large item/unit counts
- long product names, variants and SKU values
- permission / entitlement failure
- loading
- error

## Production handoff

The HTML/CSS/JS is not production Flutter code. Production implementation should:
1. Read the canonical Online Order MD documents.
2. Reuse the existing POS shell / chips / state widgets / dialog patterns first.
3. Map these prototype responsibilities to Flutter widgets/providers.
4. Use the canonical backend endpoint for Start Fulfilment:
   `POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/fulfilment/start`
5. Keep authorization backend-authoritative.
