<!-- title: POS Offers Product List Backend Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-31 -->

# POS Offers Product List Backend Implementation Status

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
