<!-- title: Tenant Admin Role Permission Second Brain Contradiction Scan -->
<!-- status: Active -->
<!-- last_updated: 2026-08-15 -->

# Tenant Admin Role Permission Second Brain Contradiction Scan

## Scan Targets

- Stale six-step Role Setup claims.
- Claims that Tenant Admin role backend endpoints are implemented.
- Missing effective permission resolver contract.
- Missing distinction between verified schema support and runtime implementation.

## Corrected Canonical Facts

- Create Role setup is five steps.
- Confirmation is a post-save outcome, not a sixth wizard step.
- Flutter role-permission datasource exists.
- Backend Tenant Admin role endpoints were not verified and are documented as missing.
- Effective permissions are additive allow grants from tenant and outlet sources, subject to active/revoked/entitlement filters.
- Explicit deny is not implemented.

## Remaining Watch Items

- Other archived documents may contain historical six-step references. Active docs must use the five-step flow.
- Any future implementation status update must distinguish Flutter-only progress from backend runtime readiness.
