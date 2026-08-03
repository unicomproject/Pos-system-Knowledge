<!-- title: ACS Email Operations and Deployment Runbook -->
<!-- status: APPROVED -->
<!-- system: OneVerz POS MVP -->
<!-- owner: Platform Architecture / Operations (OneVerz) -->
<!-- last_updated: 2026-07-27 -->
<!-- applies_to: ACS Email configuration and operations (no secrets) -->
<!-- related: Email_Architecture_And_Provider_Decisions -->

# ACS Email Operations and Deployment Runbook

## Purpose

Operational guidance for Azure Communication Services Email used by OneVerz. **No secrets** belong in this document.

Architecture: [[Email_Architecture_And_Provider_Decisions]]

## Configuration keys (non-secret)

```text
AzureCommunicationEmail:ConnectionString   # empty in repo; set via user-secrets / Key Vault / env
AzureCommunicationEmail:Endpoint           # Managed Identity path when ConnectionString empty
AzureCommunicationEmail:SenderAddress      # bare verified MailFrom
AzureCommunicationEmail:SenderDisplayName  # display only; never concatenated into senderAddress
AzureCommunicationEmail:AllowAdminSecureLinkFallback  # true Dev only; false production
```

Platform password reset URL builder (existing):

```text
PlatformPasswordReset:PublicAppBaseUrl
PlatformPasswordReset:ResetPath
```

## Local development

1. Prefer `dotnet user-secrets` on `src/E_POS.Api` (from Unified-Commerce root).
2. Set ConnectionString **or** Endpoint + credential, and SenderAddress.
3. Restart API after secrets change.
4. Dev may allow `admin_secure_link` fallback when ACS unset — production must not.

Do not commit connection strings, access keys, or live reset URLs.

## Production

- Prefer Managed Identity + Endpoint where possible.
- Store secrets in Key Vault / app settings secret slots.
- `AllowAdminSecureLinkFallback = false`.
- Override public app base URL for real tenant/platform frontends.
- Custom email domain and outbox/retry worker are **follow-up** work.

## Sender rules

- Use the exact bare verified MailFrom address.
- Trim sender and recipient.
- Reject display-name forms such as `Name <addr@domain>`.

## Observability

Log: operation id, status, correlation id, provider error codes.
Never log: access keys, connection strings, raw tokens, full reset URLs with tokens, passwords.

## Resend and failure (target)

- Outbox records send attempts and failures.
- Bounded retries.
- Platform Admin resend actions per event (see catalog).
- Until outbox exists: record failure; do not duplicate tenants.

## Current capability

| Item | Status |
|---|---|
| ACS infrastructure | COMPLETE |
| Platform password reset email | COMPLETE |
| Azure E2E reset verification | PASSED |
| Tenant onboarding emails | NOT IMPLEMENTED |
| Outbox / retry worker | NOT IMPLEMENTED |

## Related

- [[Email_Event_And_Template_Catalog]]
- [[../03_USER_JOURNEYS/Platform_Admin/17_Platform_User_Password_Reset_Flow]]
- [[../15_IMPLEMENTATION_TRACKING/Backend/Auth/SA-P1-06_Platform_Admin_User_Password_Reset_Implementation]]
