<!-- title: Angular Implementation Tracking -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Angular Implementation Tracking

## Purpose

This folder tracks completed and in-progress Angular features for SCS-TIX
EPOS Release 1.

It covers Platform Admin Web routes, pages, components, typed API services, guards, forms, state, and tests.

## Folder Pattern

```text
12_IMPLEMENTATION_TRACKING/Angular/[Module_Name]/[Feature_Name]_Implementation_Status.md
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
npm test
npm run build
ng test
ng build
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
