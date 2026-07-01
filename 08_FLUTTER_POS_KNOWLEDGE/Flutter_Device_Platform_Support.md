<!-- title: Flutter Device Platform Support -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Flutter Device Platform Support

## Purpose

This file defines device and platform support expectations for TM-EPOS Flutter.

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

## Hardware Platform Rule

Hardware support may vary by platform.

Printer, scanner, drawer, and card reader integrations must be abstracted through
hardware services and tested per platform.

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
