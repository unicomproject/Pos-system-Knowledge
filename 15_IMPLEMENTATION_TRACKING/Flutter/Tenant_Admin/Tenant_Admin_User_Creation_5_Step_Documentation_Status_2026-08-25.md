<!-- title: Tenant Admin User Creation 5-Step Documentation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-26 -->

# Tenant Admin User Creation 5-Step Documentation Status

## Documentation Result

The canonical journey, UI behavior, Flutter contract, API mapping, persistence mapping, security rules, unsupported reference controls, and QA matrix are defined for the five-step target.

The 2026-08-26 correction locks role selection to Step 2, makes Step 3 user-only, removes unsupported `No Outlet Access` and Access Level, derives review counts from final state, and prevents inactive/invited review contradictions.

## Source-Verified Capability

- Atomic user create with idempotency.
- Assignable role options filtered by delegation policy.
- Tenant-wide or selected-outlet role assignment.
- Additive direct user permission grants through backend catalog IDs.
- Invite/inactive create states, setup-token onboarding, audit, and soft reactivation.
- Optional profile media asset attachment.

## Remaining Implementation Work

| Area | Status |
|---|---|
| Flutter 3-step to 5-step refactor | Not implemented in this docs-only task |
| Dedicated user photo upload | Backend/API gap |
| User-specific till access/default till | Backend/DB/API gap |
| Save Draft | Full-stack gap |
| Access start date | Full-stack gap |
| Notes in create | DTO/UI gap; entity field exists |
| Outlet-specific role override | User-create DTO/service gap |
| Force password change toggle | Different model; not exposed in create |
| 2FA toggle | Full-stack gap |
| Phone required validation | Backend gap; current request accepts null |
| No Outlet Access | Not representable; empty outlet list means tenant-wide |
| Review count selectors | Flutter refactor gap |
| Account-mode-driven review | Flutter refactor gap |

No Flutter, C#, migration, schema, seed, API, or runtime file was modified by this Second Brain update.
