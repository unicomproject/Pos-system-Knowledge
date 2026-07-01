<!-- title: Module Overview Template -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Module Overview Template

## Purpose

Use this template for every SCS-TIX Release 1 module overview.

The module knowledge base is for frontend developers, backend developers, QA,
UI/UX designers, and AI coding assistants.

## Source Rule

Use only confirmed Release 1 scope, uploaded journeys, UI files, backend
architecture, frontend architecture, and updated database design.

Do not add unsupported scope.

## Required Sections

- Module purpose.
- Release 1 position.
- Frontend surfaces.
- Backend responsibility.
- Database tables.
- High-level flow.
- Access-control summary.
- Dependencies.
- Out-of-scope notes.
- Related files.

## Frontend Rule

State the exact frontend surface:

| Surface | Meaning |
|---|---|
| Platform Admin Web | Angular admin portal |
| Tenant Admin Layout | Admin layout inside Flutter POS app |
| Cashier POS | Flutter POS cashier journey |
| Portable POS | Same POS rules using mobile/tablet checkout |

## Backend Rule

State the API group, services, entities, repositories, database tables,
permissions, audit needs, and tenant isolation requirements.

## Database Rule

List only tables from the updated Release 1 database design.

## Scope Warning

Database presence does not automatically make a feature active Release 1 scope.

## Related Files

- [[99_Archive/01_RELEASE_SCOPE/Release_1_Scope]]
- [[99_Archive/02_ACCESS_CONTROL/Access_Control_Overview]]
- [[99_Archive/05_BACKEND_ARCHITECTURE/Backend_Overview]]
- [[99_Archive/06_DATABASE_KNOWLEDGE/Database_Overview]]
