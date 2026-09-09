<!-- title: Tenant Admin User Creation 5-Step Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-25 -->

# Tenant Admin User Creation 5-Step Test Cases

## Functional Matrix

| ID | Case | Expected result |
|---|---|---|
| UCR-001 | Load create options | Only tenant-owned active assignable roles/outlets/catalog values appear |
| UCR-002 | Complete five-step invited user | One user, access assignments, invite, outbox request, and audit are committed |
| UCR-003 | Create inactive user | User cannot sign in; no plaintext password/invite token is returned |
| UCR-004 | Tenant-wide role | Active `tenant_user_roles`; no obsolete outlet role rows remain active |
| UCR-005 | Selected outlets | Active `outlet_user_roles` only for selected tenant outlets |
| UCR-006 | Add direct permission override | Additive active `tenant_user_permissions` row; final resolver includes it |
| UCR-007 | Unknown/inactive/unentitled permission | Safe rejection; no partial user or assignment |
| UCR-008 | Role beyond delegation ceiling | `403`; no partial mutation or success audit |
| UCR-009 | Cross-tenant role/outlet/media ID | Safe failure without foreign-tenant data leakage |
| UCR-010 | Duplicate tenant email | Validation/conflict; wizard values retained |
| UCR-011 | Same idempotency key/body | Same logical result; one created user |
| UCR-012 | Same key/different body | Idempotency conflict |
| UCR-013 | Role changed during wizard | Stale inherited preview/direct grants are recalculated |
| UCR-014 | Invite accepted | Token is one-time/expiring; password is set by user; account activates |
| UCR-015 | Revoke or resend invite | Prior token becomes invalid; rotation/audit behavior is authoritative |

## Responsive Matrix

Verify desktop, laptop, tablet landscape, tablet portrait, and compact widths. Every step must have visible navigation, no RenderFlex overflow, stable validation, readable permission groups, and touch targets of at least 44px.

## Explicit Negative Cases

Do not pass a UI test that displays unsupported `No Outlet Access`, selected tills, default till, temporary password, 2FA, or save-draft controls as functional. Add these tests only after a canonical backend/DB contract is approved.
