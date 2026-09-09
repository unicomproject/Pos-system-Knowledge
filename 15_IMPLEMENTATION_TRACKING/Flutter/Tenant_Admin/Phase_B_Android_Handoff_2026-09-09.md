<!-- title: Phase B Android Handoff -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# Phase B Android Handoff

## Scope

This note records local Android handoff and emulator evidence.
It does not mark production app-link deployment complete.
The account setup journey remains token verified and backend controlled.

## Local invitation handoff

The local bridge accepts the invitation setup route.
The setup route pattern is /tenant-admin/setup/{token}.
The custom app scheme is oneverz://tenant-admin/setup.
Its token is passed internally; never copy a real token into documentation.
The landing page offers Open app and Download Android test app.
After installation, reopen the original invitation and choose Open app.
This is not a verified deferred-link installation mechanism.
The local test bridge used localhost:4200.
The isolated test API used localhost:5151.
USB/ADB reverse forwarding supported the development handoff.
Those ports are historical test configuration, not production URLs.

## Verified behavior

- An invalid test invitation was rejected.
- A real invitation opened the password setup screen during the earlier session.
- The user performed password entry personally.
- Local activation and login evidence is recorded in the linked backend note.
- Full permission-authorized dashboard completion remains pending.

## Emulator launch diagnosis

The earlier emulator-5554 user was RUNNING_LOCKED.
Its launcher lookup returned no activity even though the APK built successfully.
The unlocked emulator-5556 resolved the application's MainActivity.
Installing the profile APK and starting it returned Status: ok.
A later failure used 5554 when only 5556 was connected.
Device IDs are runtime assignments and must not be treated as permanent identities.

## Launcher change

Source: Tenantadmin/Nytroz-POS-App/tools/run-android.ps1.
Without -Device, the script enumerates connected Android devices.
It checks the current Android user's RUNNING_UNLOCKED state.
It selects the sole unlocked device.
It rejects zero unlocked devices with an actionable message.
It requests an explicit device when multiple unlocked devices exist.
An explicit -Device still receives the lock-state check.
PowerShell syntax validation passed.
The app's native launcher was verified independently with ADB.

## Developer command

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/run-android.ps1 -Mode profile
```

Run this from the Flutter application root.
The mobile_scanner KGP warning did not cause the observed launcher failure.
Plugin migration compatibility is not closed by the launcher fix.
No emulator data wipe or account password reset was used for this fix.

## Remaining production work

Approved app distribution and production hosting remain pending.
Real-device app-opening/install acceptance remains pending.
Existing local startup success is not full Phase B certification.

## Related evidence

[[15_IMPLEMENTATION_TRACKING/Backend/Auth/Tenant_Admin_Phase_B_Local_Verification_2026-09-09]]
