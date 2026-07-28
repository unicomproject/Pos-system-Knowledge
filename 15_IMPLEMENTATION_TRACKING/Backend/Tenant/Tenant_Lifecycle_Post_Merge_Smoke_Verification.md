<!-- title: Tenant Lifecycle Post-Merge Smoke Verification -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-07-28 -->

# Tenant Lifecycle Post-Merge Smoke Verification

## 1. Verification Summary

Post-merge verification of OneVerz Tenant Lifecycle Status Alignment against latest merged Backend and Frontend `origin/main`. Smoke tests used clean worktrees only. No backend/frontend source changes were made during verification.

**Final verdict: PASSED**

## 2. Environment

| Item | Value |
|---|---|
| Verification date | 2026-07-28 |
| Environment | Local Development |
| Database name | `UnifiedCommerceDb` |
| Schema | `public` |
| Backend API | `http://localhost:5150` |
| Angular | `http://localhost:4200` |
| Backend smoke worktree | `Unified-Commerce-tenant-lifecycle-smoke` |
| Frontend smoke worktree | `Nytroz-POS-Platform-Admin-tenant-lifecycle-smoke` |
| Temporary verify branches | `verify/tenant-lifecycle-post-merge` (not pushed) |

## 3. Merged Backend Evidence

| Item | Value |
|---|---|
| Remote | `https://github.com/unicomproject/Unified-Commerce.git` |
| Merge | PR #60 → `origin/main` |
| Tip | `4be3b8e` |
| Contained commits | `c093bf2`, `7b976ae`, `bc1de4f` |
| Attention type on main | `pending_activation` |

## 4. Merged Frontend Evidence

| Item | Value |
|---|---|
| Remote | `https://github.com/unicomproject/Nytroz-POS-Platform_Admin.git` |
| Merge | PR #34 → `origin/main` |
| Tip | `5014e91` |
| Contained commits | `8854f82`, `5d1cbc3` |
| Attention navigation | `status=pending_activation` |

## 5. Applied Migrations

| Migration | Applied |
|---|---|
| `20260716190000_AddReturnInspectionDraftsAndMediaFinalization` | Yes |
| `20260727150000_RepairTenantLifecycleStatusData` | Yes |
| `20260727151000_AddTenantLifecycleStatusCheckConstraint` | Yes |

`dotnet ef database update` reported: database already up to date. No new migration created.

## 6. Database Constraint Verification

| Check | Result |
|---|---|
| `return_inspection_drafts` exists | True |
| `ck_tenants_status` exists | True |
| Pending migrations | None |
| Invalid lifecycle status count | 0 |
| Tenant count after smoke | 26 |

Lifecycle status counts after smoke (no tenant names exposed):

- `active` = 15
- `pending_payment` = 9
- `suspended` = 2

## 7. Paid Tenant Smoke Flow

| Check | Result |
|---|---|
| Wizard radios | Paid / Trial / Demo visible |
| Request `subscriptionType` | `PAID` |
| Request `billingCycle` | `monthly` |
| HTTP | 201 |
| Initial lifecycle | `pending_payment` |
| UI badge | Pending Payment |
| Tenant id prefix | `61e35799` |

## 8. Mark Paid and Pending Activation

| Check | Result |
|---|---|
| Issue then Mark Paid | HTTP 200 |
| Invoice stored status | `PAID` |
| `paidAt` populated | True |
| Lifecycle after Mark Paid | `pending_activation` |
| `pendingActivationTenants` | 1 |
| Dashboard attention type | `pending_activation` |
| Attention link | `/admin/tenants?status=pending_activation` |
| Active API returns `setup_pending` | False |

## 9. Paid Activation

| Check | Result |
|---|---|
| Activate | HTTP 200, lifecycle `active` |
| Re-activate | HTTP 409 |
| Detail Active badge | True |

## 10. Trial Tenant Smoke Flow

| Check | Result |
|---|---|
| Request `subscriptionType` | `TRIAL` |
| Request `billingCycle` | `yearly` |
| HTTP | 201 |
| Lifecycle | `active` |
| Payment verification required | No |

## 11. Demo Tenant Smoke Flow

| Check | Result |
|---|---|
| Request `subscriptionType` | `DEMO` |
| Request `billingCycle` | `monthly` |
| `billingCycle` is `demo` | False |
| HTTP | 201 |
| Lifecycle | `active` |
| Payment verification required | No |

## 12. List and Detail Verification

| Check | Result |
|---|---|
| List exposes `lifecycleStatus` | Yes |
| Detail exposes `lifecycleStatus` | Yes |
| List/detail same value | Yes |
| Pending Payment vs Pending Activation | Distinct |

## 13. Dashboard and Filter Verification

| Check | Result |
|---|---|
| Attention type | `pending_activation` |
| KPI field | `pendingActivationTenants` |
| Selectable `setup_pending` filter | No |
| Selectable `inactive` filter | No |
| Billing cycle monthly/yearly/omit-all | Accepted by API |

## 14. Automated Build and Test Evidence

| Suite | Result |
|---|---|
| Backend `dotnet restore` / `dotnet build` | Succeeded (0/0) |
| Backend unit lifecycle-related | 297 passed |
| Backend integration lifecycle-related | 179 passed |
| Backend API PlatformAdmin/Tenant | 210 passed |
| Frontend `npm ci` | Succeeded |
| Frontend `npx ng build` | Succeeded |
| Frontend `npx ng test --watch=false` | 54 files / 416 tests passed |
| Post-smoke worktree cleanliness | Clean (no source diffs) |

## 15. Deferred Scope

Still deferred / not claimed as implemented:

- Tenant onboarding emails
- Payment-link generation / UI / email
- Payment-waiver persistence / API / UI
- Email outbox / retry
- Cancel endpoint
- Deprecated compatibility alias removal
- Legacy minimal create endpoint removal
- Full Tenant Admin invitation / set-password flow

## 16. Final Verdict

**PASSED**
