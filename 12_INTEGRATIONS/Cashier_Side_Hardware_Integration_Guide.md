<!-- title: Cashier-Side Hardware Integration Guide -->
<!-- status: Active -->
<!-- system: OneVerz POS -->
<!-- last_updated: 2026-09-08 -->

# Cashier-Side Hardware Integration Guide

## Purpose

This document explains what hardware the cashier can use from the OneVerz POS,
how each device is connected, what the software does, and which physical
production checks are still open. It is a cashier-side operating view; Tenant
Admin registration and assignment remain separate administrative concerns.

Canonical architecture and detailed device contracts remain owned by:

- [[POS_Hardware_Integration]]
- [[Receipt_Printer_Integration]]
- [[Cash_Drawer_Integration]]
- [[Barcode_Scanner_Integration]]
- [[../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]

## Current status at a glance

| Cashier hardware/capability | Cashier-side software path | Physical production status |
|---|---|---|
| Receipt printer | Implemented through Android-direct adapters, network transport, or optional Windows Local Print Agent | Partial; physical PR-* acceptance remains open |
| Cash drawer pulse | Implemented through ESC/POS printer/drawer transport | Partial; recorded POS80 cash-sale pulse passed, remaining DR-* cases open |
| USB HID barcode scanner | Implemented as keyboard-wedge input | Partial; physical SC-* acceptance remains open |
| Camera barcode scanner | Implemented through the app camera scanner | Partial; physical lifecycle/device acceptance remains open |
| Cash In / Cash Drop | Backend-authoritative financial workflow | Software accepted; this is not physical drawer I/O |
| Card payment terminal | Safe provider-unavailable boundary only | Not implemented as a real provider/device integration |
| Scale | No cashier runtime integration | Not implemented |
| Customer display | No cashier runtime integration | Not implemented / deferred |
| Kitchen printer | Catalogue/registry presence is not runtime support | Not implemented |

Overall cashier hardware production status remains **PARTIAL / PHYSICAL
ACCEPTANCE INCOMPLETE**. A working UI, successful API response, generated
ESC/POS bytes, or automated test does not by itself prove that a physical device
works in a customer store.

## Cashier hardware architecture

```text
Activated POS device
  -> authenticated cashier session
  -> selected outlet and till
  -> assigned/configured hardware
  -> Flutter hardware provider/controller
  -> device adapter or Local Print Agent
  -> physical peripheral
  -> typed success/failure shown to cashier
```

Cloud ownership is always scoped as:

```text
Tenant -> Outlet -> POS Device -> Till -> Hardware assignment
```

Hardware configuration does not imply connection or health. The cashier must
not see a fabricated `CONNECTED` state merely because a device is registered.

## 1. Receipt printer

### Cashier experience

The printer is used after an authoritative business operation, including:

- completed-sale receipt printing;
- receipt-history reprint;
- return, exchange and refund documents where supported;
- optional Cash In / Cash Drop slips;
- hardware test printing from the permitted Hardware Settings screen.

Payment/sale completion and printing are separate outcomes. If printing fails,
the POS must not repeat or roll back an already completed sale. The cashier gets
a safe failure and may deliberately retry/reprint according to permission and
receipt identity rules.

### Runtime paths

```text
Android POS -> USB/Bluetooth/native adapter -> ESC/POS printer
```

or:

```text
Flutter POS -> authenticated Local Print Agent -> Windows RAW spooler -> printer
```

Direct network TCP is also represented for supported non-web deployments, but
must not be treated as physically accepted until the target printer is tested.

The optional Local Print Agent uses a configured local endpoint, an
`X-Local-Print-Key`, and network/CIDR restrictions. It must run as deployed
software/service; cashiers must never be required to execute developer commands.

### Safety rules

- Stable receipt/operation identity is used to control duplicate printing.
- Timeout or unknown outcome must not trigger blind automatic resend.
- Printer failure never creates a second sale/payment.
- Customer/payment secrets must not be written to logs.
- Paper width, encoding and cutter support come from configuration.
- Tamil/Unicode physical output remains printer/profile dependent and unverified.

## 2. Physical cash drawer

The physical drawer is printer-driven through an ESC/POS kick pulse, normally
using the receipt printer's RJ11/RJ12 drawer port.

### Cash sale flow

```text
Backend confirms cash sale
  -> receipt print orchestration
  -> approved drawer-open request
  -> printer/drawer transport sends one pulse
  -> physical drawer opens
```

The recorded `POS80 / Cashbox #1 / drawerPin2` automatic cash-sale flow and
controlled direct pulse were physically observed as passed. This does not close
all cash-drawer scenarios.

### Manual/no-sale flow

A manual open requires the relevant cashier permission and the existing audited
drawer operation. The UI must not be the only security control. Backend/device
trust, tenant/outlet/till ownership and operation audit remain authoritative.

### Drawer safety rules

- Do not pulse for card payment or ordinary receipt reprint.
- Do not blindly replay a drawer command after reconnect or app restart.
- Stale requests are rejected; the recorded Local Agent safety window rejected
  requests older than 120 seconds.
- Drawer failure does not reverse a completed payment.
- Cash In/Cash Drop financial records are not proof of a physical drawer pulse.

## 3. Barcode scanner

### USB/Bluetooth HID scanner

The supported cashier model is a keyboard-wedge scanner. The scanner sends a
rapid character sequence followed by its configured terminator (normally
Enter). `PosHidScannerInputService` recognizes a completed scan frame and passes
it into the barcode scan controller.

```text
HID scanner -> scan frame -> Flutter scan controller
  -> backend/catalogue exact barcode lookup
  -> product/variant result
  -> deliberate cart or picking action
```

Leading zeroes must be preserved. Rapid scans are processed in order. An
incomplete frame, unknown barcode or ambiguous match must not mutate the cart.

### Camera scanner

The camera path uses the existing camera-scanner implementation. Permission
denial, camera unavailability, background/resume and duplicate detections must
produce safe UI state and no false cart mutation.

### Online-order picking

For OO-04B, scanning verifies the currently selected fulfilment line only.
Scanning by itself does not increase `PickedQuantity`. The cashier must confirm
`Mark as Picked`, after which the real backend validates selected-line ownership,
barcode, quantity, permission and expected version.

### Scanner fallback

If the physical scanner is unavailable, the cashier may use camera/manual input
only when the corresponding screen and permission allow it. Manual entry must
use the same backend barcode rules and must not become a weaker validation path.

## 4. Till and financial cash operations

The cashier must operate in an activated device context with the correct outlet,
till and open till session. Till session APIs own opening float, session state,
close counts and audit.

Cash Drawer, Cash In and Cash Drop screens are financial workflows backed by
server-side cash movements. Their successful software operation does not mean
that a physical drawer opened or a slip printed.

Expected separation:

| Operation | Backend financial mutation | Physical I/O |
|---|---|---|
| Cash sale | Sale/payment recorded | Receipt and one approved drawer pulse |
| Cash In | Cash movement recorded | Optional slip; drawer behavior follows policy |
| Cash Drop | Cash movement recorded | Optional slip; drawer behavior follows policy |
| Open/close till | Till session recorded | Optional report/print; failure must not corrupt session |

## 5. Hardware Settings and testing

The cashier-side Hardware Settings route is protected by
`pos.hardware.settings`. It contains the implemented hardware capability/test
widgets for printer, cash drawer and scanner paths.

A hardware test is not a financial sale. Where the backend hardware-test report
flow is used, the result is recorded in `hardware_test_logs` and can be displayed
by Tenant Admin. Supported result concepts include `PASSED`, `FAILED`, `WARNING`,
`TIMEOUT` and `NOT_SUPPORTED`.

Never convert a mocked/automated test result into a physical `PASSED` result.
Physical pass requires an operator-observed outcome and evidence reference.

## 6. Permissions relevant to the cashier

| Permission | Cashier capability |
|---|---|
| `pos.hardware.settings` | Open/test permitted POS hardware configuration |
| `receipts.view` | View receipt data |
| `receipts.print` | Print a receipt |
| `receipts.reprint` | Reprint an existing receipt |
| `cash_drawer.view` | View Cash Drawer area |
| `cash_drawer.manage` | Perform protected physical drawer operations |
| `cash_drawer.movement.create` | Create permitted Cash In/Cash Drop movement |
| `pos.till.open` | Open assigned till session |
| `pos.till.close` | Close assigned till session |

Permission-driven Flutter visibility is UX only. Backend authorization,
tenant/resource ownership and trusted device context remain mandatory.

## 7. Cashier error and recovery guide

| Situation | Cashier action | System guarantee |
|---|---|---|
| Printer unavailable/offline | Check configured printer/Agent, then explicitly retry | Completed sale is not duplicated or rolled back |
| Paper, cover, jam or cutter issue | Fix physical issue and run a deliberate test/reprint | No silent resend |
| Print timeout/unknown outcome | Check operation/physical output before retry | Outcome is not falsely treated as failed or successful |
| Drawer does not open | Follow controlled manual procedure and report hardware | Payment remains completed; no blind replay |
| HID scanner disconnected | Reconnect or use permitted camera/manual fallback | Incomplete scan does not mutate cart |
| Barcode not found | Verify label/catalogue data and rescan | No product/cart mutation |
| Camera permission denied | Grant permission/settings or use permitted HID fallback | No fake scan success |
| Hardware permission denied | Contact authorized manager/admin | UI cannot bypass backend policy |
| Card terminal requested | Use an actually available payment method | No fake card-provider success |

## 8. Unsupported cashier assumptions

The cashier must not assume that:

- every configured device is connected;
- a green UI indicator proves physical output;
- receipt printing failure means payment failed;
- Cash In/Cash Drop automatically pulses the drawer;
- a card-reader catalogue entry means a provider is integrated;
- scanner input may bypass exact backend barcode lookup;
- disconnected hardware commands will be replayed automatically;
- another outlet/till device can be selected to bypass assignment.

## 9. Store readiness checklist

Before cashier use, Operations/QA must record:

1. Activated POS device, tenant, outlet and till identity.
2. Active hardware assignment and correct connection configuration.
3. Cashier permissions required for intended operations.
4. Printer model, paper width/profile, connection and test-print evidence.
5. Drawer port/pin and deliberate pulse evidence where applicable.
6. Scanner model, suffix, leading-zero and rapid-scan evidence.
7. Failure/recovery tests for disconnect, timeout and restart.
8. Confirmation that no duplicate sale, print or drawer action occurred.
9. Evidence links in the production acceptance matrix.
10. Accepted limitations and support/rollback contact.

## 10. Release conclusion

Cashier-side integration is structurally available for receipt printing, drawer
pulse, HID/camera barcode capture and backend-authoritative till/cash workflows.
Only the recorded POS80 automatic cash-sale drawer flow is physically accepted
among the highlighted device paths. Printer and scanner physical matrices and
remaining drawer/recovery/deployment cases must be completed before overall POS
hardware can be labelled production ready.

Card terminal, scale, customer display and kitchen-printer cashier runtime paths
must remain shown as unavailable/not implemented until their real integrations
and physical acceptance are delivered.
