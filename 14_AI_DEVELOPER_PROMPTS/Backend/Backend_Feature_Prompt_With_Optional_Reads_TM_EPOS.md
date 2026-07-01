<!-- title: Backend Feature Prompt With Optional Reads -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

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
â”œâ”€â”€ 01_Module_Overview.md
â”œâ”€â”€ 02_Functional_Rules.md
â””â”€â”€ 03_Technical_Contract.md

06_DATABASE_KNOWLEDGE/Tables/[related database file]

05_BACKEND_ARCHITECTURE/
â”œâ”€â”€ Clean_Architecture_Layers.md
â”œâ”€â”€ Module_Based_Folder_Structure.md
â”œâ”€â”€ DTO_And_Mapping_Rules.md
â”œâ”€â”€ API_Standards.md
â””â”€â”€ Error_Response_Standards.md
```

## Optional Files

Read these only if required by the feature:

```text
Access / permission / tenant safety:
â”œâ”€â”€ 02_ACCESS_CONTROL/Access_Control_Overview.md
â”œâ”€â”€ 02_ACCESS_CONTROL/Feature_Entitlement_Matrix.md
â”œâ”€â”€ 02_ACCESS_CONTROL/Permission_Code_List.md
â”œâ”€â”€ 02_ACCESS_CONTROL/API_Authorization_Rules.md
â”œâ”€â”€ 05_BACKEND_ARCHITECTURE/Authentication.md
â”œâ”€â”€ 05_BACKEND_ARCHITECTURE/Authorization_And_Permissions.md
â””â”€â”€ 05_BACKEND_ARCHITECTURE/Multi_Tenant_Handling.md

Database changes:
â”œâ”€â”€ 06_DATABASE_KNOWLEDGE/Tenant_Id_Rules.md

Audit / seed data:
â”œâ”€â”€ 05_BACKEND_ARCHITECTURE/Audit_Log_Standards.md
â””â”€â”€ 05_BACKEND_ARCHITECTURE/Seed_Data_Standards.md

Offline / cache:
â”œâ”€â”€ 05_BACKEND_ARCHITECTURE/Offline_Operation_Architecture.md
â””â”€â”€ 05_BACKEND_ARCHITECTURE/Virtual_Caching_Architecture.md

Integration:
â””â”€â”€ 12_INTEGRATIONS/[related integration file]

Testing:
- 10_TESTING_QA/Testing_Strategy.md
- 10_TESTING_QA/API_Testing_Standards.md
- 10_TESTING_QA/Permission_Test_Cases.md
- 10_TESTING_QA/Tenant_Isolation_Test_Cases.md
- 10_TESTING_QA/Idempotency_Test_Cases.md
- 10_TESTING_QA/Offline_Sync_Test_Cases.md
- 10_TESTING_QA/Regression_Checklist.md
- 10_TESTING_QA/Test_Case/_Feature_Test_Case_Template.md

Implementation tracking:
â””â”€â”€ 15_IMPLEMENTATION_TRACKING/

Scope check only if unclear or conflicting:
â”œâ”€â”€ 00_START_HERE/Current_Source_Of_Truth.md
â”œâ”€â”€ 01_RELEASE_SCOPE/Release_1_Scope.md
â”œâ”€â”€ 01_RELEASE_SCOPE/Included_Features.md
â”œâ”€â”€ 01_RELEASE_SCOPE/Excluded_Features.md
â””â”€â”€ 01_RELEASE_SCOPE/EPOS_Technology_Stack.md
```

## Rules

```text
Do not write code yet.
Do not create files yet.

Use ASP.NET Core Web API, EF Core, PostgreSQL, Clean Architecture, and
Service/Repository pattern.

Do not trust frontend tenant_id.
Resolve tenant context server-side.
Use DTOs and mapping.
Do not return EF Core entities directly.

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
- Add or update the feature test case document in Second Brain using:
  10_TESTING_QA/Test_Case/_Feature_Test_Case_Template.md
- Place the feature test case document under:
  10_TESTING_QA/Test_Case/[MODULE_FOLDER_NAME]/[FEATURE_NAME]_Test_Cases.md
- Fill planned cases, permission cases, tenant isolation cases, database/integration cases, and idempotency cases if required.
- Add required automated unit/integration/API tests for the feature.
- Update the feature test case document's Current Automated Test Coverage, Test Commands, and Result Summary after tests are written and run.
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
