<!-- title: POS Activation Seed Migration Fix -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-17 -->

# POS Activation Seed Migration Fix

## Issue

Migration `20260613120000_SeedDevelopmentPosActivationData` failed with:

`null value in column "user_id" of relation "tenant_user_roles" violates not-null constraint`

## Root Cause

POS activation seed used scalar subqueries in `VALUES` for user/role IDs. When
`SeedDevelopmentAuthUsers` was skipped in a prior environment, tenant users did
not exist and subqueries returned NULL.

## Fix

| Change | Detail |
|---|---|
| Shared bootstrap | `DevelopmentAuthSeedData.EnsureTenantAndUsersSql` |
| POS seed rewrite | JOIN-based inserts for tenant_user_roles, outlet_user_roles, outlets, tills, till_activation_codes |
| Related fixes | platform_roles `is_system`, partial ON CONFLICT for platform_user_roles |

## Verification

```text
dotnet build — success
dotnet test — 94 passed
dotnet ef database update (Development) — success
dotnet run — migrations up to date, app starts
```
