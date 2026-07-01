<!-- title: Invitations, Authentication, Tokens & Security Audit Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Invitations, Authentication, Tokens & Security Audit Module Overview

## Purpose

Handle staff invitation, setup tokens, email verification, password reset, tenant auth sessions, refresh tokens, and tenant login audit for staff applications.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Auth_Tokens_Security_Audit` |
| Module number | 06 |
| Primary users | Tenant Admin, Cashier, Store Manager, Stall Operator |
| Frontend surfaces | Staff login, Invite acceptance, Password setup/reset, Session expiration state |
| API groups | `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`, `/api/v1/invitations`, `/api/v1/password-reset` |

## Main Tables

| Table | Role |
|---|---|
| `user_invites` | Used by this module |
| `user_setup_tokens` | Used by this module |
| `email_verification_tokens` | Used by this module |
| `password_reset_tokens` | Used by this module |
| `tenant_auth_sessions` | Used by this module |
| `tenant_refresh_tokens` | Used by this module |
| `tenant_login_audits` | Used by this module |

## Core Business Rules

- Staff auth is separate from platform auth and customer auth.
- Invite, setup, reset, refresh, and verification tokens are stored as hashes.
- Logout revokes the active tenant auth session.
- Inactive, locked, or deleted tenant users cannot create sessions.
- Offline login bypass is not allowed.

## Access Summary

| Control | Rule |
|---|---|
| Authentication | Required for protected staff/customer/admin actions |
| Tenant status | Tenant must be active or allowed for the requested operation |
| Feature entitlement | Required when this module is plan or add-on controlled |
| Permission | Required for staff/admin protected actions |
| Tenant isolation | Tenant-owned records must never leak across tenants |
| Audit/event history | Required for sensitive status, payment, inventory, auth, and access changes |

## Dependencies

- [[../05_Tenant_User_Permission_Access/01_Module_Overview]]
- [[../02_Tenant_Foundation/01_Module_Overview]]

## Out Of Scope

- Customer account login
- Platform admin login internals
- POS permission assignment
- Card payment authentication

## Related Files

- [[04_MODULE_KNOWLEDGE/06_Auth_Tokens_Security_Audit/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/06_Auth_Tokens_Security_Audit/03_Technical_Contract]]
