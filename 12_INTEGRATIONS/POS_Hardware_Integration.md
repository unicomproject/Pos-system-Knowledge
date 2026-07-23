<!-- title: POS Hardware Integration -->
<!-- status: Draft -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# POS Hardware Integration

## Camera barcode scanner status (2026-07-22)

The Flutter New Sale camera scanner is implemented with `mobile_scanner 7.4.0`
for Android and iOS. It uses the existing exact barcode queue/cart pipeline and
does not replace USB HID scanning. Android permission and optional-camera
configuration, iOS usage text, one-frame locking, lifecycle disposal, torch,
cancel handling, and Windows fallback are implemented. Android debug APK build
and automated tests pass. Physical Android camera acceptance remains pending.

