<!-- title: Product Setup Estimated Variant Count Flutter Implementation -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-02 -->

# Product Setup — Estimated Variant Count Flutter Implementation (2026-09-02)

## Scope

Flutter-only closure for Section 3.4 Estimated Variant Count. Backend unchanged.

## Flutter Files Changed

| File | Change |
|---|---|
| `Nytroz-POS-App/lib/features/tenant_admin/products/domain/utils/variant_estimated_count_calculator.dart` | **NEW** — live Cartesian estimate helper (max 100, formula summary) |
| `Nytroz-POS-App/lib/features/tenant_admin/products/domain/entities/step4_variant_configuration_state.dart` | Derived `estimatedCountResult` getter |
| `Nytroz-POS-App/lib/features/tenant_admin/products/presentation/widgets/step_4/estimated_variant_count_card.dart` | **NEW** — Estimated Variant Count card UI |
| `Nytroz-POS-App/lib/features/tenant_admin/products/presentation/widgets/step_4/variant_configuration_summary_card.dart` | **NEW** — post-generation Configuration Summary card |
| `Nytroz-POS-App/lib/features/tenant_admin/products/presentation/widgets/step_4/step_4_variant_configuration_form.dart` | Wired estimate card + summary card |
| `Nytroz-POS-App/lib/features/tenant_admin/products/presentation/controllers/add_product_wizard_controller.dart` | Max-100 UX validation on generate/continue |
| `Nytroz-POS-App/test/features/tenant_admin/products/variant_estimated_count_calculator_test.dart` | **NEW** — calculator unit tests |
| `Nytroz-POS-App/test/features/tenant_admin/products/estimated_variant_count_test.dart` | **NEW** — widget + draft reopen tests |
| `Nytroz-POS-App/test/features/tenant_admin/products/add_product_wizard_step4_test.dart` | VARIANT/SIMPLE card visibility regression |

## Behaviour Implemented

- Live local Cartesian estimate from selected attributes/values (no API).
- Dynamic formula summary e.g. `Colour (3) × Capacity (2) = 6 variants`.
- Incomplete configuration shows `0 variants` + helper text.
- Proactive max-100 validation in UI and `validateStep4Continue` / `generateVariants`.
- Draft reopen via existing GET /setup mapping recalculates estimate from restored configuration.
- Configuration Summary card remains distinct (post-generation counts).
- SIMPLE/BUNDLE unaffected by estimate card.

## Test Results (2026-09-02)

| Suite | Result |
|---|---|
| Focused Estimated Variant Count tests | 18/18 PASS |
| Product Setup / products tests | 105/105 PASS |
| Changed-file flutter analyze | PASS (info-only style hints) |
| Full Flutter regression | 1439/1447 PASS |

### Full suite unrelated failures (pre-existing)

- `test/features/tenant_admin/product_create_test.dart` — compile error: missing `productCode` on `ProductCreateRequestDto`
- `test/features/tenant_admin/product_filter_test.dart` — Riverpod filter state
- `test/features/tenant_admin/product_type_tracking_widget_test.dart` — widget expectation drift (2 tests)
- Additional unrelated tenant_admin compile/load failures (5 tests)

## Backend Changed

**NO**

## Final Verdict

**FLUTTER PRODUCT VARIANT ESTIMATED COUNT CONTRACT COMPLETE**
