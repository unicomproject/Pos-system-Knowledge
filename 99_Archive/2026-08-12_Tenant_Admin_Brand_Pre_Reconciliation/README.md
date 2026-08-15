<!-- status: Historical / stale -->
# Tenant Admin Brand pre-reconciliation archive

This archive identifies the exact active documents superseded by the 2026-08-12 Brand reconciliation. Historical content is preserved losslessly in Git at Second Brain baseline `4d8918d16cce6517c50cf39e50d04906c56c2f09`; it is not canonical implementation guidance.

| Historical path | Baseline blob | Reason archived |
|---|---|---|
| `03_USER_JOURNEYS/Tenant_Admin/08_Category_Brand_Management_Flow.md` | `a5ca02c11a328eb3a222ed52d574fee4cd6e8011` | Generic flow omitted selection/detail and data-integrity rules. |
| `08_FLUTTER_POS_KNOWLEDGE/Brands_Management_Screen_Specification.md` | `31cc9bdab3b56916a22b4d2d7b9255f9bd656c3b` | Declared white sidebar, Settings active, Cards, optional side panel and Sort Order list column. |
| `10_TESTING_QA/Test_Case/07_CatalogProduct/Brand_Collection_CRUD_Test_Cases.md` | `3cfcdd181433a2b2c4ae81724cdad589919934a5` | Historical pass claims did not cover the fresh target contract. |
| `15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/Brand_Collection_CRUD_Implementation_Status.md` | `a21e02dfa7132daf42a93f453b3b32778117d518` | Falsely claimed SortOrder, ProductCount, Description response and a nonexistent migration were implemented. |

Recovery example: `git show 4d8918d16cce6517c50cf39e50d04906c56c2f09:<historical-path>`.
