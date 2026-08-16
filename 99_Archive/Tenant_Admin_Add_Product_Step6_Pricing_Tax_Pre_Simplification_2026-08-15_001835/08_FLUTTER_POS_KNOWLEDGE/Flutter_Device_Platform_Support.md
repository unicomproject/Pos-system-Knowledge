<!-- title: Flutter Device Platform Support -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-09 -->


# Flutter Device Platform Support

## Purpose

This file defines device and platform support expectations for OneVerz POS Flutter.

The MVP direction supports selling and operations across mobile, tablet, and
desktop-style devices.

## Supported Business Devices

| Device | Support Direction |
|---|---|
| Android phone | POS and simple admin workflows |
| Android tablet | POS and tenant admin workflows |
| iPhone | POS and simple operational workflows |
| iPad | POS and tenant/admin workflows |
| Windows laptop | Desktop EPOS/admin workflows |
| Windows desktop | Desktop EPOS/admin workflows |

## Responsive Rule

Design screens to adapt to:

- Phone portrait.
- Phone landscape where needed.
- Tablet.
- Desktop/laptop widths.

Do not duplicate feature logic per platform.

Discount-specific behavior follows
[[../13_DECISIONS_AND_CHANGES/POS_CASHIER_DISCOUNT_CURRENT_RELEASE_DECISION_2026-08-09]]:
tablet-first two-column when readable, proportional smaller-tablet adaptation,
and stacked near-full-width/full-height narrow layout. Keyboard/viewInsets,
safe areas, increased text scale, bounded product scrolling, reachable actions,
and no overflow/clipping are mandatory. Screen width never changes Discount rules.

## Hardware Platform Rule

Hardware support may vary by platform.

Printer, scanner, drawer, and card reader integrations must be abstracted through
hardware services and tested per platform.

Required flow is UI → provider/controller → hardware service → typed
adapter/client → local device service/native transport → hardware. Widgets never
perform HTTP, socket, spooler, terminal, or ESC/POS I/O.

| Platform | Hardware boundary |
|---|---|
| Physical Android | Laptop LAN Local Agent; camera/HID where supported |
| Android emulator | Development host mapping only; not physical evidence |
| Windows desktop | Local Agent or accepted desktop transport |
| iOS | Camera/HID target; printer transport remains unverified |

Direct Android USB, Bluetooth and direct TCP production acceptance are pending.
Hardware I/O is bounded asynchronous work and must not freeze the UI.

## Offline Platform Rule

Offline cache and sync behavior must be consistent across supported platforms,
but local storage implementation may differ.

## Customer Online Store Boundary

Customer online store is browser-based and should work on common browsers.

Flutter POS knowledge focuses on staff/business apps, not customer storefront UI.

## Related Files

- [[Flutter_App_Architecture]]
- [[Flutter_Hardware_Payment_Receipt]]
- [[Flutter_Local_Storage_Cache]]
