<!-- status: Active canonical target; Add/Edit not implemented -->
<!-- last_updated: 2026-08-15 -->
# Tenant Admin Brand Management and Add/Edit Content Contract

## Preserve implemented list/details

Brand Management keeps the implemented list and read-only detail behavior. The detail panel must remain read-only and must not become the Add/Edit form.

## Common-layout ownership

Future Add/Edit implementation creates only route content. It must reuse the actual shared `TenantAdminLayout`, `TenantAdminPageScaffold`, header, sidebar/drawer, footer, navigation, theme, spacing, responsive outer layout and breadcrumb components. It must not create another Scaffold/shell/sidebar/header/footer.

## One form

Use one reusable form content implementation with ADD and EDIT modes. Exact class name is not locked. Independent duplicated Add and Edit forms are forbidden.

ADD: heading `Add Brand`; breadcrumb `Product / Brand / Brand Management / Add Brand`; empty/default state.

EDIT: heading `Edit Brand`; breadcrumb `Product / Brand / Brand Management / Edit Brand`; receive `brandId`; show loading before editable fields; GET detail; guard prefill so async completion cannot overwrite user edits.

Fields: Brand Name*, Code*, Sort Order, Brand Logo, Description, Status*. Actions: Back to List, Cancel, Save Brand. Brand Preview is excluded. Status options are Active/Inactive only. BrandSlug is hidden/server-managed.

## State and behavior target

State must cover identity, visible fields, existing/new logo, mode, loading, dirty, submitting, field errors and global error. Reset between Add/Edit and Brand IDs. Suppress double save. On failure retain values. Dirty Back/Cancel requires confirmation. Refresh affected list/detail after success.

Initial logo belongs to Create; later replacement belongs to Update. If Brand creation succeeds and logo fails, show recoverable partial success and retry logo without re-creating. Exact mechanism awaits backend closure.

## Responsive/accessibility target

Tablet-first: verify 1024×768, 1280×800, common Android tablet portrait/landscape and desktop. Content must scroll with keyboard, avoid breadcrumb/action overflow, retain usable logo sizing/alignment, and meet shared touch target, focus, label, semantics and error-announcement standards.

Implementation status: **NOT IMPLEMENTED**. Do not begin until the canonical backend P0 gate passes.
