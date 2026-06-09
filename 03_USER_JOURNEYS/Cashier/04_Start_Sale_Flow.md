<!-- title: Start Sale Flow -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Start Sale Flow

## Purpose

Defines cashier start-sale, product search/scan, cart build, and park/recall entry points.

## Source Basis

This journey is based on the uploaded SCS-TIX Release 1 user journey files, UI
screens, backend architecture, database design, and confirmed project decisions.

It must not be expanded into e-commerce, offline sync, supplier, delivery, kiosk,
coupon, AI, or accounting scope.

## Actors

| Actor | Responsibility |
|---|---|
| Cashier | Builds cart and starts sale |
| Backend | Validates product, price, stock, and POS context |
| POS Device | Provides scan/input context |

## Preconditions

- Cashier is authenticated.
- Device is trusted.
- Till session is open.
- Product/catalog feature is available.

## Main Flow

| Step | User/System Action | Expected Result |
|---:|---|---|
| 1 | Tap Start Sale | POS terminal opens |
| 2 | Search/scan/click product tile | Product and variant data is loaded |
| 3 | Select variant where required | Sellable variant is selected |
| 4 | Add item to cart | Cart totals update |
| 5 | Choose next action | Proceed payment, discount, customer, park, or continue sale |

## Journey Diagram

```mermaid
flowchart TD
    S1[Tap Start Sale]
    S1 --> S2[Search/scan/click product tile]
    S2 --> S3[Select variant where required]
    S3 --> S4[Add item to cart]
    S4 --> S5[Choose next action]
    S5 --> Done[Journey completed]
```

## Business Rules

- Sale must remain tenant/outlet scoped.
- Product price/stock must be validated by backend.
- Cart totals must recalculate after item changes.
- Park/recall is supported for held sales.

## Access-Control Rules

| Control | Required Rule |
|---|---|
| Authentication | Required |
| Feature entitlement | POS/catalog enabled |
| Permission | Sale create permission |
| Trusted device | Required |
| Open till session | Required |

## Data and API References

| Area | References |
|---|---|
| API groups | `/api/v1/pos/sales`, `/api/v1/products` |
| Tables | `sales`, `sale_lines`, `products`, `product_variants`, `inventory_balances`, `price_list_items` |

## Edge Cases

- No stock blocks or warns by business rule.
- Inactive product cannot be sold.
- No open till session returns 403/business error.

## Out of Scope

- Offline sale queue is excluded.
- E-commerce order flow is excluded.

## Completion Criteria

- The user reaches the expected final state without bypassing access control.
- Tenant-owned data remains inside the resolved tenant context.
- Sensitive actions write audit records where required.
- UI state and backend state stay consistent after completion.

## Related Files

- [[../01_RELEASE_SCOPE/Release_1_Scope]]
- [[../02_ACCESS_CONTROL/Access_Control_Overview]]
- [[../05_BACKEND_ARCHITECTURE/API_Standards]]
