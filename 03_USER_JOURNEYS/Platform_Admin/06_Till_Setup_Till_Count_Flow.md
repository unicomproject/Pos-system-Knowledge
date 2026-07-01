<!-- title: Till Setup And Till Count Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Till Setup And Till Count Flow

## Purpose

Defines how Platform Admin creates tills for outlets and prepares them for later POS device binding.

## Actor

Platform Admin

## Source

Derived from `Slide 4 - Till Setup / Till Count Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens till setup for a selected outlet.

## Preconditions

- Tenant exists.
- Outlet exists and is active.
- Platform Admin has till setup permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open tenant detail | System opens selected tenant. |
| 2 | Select outlet | Platform Admin chooses the outlet where till will be created. |
| 3 | Open tills | System shows existing tills for outlet. |
| 4 | Click add till | System opens add till form. |
| 5 | Enter till details | Platform Admin enters till name and till code. |
| 6 | Save till | System validates and creates till. |
| 7 | Device binding status pending | System marks till device binding as pending. |
| 8 | Till ready or active | Till is ready to be bound to tablet or POS device. |

## Data Used Or Captured

- Till name
- Till code
- Outlet
- Till status
- Last synced time
- Device binding status

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Till code must be unique within outlet/tenant.
- Till is a system record; POS device is bound later.

## Validation And Error Cases

- Duplicate till code
- Outlet inactive
- Permission denied
- Invalid till status

## Outcome

Till is ready for POS device setup.

## Related Modules

- 07_Outlet_Till_POS_Device_Foundation
- 08_Hardware_Till_Cash_Control

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/08_Outlet_Till_And_POS_Device_Foundation.md
