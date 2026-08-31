<!-- title: Cash In Chunk 2 Flutter Backend Integration Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Cash In Chunk 2 Flutter Backend Integration Status

> Tracks Flutter wiring of the existing Cash In UI to the canonical Cash In
> backend completed in Chunk 1. Canonical feature authority remains
> [[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]]
> and [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_In_Screen_Implementation_Specification]].

**Status:** CASH IN CHUNK 2 FLUTTER API INTEGRATION COMPLETE — FINAL RUNTIME ACCEPTANCE PENDING

## Source of truth

- Cash In Chunk 1 backend/database: COMPLETE
- Cash In Chunk 2 Flutter API integration: COMPLETE
- Existing Cash In presentation preserved (no redesign; no Back Arrow)
- Canonical mutation: `POST /api/v1/pos/cash-drawer/movements`
- Canonical types: `GET /api/v1/pos/cash-movement-types?direction=IN`

## Implementation status summary

```text
Cash In Chunk 1 backend/database:
COMPLETE

Cash In Chunk 2 Flutter API integration:
COMPLETE

Movement types backend loading:
IMPLEMENTED

Hardcoded production reason authority:
REMOVED

Canonical POST integration:
IMPLEMENTED

Idempotency requestId:
WIRED

Backend-authoritative currency:
WIRED

Backend-authoritative expected cash:
WIRED

No-open-till state:
WIRED

Permission state:
WIRED

Manager PIN transmitted:
NO

Focused Flutter tests:
VERIFIED

Flutter regression:
VERIFIED

Responsive runtime acceptance:
PASS (logical viewport matrix + tablet layout)

Production acceptance:
PASS — see [[Cash_In_Chunk_3_Final_Production_Acceptance]]
```

## Verified behavior

- Reason dropdown values are backend `movementTypeId` options (global + tenant).
- Empty catalog disables Confirm and does not restore hardcoded fallbacks.
- Submit payload: `requestId`, `deviceId`, `movementTypeId`, `amount`, optional `note`.
- Submit payload excludes tenant/outlet/till/session/cashier/currency/expected cash/managerPin.
- Same logical retry reuses `pendingRequestId`; new Cash In generates a new id.
- Success refreshes Cash Drawer summary/movements before leaving the screen.
- Failure preserves amount/reason/note; no optimistic financial success.

## Verification

- Focused `flutter test test/features/cash_drawer/`: PASS — 32 / 32
- `flutter analyze`: PASS — No issues found
- Full `flutter test`: PASS — 1060 / 1060

## Remaining

Responsive + accessibility + authenticated runtime + end-to-end final acceptance.
