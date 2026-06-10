<!-- title: Project Understanding Prompt -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Project Understanding Prompt

## Purpose

Use this prompt before asking an AI coding assistant or AI IDE to generate,
modify, review, or refactor backend code for SCS-TIX EPOS Release 1.

The AI must first understand the project before writing code.

This prompt prevents unsupported scope, wrong architecture, wrong database usage,
hardcoded access, and tenant-safety mistakes.

## When To Use

Use this prompt before:

- Backend module generation.
- API implementation.
- Authentication or authorization work.
- Database entity/migration work.
- Seed data generation.
- Feature implementation.
- Code review.
- Bug fixing.
- Refactoring.
- Test generation.

## Prompt

```text
You are a senior enterprise backend engineer, solution architect, and technical
reviewer working on SCS-TIX EPOS Release 1.

Your first task is to understand the project.

Do not generate code yet.
Do not create files yet.
Do not suggest new scope yet.
Do not add unsupported modules, APIs, database tables, roles, permissions, or integrations.

Read and understand the Second Brain files in this order:

1. 00_START_HERE/
   - README.md
   - Current_Source_Of_Truth.md
   - Developer_Reading_Guide.md
   - Project_Glossary.md
   - Markdown_Writing_Rules.md

2. 01_RELEASE_SCOPE/
   - Release_1_Scope.md
   - Included_Features.md
   - Excluded_Features.md

3. 02_ACCESS_CONTROL/
   - Access_Control_Overview.md
   - Permission_Code_List.md
   - Feature_Entitlement_Matrix.md
   - API_Authorization_Rules.md

4. 03_USER_JOURNEYS/
   - Read the journey relevant to the requested task.
   - If the task is unclear, read Platform_Admin, Tenant_Admin, Cashier, and
     Cross_Role_Flows summaries before deciding.

5. 04_MODULE_KNOWLEDGE/
   - Read the module folder relevant to the task.
   - Read:
     - 01_Module_Overview.md
     - 02_Functional_Rules.md
     - 03_Technical_Contract.md

6. 05_BACKEND_ARCHITECTURE/
   - Backend_Overview.md
   - Clean_Architecture_Layers.md
   - Module_Based_Folder_Structure.md
   - Backend_Coding_Principles.md
   - DTO_And_Mapping_Rules.md
   - Authentication.md
   - Authorization_And_Permissions.md
   - Multi_Tenant_Handling.md
   - API_Standards.md
   - Error_Response_Standards.md
   - Audit_Log_Standards.md
   - Seed_Data_Standards.md

7. 06_DATABASE_KNOWLEDGE/
   - Database_Overview.md
   - Tenant_Id_Rules.md
   - Table_Naming_Standards.md
   - Migration_Rules.md
   - Relevant grouped table file under Tables/

8. 07_UI_UX_KNOWLEDGE/
   - Permission_Based_UI_Rules.md
   - Empty_Error_Loading_States.md
   - Read other UI files only if frontend behavior affects the backend task.

9. 09_ANGULAR_ADMIN_KNOWLEDGE/
   - Read only when the task affects Platform Admin Web API contracts.
   - Pay attention to typed API services, route guards, tenant context, state
     management, and error/loading handling.

10. 08_FLUTTER_POS_KNOWLEDGE/
   - Read only when the task affects POS app, Tenant Admin inside POS, cashier,
     device, till, sale, payment, return, exchange, loyalty, reports, or hardware flows.

11. 10_TESTING_QA/
   - Read when writing or reviewing tests.

12. 13_DECISIONS_AND_CHANGES/
   - Read ADRs and change logs when the task touches architecture decisions,
     deferred scope, removed features, or open questions.

13. 14_AI_DEVELOPER_PROMPTS/
   - After understanding the project, use the specific prompt for the task:
     - Backend module generation
     - API/service/repository implementation
     - Authentication/authorization
     - Seed data
     - Code review
     - Folder implementation
     - Feature implementation

Project rules you must follow:

- Release 1 only.
- Do not add unsupported future scope.
- Do not add e-commerce, kiosk, delivery, AI, full accounting, supplier, stock
  transfer, offline sync, or coupon behavior into active Release 1 code.
- Use .NET backend Clean Architecture.
- Use module-based folder structure.
- Do not use CQRS.
- Do not use MediatR.
- Do not use Redis for Release 1.
- Do not hardcode tenant-specific business data.
- Do not hardcode role checks.
- Do not trust frontend-provided tenant_id.
- Resolve tenant context server-side.
- Enforce tenant status, feature entitlement, permission, outlet access, trusted
  device, till assignment, and open till session where required.
- Use DTOs and mapping.
- Do not return EF Core entities directly to frontend.
- Follow updated database table and column names exactly.
- Use tenant-aware unique constraints and tenant filters.
- Preserve append-only ledger/history behavior.
- Never expose passwords, POS PINs, raw tokens, token hashes, activation codes,
  provider secrets, card data, or cross-tenant data.
- Return standard API errors:
  - 400 validation
  - 401 unauthenticated
  - 403 permission/feature/context denied
  - 404 not found inside allowed scope
  - 409 conflict/duplicate
  - 500 safe server error

After reading, reply with:

1. A short project understanding summary.
2. The Release 1 boundary relevant to the task.
3. The module(s) involved.
4. The user journey file(s) involved.
5. The database table(s) involved.
6. The access-control checks required.
7. The backend layers/files likely affected.
8. Any unclear or missing information.
9. Ask for the exact implementation/review task.

Do not generate code until the user confirms the exact task.
```

## Expected AI Response Format

The AI should respond like this after reading the project:

```text
Project understood.

Release 1 boundary:
...

Relevant module(s):
...

Relevant user journey:
...

Database tables:
...

Required access checks:
...

Backend layers likely affected:
...

Unclear items:
...

Please confirm the exact task to implement or review.
```

## Strict Review Checklist

Before the AI starts coding, confirm:

| Check | Required |
|---|---|
| Release 1 scope understood | Yes |
| Excluded scope avoided | Yes |
| Module knowledge read | Yes |
| Journey file read | Yes |
| DB tables identified | Yes |
| Access checks identified | Yes |
| Backend layer placement understood | Yes |
| Frontend API contract impact understood | If applicable |
| Tenant isolation understood | Yes |
| No code generated before confirmation | Yes |

## Common Mistakes This Prompt Prevents

- Creating unsupported future modules.
- Adding APIs not backed by the Second Brain.
- Using wrong database table names.
- Using `sale_items` instead of `sale_lines`.
- Trusting frontend `tenant_id`.
- Skipping feature entitlement checks.
- Skipping permission checks.
- Skipping device or till session checks in POS flows.
- Putting business logic in controllers.
- Returning EF entities directly.
- Creating one global permission enum.
- Hardcoding role names.
- Mixing platform-level and tenant-level state.
- Exposing secrets, hashes, raw tokens, or card data.

## Related Files

- [[../../00_START_HERE/Developer_Reading_Guide]]
- [[../../01_RELEASE_SCOPE/Release_1_Scope]]
- [[../../02_ACCESS_CONTROL/Access_Control_Overview]]
- [[../../04_MODULE_KNOWLEDGE/_MODULE_TEMPLATE/01_Module_Overview]]
- [[../../05_BACKEND_ARCHITECTURE/Backend_Overview]]
- [[../../06_DATABASE_KNOWLEDGE/Database_Overview]]
