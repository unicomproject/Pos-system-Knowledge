<!-- title: Tenant Admin User Creation 5-Step Corrected Flutter Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-26 -->

# Tenant Admin User Creation 5-Step Corrected Flutter Contract

## Implementation Boundary

Current Flutter remains a three-step implementation. This document defines the five-step target; no Flutter code changed during this documentation task.

## Canonical Wizard State

Maintain one state object with basic identity, account mode, optional profile media ID, selected Base Role ID, inherited role permission snapshot, additive direct grant IDs, outlet access mode/IDs, and derived summaries. Do not store Access Level or hardcoded review counts.

## Step Rules

- Step 1 has no role field.
- Step 2 is the only writer of `roleId`.
- Step 3 never invokes role permission mutation; it only edits additive `overriddenPermissionIds` when allowed.
- Step 4 sends empty `outletIds` for tenant-wide or non-empty IDs for selected outlets.
- Step 4 must not expose no-outlet, selected-till, default-till, or per-user default-outlet controls as functional.
- Step 5 reads current state selectors; it never owns independent counts.

## Role Change Reconciliation

When role changes, clear Role A-derived permissions/modules, load Role B, remove direct grants no longer active/entitled/delegable, rebuild the effective permission set, and recalculate review counts. Do not retain stale inherited grants.

## Count Selectors

`moduleCount` = distinct module IDs/codes in final effective permission set. `effectivePermissionCount` = distinct final effective permission IDs/codes. `outletCount` = selected IDs or authoritative active-outlet option count for tenant-wide. Till count is unavailable until a backend contract exists.

## Account Mode

Map invited mode to `INVITED` with invite email/setup flow. Map non-invited create mode to `INACTIVE`. Never send `ACTIVE` on create. Security review widgets render from the selected mode and must not show invitation content for inactive mode.

## Unsupported Controls

Do not send plaintext temporary password, Force Password Change, 2FA, Access Start Date, notes, draft state, till IDs, Default Till, or per-user Default Outlet. Mark separately approved future implementations before adding fields.
