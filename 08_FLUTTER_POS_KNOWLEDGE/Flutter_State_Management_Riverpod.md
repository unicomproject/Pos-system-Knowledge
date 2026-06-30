<!-- title: Flutter State Management Riverpod -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Flutter State Management Riverpod

## Purpose

This file defines Riverpod usage for TM-EPOS Flutter apps.

Riverpod manages screen state, loaded context, cart state, permissions, device
state, cache state, and sync status.

## Provider Rule

Use providers as the boundary between UI and application logic.

Do not place business rules inside widgets.

## Provider Types

| Provider Type | Usage |
|---|---|
| FutureProvider | Initial API/local cache reads |
| StreamProvider | Sync status, device status, live updates |
| StateNotifier/Notifier | Cart, checkout, till, sync queue actions |
| Provider | Repository/service dependency injection |

## Important App State

- Auth session state.
- Tenant context.
- Feature and permission context.
- Outlet, till, and device context.
- Product/category cache state.
- Active cart state.
- Parked sales state.
- Offline sync queue state.
- Hardware connection state.
- Pickup/order fulfilment state.

## Cart State Rule

Cart state may live in memory for speed, but must be persisted to local storage
for crash/restart recovery and offline survival.

## Permission State Rule

Permission state can be cached for UI rendering, but protected actions still need
backend authorization.

## Sync State Rule

Offline sync providers should expose:

- Pending item count.
- Last sync time.
- Sync in progress.
- Failed item count.
- Conflict count.
- Device offline/online state.

## Anti-Patterns

- Calling Dio directly inside widgets.
- Storing raw tokens in providers.
- Using providers as permanent storage.
- Allowing UI state to become final business truth.

## Related Files

- [[Flutter_API_Integration]]
- [[Flutter_Local_Storage_Cache]]
- [[Flutter_Offline_Operation_Sync]]
