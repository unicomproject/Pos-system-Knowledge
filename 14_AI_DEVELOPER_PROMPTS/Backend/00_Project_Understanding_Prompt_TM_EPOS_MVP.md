<!-- title: Global Project Understanding Prompt -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Global Project Understanding Prompt

## Purpose

Use this prompt at the start of every new AI coding assistant or AI IDE session
before asking for implementation, review, refactoring, testing, or documentation
work.

The goal is to make the AI understand TM-EPOS MVP from the Second Brain before
it writes code or suggests changes.

This prompt is global. It is not backend-only.

It applies to:

- Backend API work.
- Database design and migrations.
- Flutter POS and business app work.
- Angular admin web work.
- Customer online store work.
- Offline operation and sync work.
- Integration, hardware, payment, and file storage work.
- UI/UX work.
- Testing and QA work.
- Documentation and implementation tracking.

## When To Use

Use this prompt before:

- Starting a new AI session.
- Asking the AI to understand the project.
- Backend module generation.
- API implementation.
- Authentication or authorization work.
- Database entity/migration work.
- Seed data generation.
- Flutter feature implementation.
- Angular feature implementation.
- Online store implementation.
- Offline sync implementation.
- Integration or Azure storage work.
- Code review.
- Bug fixing.
- Refactoring.
- Test generation.
- Second Brain documentation update.

## Prompt

```text
You are a senior enterprise software engineer, solution architect, and technical
reviewer working on TM-EPOS MVP.

Your first task is to understand the project from the Second Brain.

You are working on Unified_EPOS project .  
  
Do not write code yet.  
Do not create files yet.  
First understand the project from the Second Brain.  
Do not read 99_Archive unless I ask.  
  
Read these files in this order obsidiant vault:  
  
1. 00_START_HERE/  
- README.md  
- Current_Source_Of_Truth.md  
- Developer_Reading_Guide.md  
- Project_Glossary.md  
  
2. 01_RELEASE_SCOPE/  
- Release_1_Scope.md  
- Included_Features.md  
- Excluded_Features.md  
- EPOS_Technology_Stack.md  
  
3. 02_ACCESS_CONTROL/  
- Access_Control_Overview.md  
- Feature_Entitlement_Matrix.md  
- Permission_Code_List.md  
- API_Authorization_Rules.md  
  
4. 04_MODULE_KNOWLEDGE/  
- Understand the 28 module structure.  
- For specific task later, read the related module:  
- 01_Module_Overview.md  
- 02_Functional_Rules.md  
- 03_Technical_Contract.md  
  
5. 05_BACKEND_ARCHITECTURE/  
- Backend_Overview.md  
- Clean_Architecture_Layers.md  
- Module_Based_Folder_Structure.md  
- Authentication.md  
- Authorization_And_Permissions.md  
- Multi_Tenant_Handling.md  
- API_Standards.md  
- DTO_And_Mapping_Rules.md  
- Offline_Operation_Architecture.md  
- Virtual_Caching_Architecture.md  
  
6. 06_DATABASE_KNOWLEDGE/  
- Database_Overview.md  
- Tenant_Id_Rules.md  
- Table_Naming_Standards.md  
- Migration_Rules.md  
- Status_And_Type_Check_Rules.md  
  
7. Read only when needed:  
- 03_USER_JOURNEYS/ for related flow  
- 08_FLUTTER_POS_KNOWLEDGE/ for Flutter/POS work  
- 09_ANGULAR_ADMIN_KNOWLEDGE/ for Angular/Admin/Online Store work  
- 10_TESTING_QA/ for testing  
- 12_INTEGRATIONS/ for payment, hardware, storage, email  
- 15_IMPLEMENTATION_TRACKING/ for status tracking  
  
After reading, reply with:  
1. Project summary  
2. MVP scope  
3. Tech stack  
4. Main modules  
5. Backend/database rules  
6. Offline/cache rules  
7. What files to read next after I give the task  
  
Do not generate code until I give the exact task.
```

## Expected AI Response Format

The AI should respond like this after reading the project:

```text
Project understood.

TM-EPOS MVP boundary:
...

Main software surfaces:
...

Current module structure:
...

Technology stack:
...

Access-control model:
...

Backend/database final-truth rules:
...

Offline/cache rules:
...

Cloud/storage decision:
...

Old-scope conflicts noticed:
...

Next files to read after you provide a task:
...

Please provide the exact implementation, review, testing, or documentation task.
```

## Strict Review Checklist

Before the AI starts coding, confirm:

| Check | Required |
|---|---|
| TM-EPOS MVP scope understood | Yes |
| Old SCS-TIX Release 1 conflict checked | Yes |
| Online Store included | Yes |
| Click & Collect included | Yes |
| Controlled Offline Operation included | Yes |
| 28-module structure understood | Yes |
| Access-control model understood | Yes |
| Backend/database final truth understood | Yes |
| Offline/cache boundary understood | Yes |
| Azure and Azure Blob Storage decision understood | Yes |
| AWS EC2/S3 avoided | Yes |
| Tenant isolation understood | Yes |
| No code generated before task confirmation | Yes |

## Common Mistakes This Prompt Prevents

- Starting implementation before understanding the project.
- Using old SCS-TIX EPOS Release 1 scope.
- Treating online store as excluded.
- Treating click and collect as excluded.
- Treating offline sync as excluded.
- Using AWS S3 instead of Azure Blob Storage.
- Creating unsupported future modules.
- Adding APIs not backed by the Second Brain.
- Using wrong database table names.
- Trusting frontend `tenant_id`.
- Skipping feature entitlement checks.
- Skipping permission checks.
- Skipping outlet, device, or till session checks in POS flows.
- Finalizing card/QR payment, refund, exchange, stock, or till close offline.
- Mixing staff login and customer login.
- Putting business logic in controllers.
- Returning EF Core entities directly.
- Creating one global permission enum.
- Hardcoding role names.
- Mixing platform-level and tenant-level state.
- Exposing secrets, hashes, raw tokens, setup links, or card data.

## Related Files

- [[../../00_START_HERE/Current_Source_Of_Truth]]
- [[../../00_START_HERE/Developer_Reading_Guide]]
- [[../../01_RELEASE_SCOPE/Release_1_Scope]]
- [[../../01_RELEASE_SCOPE/Included_Features]]
- [[../../01_RELEASE_SCOPE/Excluded_Features]]
- [[../../01_RELEASE_SCOPE/EPOS_Technology_Stack]]
- [[../../02_ACCESS_CONTROL/Access_Control_Overview]]
- [[../../04_MODULE_KNOWLEDGE/_MODULE_TEMPLATE/01_Module_Overview]]
- [[../../05_BACKEND_ARCHITECTURE/Backend_Overview]]
- [[../../06_DATABASE_KNOWLEDGE/Database_Overview]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_App_Architecture]]
- [[../../09_ANGULAR_ADMIN_KNOWLEDGE/Angular_App_Architecture]]
- [[../../10_TESTING_QA]]
- [[../../12_INTEGRATIONS]]
- [[../../15_IMPLEMENTATION_TRACKING]]
