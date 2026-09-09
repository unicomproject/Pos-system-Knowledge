<!-- title: ADR 010 Tenant Admin Native Online Store 9-Step Journey -->
<!-- status: Accepted with reconciliation blockers -->
<!-- date: 2026-08-27 -->

# ADR 010 — Tenant Admin Native Online Store 9-Step Journey

## Decision

Tenant Admin Online Store management uses `EC-TA-UJ-02` mapped to `TA-UJ-063` and exactly nine steps: Overview, Enable, Identity, URL & Domain, Branding & Banners, Contact & Support, Click & Collect, Products & Policies, Review & Publish. Store Live is the Step 9 result state.

## Boundaries

- Platform Admin `SA-ST-UJ-011` remains initial bootstrap only.
- Customer storefront remains a separate public/customer surface.
- This is OneVerz native Online Store, not external commerce integration.
- Release 1 excludes delivery, guest checkout and online payment gateway scope.

## Consequences

Backend readiness is authoritative; setup enablement is not publication; publish is tenant-scoped, permission-protected, audited and idempotent. Current four-policy UI versus five-policy backend mismatch and mandatory-readiness differences remain explicit blockers, not silent assumptions.

Canonical contract: [[../../03_USER_JOURNEYS/Tenant_Admin/22_Online_Store_Setup_And_Publish_Flow]].
