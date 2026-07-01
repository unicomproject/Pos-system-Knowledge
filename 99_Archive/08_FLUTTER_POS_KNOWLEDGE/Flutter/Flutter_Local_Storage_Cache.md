<!-- title: Flutter Local Storage Cache -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Flutter Local Storage Cache

## Purpose

This file defines Release 1 Flutter local storage and cache rules.

## Decision

Release 1 local storage is not a full offline transactional POS database.

It is only for secure session values, non-sensitive preferences, and limited
reference cache.

## Storage Areas

| Storage | Release 1 Usage |
|---|---|
| Flutter Secure Storage | Access token, refresh token, sensitive session values |
| SharedPreferences | Non-sensitive UI preferences |
| Lightweight cache | Tenant config, permissions, outlets, receipt settings, products |
| Not allowed | Offline sale queue, payment queue, conflict resolver, stock authority |

## Secure Storage Rules

Use secure storage for access token, refresh token if used, sensitive session
state, and device/session values where backend contract requires it.

Do not store tokens in SharedPreferences.

## SharedPreferences Rules

Allowed values:

- Theme preference.
- Last selected display preference.
- Non-sensitive UI flags.
- App version display preference.

Not allowed:

- Tokens.
- Passwords.
- POS PINs.
- Provider secrets.
- Raw setup or activation codes.
- Card data.

## Cache Rule

Cache may improve speed for tenant config, permission list, feature visibility,
assigned outlets, receipt settings, and product lookup reference data.

Cache is never final authority for checkout, payment, stock, refund, exchange,
discount approval, or audit.

## Clear Rules

Clear sensitive storage when logout happens, session expires, device is
deactivated, tenant context becomes invalid, or backend requests re-authentication.

## Related Files

- [[Flutter_API_Network]]
- [[Flutter_Error_Handling]]
- [[Flutter_Security_Guardrails]]
