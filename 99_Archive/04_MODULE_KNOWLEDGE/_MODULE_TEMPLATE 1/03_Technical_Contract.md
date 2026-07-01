<!-- title: Technical Contract Template -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Technical Contract Template

## Purpose

Use this template to define a module technical contract.

The contract aligns frontend, backend, database, QA, and AI feature generation.

## Required Sections

- API group.
- Frontend screens/routes.
- Backend services.
- Domain entities.
- Database tables.
- Permission codes.
- Request/response rules.
- State-management rules.
- Audit/logging rules.
- Test cases.

## API Contract Rule

Use API group names where exact endpoint names are not confirmed.

Do not invent unsupported endpoint names.

## DTO Rule

Do not return database entities directly to frontend.

Use DTOs and mapping.

## Tenant Rule

Tenant-owned APIs must resolve tenant context server-side.

Do not trust frontend-provided `tenant_id`.

## Security Rule

Never expose password hashes, POS PIN hashes, raw tokens, raw activation codes,
refresh token hashes, payment provider secrets, or card data.

## Related Files

- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
- [[../../09_ANGULAR_ADMIN_KNOWLEDGE/Angular_API_Integration_Guide]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_App_Architecture]]
