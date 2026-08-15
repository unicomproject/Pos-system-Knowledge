<!-- title: POS Offers Product List Backend Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-31 -->

# POS Offers Product List Backend Implementation Status

## 2026-08-13 — Authoritative Checkout Integration Pass

Status: **PARTIALLY IMPLEMENTED — RELEASE BLOCKED PENDING RUNTIME ACCEPTANCE**

- Checkout summary now resolves eligible automatic LINE discount policies from canonical backend data using tenant, outlet, POS channel, active window, target INCLUDE/EXCLUDE, minimum quantity, priority, calculation method, cap, and current authoritative price-list value.
- Start-payment repeats the same backend resolution; Flutter does not submit or control offer price, discount amount, line total, or grand total.
- Automatic promotion amounts are persisted in existing `sales_order_lines.discount_amount` and `sales_order_discounts` policy snapshots, and are included in receipt discount lines/totals.
- Manual cashier applications remain supported. The safe current rule is exclusivity: an automatic promotion and manual discount application cannot be combined; checkout returns `pos_checkout.discount_stacking_not_allowed`.
- Focused backend checkout suite passes 19/19 including quantity 1/2 and inactive/expired policy cases. Flutter analyze passes.
- Still required before release-ready status: authenticated runtime catalog-to-cart-to-payment transaction, read-only database verification, receipt rendering evidence, park/recall runtime verification, and offline/conflict acceptance. Conditional `DiscountPolicyCondition` rules remain display-only and are not automatically applied by checkout.

## Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | CatalogProduct / POS |
| Feature | Offers Product Discovery (`segment=offers`) |
| Status | Not Started |
| Completed Date | - |
| Branch | - |
| PR / Commit | - |
| Tests | Not Run |

---

## Feature Summary

Lists products with active targeted discount policies or special compare-at prices. Computes selling price, offer price, and promotional badges dynamically while preserving core pricing and checkout rules.

---

## API Contract (Planned)

| Method | Route | Query | Permission |
|---|---|---|---|
| GET | `/api/v1/pos/products` | `deviceId`, `segment=offers`, optional `categoryId`/`search` | `products.view` |

---

## Files Changed

```text
No implementation files changed. Documentation phase only.
```

---

## Tests Written

```text
Planned test coverage documented.
Implementation tests not created.
Result: Not Run.
```

---

## Related Files

- [[../../../../04_MODULE_KNOWLEDGE/21_POS_Operations/06_Offers_Product_Discovery_Feature]]
- [[../../../../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Offers_Product_Discovery_Test_Cases]]
- [[../../../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
