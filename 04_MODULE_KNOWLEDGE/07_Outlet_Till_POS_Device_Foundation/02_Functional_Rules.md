<!-- title: Outlet, Till & POS Device Foundation Functional Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->

# Outlet, Till & POS Device Foundation Functional Rules

## Purpose

Defines business and UX rules for `Outlet_Till_POS_Device_Foundation` in the new OneVerz POS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens,
responsive online store screens, Angular/admin screens, tests, or database changes.

## Business Rules

- Outlet code is tenant-unique within the tenant.
- Tenant isolation is strictly enforced.
- Only one default outlet per tenant.
- Soft deletion is used. Outlets with active tills, orders, stock, or users cannot be hard deleted. Deletion becomes deactivation when dependencies exist.
- Till belongs to an outlet and is used for POS sessions.
- Trusted POS device must match tenant, outlet, and assigned till policy.
- One active Till-device assignment per Till/device where defined.
- Assignment history should be preserved using `released_at`.
- One device assignment cannot silently bypass permissions.
- Revoked or cross-tenant devices cannot load or operate hardware configuration.
- Configuration changes require actor, device, old/new version and timestamp audit.
- A cashier cannot silently change the shift printer, drawer or terminal.
- Business hours can guide online store and pickup availability but do not replace backend validation.

## Outlet Types

**Confirmed Supported Types:**
- `STORE`: Standard retail location.
- `WAREHOUSE`: Storage/fulfillment operation.

**Proposed Future Types:**
- `TEMPORARY`, `KIOSK`, `COLLECTION_POINT`, `POPUP`: These are visually suggested by UI but require domain additions, DB migrations, and API contract updates to be fully supported. Not required for Release 1 unless explicitly requested.

## Outlet Statuses

**Persisted Lifecycle Status:**
- `Active`: Outlet is operational.
- `Inactive`: Outlet is suspended or no longer operational.
- *Transitions:* Allowed between Active and Inactive for users with `tenant.outlets.manage` permission. Requires audit-log.

**Derived Operational Health Status:**
- `Needs Attention`: This is a derived UI/Operational state, NOT a persisted database status. It requires backend rules (e.g., inactive status, missing manager, no till, device issue) to be aggregated. Currently pending product decision on exact rule definition.

## Till Status Rules

**Till Lifecycle Status:**
- `ACTIVE`
- `INACTIVE`
- `MAINTENANCE`
- `DELETED`

**Till Operational Status (Monitoring):**
- `ONLINE`: Till lifecycle is ACTIVE, active Till-device assignment exists, assigned POS device is active, and POS device last-seen timestamp (e.g., `pos_devices.last_seen_at`) is inside the configured heartbeat window (default 5 minutes).
- `OFFLINE`: No active device assignment exists, assigned device is inactive, device heartbeat missing, device heartbeat older than threshold, or Till is INACTIVE/MAINTENANCE.
- `NEEDS_ATTENTION`: Till is in MAINTENANCE, ACTIVE Till has no device assignment, assigned POS device is inactive, hardware is missing, hardware latest test failed, hardware warning exists, or hardware is not ready.

**Current Cashier Rule:**
Current cashier should be resolved dynamically from the current OPEN Till session (`till_sessions.status = OPEN`, `till_sessions.opened_by_tenant_user_id`). Do not treat a permanently assigned user as the current cashier unless verified. If no open session, current cashier is `null` (displayed as `—`).

## User Rules

| User Type | Rule |
|---|---|
| Platform Admin | May manage platform-owned setup only when platform permission exists |
| Tenant Admin | May manage tenant-owned configuration only when entitlement and permission pass |
| Cashier / Stall Operator | May perform POS actions only with outlet, trusted device, and till context |
| Customer | May access online store/customer actions only through customer-facing APIs |
| Backend Worker | May process derived records, sync, notifications, or reports using service identity and audit |

## UI Rules

- Show this module only when the tenant plan, feature entitlement, and user permission allow it.
- Use loading, empty, error, permission-denied, feature-disabled, offline, and conflict states where relevant.
- Do not hardcode role names such as cashier, manager, or administrator as authorization logic.
- Do not show fake data, fake counts, fake success states, or hardcoded module rows.
- Mobile, tablet, iPad, laptop, and desktop layouts must keep the same business rules.

## Backend Rules

- Resolve tenant context server-side for every tenant-owned mutation.
- Validate foreign-key ownership within the same tenant before saving.
- Use typed request/response DTOs and map them to domain models/entities.
- Return standard 400, 401, 403, 404, 409, and 500 responses.
- Never expose passwords, POS PINs, token hashes, payment secrets, card data, or cross-tenant records.

## Offline And Cache Rules

- Cache can speed up safe reference data only.
- Backend database remains final truth for sale totals, stock, payments, refunds, exchanges, permissions, and sync acceptance.
- Offline operations must be marked pending until accepted by backend sync.
- Conflicts must be visible; do not silently overwrite backend truth.

## Error Rules

| Case | Expected Behavior |
|---|---|
| Missing login | Return 401 and send user to login/session recovery |
| Permission denied | Return 403 and show access denied state |
| Feature disabled | Return 403 and show feature not enabled state |
| Invalid business data | Return 400 with safe field/form errors |
| Duplicate or conflict | Return 409 with safe conflict message |
| Offline blocked action | Explain that online backend validation is required |

## Out Of Scope

- Hardware test execution/result persistence is owned by Module 08.
- Cash reconciliation
- Order fulfilment events
- Customer device/browser identity

## Related Files

- [[04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/03_Technical_Contract]]
