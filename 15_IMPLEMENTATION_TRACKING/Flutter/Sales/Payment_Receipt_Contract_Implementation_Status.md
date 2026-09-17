<!-- title: Payment Receipt Contract Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->

# Payment Receipt Contract Implementation Status

## Pending receipt confirmation queue — 2026-09-15

Status: **IMPLEMENTED — AUTOMATED VALIDATION COMPLETE; PHYSICAL PRINTER
ACCEPTANCE PENDING**.

The completed-sale recovery controller no longer replays `pendingPrint` during
startup. Legacy pending work is converted to `awaitingConfirmation` and held in
the encrypted device store. Confirmed printer-unavailable/not-configured
failures enter the same queue. Receipt History shows the pending count and an
authorized operator can either confirm **Print Now** or confirm **Remove**.
Reconnect/restart/provider initialization cannot print. Print Now uses a fresh
request identity; success removes the pending entry, while another confirmed
unavailable result stays pending. Remove performs no physical request.

Changed Flutter owners:

- `recovery/print_operation.dart`
- `recovery/print_operation_store.dart`
- `completed_sale_print_provider.dart`
- `pos_receipt_history_screen.dart`
- `completed_sale_local_print_agent_test.dart`

Focused receipt validation covers legacy startup without printing, explicit
confirmation printing once, removal with zero physical calls, unavailable
printing entering the manual queue, and existing copies/audit-only/Payment
Success behavior. No backend API, database schema, migration or permission code
was added.

## Cash recovery follow-up — 2026-09-12

Recovered cash success now hydrates the original authoritative payment and stored
receipt snapshot, including receipt/sale IDs, item discounts, tenders, tax/discount
lines, cashier/till/outlet and completion timestamp. Completed-cart locking is
separate from explicit next-sale reset; receipt state is retained. Recovery does
not auto-repeat physical output. Runtime receipt `RCP-000186` matched DB subtotal
4500, discount 1125, tax 0, total 3375, tender 4000 and change 625 (LKR).
The UI displayed the UTC time 05:14 while DB local time was 10:44 +05:30; this is
a display-timezone observation, not a different payment timestamp. Physical
paper/drawer confirmation is not established by software acceptance alone.

## Status Summary

| Item | Value |
|---|---|
| Platform | Flutter + Backend POS |
| Module | Payment/Refund and POS Operations |
| Feature | Authoritative payment receipt and print orchestration |
| Status | Testing |
| Completed Date | - |
| PR / Commit | Current working trees; no commit created |
| Tests | Targeted pass; full Flutter suite has unrelated failures |

## Feature Summary

Cash completion returns an authoritative receipt snapshot consumed by Flutter.
Completed-sale and Receipt History paths use one printer service and Local Agent
HTTP transport. Card cannot be stored as cash; real Card and Split execution are
not complete.

## Related Second Brain Files

| Area | File |
|---|---|
| Module | [[../../../04_MODULE_KNOWLEDGE/24_Payment_Refund/01_Module_Overview]] |
| POS contract | [[../../../04_MODULE_KNOWLEDGE/21_POS_Operations/03_Technical_Contract]] |
| Journey | [[../../../03_USER_JOURNEYS/Cashier/07_Payment_Flow]] |
| Database | [[../../../06_DATABASE_KNOWLEDGE/Tables/24_Payment_And_Refund_UPDATED]] |
| Integration | [[../../../12_INTEGRATIONS/Receipt_Printer_Integration]] |

## Files Changed

Backend checkout/receipt DTOs and repositories, provider-neutral Card contract,
Flutter receipt models/mapper/controller/printer client/recovery/history, and
Local Agent contract/builder/tests are in the current working trees.

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| POS authentication/context | Done | Existing checkout boundary |
| Receipt print permission | Done | Backend audit/reprint boundary |
| Activated device/config | Done | Device-scoped Flutter configuration |
| Merchant-copy-specific permission | Gap | No distinct approved permission |
| Provider authorization | Blocked | No real Card provider |

## Database Tables Used

| Table | Usage |
|---|---|
| `sales_orders`, `sales_order_lines` | Authoritative sale |
| `sales_payments`, `sales_payment_transactions` | Cash/provider-safe outcome |
| `receipts` | Immutable `receipt_data_json` snapshot |
| `receipt_print_logs` | Idempotent print/reprint audit |
| Stock/discount/tax tables | Completion calculation and snapshots |

## Implemented Scope

- Receipt contract v2 tenders, safe card display, discounts, tax, copy metadata.
- v1 receipt compatibility at Local Agent boundary.
- No Flutter financial recalculation.
- One stable physical attempt and one audit per intended copy.
- Durable pending-print/audit/unknown recovery with no silent POST retry.
- Receipt History reprint uses original snapshot and creates no new sale/payment.
- Card gateway outcomes fail safely; completed provider mapping stores safe data.

## Known Gaps

- No real Card provider/terminal or physical Card receipt.
- QR and atomic Split persistence/UI are not implemented.
- Copy policy is device-printer configuration with a safe one-customer/
  zero-merchant fallback; physical multi-copy acceptance is pending.
- Tax registration number/invoice label has no authoritative configured source.
- Return/exchange/refund receipts and till reports lack full print acceptance.
- Full Flutter suite has seven unrelated New Sale widget/render failures.

## Tests Written

| Test type | Evidence | Result |
|---|---|---|
| Backend integration | Checkout/receipt/idempotency/provider outcomes | Passed |
| Flutter targeted | Mapper, Local Agent, copies, audit/rebuild recovery | 26 passed |
| Local Agent | Contract/format/security/idempotency | 30 passed |
| Full Flutter | Existing repository suite | 651 passed, 7 failed |

## Test Commands Run

```text
dotnet build E_POS.sln --configuration Release
dotnet test
flutter analyze
flutter test
flutter build apk --debug
```

## Test Result Summary

Backend full tests passed 1,363; Flutter analysis and Android debug build passed.
Targeted payment/receipt tests passed. Full Flutter is not green due to seven
New Sale widget/render failures, so this feature remains `Testing`.

## Physical Verification

Cash/POS80 output was observed in development. Current original/reprint contract
v2, customer/merchant copies, tax/discount layout, barcode scan, corrected cut,
and all failure/recovery cases are not fully physically accepted.

## Second Brain Updates

Payment, POS and Hardware module files, journeys, Flutter map, integration
documents, and feature index were aligned on 2026-07-29.

## Final Completion Checklist

| Check | Status |
|---|---|
| Authoritative receipt mapping | Yes |
| Duplicate prevention/audit recovery | Yes |
| Real Card provider | No |
| Atomic Split | No |
| Full Flutter suite green | No |
| Required physical acceptance | No |
| Status may be Completed | No |

## Hardware Chunk 2 update (2026-07-29)

- Return/exchange/refund completion now uses the same structured Local Agent
  transport as completed sales; the obsolete unsupported RAW-byte path is no
  longer selected for Local Agent.
- Purpose/configuration/copy identity and typed Agent outcome are sent to the
  backend print audit.
- UI/provider rebuild cannot repeat the automatic sale print. Audit-only retry
  cannot resend paper.
- Ambiguous output is recorded as unknown. Operator confirmation creates a new
  audit identity linked to the physical request rather than overwriting or
  repeating it.
- Targeted receipt/hardware recovery tests pass. Full physical POS80 acceptance
  and controlled historical non-sale reprints remain pending.
- Status: `PARTIALLY IMPLEMENTED / RUNTIME VERIFICATION REQUIRED`.

## Related Files

- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Hardware_Payment_Receipt]]
- [[../../../12_INTEGRATIONS/Card_Reader_Integration]]
- [[../../../12_INTEGRATIONS/Payment_Gateway_Integration]]
- [[../../../15_IMPLEMENTATION_TRACKING/Backend/POSOperations/Receipt_Printer_Local_Agent_Implementation_Status]]
