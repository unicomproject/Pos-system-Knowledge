git commit <!-- title: Developer Reading Guide -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Developer Reading Guide

## Purpose

This guide tells each developer what to read before starting SCS-TIX EPOS Release 1 work.
It is designed for backend, Flutter POS, Angular Platform Admin, UI/UX, QA, and AI-assisted implementation.
Do not start coding from a journey file alone.
Always read scope and access-control rules first.

## Required Reading For Everyone

| Order | File | Reason |
|---|---|---|
| 1 | [[Current_Source_Of_Truth]] | Understand which sources control decisions |
| 2 | [[Release_1_Scope]] | Avoid implementing deferred features |
| 3 | [[Included_Features]] | Know what must be delivered |
| 4 | [[Excluded_Features]] | Know what must not be built |
| 5 | [[Project_Glossary]] | Use consistent terminology |
| 6 | [[Access_Control_Overview]] | Understand entitlement, permission, outlet, device, and till checks |
| 7 | [[Markdown_Writing_Rules]] | Follow Second Brain writing rules |

## Backend Developer Reading Path

1. Read [[Backend_Overview]].
2. Read [[Clean_Architecture_Layers]].
3. Read [[Module_Based_Folder_Structure]].
4. Read [[Authentication]].
5. Read [[Authorization_And_Permissions]].
6. Read [[Multi_Tenant_Handling]].
7. Read [[API_Standards]].
8. Read [[Error_Response_Standards]].
9. Read [[Audit_Log_Standards]].
10. Read the module knowledge file for the feature.
11. Read the matching database table file.
12. Read the matching user journey.

## Flutter POS Developer Reading Path

1. Read [[Flutter_App_Architecture]].
2. Read [[Feature_First_Folder_Structure]].
3. Read [[Dio_API_Client]].
4. Read [[Secure_Storage_Token]].
5. Read [[Permission_Based_UI_Rendering]].
6. Read Cashier journey files under [[Cashier]].
7. Read Tenant Admin journeys when building admin screens inside the POS app.
8. Read [[POS_App_UI_Rules]].
9. Read [[Empty_Error_Loading_States]].
10. Read API authorization rules before showing action buttons.

## Angular Platform Admin Developer Reading Path

1. Read [[Angular_App_Architecture]].
2. Read [[Platform_Admin_Folder_Structure]].
3. Read [[Tenant_Wizard_State]].
4. Read [[Permission_Based_Menu]].
5. Read [[Angular_API_Integration_Guide]].
6. Read [[Angular_Form_Validation_Guide]].
7. Read Platform Admin journey files.
8. Read [[Feature_Entitlement_Matrix]].
9. Read subscription and tenant table files.
10. Read relevant ADR files before changing scope.

## Database Developer Reading Path

1. Read [[Database_Overview]].
2. Read [[Tenant_Id_Rules]].
3. Read [[Table_Naming_Standards]].
4. Read [[Migration_Rules]].
5. Read table files under [[Tables]].
6. Read [[Seed_Data_Standards]].
7. Read [[Tenant_Isolation_Test_Cases]].
8. Read [[Migration_Review_Prompt]] before migrations.

## QA Engineer Reading Path

1. Read [[Release_1_Scope]].
2. Read [[API_Authorization_Rules]].
3. Read [[Testing_Strategy]].
4. Read [[Permission_Test_Cases]].
5. Read [[Tenant_Isolation_Test_Cases]].
6. Read [[POS_Flow_Test_Cases]].
7. Read [[Regression_Checklist]].
8. Test denied access cases, not only successful flows.

## UI/UX Designer Reading Path

1. Read [[Design_System]].
2. Read [[POS_App_UI_Rules]].
3. Read [[Tenant_Admin_UI_Rules]].
4. Read [[Platform_Admin_UI_Rules]].
5. Read [[Permission_Based_UI_Rules]].
6. Read role-specific journeys.
7. Check feature-disabled, permission-denied, empty, loading, and error states.

## AI-Assisted Development Reading Path

1. Read this folder first.
2. Read the relevant module overview.
3. Read the matching functional rules.
5. Read the database table file.
7. Generate code only for confirmed Release 1 scope.

## Recommended Reading By Work Item

| Work Item         | Required Files                                                                |
| ----------------- | ----------------------------------------------------------------------------- |
| Tenant creation   | [[Create_Tenant_Flow]], [[Tenant]], [[Subscription]], [[Feature_Entitlement]] |
| User setup        | [[01_Setup_Link_And_Password_Flow]], [[Auth]], [[Users]]                      |
| Role permissions  | [[Role_Permission]], [[Permission_Code_List]], [[API_Authorization_Rules]]    |
| Till setup        | [[Till]], [[Devices]], [[Tills]]                                              |
| Device activation | [[Device_Activation_Flow]], [[Device]], [[POS_Hardware_Integration]]          |
| POS sale          | [[Start_Sale_Flow]], [[Sales]], [[Sale_Lines]], [[Payments]]                  |
| Discount          | [[Discount_Flow]], [[Discount]], [[Discounts]]                                |
| Return/refund     | [[08_Return_Refund_Flow]], [[Returns]], [[RefundsReturn_Refund_Flow]]         |
| Exchange          | [[Exchange_Flow]], [[Exchange]]                                               |
| Reports           | [[Reports]], [[Reports.md]]                                                   |

## Implementation Sequence Rule

Do not build screens before the backend contract is understood.
Do not build backend endpoints before reading the journey and table rules.
Do not create migrations without tenant_id rules, unique indexes, and audit requirements.
Do not show UI buttons unless the matching permission and feature entitlement are known.

## Common Mistakes To Avoid

- Treating Cashier, Manager, and Tenant Admin as fixed hardcoded UI layouts.
- Trusting tenant_id from frontend payloads.
- Allowing POS sales with only a valid JWT token.
- Implementing e-commerce because an old screen or table reference exists.
- Creating one giant PermissionCode enum.

## Review Rule

