<!-- title: Tenant Admin User Creation 5-Step Corrected UI Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-26 -->

# Tenant Admin User Creation 5-Step Corrected UI Contract

## Locked Step Ownership

| Step | Owns | Must not own |
|---|---|---|
| 1 Basic Information | Identity, profile, invitation/account mode | Base Role |
| 2 Assign Base Role | Single role selection and inherited preview | User identity editing |
| 3 Configure Permissions | User-only additive grants and effective summary | Global role mutation |
| 4 Outlet & Till Scope | All/selected outlet scope; future till section | Unsupported no-outlet/till/default controls |
| 5 Security & Review | Final state-derived review and create | Hardcoded counts/access level |

## Step 1

Show Full Name, Email, Phone, optional Employee ID, read-only/generated Staff Code, optional Profile Photo, and `INVITED`/`INACTIVE` mode. Phone is required by the corrected UX; backend enforcement remains an implementation gap. Do not show Role.

## Step 2

Render backend-returned assignable role cards with description, module preview, and inherited permission preview. Only this step writes the selected Base Role into wizard state.

## Step 3

Use clear badges: `Inherited`, `User Override`, `Locked / Not Assignable`. Inherited role permissions are read-only in this flow. The optional override control adds user-specific grants only when the actor has `tenant.users.permission_override`. Display: `This changes the user's effective permissions, not the Base Role.`

Summary values are computed from the current role baseline and accepted additive grants. Do not call the role permission replacement API from Add New User.

## Step 4

Show only `All Outlets` and `Selected Outlets`. Selected Outlets requires at least one choice. `No Outlet Access`, per-user Default Outlet, selected tills, and Default Till are omitted because the current API cannot persist them with the requested semantics.

If future till/default support is approved, option lists become conditional on outlet scope and invalid dependent selections are cleared immediately when outlets change.

## Step 5

Cards display final User Information, Base Role, Module Count, Effective Permission Count, outlet scope/count, and the selected account/invitation mode. Do not display Access Level. Omit Till Count/defaults until supported.

`INVITED` review shows invite destination and setup-token behavior. `INACTIVE` review shows login disabled and no invite promise. Never combine `ACTIVE` with `Will be invited`.

## Actions

Steps 1–4 use `Back` where applicable, `Cancel`, and `Next`. Step 5 uses `Back`, `Cancel`, and `Create User`. `Save Draft` is absent from every active step because no draft contract exists.

## Responsive Contract

Tablet landscape is primary. Use a compact horizontal stepper; stack fields/cards when width becomes unsafe; preserve 44px touch targets; keep validation next to its field; prevent nested page scroll and RenderFlex overflow. Review values must update immediately after back-navigation changes.
