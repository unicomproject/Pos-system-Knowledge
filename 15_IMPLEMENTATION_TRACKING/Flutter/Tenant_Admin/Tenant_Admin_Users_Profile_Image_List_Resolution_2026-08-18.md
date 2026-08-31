<!-- title: Tenant Admin Users List Profile Image Resolution -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-18 -->

# Tenant Admin Users List Profile Image Resolution

## Status

`IMPLEMENTED — RUNTIME VERIFICATION PENDING`

Authenticated Users List API runtime verification passed. Authenticated Flutter
screen visual verification was not executed in this run, so do not mark the
screen issue fully RESOLVED until a Tenant Admin Users screen capture or E2E
run confirms the image renders in-app.

## Issue

Tenant Admin Users List did not display the cashier/user profile image even
though `CASHIER001@GMAIL.COM` had a seeded profile image.

## Root Cause

The backend Users List contract did not expose `ProfileImageUrl`, while the
user detail contract did. The Flutter Users table therefore had no image URL to
render and used initials-only `CircleAvatar` rendering.

No production query semantics or development-only hardcoded image URL were
required to fix the issue.

## Backend Fix

- `src/E_POS.Application/Modules/Tenant/AccessControl/Dtos/TenantAdmin/TenantAdminUserDtos.cs`
  - Added nullable `ProfileImageUrl` to `TenantAdminUserListItemResponse`.
- `src/E_POS.Infrastructure/Modules/Tenant/AccessControl/Repositories/TenantAdminUserRepository.cs`
  - The list query now carries the user's `profile_image_url` media asset id.
  - The paged list batch-resolves active media assets using
    `MediaUrlResolver.PreferMediaAsset`.
  - Users without active profile media still return `null`.
  - Search, filtering, sorting and pagination remain unchanged; profile media
    resolution runs after pagination to avoid N+1 detail lookups.
- `tests/E_POS.IntegrationTests/AccessControl/TenantAdminUserProfileMediaPostgreSqlTests.cs`
  - Added coverage proving `ListAsync` returns the resolved profile image URL.

## Flutter Fix

- `lib/features/tenant_admin/users/data/models/tenant_user_dto.dart`
  - Parses nullable `profileImageUrl` from Users List API items.
- `lib/features/tenant_admin/users/domain/entities/tenant_user.dart`
  - Added nullable `profileImageUrl` to `TenantUser`.
- `lib/features/tenant_admin/users/data/mappers/tenant_user_mapper.dart`
  - Maps list DTO `profileImageUrl` into the domain entity.
- `lib/features/tenant_admin/users/presentation/widgets/user_avatar.dart`
  - Added shared avatar widget.
  - Uses `NetworkImage` only when a non-empty absolute URL exists.
  - Keeps initials or icon fallback underneath the foreground image.
- `lib/features/tenant_admin/users/presentation/widgets/user_table.dart`
  - Desktop/tablet Users list now uses `UserAvatar`.
- `lib/features/tenant_admin/users/presentation/widgets/user_mobile_list.dart`
  - Mobile Users list now uses the same `UserAvatar`.
- `test/features/tenant_admin/user_dto_test.dart`
  - Added list DTO and mapper assertions for `profileImageUrl`.
- `test/features/tenant_admin/user_avatar_test.dart`
  - Added focused widget tests for profile image URL, missing image fallback,
    and invalid URL fallback.

## Data / Seed State

`CASHIER001@GMAIL.COM` was checked in local `UnifiedCommerceDb` on
2026-08-18:

| Field | Value |
|---|---|
| User id | `99999999-0003-4000-8000-000000000001` |
| Tenant id | `55555555-0000-4000-8000-000000000001` |
| Full name | `Kavin` |
| Account status | `ACTIVE` |
| Profile media asset | `dddddddd-0001-4000-8000-000000000001` |
| Media status | `ACTIVE` |
| Public URL | `https://imgcdn.stablediffusionweb.com/2024/10/15/12d6f588-c9ab-4c05-82f0-99f9c2c0453f.jpg` |

No migration or seed repair was required.

## Verification Evidence

| Check | Result |
|---|---|
| Backend build | PASS: `dotnet build E_POS.sln --configuration Release` succeeded, 0 warnings / 0 errors after retry. Earlier run failed because `E_POS.ApiTests.dll` was locked by another process. |
| Backend API tests | PASS: `dotnet test tests/E_POS.ApiTests/E_POS.ApiTests.csproj --configuration Release --filter FullyQualifiedName~TenantAdminUsersControllerTests` passed 6/6. |
| Backend focused integration test | PASS: `dotnet test tests/E_POS.IntegrationTests/E_POS.IntegrationTests.csproj --configuration Release --filter FullyQualifiedName~TenantAdminUserProfileMediaPostgreSqlTests` passed 1/1. |
| Flutter analyze | PASS: `flutter analyze` reported no issues. |
| Flutter focused tests | PASS: `flutter test test/features/tenant_admin/user_dto_test.dart test/features/tenant_admin/user_avatar_test.dart` passed 9/9. |
| Flutter full tests | FAIL unrelated: `flutter test` failed in `test/features/tenant_admin/inventory_visual_runtime_test.dart` because existing inventory visual overflow expectations fail across locked screens. |
| Authenticated Users List API runtime | PASS: `GET /api/v1/tenant-admin/users?search=CASHIER001%40GMAIL.COM&page=1&pageSize=10` returned Kavin/Cashier with non-null `profileImageUrl`. |
| Cashier row visibility | PASS at API level. Flutter screen visual verification pending. |
| Cashier profile image visibility | PASS by API contract + focused widget behavior. Authenticated Flutter screen visual verification pending. |
| Initials fallback | PASS in focused widget test for missing and invalid profile image values. |

## Source Of Truth Status

Tenant Admin Users List profile image support is implemented in backend and
Flutter code, with API runtime and automated tests passed. Final source-of-truth
status remains:

`IMPLEMENTED — RUNTIME VERIFICATION PENDING`

until an authenticated Flutter Users screen run confirms the seeded cashier
image is visible in-app.
