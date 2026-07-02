<!-- status: Archived reference — port 5052 / SCS backend obsolete -->
<!-- superseded_by: ../../11_DEVELOPER_ONBOARDING/Backend_Local_Development_Setup.md -->

> **ARCHIVED NOTE (2026-07-01):** This project note references old port **5052**
> and `127.0.0.1:5052`. Active backend is Unified Commerce on port **5187**.
> See [[../../11_DEVELOPER_ONBOARDING/Backend_Local_Development_Setup]].

# Tenant Admin Frontend Data Binding Update - 2026-06-25

## Summary

Frontend fixes were applied in the active Flutter project:

```text
C:\Users\User\Desktop\pos final wep\Tenantadmin\Nytroz-POS-App
```

The work focused on making Tenant Admin Users and Tills screens show original backend/database data instead of stale/static UI data.

## Files Changed

```text
lib/features/tenant_admin/presentation/screens/tenant_admin_placeholder_screen.dart
lib/features/tenant_admin/tills/presentation/providers/till_visibility_provider.dart
```

## Users Page Update

- Active rendered Users page was confirmed inside `tenant_admin_placeholder_screen.dart`.
- Users table now fetches backend data from:

```http
GET /api/v1/tenant-admin/users
```

- Added `_tenantUsersProvider` to load page 1 users from the backend.
- Added JSON mapping into `_ReferenceUser.fromJson` for:
  - full name
  - email
  - role name
  - outlet name
  - status
  - last active date
  - phone
  - created/joined date
- Table renders backend users in a responsive horizontal table.
- No backend/API/database/auth/permission/folder-structure changes were made.

## Tills Page Update

- Active Tills route already used the backend chain:

```text
TillListScreen
-> tillListProvider
-> GetTills
-> TillRepositoryImpl
-> TillRemoteDatasource
-> GET /api/v1/tenant-admin/tills
```

- Issue found: list provider could keep stale/empty cached state after create/navigation.
- Minimal fix applied:

```dart
FutureProvider<TillListResult?>
```

changed to:

```dart
FutureProvider.autoDispose<TillListResult?>
```

- This makes the Tills page refetch original backend data when reopened.
- Existing datasource, repository, usecase, DTO, mapper, and UI table were kept.
- No backend/API/database/auth/permission/folder-structure changes were made.

## Validation

Commands run:

```bash
dart analyze lib/features/tenant_admin/presentation/screens/tenant_admin_placeholder_screen.dart
dart analyze lib/features/tenant_admin/tills
flutter build apk --debug --dart-define=API_BASE_URL=http://127.0.0.1:5052
adb install -r build/app/outputs/flutter-apk/app-debug.apk
adb reverse tcp:5052 tcp:5052
```

Result:

- Dart analyze passed for Users page file.
- Dart analyze passed for Tills module.
- Debug APK installed successfully on emulator.
- Backend local port reverse was set for emulator access.

## Important Runtime Note

Backend must be running on local port `5052` for emulator frontend to show original backend data.

```bash
adb reverse tcp:5052 tcp:5052
```

must be active when using Android emulator with:

```text
API_BASE_URL=http://127.0.0.1:5052
```

## Do Not Change

These were intentionally not changed:

- Folder structure
- Backend/API/database
- Provider business logic beyond stale-cache lifecycle fix
- Auth logic
- Permission logic
- New packages
