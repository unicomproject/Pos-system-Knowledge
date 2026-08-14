<!-- title: Product Variant Popup Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-02 -->

# Product Variant Popup Implementation Status

| Item | Value |
|---|---|
| Platform | Flutter |
| Feature | Cashier Product Variant Selection Popup |
| Documentation | Documentation Ready |
| Implementation | Partial: production Flutter popup and cart-calculation integration implemented; configurable recommendations and fractional cart quantities remain constrained |
| Tests | 10/10 focused and 114/114 cart/sale Flutter tests passed; full suite 702 passed / 11 failed in unrelated pre-existing POS shell/widget expectations |
| Production Validation | Pending |

## Implemented Evidence (2026-08-02)

- Stable option/value IDs resolve the exact sellable variant; variant SKU, selectability, stock state, one image and decimal authoritative price are mapped.
- Optional line note is trimmed, limited to 500 characters, included in the Chunk 2 cart request and used in cart line identity.
- Frequently Bought Together loads independently (maximum three), retains recommendation metadata and cannot partially mutate the local cart before backend cart calculation succeeds.
- The existing New Sale grid and direct barcode/simple-product paths are preserved; configurable products use the single existing variant popup entry point.
- Submission is guarded against double taps and keeps the popup state open on backend failure.

### Changed Flutter Paths

`lib/core/network/api_endpoints.dart`; `lib/features/cart/domain/entities/pos_catalog_models.dart`; `lib/features/cart/data/datasources/pos_catalog_remote_datasource.dart`; `lib/features/cart/presentation/providers/pos_catalog_provider.dart`; `lib/features/cart/presentation/providers/pos_new_sale_cart_provider.dart`; `lib/features/cart/presentation/providers/pos_parked_sale_provider.dart`; `lib/features/sale/domain/entities/pos_checkout_summary.dart`; `lib/features/sale/presentation/providers/pos_checkout_summary_provider.dart`; `lib/features/sale/presentation/widgets/new_sale/pos_product_variant_sheet.dart`; `lib/features/pos/presentation/widgets/new_sale/cart/pos_cart_row.dart`; related tests.

### Validation Evidence

- `flutter analyze`: clean after the final lint correction.
- Focused command covering popup flow and cart contracts: 10/10 passed.
- Complete `test/features/cart` + `test/features/sale` groups: 114/114 passed.
- Final full Flutter run: 702 tests passed and 11 failed. Failures were in pre-existing POS home/top-bar/shared widget expectations, not the focused popup/cart tests; therefore the repository-wide suite is not recorded as green.
- Backend-to-Flutter real-environment, emulator, physical tablet, barcode hardware, orientation, keyboard and receipt validation: Pending.

### Remaining Limitations

- Fractional quantity is deliberately blocked because the active legacy cart contract accepts integer quantity; no rounding or integer approximation is sent. Status: Partial.
- Recommended products that themselves require configuration are shown but cannot be selected atomically in this popup. Status: Partial.
- Explicit displayed-price comparison token and completed-order-detail note projection are not exposed by the active backend contract. Status: Pending.
- Production Complete is not claimed without real backend, device and end-to-end evidence.

## Target-Screen UI Alignment (2026-08-02)

- The existing popup now uses an adaptive 68–74% wide centred dialog on landscape/desktop, a three-section image/configuration/recommendation layout, and stacked portrait/mobile layouts.
- Popup-scoped OneVerz orange/navy/grey tokens replace the previous blue/purple controls without changing the global theme.
- The approved single-image rule is preserved: resolved variant image, then product image, then placeholder. No thumbnails, carousel, arrows or swipe navigation were introduced.
- Product hierarchy, compact option controls, grouped quantity stepper, compact 500-character note, right-side FBT card, orange Add to Cart and neutral Cancel action now follow the approved target.
- Production `isLegacyFixture` cart-validation bypass was removed. Missing stable option/UOM metadata now disables submission and cannot mutate the local cart.
- Recommendation integer rounding and hardcoded `Recommendation` category were removed. A recommendation with a non-integral price is not selectable under the active integer cart model; its decimal price remains displayed.
- Silent `LKR` substitution was removed from the affected detail/variant/recommendation mapping. Missing currency produces a safe unavailable-price state.

### Target-Alignment Validation

- `flutter analyze`: no issues.
- Focused popup, contract, checkout and responsive tests: 16/16 passed.
- Full Flutter suite: 703 passed / 11 failed; the 11 failures match the existing unrelated POS shell/top-bar/widget baseline.
- Pixel Tablet emulator `emulator-5554`, Android 15 API 35, was detected. Authenticated real-backend popup visual-state validation was not completed, so emulator visual evidence remains Pending.
- Physical tablet and physical scanner validation remain Pending.

## Related Files

- [[../../../04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Product_Variant_Popup_Implementation_Specification]]
- [[../../../03_USER_JOURNEYS/Cashier/04_Start_Sale_Flow]]
