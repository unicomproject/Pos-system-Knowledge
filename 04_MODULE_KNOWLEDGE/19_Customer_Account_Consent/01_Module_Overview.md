<!-- title: Customer Basic, Authentication & Consent Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Customer Basic, Authentication & Consent Module Overview

## Purpose

Support customer records, customer website authentication, OTP verification, password reset, sessions, refresh tokens, and consent records for online store and loyalty use.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Customer_Account_Consent` |
| Module number | 19 |
| Primary users | Customer, Tenant Admin, Cashier |
| Frontend surfaces | Customer website login/register, Customer profile, POS customer attach, Consent capture |
| API groups | `/api/v1/customers`, `/api/v1/customer-auth`, `/api/v1/customer-auth/otp`, `/api/v1/customer-consents` |

## Main Tables

| Table | Role |
|---|---|
| `customers` | Used by this module |
| `customer_auth_accounts` | Used by this module |
| `customer_verification_otps` | Used by this module |
| `customer_password_reset_tokens` | Used by this module |
| `customer_auth_sessions` | Used by this module |
| `customer_refresh_tokens` | Used by this module |
| `customer_consents` | Used by this module |

## Core Business Rules

- Customer auth is separate from staff auth and platform auth.
- Customer account is optional for guest checkout if business rules allow it.
- Customer consent must be recorded for marketing or privacy-sensitive communication.
- Customer sessions do not grant tenant staff permissions.
- OTP and reset tokens are stored as hashes or safe references.

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

- [[../22_Online_Store_Cart_Checkout/01_Module_Overview]]
- [[../26_Notification/01_Module_Overview]]

## Out Of Scope

- Tenant user permissions
- Platform admin login
- Card data storage
- Offline staff login bypass

## Related Files

- [[04_MODULE_KNOWLEDGE/19_Customer_Account_Consent/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/19_Customer_Account_Consent/03_Technical_Contract]]
