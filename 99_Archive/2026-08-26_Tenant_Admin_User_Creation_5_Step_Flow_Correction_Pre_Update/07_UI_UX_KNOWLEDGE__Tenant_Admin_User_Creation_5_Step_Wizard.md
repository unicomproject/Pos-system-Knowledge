<!-- title: Tenant Admin User Creation 5-Step Wizard UI Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-25 -->

# Tenant Admin User Creation 5-Step Wizard UI Contract

## Locked Structure

The Add New User experience uses one responsive five-step wizard: Basic Information, Assign Role, Configure Permissions, Outlet/Till/Access Scope, and Security & Review. The stepper communicates progress but does not imply partial backend persistence.

## Interaction Rules

- Load backend `create-options` before enabling role/outlet selection.
- Preserve entered state when moving backward.
- Recalculate role-derived modules when role changes.
- Clearly separate inherited role permissions from additive direct user grants.
- Never show explicit deny, no-outlet access, or till selection as working controls until matching backend contracts exist.
- Primary actions use OneVerz Orange `#FF6A00`; shell/navigation use Black `#000000`.
- Buttons and controls maintain a minimum 44px touch target.

## Responsive Behavior

| Width class | Wizard behavior |
|---|---|
| Large/expanded | Horizontal stepper; two-column forms; review cards in grid |
| Tablet landscape | Horizontal compact stepper; two columns only when each field remains usable |
| Tablet portrait | Scrollable/condensed step labels; single-column forms; sticky action footer |
| Compact | Vertical progress summary; one column; no clipped actions or nested page scroll |

Step 3 modules use the backend catalog and show selected/total counts. Step 4 supports tenant-wide or selected outlets. Till controls remain visibly unavailable or omitted until the backend owns a user-to-till contract.

## Profile Image

Allow one square image preview with replace/remove states. Recommended crop is 1:1 and 400×400 or larger. Current backend validates image type/size through a generic media path but lacks a dedicated user-photo upload API; UI must not claim this gap is closed.

## Review

Review cards show identity, role, inherited permission count, direct grant count, outlet scope, account status, invite intent, and profile image. Do not show invented access-level labels. On submit, disable duplicate actions and use the same idempotency key for retries of the same body.
