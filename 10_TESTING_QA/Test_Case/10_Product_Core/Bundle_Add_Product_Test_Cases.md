<!-- title: Bundle Add Product Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->

<!-- title: Bundle / Kit QA Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->

# Bundle / Kit QA Test Cases

1. select BUNDLE structure
2. Bundle parent tracking controls hidden
3. Inventory Method = Component-based
4. Step 2 → Step 4 (Step 3 NOT APPLICABLE)
5. legacy BUNDLE Step 3 draft normalizes to Step 4
5b. Step 4 Back → Step 2
5c. malformed duplicate API payload returns duplicate_component
6. BUNDLE renders Bundle Composition
7. SIMPLE does not render Bundle Composition
8. VARIANT does not render Bundle Composition
9. Add Component opens right drawer
10. Cancel drawer changes nothing
11. Escape closes drawer
12. Product Name search
13. SKU search
14. Barcode search
15. exact Variant SKU search
16. exact Variant Barcode search
17. inactive Product excluded
18. Draft Product excluded
19. archived/deleted Product excluded
20. Bundle candidate excluded
21. current Bundle excluded
22. non-inventory Product excluded
23. Simple Product selected directly
24. Variant parent requires exact Variant
25. inactive Variant blocked
26. cross-tenant Product blocked
27. cross-tenant Variant blocked
28. Required Qty zero rejected
29. Required Qty negative rejected
30. invalid decimal rejected
31. valid decimal UOM accepted
32. Unit read-only
33. selected Outlet stock used
34. other Outlet stock excluded
35. Outlet change refreshes stock
36. Supports Bundles calculation correct
37. Bundle min calculation correct
38. Limiting Component correct
39. duplicate Simple component merged
40. duplicate exact Variant merged
41. Edit quantity recalculates summary
42. Remove recalculates summary
43. zero-stock component can be configured
44. zero-stock component makes Bundle availability zero
45. Batch stock calculation
46. expired stock excluded
47. serial stock handled correctly
48. no Batch selected during Bundle setup
49. no Serial selected during Bundle setup
50. First Step 4 Save Draft with 0 components creates one empty combo_definitions row, zero combo_components rows.
50b. First non-empty Save creates/updates combo_definitions and inserts combo_components.
50c. Repeated Save updates combo_components.
50d. All components removed physically deletes all combo_components rows.
51. Save Draft with 1 component succeeds
52. Save & Continue with <2 fails
53. Save & Continue with 2 valid succeeds
54. Draft Resume restores exact components
55. current stock refreshed after Draft Resume
56. duplicate DB rows prevented
57. missing Bundle manage permission returns 403
58. missing inventory permission does not leak stock
59. missing cost permission hides cost
60. stale rowVersion returns 409
61. Bundle → SIMPLE confirmation
62. Bundle → VARIANT confirmation
63. confirmed type change clears Bundle draft mappings
64. Step 4 Skip unavailable
65. Step 4 success targets Step 5
66. final Review rejects newly inactive component
67. final Review rejects deleted component
68. POS Bundle sale uses quantity multiplier
69. insufficient component stock blocks sale
70. component deductions remain atomic
71. Step 1 Batch/Expiry/Serial on a later BUNDLE selection shows the parent-identity warning
72. confirmed BUNDLE conflict clears initial tracking values and creates no Bundle-parent `product_batches` / `serial_numbers`
73. Product Setup identity persist does not invent Bundle parent stock quantity
71. Step 1 Initial Tracking values with BUNDLE selected show the parent-identity warning
72. Confirming BUNDLE conflict clears provisional Batch/Expiry/Serial and does not create Bundle-parent `product_batches` / `serial_numbers`
73. Cancelling the BUNDLE conflict warning retains Step 1 values and does not advance/save the incompatible structure change silently

