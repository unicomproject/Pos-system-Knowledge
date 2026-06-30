<!-- title: Developer Reading Guide -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Developer Reading Guide

## Purpose

This guide tells each developer what to read before starting TM-EPOS MVP work.
It is designed for backend, Flutter, desktop/mobile EPOS, online store, admin,
UI/UX, QA, and AI-assisted implementation.
Do not start coding from a journey file alone.
Always read source-of-truth and scope rules first.

## Required Reading For Everyone

| Order | File | Reason |
|---:|---|---|
| 1 | [[Current_Source_Of_Truth]] | Understand which sources control decisions |
| 2 | [[../01_RELEASE_SCOPE/Release_1_Scope]] | Understand current MVP boundary |
| 3 | [[../01_RELEASE_SCOPE/Included_Features]] | Know what must be delivered |
| 4 | [[../01_RELEASE_SCOPE/Excluded_Features]] | Know what is not active |
| 5 | [[Project_Glossary]] | Use consistent terminology |
| 6 | [[../02_ACCESS_CONTROL/Access_Control_Overview]] | Understand entitlement and permission checks |
| 7 | [[Markdown_Writing_Rules]] | Follow Second Brain writing rules |

## Backend Developer Reading Path

1. Read [[../05_BACKEND_ARCHITECTURE/Backend_Overview]].
2. Read [[../05_BACKEND_ARCHITECTURE/Clean_Architecture_Layers]].
3. Read [[../05_BACKEND_ARCHITECTURE/Module_Based_Folder_Structure]].
4. Read [[../05_BACKEND_ARCHITECTURE/Authentication]].
5. Read [[../05_BACKEND_ARCHITECTURE/Authorization_And_Permissions]].
6. Read [[../05_BACKEND_ARCHITECTURE/Multi_Tenant_Handling]].
7. Read [[../05_BACKEND_ARCHITECTURE/API_Standards]].
8. Read the affected module knowledge file.
9. Read the matching database table file.
10. Read the relevant user journey.

## Database Developer Reading Path

1. Read [[../06_DATABASE_KNOWLEDGE/Database_Overview]].
2. Read [[../06_DATABASE_KNOWLEDGE/Tenant_Id_Rules]].
3. Read [[../06_DATABASE_KNOWLEDGE/Table_Naming_Standards]].
4. Read [[../06_DATABASE_KNOWLEDGE/Migration_Rules]].
5. Read the updated Unified Commerce table group.
6. Check constraints from the uploaded database design.
7. Read access-control rules before adding tenant-owned tables.
8. Read [[../13_DECISIONS_AND_CHANGES/Scope_Change_Log]] before replacing old table files.

## Flutter / EPOS Developer Reading Path

1. Read [[../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_App_Architecture]].
2. Read [[../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Folder_Structure]].
3. Read [[../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_API_Integration]].
4. Read [[../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Local_Storage_Cache]].
5. Read the offline operation and cache files when implementing offline behavior.
6. Read POS, order, checkout, and payment journeys before UI work.
7. Read permission UI rules before showing action buttons.
8. Read hardware integration files before printer/scanner/drawer/card work.

## Online Store Developer Reading Path

1. Read [[Current_Source_Of_Truth]].
2. Read [[../01_RELEASE_SCOPE/Included_Features]].
3. Read Online Store module knowledge when created.
4. Read Cart & Checkout module knowledge when created.
5. Read Fulfilment & Pickup / Click & Collect module knowledge when created.
6. Read database files for sales channels, shopping carts, checkout sessions,
   sales orders, fulfilment orders, and pickup orders.
7. Read customer-facing UI rules when created.

## Admin / Operations Developer Reading Path

1. Read Platform Admin and Tenant Admin journeys.
2. Read product, variant, inventory, order, reports, users, and permissions modules.
3. Read entitlement and feature flag rules.
4. Read database tables for product, inventory, user, outlet, till, order, and
   reporting areas.
5. Do not hardcode roles or access decisions.

## QA Engineer Reading Path

1. Read [[Current_Source_Of_Truth]].
2. Read MVP included and excluded features.
3. Read POS journeys.
4. Read online store, click and collect, and offline journeys when created.
5. Read access-control test cases.
6. Read database constraints for duplicate prevention and idempotency.
7. Read error handling and offline recovery rules.

## AI Assistant Reading Path

Before generating code or documentation, AI assistants must read:

1. [[Current_Source_Of_Truth]]
2. [[Project_Glossary]]
3. [[Markdown_Writing_Rules]]
4. The relevant scope file.
5. The relevant module file.
6. The relevant database file.
7. The relevant journey file.
8. The relevant architecture file.

## Work Rule

If a file still says online store, click and collect, or offline sync are
excluded, do not follow that old rule. Flag it and update it only when that file
is part of the current update task.

## Related Files

- [[README]]
- [[Current_Source_Of_Truth]]
- [[Project_Glossary]]
- [[../13_DECISIONS_AND_CHANGES/Scope_Change_Log]]
