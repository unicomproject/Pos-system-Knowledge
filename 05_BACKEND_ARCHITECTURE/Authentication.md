<!-- title: Authentication -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Authentication

## Purpose

This file defines authentication boundaries for TM-EPOS MVP backend.

Authentication confirms identity.
Authorization decides what the authenticated identity can do.

## Identity Types

| Identity Type | Used For |
|---|---|
| Platform user | Platform admin operations |
| Tenant user | Business admin, POS, fulfilment, reports |
| Customer | Online store checkout/profile/order visibility |
| Offline client/device | Offline operation and sync trust boundary |

## Platform User Authentication

Platform users authenticate through platform authentication endpoints.

Platform sessions and refresh tokens are separate from tenant users.

Platform users must not silently act as tenant users without explicit support
workflow and audit.

## Tenant User Authentication

Tenant users authenticate for business admin, POS, desktop EPOS, fulfilment,
pickup, reporting, and hardware operations.

Tenant user authentication must resolve tenant context and user status.

## Customer Authentication

Customer authentication may be required for customer profile, saved details,
order visibility, and pickup status.

Public catalogue browsing can be tenant/domain/sales-channel scoped without full
customer login when allowed.

## Offline Client Trust

Offline client/device trust is not a replacement for user authentication.

Offline sync must validate approved client/device, tenant, outlet, and payload
rules before accepting queued operations.

## Token Rules

- Store only token hashes in database.
- Rotate refresh tokens where applicable.
- Revoke sessions on reuse or suspicious behavior.
- Never log raw tokens.
- Never return token hashes to clients.

## Session Rules

Logout, session expiry, account lock, tenant suspension, or device deactivation
must block protected actions.

## Security Audit

Login success, login failure, lockout, logout, refresh reuse, and suspicious
offline sync attempts should be auditable.

## Related Files

- [[Authorization_And_Permissions]]
- [[API_Standards]]
- [[Offline_Operation_Architecture]]
