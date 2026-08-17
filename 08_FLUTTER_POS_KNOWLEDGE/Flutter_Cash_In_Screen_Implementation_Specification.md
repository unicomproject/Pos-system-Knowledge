<!-- title: Flutter Cash In Screen Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# Flutter Cash In Screen Implementation Specification

## Scope and status

Preserve the existing Cash In screen under `features/cash_drawer`. Cash In
canonical backend integration and production acceptance are **VERIFIED**
(Chunk 2 + Chunk 3, 2026-08-15). This document remains the Flutter UI/data
contract. Cash Drop is a sibling feature — see
[[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/07_Cash_Drop_Feature]].

## Approved layout

- Reuse the shared Cashier POS top header and bottom navigation.
- Keep one white content surface below the header.
- Show Cash In title and helper text; no back arrow.
- Show Till, Current Expected Cash, and Opening Cash in the information card.
- Wide layouts use a details-dominant two-column body with Cash In Details and
  Cash In Summary.
- Bottom actions are **Cancel** and **Confirm Cash In**.
- Phone may stack sections; Tablet landscape must fit without full-page
  scrolling / overflow (compact spacing).

## Fields

| Field | Contract |
|---|---|
| Amount | Required positive decimal; financial type is decimal |
| Reason | Required `movement_type_id` selected from backend catalog |
| Note | Optional explanation mapped to `cash_movements.reason`, max 500 UI chars |
| Manager PIN | Optional future placeholder only; never authorize, persist, or log |

Do not hardcode the reason catalog. Load active system-global and current-tenant
movement types where direction is `IN`.

## Presentation state

State must cover loading, ready, validation, submitting, success, typed error,
permission denied, no open till, offline, and unknown outcome. Disable Confirm
while invalid or submitting. A local state transition must never claim a
financial success.

## Layer responsibilities (actual paths)

```text
lib/features/cash_drawer/
  presentation/screens/pos_cash_in_screen.dart
  presentation/widgets/cash_in_*.dart
  presentation/providers/cash_in_provider.dart
  domain/entities + repository contract
  data/models + remote datasource + repository implementation
```

Conceptual ownership under `features/pos/cash_drawer` is optional future
alignment only; do not invent duplicate screens.

## API integration

- Reuse current-session/summary calls for till context.
- Use `GET /api/v1/pos/cash-movement-types?direction=IN`.
- Use existing `POST /api/v1/pos/cash-drawer/movements` with canonical body
  (`requestId`, `deviceId`, `movementTypeId`, `amount`, optional `note`).
- Stable idempotency identifier until success/reset.
- Do not treat tenant, outlet, till, user, expected cash, or currency supplied
  by Flutter as authoritative.
- Map typed errors without exposing secrets.

## Canonical response use

The backend response owns movement id/number, amount, currency, performed time,
and refreshed expected cash. On success refresh summary and movements. On an
unknown outcome, resolve using the same idempotency identifier; never issue an
automatic fresh transaction.

## Access and connectivity

- Screen/read data: `cash_drawer.view`.
- Confirm mutation: `cash_drawer.movement.create`.
- Do not substitute `cash_drawer.manage` or role-name checks.
- Financial mutation is online-only until a separately approved offline cash
  control protocol exists.

## Theme

Use shared design tokens (`TenantAdminColors`, spacing, radius). Do not hardcode
raw `#FF6A00` / black in widgets.

## Acceptance gate

Cash In acceptance is complete per
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_In_Chunk_3_Final_Production_Acceptance]].
Cash Drop remains separate and not production-ready until OUT support lands.

## Related files

- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]]
- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/07_Cash_Drop_Feature]]
- [[../03_USER_JOURNEYS/Cashier/10_Cash_In_Out_Flow]]
- [[Flutter_Cash_Drawer_Management_Screen_Implementation_Specification]]
