<!-- title: Backend Feature Prompt With Optional Reads -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->

# Backend Feature Prompt With Optional Reads

```text
You are a senior .NET backend engineer working on TM-EPOS MVP.

Assume the project understanding prompt was already read in this session.

I will provide:

Module: [MODULE_FOLDER_NAME]
Feature: [FEATURE_NAME]
User Journey: [OPTIONAL]
Database File: [OPTIONAL]
```

## Required Files

First, read only the related Second Brain files:

```text
03_USER_JOURNEYS/[related journey]

04_MODULE_KNOWLEDGE/[MODULE_FOLDER_NAME]/
├── 01_Module_Overview.md
├── 02_Functional_Rules.md
└── 03_Technical_Contract.md

06_DATABASE_KNOWLEDGE/Tables/[related database file]

05_BACKEND_ARCHITECTURE/
├── Clean_Architecture_Layers.md
├── Module_Based_Folder_Structure.md
├── DTO_And_Mapping_Rules.md
├── API_Standards.md
└── Error_Response_Standards.md
```

## Optional Files

Read these only if required by the feature:

```text
Access / permission / tenant safety:
├── 02_ACCESS_CONTROL/Access_Control_Overview.md
├── 02_ACCESS_CONTROL/Feature_Entitlement_Matrix.md
├── 02_ACCESS_CONTROL/Permission_Code_List.md
├── 02_ACCESS_CONTROL/API_Authorization_Rules.md
├── 05_BACKEND_ARCHITECTURE/Authentication.md
├── 05_BACKEND_ARCHITECTURE/Authorization_And_Permissions.md
└── 05_BACKEND_ARCHITECTURE/Multi_Tenant_Handling.md

Database changes:
├── 06_DATABASE_KNOWLEDGE/Tenant_Id_Rules.md
├── 06_DATABASE_KNOWLEDGE/Table_Naming_Standards.md
├── 06_DATABASE_KNOWLEDGE/Status_And_Type_Check_Rules.md
└── 06_DATABASE_KNOWLEDGE/Migration_Rules.md

Audit / seed data:
├── 05_BACKEND_ARCHITECTURE/Audit_Log_Standards.md
└── 05_BACKEND_ARCHITECTURE/Seed_Data_Standards.md

Offline / cache:
├── 05_BACKEND_ARCHITECTURE/Offline_Operation_Architecture.md
└── 05_BACKEND_ARCHITECTURE/Virtual_Caching_Architecture.md

Integration:
└── 12_INTEGRATIONS/[related integration file]

Testing:
└── 10_TESTING_QA/

Implementation tracking:
└── 15_IMPLEMENTATION_TRACKING/

Scope check only if unclear or conflicting:
├── 00_START_HERE/Current_Source_Of_Truth.md
├── 01_RELEASE_SCOPE/Release_1_Scope.md
├── 01_RELEASE_SCOPE/Included_Features.md
├── 01_RELEASE_SCOPE/Excluded_Features.md
└── 01_RELEASE_SCOPE/EPOS_Technology_Stack.md
```

## Rules

```text
Do not write code yet.
Do not create files yet.
Do not read 99_Archive unless I ask.
Do not reread full release/scope files unless scope is unclear or conflicting.

Use ASP.NET Core Web API, EF Core, PostgreSQL, Clean Architecture, and
Service/Repository pattern.

Do not trust frontend tenant_id.
Resolve tenant context server-side.
Use DTOs and mapping.
Do not return EF Core entities directly.

Backend database is final truth.
Do not finalize payment, refund, exchange, final stock, final sale total, or
till close offline.

Use Azure Blob Storage for file/image storage.
Do not use AWS S3.
Do not use CQRS, MediatR, or Redis unless separately approved.
```

## Before Coding

Before coding, respond with summary only:

```text
1. Feature summary
2. Related journey
3. Related database tables
4. Required access checks
5. Backend files/layers affected
6. Optional files read and why
7. Implementation plan
8. Test plan
9. Second Brain update plan
10. Unclear items
```

Wait for my confirmation.

## After Confirmation

After I confirm:

```text
- Implement the backend feature with file paths.
- Add required unit/integration tests.
- Run the relevant dotnet test command.
- Fix failing tests.
- Show final test result.
- Update implementation tracking:
  15_IMPLEMENTATION_TRACKING/Backend/[MODULE_FOLDER_NAME]/[FEATURE_NAME]_Implementation_Status.md
```

Use this status after tests pass:

```md
## Implementation Status

| Item | Value |
|---|---|
| Feature | [FEATURE_NAME] |
| Module | [MODULE_FOLDER_NAME] |
| Platform | Backend |
| Status | Completed |
| Completed Date | [YYYY-MM-DD] |
| Tests | Passed |
| PR / Commit | [value or -] |
```

Do not mark completed if tests fail.
Do not invent anything outside the Second Brain.
