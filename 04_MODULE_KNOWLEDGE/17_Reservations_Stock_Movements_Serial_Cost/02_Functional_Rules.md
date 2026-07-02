<!-- title: Reservations, Stock Movements, Serial & Cost Allocation Functional Rules -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Reservations, Stock Movements, Serial & Cost Allocation Functional Rules

## Purpose

Defines business and UX rules for `Reservations_Stock_Movements_Serial_Cost` in the new TM-EPOS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens,
responsive online store screens, Angular/admin screens, tests, or database changes.

## Business Rules

- Stock movements are append-only.
- Reservations protect stock during cart checkout, click and collect, or held POS flows.
- Movement reference links stock changes to order, sale, return, exchange, adjustment, or sync source.
- Serial movement must match serial-number tracked products.
- Cost allocation is recorded separately from sale price.

## User Rules

| User Type | Rule |
|---|---|
| Platform Admin | May manage platform-owned setup only when platform permission exists |
| Tenant Admin | May manage tenant-owned configuration only when entitlement and permission pass |
| Cashier / Stall Operator | May perform POS actions only with outlet, trusted device, and till context |
| Customer | May access online store/customer actions only through customer-facing APIs |
| Backend Worker | May process derived records, sync, notifications, or reports using service identity and audit |

## UI Rules

- Show this module only when the tenant plan, feature entitlement, and user permission allow it.
- Use loading, empty, error, permission-denied, feature-disabled, offline, and conflict states where relevant.
- Do not hardcode role names such as cashier, manager, or administrator as authorization logic.
- Do not show fake data, fake counts, fake success states, or hardcoded module rows.
- Mobile, tablet, iPad, laptop, and desktop layouts must keep the same business rules.

## Backend Rules

- Resolve tenant context server-side for every tenant-owned mutation.
- Validate foreign-key ownership within the same tenant before saving.
- Use typed request/response DTOs and map them to domain models/entities.
- Return standard 400, 401, 403, 404, 409, and 500 responses.
- Never expose passwords, POS PINs, token hashes, payment secrets, card data, or cross-tenant records.

## Offline And Cache Rules

- Cache can speed up safe reference data only.
- Backend database remains final truth for sale totals, stock, payments, refunds, exchanges, permissions, and sync acceptance.
- Offline operations must be marked pending until accepted by backend sync.
- Conflicts must be visible; do not silently overwrite backend truth.

## Error Rules

| Case | Expected Behavior |
|---|---|
| Missing login | Return 401 and send user to login/session recovery |
| Permission denied | Return 403 and show access denied state |
| Feature disabled | Return 403 and show feature not enabled state |
| Invalid business data | Return 400 with safe field/form errors |
| Duplicate or conflict | Return 409 with safe conflict message |
| Offline blocked action | Explain that online backend validation is required |

## Out Of Scope

- Manual stocktake counting
- Supplier invoice processing
- Payment refund settlement
- Customer consent records

## Related Files

- [[04_MODULE_KNOWLEDGE/17_Reservations_Stock_Movements_Serial_Cost/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/17_Reservations_Stock_Movements_Serial_Cost/03_Technical_Contract]]
