<!-- title: Flutter Product Variant Popup Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-01 -->

# Flutter Product Variant Popup Implementation Specification

## Purpose And Authority

Flutter implementation must follow [[../04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]]. This document defines client layering only; it does not claim implementation completion.

## Target Architecture

```text
responsive widget/modal
-> Riverpod notifier/controller and typed view state
-> domain use case/repository interface
-> data repository
-> typed remote datasource/DTO
-> POS API
```

Widgets must not issue HTTP requests, calculate authoritative money/tax/discount/stock, or own persistence. DTOs stay in the data layer; domain models and explicit loading/ready/submitting/error/conflict states drive presentation.

## UI State And Behaviour

- Render option groups and values dynamically by IDs. The controller filters viable combinations, clears incompatible selections and resolves exactly one selectable variant.
- Render one image component using the backend-resolved image/fallback; no gallery, thumbnails or navigation.
- State owns resolved variant, quantity/manual-input validation, trimmed nullable line note, selected recommendation IDs and any nested recommendation-variant resolution.
- Submit one logical request, consume the backend-authoritative cart response, and update local cart state only after success. Use an in-flight guard/idempotent client request identity to prevent duplicate taps and partial recommendation additions.
- Handle initial loading, recommendation-only failure, detail error/retry, unavailable/conflict refresh, offline/stale data and safe disposal/cancellation.
- Use centred dialogs on desktop/tablet landscape, adaptive dialog/sheet on tablet portrait and full-screen modal/sheet on mobile. Keep action/note reachable with the keyboard, wrap chips/cards, support keyboard/screen readers, 44x44 targets and overflow tests.

## Test Responsibilities

Controller/unit tests cover ID-based resolution, incompatible resets, quantity/note normalization, recommendation state and submission locking. Repository/datasource tests cover typed request/response and error mapping. Widget/golden tests cover one-image-only behaviour, responsive layouts, accessibility, keyboard reachability, loading/error/retry/conflict and cancellation without cart mutation. Integration tests prove backend-returned price/tax/total replaces any preview value.

## Status

Documentation Ready. Existing `PosProductVariantSheet` and resolved-variant direct-add code are partial evidence only. Production popup, note/recommendation integration, tests and physical validation remain Pending.

## Related Files

- [[Flutter_Cashier_POS_Implementation_Map]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Product_Variant_Popup_Implementation_Status]]
- [[../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Product_Variant_Selection_Popup_Test_Cases]]
