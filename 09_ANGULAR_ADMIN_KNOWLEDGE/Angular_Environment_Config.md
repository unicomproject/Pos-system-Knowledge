<!-- title: Angular Environment Config -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Angular Environment Config

## Purpose

This file defines environment and configuration rules for the SCS-TIX Angular
Platform Admin Web Portal.

It closes the architecture gap around environment configuration.

## Environment Rule

Environment files and app config must contain runtime configuration only.

Do not store tenant data, business data, secrets, passwords, provider keys, or
mock production values in frontend environment files.

## Allowed Environment Values

| Config | Purpose |
|---|---|
| `production` | Build/runtime mode |
| `apiBaseUrl` | Backend API base URL |
| `appName` | Application display name |
| `appVersion` | Frontend release/version display |
| `defaultLocale` | Default UI locale if needed |
| `requestTimeoutMs` | API request timeout value |
| `enableDebugLogging` | Non-production debug flag only |

## Not Allowed

Do not place these in frontend config:

- API secrets.
- Payment provider secrets.
- AWS keys.
- Tenant IDs.
- User IDs.
- Product data.
- Permission seed data.
- Subscription plan seed data.
- Real tokens.
- Raw setup or payment links.

## API URL Rule

Page components and feature components must not hardcode API URLs.

API base URL comes from environment or app config.

Endpoint paths belong in typed API services or `core/config`.

## Tenant Context Rule

Tenant context must not be configured in environment files.

Selected tenant context is runtime user state.

It must be cleared when tenant changes.

## Build Configuration Rule

Release builds must use production configuration.

Development builds may use a development API URL, but final release output must use
real backend API integration.

## Related Files

- [[Angular_API_Integration_Guide]]
- [[Angular_App_Architecture]]
- [[Platform_Admin_Folder_Structure]]
- [[../05_BACKEND_ARCHITECTURE/API_Standards]]
