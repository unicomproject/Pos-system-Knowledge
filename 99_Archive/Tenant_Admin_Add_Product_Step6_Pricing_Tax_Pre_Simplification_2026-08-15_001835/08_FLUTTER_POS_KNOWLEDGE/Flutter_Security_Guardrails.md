<!-- title: Flutter Security Guardrails -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-08 -->


# Flutter Security Guardrails

## Purpose

This file defines Flutter security guardrails for OneVerz POS MVP.

The app handles tenant data, staff actions, customer/order data, device trust,
and payment-related workflows.

## Core Rules

- Never store raw passwords.
- Never log access tokens or refresh tokens.
- Never store card data.
- Never store payment provider secrets.
- Never store POS PINs in plain text.
- Use secure storage for sensitive tokens.
- Use local DB only for allowed cached/offline data.
- Clear sensitive state on logout.

## Token Rule

Access token should stay in memory where possible.

Refresh token storage must follow platform security decisions.

Do not expose token values through logs, crash reports, or debug UI.

## Local Cache Security

Local cache can store reference/config/offline operational data, but not raw
secrets.

If platform supports encrypted local database, use it for sensitive offline data.

## Device Trust Rule

POS device trust is required for device-bound POS/offline actions.

A trusted device does not replace user authentication or permission checks.

Hardware configuration is tenant/outlet/device scoped, versioned and revocable.
Device revocation blocks hardware actions.

Local Agent keys use secure storage and never enter widget/provider state,
recovery records, diagnostics or logs. Production requires private CIDR/firewall
restriction, local authentication and trusted HTTPS; debug HTTP is not
production security.

## Offline Security Rule

Offline mode must restrict protected actions that require backend validation.

Do not allow offline finalization of card/QR payment, refund, exchange,
future/deferred loyalty or store credit, till final close, or final stock.

## Debug Rule

Debug logs in development must not be copied into production behavior.

Never log receipt/API-key secrets, provider credentials, PAN, CVV, PIN,
track/EMV data, reusable tokens or unsanitized provider responses. Only masked
card display and safe provider references may reach UI/receipt state.

## Related Files

- [[Flutter_Local_Storage_Cache]]
- [[Flutter_Offline_Operation_Sync]]
- [[Flutter_API_Network]]
