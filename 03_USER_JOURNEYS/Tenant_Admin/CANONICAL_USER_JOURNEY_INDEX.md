<!-- title: Tenant Admin Canonical User Journey Index -->
<!-- status: Canonical -->
<!-- last_updated: 2026-09-09 -->
<!-- parent: [[../00_Global_User_Journey_Register]] -->

# Tenant Admin Canonical User Journey Index

**69 numbered journeys**, plus Online Store `EC-TA-UJ-02` (numeric ID collision pending reconciliation).

| Journey ID | Journey Name | Status | Completion % |
|---|---|---|---:|

| TA-UJ-001 | Tenant Login | COMPLETE | 95 |
| TA-UJ-002 | Tenant Logout | COMPLETE | 95 |
| TA-UJ-003 | First Login / Set Password (setup token) | COMPLETE | 80 |
| TA-UJ-004 | Submit Payment via Payment Link (Flutter) | PARTIAL | 35 |
| TA-UJ-005 | View Tenant Dashboard | PARTIAL | 50 |
| TA-UJ-006 | Browse Outlets | COMPLETE | 90 |
| TA-UJ-007 | Create Outlet | PARTIAL | 70 |
| TA-UJ-008 | View Outlet Details | COMPLETE | 90 |
| TA-UJ-009 | Edit Outlet | COMPLETE | 85 |
| TA-UJ-010 | Activate Outlet | PARTIAL | 40 |
| TA-UJ-011 | Deactivate Outlet | PARTIAL | 40 |
| TA-UJ-012 | Browse Tills | COMPLETE | 90 |
| TA-UJ-013 | Create Till (+ hardware) | PARTIAL | 75 |
| TA-UJ-014 | View Till Details | COMPLETE | 85 |
| TA-UJ-015 | Edit Till | COMPLETE | 85 |
| TA-UJ-016 | Browse Users | COMPLETE | 90 |
| TA-UJ-017 | Add User — Corrected 5-Step User Access | PARTIAL | 65 |
| TA-UJ-018 | View User Details | COMPLETE | 85 |
| TA-UJ-019 | Edit User | COMPLETE | 85 |
| TA-UJ-020 | Browse Roles | COMPLETE | 85 |
| TA-UJ-021 | Create Role | COMPLETE | 85 |
| TA-UJ-022 | Edit Role Permissions | COMPLETE | 85 |
| TA-UJ-023 | Browse Products | COMPLETE | 85 |
| TA-UJ-024 | Create Product (wizard) | PARTIAL | 55 |
| TA-UJ-025 | Save Explicit Product Draft | NOT_STARTED | 5 |
| TA-UJ-026 | Resume Product Draft | NOT_STARTED | 5 |
| TA-UJ-027 | Publish Product | NOT_STARTED | 5 |
| TA-UJ-028 | View Product Details | COMPLETE | 85 |
| TA-UJ-029 | Edit Product | COMPLETE | 85 |
| TA-UJ-030 | Duplicate Product | NOT_STARTED | 5 |
| TA-UJ-031 | Archive / Delete Product | COMPLETE | 80 |
| TA-UJ-032 | Activate / Deactivate Product | PARTIAL | 60 |
| TA-UJ-033 | View Product Dashboard | COMPLETE | 80 |
| TA-UJ-034 | Curate Popular Products | PARTIAL | 60 |
| TA-UJ-035 | Browse Categories | NOT_STARTED | 10 |
| TA-UJ-036 | Create Category | NOT_STARTED | 10 |
| TA-UJ-037 | View Category Details | NOT_STARTED | 10 |
| TA-UJ-038 | Edit Category | NOT_STARTED | 10 |
| TA-UJ-039 | Delete Category | NOT_STARTED | 10 |
| TA-UJ-040 | Browse Brands | COMPLETE | 90 |
| TA-UJ-041 | Create Brand | COMPLETE | 90 |
| TA-UJ-042 | View Brand Details | COMPLETE | 90 |
| TA-UJ-043 | Edit Brand | COMPLETE | 90 |
| TA-UJ-044 | Delete Brand | COMPLETE | 90 |
| TA-UJ-045 | View Inventory / Current Stock | NOT_STARTED | 20 |
| TA-UJ-046 | Stock In | NOT_STARTED | 25 |
| TA-UJ-047 | Stock Adjustment | NOT_STARTED | 10 |
| TA-UJ-048 | Stock Out | NOT_STARTED | 10 |
| TA-UJ-049 | Stock Count | NOT_STARTED | 10 |
| TA-UJ-050 | View Stock Movement History | NOT_STARTED | 15 |
| TA-UJ-051 | View Stock Alerts | NOT_STARTED | 15 |
| TA-UJ-052 | View/Export Sales Report | NOT_STARTED | 20 |
| TA-UJ-053 | View/Export Product Report | NOT_STARTED | 20 |
| TA-UJ-054 | View/Export Inventory Report | NOT_STARTED | 20 |
| TA-UJ-055 | View/Export Order Report | NOT_STARTED | 20 |
| TA-UJ-056 | View Billing / Subscription | NOT_STARTED | 5 |
| TA-UJ-057 | Request Plan Upgrade | NOT_STARTED | 5 |
| TA-UJ-058 | View Tenant Audit Logs | NOT_STARTED | 5 |
| TA-UJ-059 | Configure POS Login Branding | PARTIAL | 30 |
| TA-UJ-060 | Manage C&C Order Status (Staff) | NOT_STARTED | 25 |
| TA-UJ-061 | Manage Expiry / Offer Discounts | NOT_STARTED | 5 |
| TA-UJ-062 | Monitor Device / Hardware Readiness | PARTIAL | 50 |
| EC-TA-UJ-02 | Configure And Publish Native Online Store (`EC-TA-UJ-02`) | PARTIAL | 70 |

| TA-UJ-063 | Browse Tax Setup | NOT_STARTED | 15 |
| TA-UJ-064 | Create Tax Setup | NOT_STARTED | 10 |
| TA-UJ-065 | Edit Tax Setup | NOT_STARTED | 10 |
| TA-UJ-066 | Schedule Tax Rate Change | NOT_STARTED | 5 |
| TA-UJ-067 | Activate / Deactivate Tax Setup | NOT_STARTED | 5 |
| TA-UJ-068 | View Products Using Tax | NOT_STARTED | 5 |
| TA-UJ-069 | Assign Tax in Product Setup (Step 6) | PARTIAL | 40 |

## 2026-08-25 User Creation Correction

TA-UJ-017 now points to [[07_User_Management_Add_New_User_Flow]]. The backend supports atomic user creation, role/outlet assignment, additive direct permission grants, invitation, and audit. Flutter remains a three-step implementation and user-specific till/default-till contracts are absent, so this journey cannot remain marked complete.

## 2026-08-27 Online Store Journey Lock

The local Online Store document used `TA-UJ-063`, which the remote index also assigns to Tax Setup. Use `EC-TA-UJ-02` to distinguish Online Store pending numeric-ID reconciliation; existing Tax IDs are preserved. The approved Tenant Admin native Online Store journey has exactly nine steps; the Store Live screen is the result state of Step 9, not Step 10. See [[22_Online_Store_Setup_And_Publish_Flow]].



## Category Management journey status (2026-08-27)

TA-UJ-035 … TA-UJ-039: **NOT_STARTED** (backend contract + implementation complete; **Flutter implementation pending**; end-to-end journey **NOT COMPLETE**). Canonical Category Management backend is IMPLEMENTED (ADR 010 — Category decoupled from Department). Do not mark these journeys COMPLETE because backend exists; Flutter Category Management is still Coming Soon.

Authority: [[../../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_SECOND_BRAIN_GAP_CLOSURE_2026-08-27]]

## Tax Management journey status (2026-09-03)

TA-UJ-063 … TA-UJ-069: Second Brain **canonical contract READY**. Existing Flutter/backend Tax aggregate may partially support list/create/update but does **not** yet implement the full Tax Setup list/schedule/treatment/products-using contract. Do not mark COMPLETE.

Authority: [[../../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]]
Decision register: [[../../13_DECISIONS_AND_CHANGES/TENANT_ADMIN_TAX_MANAGEMENT_DECISION_REGISTER_2026-09-03]]
