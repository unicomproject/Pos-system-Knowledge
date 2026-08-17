<!-- status: Active future handoff; blocked by backend P0 gate -->
<!-- last_updated: 2026-08-15 -->
# Tenant Admin Add/Edit Brand — Flutter Content Handoff

Do not start this phase until the Backend/API/RBAC P0 gate in the canonical Brand source truth passes.

Future scope creates **Brand route content only** inside the existing Tenant Admin common layout. Reuse the shared shell, sidebar, header, footer, navigation, theme, responsive outer layout, page scaffold and breadcrumbs. Do not duplicate them.

- Preserve the implemented Brand list and read-only details panel.
- Add and Edit navigate to separate route content within the shared shell.
- Use one reusable form implementation with ADD/EDIT modes; do not create two forms.
- Follow the canonical headings, breadcrumbs, fields and actions.
- No Brand Preview, modal editor, drawer editor or editable details side panel.
- Edit receives `brandId`, shows loading, fetches detail and performs guarded one-time prefill.
- State covers existing/new logo, dirty/submitting/loading, field/global errors and reset between modes/IDs.
- Do not upload an unchanged logo. Support the backend-approved recoverable initial-logo partial-success flow.
- Disable Save during submission, retain values on failure, guard dirty navigation and refresh list/detail after success.
- Verify tablet portrait/landscape, 1024×768, 1280×800, common Android tablets and desktop, including keyboard scrolling, focus, semantics and touch targets.

Current status: **NOT IMPLEMENTED / BLOCKED BY REQUIRED BACKEND P0 CONTRACT CLOSURE**.
