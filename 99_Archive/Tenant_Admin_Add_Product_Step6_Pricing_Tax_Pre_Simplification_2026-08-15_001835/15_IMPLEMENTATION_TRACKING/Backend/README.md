<!-- title: Backend Implementation Tracking -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Backend Implementation Tracking

## Purpose

This folder tracks completed and in-progress Backend features for SCS-TIX
EPOS Release 1.

It covers .NET API, Application, Domain, Infrastructure, EF Core, migrations, seed data, and backend tests.

## Folder Pattern

```text
12_IMPLEMENTATION_TRACKING/Backend/[Module_Name]/[Feature_Name]_Implementation_Status.md
```

## Completion Rule

A feature can be marked `Completed` only when:

- Implementation is completed.
- Related tests are written.
- Relevant test command is run.
- Failing tests are fixed or documented.
- Related Second Brain files are updated.
- PR or commit reference is recorded.
- Completed date is added.

## Useful Test Commands

```text
dotnet test
dotnet test tests/SCS.UnitTests
dotnet test tests/SCS.IntegrationTests
dotnet test tests/SCS.ApiTests
```

## Tracking Fields

Every status file must record:

| Field | Required |
|---|---|
| Module | Yes |
| Feature | Yes |
| Status | Yes |
| Completed date | If completed |
| Files changed | Yes |
| Tests written/run | Yes |
| PR/commit | Yes |
| Second Brain updates | Yes |

## Review Rule

Do not mark unsupported Release 1 scope as completed.

Do not mark completed when tests fail.

## Related Files

- [[../Full_Feature_Status_Index]]
- [[../../11_DEVELOPER_ONBOARDING/Code_Review_Checklist]]
