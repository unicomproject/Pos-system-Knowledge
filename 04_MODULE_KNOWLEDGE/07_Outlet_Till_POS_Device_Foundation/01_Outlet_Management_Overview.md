# 01 Outlet Management Overview

> [!IMPORTANT]
> **Canonical source for Tenant Admin Outlet Management and Create Outlet journey. Older conflicting specifications are archived.**
> Last Verified Date: 2026-08-06
> Source Files Reviewed: `outlets` table schema, `TenantAdminOutletsController.cs`, `add_outlet_screen.dart`, `outlet_form.dart`

## Purpose
The Outlet Management module coordinates the modeling and operation of physical and logical sale and inventory locations (Outlets) in the OneVerz POS system. It provides the administrative foundation for:
1. Creating and maintaining business outlets (stores, warehouses).
2. Configuring physical locations, contact details, and operating schedules.
3. Establishing outlet operational roles, till associations, and permissions.

## Document Directory
To ensure traceability and implementation completeness, this module is broken down into the following canonical specifications:

1. **[[01_Outlet_Management_Overview]]** (This document) - High-level module purpose, directory, and overview.
2. **[[02_Create_Outlet_Current_State_Audit]]** - Full technical audit of the current frontend, backend, and database implementations.
3. **[[03_Create_Outlet_Canonical_Functional_Specification]]** - Functional requirements for the Create Outlet workflow.
4. **[[04_Create_Outlet_UI_UX_and_User_Journey]]** - Step-by-step user journey, application shell boundaries, and visual specs.
5. **[[05_Create_Outlet_Business_Rules_and_Validation]]** - Core domain logic and field-level validation rules.
6. **[[06_Create_Outlet_FE_BE_API_Contract]]** - Exact endpoints, payload examples, and HTTP response codes.
7. **[[07_Create_Outlet_Database_Design_and_Mapping]]** - Entity mappings, tables, columns, and recommended constraints.
8. **[[08_Create_Outlet_Permissions_Security_and_Audit]]** - Access control, tenant isolation, and audit events.
9. **[[09_Create_Outlet_Non_Functional_Requirements]]** - Performance, security, accessibility, responsiveness, and observability.
10. **[[10_Create_Outlet_Error_States_and_Messages]]** - Field and page-level error states, focus, and retry handling.
11. **[[11_Create_Outlet_QA_Acceptance_and_Test_Cases]]** - Comprehensive QA checklist and structured test scenarios.
12. **[[12_Create_Outlet_Implementation_Gap_and_Plan]]** - Phased delivery roadmap for P0, P1, and P2.
13. **[[13_Create_Outlet_Product_Decisions_Register]]** - Open product questions, options, and architectural recommendations.
14. **[[14_Create_Outlet_Traceability_Matrix]]** - Complete map connecting requirements to files, APIs, and test cases.

## Core Scope Boundaries
- **Tenant Admin Workspace**: Full CRUD operations on outlets are restricted to the Tenant Admin panel.
- **POS / Cashier Workspace Isolation**: The POS shell must not leak cashier context (tills, active cashier shifts, open sessions) into the outlet creation workflow.
- **System Isolation**: Outlets are strictly isolated by Tenant ID.
