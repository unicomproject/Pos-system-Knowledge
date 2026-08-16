<!-- title: Implementation Status Template -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Implementation Status Template

## Purpose

Use this template for every completed or in-progress feature status file.

Copy this file into:

```text
12_IMPLEMENTATION_TRACKING/[Platform]/[Module_Name]/[Feature_Name]_Implementation_Status.md
```

## Status Summary

| Item | Value |
|---|---|
| Platform | [Backend / Angular / Flutter] |
| Module | [MODULE_NAME] |
| Feature | [FEATURE_NAME] |
| Status | [Not Started / In Progress / Testing / Completed / Blocked] |
| Completed Date | [YYYY-MM-DD or -] |
| Developer | [Name or -] |
| Reviewer | [Name or -] |
| PR / Commit | [PR link, PR number, commit hash, or -] |
| Tests | [Passed / Failed / Not Run / N/A] |

## Feature Summary

Describe what this feature does in 3 to 5 lines.

The summary must match module knowledge and the related user journey.

Do not add unsupported Release 1 scope.

## Related Second Brain Files

| Area | File |
|---|---|
| Module overview | [[../../04_MODULE_KNOWLEDGE/[MODULE_NAME]/01_Module_Overview]] |
| Functional rules | [[../../04_MODULE_KNOWLEDGE/[MODULE_NAME]/02_Functional_Rules]] |
| Technical contract | [[../../04_MODULE_KNOWLEDGE/[MODULE_NAME]/03_Technical_Contract]] |
| User journey | [[../../03_USER_JOURNEYS/[ROLE_OR_AREA]/[JOURNEY_FILE]]] |
| Database | [[../../06_DATABASE_KNOWLEDGE/Tables/[DATABASE_GROUP_FILE]]] |
| Architecture | [[../../05_BACKEND_ARCHITECTURE/Backend_Overview]] |

## Files Changed

```text
[List changed files here]
```

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| Authentication | [Done / N/A] | |
| Tenant status | [Done / N/A] | |
| Feature entitlement | [Done / N/A] | |
| Permission | [Done / N/A] | |
| Outlet access | [Done / N/A] | |
| Trusted device | [Done / N/A] | |
| Assigned till | [Done / N/A] | |
| Open till session | [Done / N/A] | |

## Database Tables Used

| Table | Usage |
|---|---|
| `[table_name]` | [read/write/ledger/reference] |

## Tests Written

| Test Type | File / Test Name | Result |
|---|---|---|
| Unit | [test file] | [Passed / Failed / Not Run] |
| Integration | [test file] | [Passed / Failed / Not Run] |
| Manual | [manual check] | [Passed / Failed / Not Run] |

## Test Commands Run

```text
[command used]
```

## Test Result Summary

Write the final test result here.

Do not mark completed if tests failed.

## Second Brain Updates

| File Updated | Update Summary |
|---|---|
| `[file path]` | [what changed] |

## Final Completion Checklist

| Check | Required |
|---|---|
| Implementation completed | Yes |
| Tests written | Yes |
| Tests run | Yes |
| PR/commit recorded | Yes |
| Second Brain updated | Yes |
| Completed date added | Yes |
| No unsupported scope added | Yes |

## Related Files

- [[../Full_Feature_Status_Index]]
- [[../../11_DEVELOPER_ONBOARDING/Code_Review_Checklist]]
