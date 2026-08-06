<!-- title: POS Frequently Sold Backend Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-31 -->

# POS Frequently Sold Backend Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | CatalogProduct / POS |
| Feature | Frequently Sold Product Discovery (`segment=frequently-sold`) |
| Status | Completed |
| Completed Date | 2026-07-31 |
| Branch | - |
| PR / Commit | Current working tree |
| Tests | All 20 repository integration tests passed |

---

## Feature Summary

Dynamic lookback calculation aggregating completed sales at the product level for the current outlet over a rolling 30-day lookback window. Excludes draft, incomplete, voided, or cancelled sales. Deducts cancelled and returned quantities.

---

## API Contract (Planned)

| Method | Route | Query | Permission |
|---|---|---|---|
| GET | `/api/v1/pos/products` | `deviceId`, `segment=frequently-sold`, optional `categoryId`/`search` | `products.view` |

---

## Files Changed

```text
- src/E_POS.Infrastructure/Modules/Tenant/CatalogProduct/Repositories/PosProductCatalogRepository.cs
```

---

## Tests Written

```text
Five new integration test cases added to PosProductCatalogRepositoryTests.cs:
- ListProductsAsync_FrequentlySold_ReturnsRankedProducts
- ListProductsAsync_FrequentlySold_DeductsCancellationsAndReturns
- ListProductsAsync_FrequentlySold_ExcludesNonCompletedAndOldOrders
- ListProductsAsync_FrequentlySold_ResolvesConfigsAndAppliesLimit
- ListProductsAsync_FrequentlySold_ObeysTenantAndOutletIsolation
Result: Passed (20/20 total repository tests).
```

---

## Related Files

- [[../../../../04_MODULE_KNOWLEDGE/21_POS_Operations/05_Frequently_Sold_Product_Discovery_Feature]]
- [[../../../../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Frequently_Sold_Product_Discovery_Test_Cases]]
- [[../../../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
