<!-- title: Flutter Security Guardrails -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Flutter Security Guardrails

## Purpose

This file defines Flutter frontend security and NFR guardrails for Release 1.

Backend remains the final enforcement authority.

## Token Rules

- Store tokens only in secure storage.
- Never store tokens in SharedPreferences.
- Clear sensitive state on logout.
- Clear sensitive state on session expiry.
- Do not log access or refresh tokens.

## Sensitive Data Rules

Never store or log:

- Passwords.
- POS PINs.
- Full card number.
- CVV.
- Sensitive cardholder data.
- API secrets.
- Production credentials.
- Provider secrets.
- Raw activation codes.

## Permission Rules

- UI hides/disables actions based on backend permission and feature context.
- Backend still enforces every protected action.
- Do not hardcode role names.
- Do not hardcode permission access inside random widgets.
- Permission strings must be centralized where needed.

## POS Safety Rules

| Rule | Required |
|---|---|
| Billing blocked without outlet | Yes |
| Billing blocked without open till | Yes |
| Payment prevents double submit | Yes |
| Sale completion uses locked state | Yes |
| Failed API does not corrupt cart/payment | Yes |
| Receipt print failure does not cancel sale | Yes |
| Production disables verbose logs | Yes |

## Device and Hardware Rules

Device activation and trust status must be validated before protected POS
operation when backend policy requires it.

Hardware errors must show retry or manual fallback.

## Related Files

- [[Flutter_Local_Storage_Cache]]
- [[Flutter_Permission_Based_UI_Rendering]]
