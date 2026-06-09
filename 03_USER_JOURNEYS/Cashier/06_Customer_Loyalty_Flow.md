<!-- title: Customer Loyalty Flow -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Customer Loyalty Flow

## Purpose

Defines adding customer to sale and using basic loyalty earn/redeem.

## Source Basis

This journey is based on the uploaded SCS-TIX Release 1 user journey files, UI
screens, backend architecture, database design, and confirmed project decisions.

It must not be expanded into e-commerce, offline sync, supplier, delivery, kiosk,
coupon, AI, or accounting scope.

## Actors

| Actor | Responsibility |
|---|---|
| Cashier | Searches/selects or creates customer |
| Customer | Receives loyalty benefit if member |
| Backend | Validates membership and loyalty rules |

## Preconditions

- Cart/sale exists.
- Customer/loyalty feature is enabled where used.
- Cashier has customer/loyalty permission.

## Main Flow

| Step | User/System Action | Expected Result |
|---:|---|---|
| 1 | Tap Add Customer | Customer search screen opens |
| 2 | Search by phone/email/name | Matching customer appears |
| 3 | Select or create customer | Customer attaches to cart/sale |
| 4 | View loyalty summary | Points/membership are shown |
| 5 | Redeem if requested and permitted | Discount/value is applied and ledger prepared |

## Journey Diagram

```mermaid
flowchart TD
    S1[Tap Add Customer]
    S1 --> S2[Search by phone/email/name]
    S2 --> S3[Select or create customer]
    S3 --> S4[View loyalty summary]
    S4 --> S5[Redeem if requested and permitted]
    S5 --> Done[Journey completed]
```

## Business Rules

- Customer records are tenant-scoped.
- Loyalty is basic earn/redeem in Release 1.
- Redeem requires valid membership and permission.
- Loyalty transactions are ledger records.

## Access-Control Rules

| Control | Required Rule |
|---|---|
| Authentication | Required |
| Feature entitlement | Customer/loyalty enabled |
| Permission | Customer select/create and loyalty redeem where used |
| Open till session | Required for sale use |

## Data and API References

| Area | References |
|---|---|
| API groups | `/api/v1/customers`, `/api/v1/loyalty` |
| Tables | `customers`, `customer_memberships`, `loyalty_programs`, `loyalty_transactions`, `sales` |

## Edge Cases

- Customer not found allows create if permitted.
- No loyalty membership disables redeem.
- Insufficient points blocks redemption.

## Out of Scope

- E-commerce customer profile is excluded.
- Advanced loyalty campaigns are excluded.

## Completion Criteria

- The user reaches the expected final state without bypassing access control.
- Tenant-owned data remains inside the resolved tenant context.
- Sensitive actions write audit records where required.
- UI state and backend state stay consistent after completion.

## Related Files

- [[../01_RELEASE_SCOPE/Release_1_Scope]]
- [[../02_ACCESS_CONTROL/Access_Control_Overview]]
- [[../05_BACKEND_ARCHITECTURE/API_Standards]]
