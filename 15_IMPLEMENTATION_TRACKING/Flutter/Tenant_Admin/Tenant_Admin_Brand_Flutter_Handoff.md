<!-- status: Active future handoff; blocked on verified backend contract -->
# Tenant Admin Brand — Flutter Handoff

**FLUTTER IMPLEMENTATION MUST ALIGN WITH VERIFIED BACKEND CONTRACT.** Do not integrate final editing, SortOrder, ProductCount or paging assumptions until backend/database contracts and tests are verified.

Future scope:

- One continuous white workspace; left owns breadcrumb/header/Add/search/table/pagination; right permanently owns Brand Details.
- Initial null selection and exact centered no-selection state; no first-row selection or initial detail GET.
- Row selection with restrained highlight, full detail GET and right-only loading/error.
- Add/Create in right region with canonical defaults; Cancel to no selection.
- Edit only full detail; preserve Description and SortOrder; canonical field order; no desktop X.
- Delete selected clears selection and never selects a replacement; orange confirmation with loading/submit guard.
- Exact seven centered proportional desktop/tablet columns; no SortOrder list column; real ProductCount.
- Server search with debounce/page reset/stale protection and initial page size 10 pagination contract.
- JPEG/PNG 2 MB image selection/preview and explicit profile-saved/image-failed partial result.
- Operation-specific permissions; Product and Brand active; Settings inactive.
- Verify all seven target viewports and approved tablet/mobile adaptation.
- Add canonical semantics, tooltips/labels, focus/keyboard, text-scale and touch-target tests.
- Consolidate list/query/mutation state so mutations invalidate the provider actually displayed.

Handoff status: **NOT READY TO IMPLEMENT AGAINST CURRENT BACKEND**; ready for Flutter execution only after Backend/DB verification handoff.
