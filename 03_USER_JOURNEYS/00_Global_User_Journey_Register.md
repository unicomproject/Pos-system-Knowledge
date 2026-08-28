<!-- title: Global User Journey Register -->
<!-- status: Canonical -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-13 -->
<!-- supersedes: Provisional 163-candidate register (2026-08-12 audit) -->

# Global User Journey Register

## Authority

Canonical **one-row-per-journey** master index for OneVerz EPOS atomic user journeys across all surfaces.

| Attribute | Value |
|---|---|
| Register version | **173** (locked 2026-08-12) |
| Previous provisional count | 163 (superseded) |
| Previous locked count | 172 (Selected-Tenant Phase 2.5; SA-UJ-048–056) |
| Selected-Tenant Online Store | SA-UJ-057 registered (**COMPLETE** — runtime E2E closed 2026-08-13) |
| ST-UX-001 | Cross-cutting requirement - **PASS (implemented); not counted** |

## Surface summary

| Surface | Total | Complete | Partial | Not Started | Blocked |
|---|---:|---:|---:|---:|---:|
| Super Admin | 57 | 55 | 1 | 1 | 0 |
| Tenant Admin | 62 | 26 | 11 | 25 | 0 |
| Cashier POS | 36 | 21 | 9 | 4 | 2 |
| E-commerce Customer | 18 | 12 | 5 | 1 | 0 |
| **GRAND TOTAL** | **173** | **114** | **26** | **31** | **2** |

Arithmetic: 114 + 26 + 31 + 2 = 173

Selected-Tenant final runtime E2E closure (2026-08-13): SA-UJ-048…057 moved **PARTIAL → COMPLETE** against live PostgreSQL + backend `0245053` + Angular `8587e04`. ST-UX-001 remains **PASS** (not counted). Evidence: [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_SELECTED_TENANT_FINAL_RUNTIME_E2E_CLOSURE_2026-08-13]]. SA-UJ-024 remains sole Super Admin **NOT_STARTED**.

## Super Admin vs Tenant Admin - Selected-Tenant ownership

| Mode | Actor | Purpose |
|---|---|---|
| **Super Admin Selected-Tenant** | Platform Admin | **Initial assisted / bootstrap configuration** |
| **Tenant Admin** | Tenant Admin | **Ongoing operational management** |

NOT duplicates (actor, surface, permission namespace, business purpose, audit attribution differ):

- Create Outlet (SA-UJ-051 vs TA-UJ-007)
- Create Till (SA-UJ-052 vs TA-UJ-013)
- Create Role (SA-UJ-053 vs TA-UJ-024)
- Add User (SA-UJ-054 vs TA-UJ-017)
- Product Onboarding (SA-UJ-055/056 vs TA-UJ-027+)
- Online Store readiness (SA-UJ-057 vs TA storefront ops)

## Cross-cutting requirements (not journeys)

| ID | Name | Applies to | Counted? |
|---|---|---|---|
| **ST-UX-001** | Selected-Tenant Context Requirement | All Selected-Tenant screens | **NO** |

Requirements: tenant name, code, status, plan summary; Exit always reachable; Switch where allowed; refresh/deep-link safety; suspended treatment; no stale tenant context; no cross-tenant cache leakage.

Contract: [[Platform_Admin/ST-UX-001_Selected_Tenant_Context_Requirement]]

Rejected as journey: SA-ST-UJ-004 merged to ST-UX-001.

## Canonical ID mapping - Selected-Tenant (discovery to global)

| Canonical ID | Legacy / Discovery ID | Journey Name | Status |
|---|---|---|---|
| SA-UJ-048 | SA-ST-UJ-001 | Enter Selected-Tenant Context | COMPLETE |
| SA-UJ-049 | SA-ST-UJ-002 | Switch Selected Tenant | COMPLETE |
| SA-UJ-050 | SA-ST-UJ-003 | Exit Selected-Tenant Context | COMPLETE |
| SA-UJ-051 | SA-ST-UJ-005 | Create Outlet for Selected Tenant | COMPLETE |
| SA-UJ-052 | SA-ST-UJ-006 | Create Till for Selected Tenant Outlet | COMPLETE |
| SA-UJ-053 | SA-ST-UJ-007 | Create Tenant Role | COMPLETE |
| SA-UJ-054 | SA-ST-UJ-008 | Add Additional Tenant User | COMPLETE |
| SA-UJ-055 | SA-ST-UJ-009 | Manually Onboard Initial Products | COMPLETE |
| SA-UJ-056 | SA-ST-UJ-010 | Import Initial Products via CSV | COMPLETE |
| SA-UJ-057 | SA-ST-UJ-011 | Configure Initial Online Store | COMPLETE |

Existing SA-UJ-001 through SA-UJ-047 **unchanged**. SA-UJ-047 remains Browse Platform Login Audit Logs.

## Master journey index

One row per journey. Implementation status reflects **production code**, not documentation maturity.

| Journey ID | Legacy/Discovery ID | Surface | Actor | Parent Flow | Journey Name | Trigger | Success Outcome | Scope | Status | Completion % | Documentation Reference | Permission | Entitlement | Dependencies | Notes |
|---|---|---|---|---|---|---|---|---|---:|---|---|---|---|---|

| SA-UJ-001 | Flow01 | SA | Platform Admin | Auth | Platform Login | Open `/login` | Session issued | Y | COMPLETE | 95 | - | - | - | - | — |
| SA-UJ-002 | — | SA | Platform Admin | Auth | Platform Logout | Sign out | Session cleared | Y | COMPLETE | 95 | - | - | - | - | — |
| SA-UJ-003 | Flow17 | SA | Platform Admin | Auth | Admin-Initiated Password Reset | Users → send reset | Token emailed; user resets | Y | PARTIAL | 45 | - | - | - | - | FE not merged (`feature/platform-admin-user-password-reset`) |
| SA-UJ-004 | SA-J02 | SA | Platform Admin | Dashboard | View Platform Dashboard | Open `/admin/dashboard` | KPIs + attention loaded | Y | COMPLETE | 90 | - | - | - | - | “This Month” chip cosmetic only |
| SA-UJ-005 | Flow03 | SA | Platform Admin | Tenant Mgmt | Browse Tenants | Open `/admin/tenants` | Tenant list (search/filter = capability) | Y | COMPLETE | 95 | - | - | - | - | — |
| SA-UJ-006 | Flow4 | SA | Platform Admin | Tenant Mgmt | Create Tenant Wizard | Create/resume draft | Draft finalized / tenant provisioned | Y | COMPLETE | 85 | - | - | - | - | Emails/PayHere = other journeys |
| SA-UJ-007 | Flow4 | SA | Platform Admin | Tenant Mgmt | Manage Onboarding Drafts | Drafts page | Resume/discard | Y | COMPLETE | 85 | - | - | - | - | Thin FE tests |
| SA-UJ-008 | Flow4 | SA | Platform Admin | Tenant Mgmt | Track Onboarding Operation | Open operation | Status/retry visible | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-009 | Flow18 | SA | Platform Admin | Tenant Mgmt | Resend Tenant Admin Invitation | Resend action | Invite resent | Y | COMPLETE | 85 | - | - | - | - | Email delivery mode gaps |
| SA-UJ-010 | Flow03 | SA | Platform Admin | Tenant Mgmt | View Tenant Details | Open tenant | Detail loaded | Y | COMPLETE | 95 | - | - | - | - | — |
| SA-UJ-011 | Flow03 | SA | Platform Admin | Tenant Mgmt | Edit Tenant Profile | Save | Profile updated | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-012 | Flow11 | SA | Platform Admin | Tenant Mgmt | Activate Tenant | Activate | ACTIVE | Y | COMPLETE | 90 | - | - | - | - | Distinct lifecycle |
| SA-UJ-013 | Flow03 | SA | Platform Admin | Tenant Mgmt | Suspend Tenant | Suspend | SUSPENDED | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-014 | Flow03 | SA | Platform Admin | Tenant Mgmt | Reactivate Tenant | Reactivate | ACTIVE | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-015 | Flow03 | SA | Platform Admin | Tenant Mgmt | Manage Tenant Entitlements | Edit entitlements | Entitlements saved | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-016 | Flow14 | SA | Platform Admin | Tenant Mgmt | View Tenant Audit Trail | Audit tab | Logs listed | Y | COMPLETE | 85 | - | - | - | - | — |
| SA-UJ-017 | Flow10 | SA | Platform Admin | Billing | Browse Billing Invoices | `/admin/billing` | Invoices listed | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-018 | Flow10 | SA | Platform Admin | Billing | Issue Invoice | Issue action | Invoice issued | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-019 | Flow10 | SA | Platform Admin | Billing | Mark Invoice Paid | Mark paid | Settled | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-020 | Flow4 | SA | Platform Admin | Billing | Browse Manual Payment Queue | `/admin/billing/manual-payments` | Queue listed | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-021 | Flow4 | SA | Platform Admin | Billing | Approve Manual Payment | Approve | Approved | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-022 | Flow4 | SA | Platform Admin | Billing | Reject Manual Payment | Reject | Rejected | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-023 | — | SA surface / public | Payment Recipient | Billing | Submit Manual Payment Evidence | Open `/payment/:accessToken` | Proof submitted to queue | Y | COMPLETE | 90 | - | - | - | - | **Not Super Admin actor** |
| SA-UJ-024 | Incl.Feat | SA | Platform Admin | Billing | Collect Payment via PayHere Link | Send/open PayHere | Paid via IPG | Y | NOT_STARTED | 5 | - | - | - | - | No IPG/UI/webhook |
| SA-UJ-025 | UI4A | SA | Platform Admin | Plans | Browse Subscription Plans | `/admin/subscriptions` | Plans listed | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-026 | UI4B | SA | Platform Admin | Plans | Create Subscription Plan | Create wizard | Draft saved | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-027 | UI4B | SA | Platform Admin | Plans | Edit Subscription Plan | Edit draft | Draft updated | Y | COMPLETE | 85 | - | - | - | - | No `/edit/:id` route |
| SA-UJ-028 | UI4A | SA | Platform Admin | Plans | View Plan Details | Open plan | Detail shown | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-029 | UI4A | SA | Platform Admin | Plans | Publish Plan | Publish | Published | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-030 | UI4A | SA | Platform Admin | Plans | Duplicate Plan | Duplicate | New draft | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-031 | UI4A | SA | Platform Admin | Plans | Archive Plan | Archive | Archived | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-032 | UI4A | SA | Platform Admin | Plans | Reactivate Plan | Reactivate | Active again | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-033 | UI4A | SA | Platform Admin | Plans | Delete Draft Plan | Delete | Draft removed | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-034 | — | SA | Platform Admin | Catalog | Browse Modules & Features | `/admin/modules` | Catalog viewed | Y | COMPLETE | 90 | - | - | - | - | Read-only |
| SA-UJ-035 | SA-P1-04 | SA | Platform Admin | Return Policies | Browse Return Policy Templates | `/admin/return-policy-templates` | Templates listed | Y | COMPLETE | 90 | - | - | - | - | Journey MD missing; **approved R1** |
| SA-UJ-036 | SA-P1-04 | SA | Platform Admin | Return Policies | Create Return Policy Template | `/create` | Template created | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-037 | SA-P1-04 | SA | Platform Admin | Return Policies | View Return Policy Template | Open `:id` | Detail shown | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-038 | SA-P1-04 | SA | Platform Admin | Return Policies | Edit Return Policy Template | Save | Updated | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-039 | SA-P1-04 | SA | Platform Admin | Return Policies | Delete Return Policy Template | Delete | Soft-deleted/removed | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-040 | Flow13 | SA | Platform Admin | Roles | Browse Platform Roles | `/admin/roles-permissions` | Roles listed | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-041 | Flow13 | SA | Platform Admin | Roles | Create Platform Role | Create | Role created | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-042 | Flow13 | SA | Platform Admin | Roles | Edit Role Permissions | Assign tree | Perms saved | Y | COMPLETE | 90 | - | - | - | - | — |
| SA-UJ-043 | Flow13 | SA | Platform Admin | Platform Users | Browse Platform Users | `/admin/platform-users` | Users listed | Y | COMPLETE | 85 | - | - | - | - | Client search = capability |
| SA-UJ-044 | Flow13 | SA | Platform Admin | Platform Users | Create Platform User | Create | User created/invited | Y | COMPLETE | 85 | - | - | - | - | No password field (invite-style) |
| SA-UJ-045 | Flow13 | SA | Platform Admin | Platform Users | Update Platform User Status/Roles | Edit | Status/roles updated | Y | COMPLETE | 85 | - | - | - | - | — |
| SA-UJ-046 | Flow15 | SA | Platform Admin | Settings | Configure System Settings | `/admin/settings/system` | Defaults saved | Y | COMPLETE | 85 | - | - | - | - | — |
| SA-UJ-047 | Flow14 | SA | Platform Admin | Audit | Browse Platform Login Audit Logs | `/admin/audit-logs` | Login audits listed | Y | COMPLETE | 85 | - | - | - | - | Login-only R1 |
| TA-UJ-001 | - | TA | Tenant Admin | - | Tenant Login | - | - | Y | COMPLETE | 95 | - | - | - | - | - |
| TA-UJ-002 | - | TA | Tenant Admin | - | Tenant Logout | - | - | Y | COMPLETE | 95 | - | - | - | - | - |
| TA-UJ-003 | - | TA | Tenant Admin | - | First Login / Set Password (setup token) | - | - | Y | COMPLETE | 80 | - | - | - | - | - |
| TA-UJ-004 | - | TA | Tenant Admin | - | Submit Payment via Payment Link (Flutter) | - | - | Y | PARTIAL | 35 | - | - | - | - | - |
| TA-UJ-005 | - | TA | Tenant Admin | - | View Tenant Dashboard | - | - | Y | PARTIAL | 50 | - | - | - | - | - |
| TA-UJ-006 | - | TA | Tenant Admin | - | Browse Outlets | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| TA-UJ-007 | - | TA | Tenant Admin | - | Create Outlet | - | - | Y | PARTIAL | 70 | - | - | - | - | - |
| TA-UJ-008 | - | TA | Tenant Admin | - | View Outlet Details | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| TA-UJ-009 | - | TA | Tenant Admin | - | Edit Outlet | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| TA-UJ-010 | - | TA | Tenant Admin | - | Activate Outlet | - | - | Y | PARTIAL | 40 | - | - | - | - | - |
| TA-UJ-011 | - | TA | Tenant Admin | - | Deactivate Outlet | - | - | Y | PARTIAL | 40 | - | - | - | - | - |
| TA-UJ-012 | - | TA | Tenant Admin | - | Browse Tills | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| TA-UJ-013 | - | TA | Tenant Admin | - | Create Till (+ hardware) | - | - | Y | PARTIAL | 75 | - | - | - | - | - |
| TA-UJ-014 | - | TA | Tenant Admin | - | View Till Details | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| TA-UJ-015 | - | TA | Tenant Admin | - | Edit Till | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| TA-UJ-016 | - | TA | Tenant Admin | - | Browse Users | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| TA-UJ-017 | - | TA | Tenant Admin | - | Add User | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| TA-UJ-018 | - | TA | Tenant Admin | - | View User Details | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| TA-UJ-019 | - | TA | Tenant Admin | - | Edit User | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| TA-UJ-020 | - | TA | Tenant Admin | - | Browse Roles | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| TA-UJ-021 | - | TA | Tenant Admin | - | Create Role | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| TA-UJ-022 | - | TA | Tenant Admin | - | Edit Role Permissions | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| TA-UJ-023 | - | TA | Tenant Admin | - | Browse Products | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| TA-UJ-024 | - | TA | Tenant Admin | - | Create Product (wizard) | - | - | Y | PARTIAL | 55 | - | - | - | - | - |
| TA-UJ-025 | - | TA | Tenant Admin | - | Save Explicit Product Draft | - | - | Y | NOT_STARTED | 5 | - | - | - | - | - |
| TA-UJ-026 | - | TA | Tenant Admin | - | Resume Product Draft | - | - | Y | NOT_STARTED | 5 | - | - | - | - | - |
| TA-UJ-027 | - | TA | Tenant Admin | - | Publish Product | - | - | Y | NOT_STARTED | 5 | - | - | - | - | - |
| TA-UJ-028 | - | TA | Tenant Admin | - | View Product Details | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| TA-UJ-029 | - | TA | Tenant Admin | - | Edit Product | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| TA-UJ-030 | - | TA | Tenant Admin | - | Duplicate Product | - | - | Y | NOT_STARTED | 5 | - | - | - | - | - |
| TA-UJ-031 | - | TA | Tenant Admin | - | Archive / Delete Product | - | - | Y | COMPLETE | 80 | - | - | - | - | - |
| TA-UJ-032 | - | TA | Tenant Admin | - | Activate / Deactivate Product | - | - | Y | PARTIAL | 60 | - | - | - | - | - |
| TA-UJ-033 | - | TA | Tenant Admin | - | View Product Dashboard | - | - | Y | COMPLETE | 80 | - | - | - | - | - |
| TA-UJ-034 | - | TA | Tenant Admin | - | Curate Popular Products | - | - | Y | PARTIAL | 60 | - | - | - | - | - |
| TA-UJ-035 | - | TA | Tenant Admin | - | Browse Categories | - | - | Y | NOT_STARTED | 10 | - | - | - | - | - |
| TA-UJ-036 | - | TA | Tenant Admin | - | Create Category | - | - | Y | NOT_STARTED | 10 | - | - | - | - | - |
| TA-UJ-037 | - | TA | Tenant Admin | - | View Category Details | - | - | Y | NOT_STARTED | 10 | - | - | - | - | - |
| TA-UJ-038 | - | TA | Tenant Admin | - | Edit Category | - | - | Y | NOT_STARTED | 10 | - | - | - | - | - |
| TA-UJ-039 | - | TA | Tenant Admin | - | Delete Category | - | - | Y | NOT_STARTED | 10 | - | - | - | - | - |
| TA-UJ-040 | - | TA | Tenant Admin | - | Browse Brands | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| TA-UJ-041 | - | TA | Tenant Admin | - | Create Brand | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| TA-UJ-042 | - | TA | Tenant Admin | - | View Brand Details | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| TA-UJ-043 | - | TA | Tenant Admin | - | Edit Brand | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| TA-UJ-044 | - | TA | Tenant Admin | - | Delete Brand | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| TA-UJ-045 | - | TA | Tenant Admin | - | View Inventory / Current Stock | - | - | Y | NOT_STARTED | 20 | - | - | - | - | - |
| TA-UJ-046 | - | TA | Tenant Admin | - | Stock In | - | - | Y | NOT_STARTED | 25 | - | - | - | - | - |
| TA-UJ-047 | - | TA | Tenant Admin | - | Stock Adjustment | - | - | Y | NOT_STARTED | 10 | - | - | - | - | - |
| TA-UJ-048 | - | TA | Tenant Admin | - | Stock Out | - | - | Y | NOT_STARTED | 10 | - | - | - | - | - |
| TA-UJ-049 | - | TA | Tenant Admin | - | Stock Count | - | - | Y | NOT_STARTED | 10 | - | - | - | - | - |
| TA-UJ-050 | - | TA | Tenant Admin | - | View Stock Movement History | - | - | Y | NOT_STARTED | 15 | - | - | - | - | - |
| TA-UJ-051 | - | TA | Tenant Admin | - | View Stock Alerts | - | - | Y | NOT_STARTED | 15 | - | - | - | - | - |
| TA-UJ-052 | - | TA | Tenant Admin | - | View/Export Sales Report | - | - | Y | NOT_STARTED | 20 | - | - | - | - | - |
| TA-UJ-053 | - | TA | Tenant Admin | - | View/Export Product Report | - | - | Y | NOT_STARTED | 20 | - | - | - | - | - |
| TA-UJ-054 | - | TA | Tenant Admin | - | View/Export Inventory Report | - | - | Y | NOT_STARTED | 20 | - | - | - | - | - |
| TA-UJ-055 | - | TA | Tenant Admin | - | View/Export Order Report | - | - | Y | NOT_STARTED | 20 | - | - | - | - | - |
| TA-UJ-056 | - | TA | Tenant Admin | - | View Billing / Subscription | - | - | Y | NOT_STARTED | 5 | - | - | - | - | - |
| TA-UJ-057 | - | TA | Tenant Admin | - | Request Plan Upgrade | - | - | Y | NOT_STARTED | 5 | - | - | - | - | - |
| TA-UJ-058 | - | TA | Tenant Admin | - | View Tenant Audit Logs | - | - | Y | NOT_STARTED | 5 | - | - | - | - | - |
| TA-UJ-059 | - | TA | Tenant Admin | - | Configure POS Login Branding | - | - | Y | PARTIAL | 30 | - | - | - | - | - |
| TA-UJ-060 | - | TA | Tenant Admin | - | Manage C&C Order Status (Staff) | - | - | Y | NOT_STARTED | 25 | - | - | - | - | - |
| TA-UJ-061 | - | TA | Tenant Admin | - | Manage Expiry / Offer Discounts | - | - | Y | NOT_STARTED | 5 | - | - | - | - | - |
| TA-UJ-062 | - | TA | Tenant Admin | - | Monitor Device / Hardware Readiness | - | - | Y | PARTIAL | 50 | - | - | - | - | - |
| POS-UJ-001 | - | POS | Cashier | - | Cashier Login | - | - | Y | COMPLETE | 95 | - | - | - | - | - |
| POS-UJ-002 | - | POS | Cashier | - | Cashier Logout | - | - | Y | COMPLETE | 95 | - | - | - | - | - |
| POS-UJ-003 | - | POS | Cashier | - | Activate/Trust Device | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| POS-UJ-004 | - | POS | Cashier | - | Open Till | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| POS-UJ-005 | - | POS | Cashier | - | View POS Home | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-006 | - | POS | Cashier | - | Build Sale (catalog→cart) | - | - | Y | COMPLETE | 80 | - | - | - | - | - |
| POS-UJ-007 | - | POS | Cashier | - | Attach Customer to Sale | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-008 | - | POS | Cashier | - | Browse Customers | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| POS-UJ-009 | - | POS | Cashier | - | View Customer Profile | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-010 | - | POS | Cashier | - | Add Customer | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-011 | - | POS | Cashier | - | Edit Customer | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-012 | - | POS | Cashier | - | Deactivate Customer | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-013 | - | POS | Cashier | - | Apply Manual Discount | - | - | Y | PARTIAL | 60 | - | - | - | - | - |
| POS-UJ-014 | - | POS | Cashier | - | Park Sale | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-015 | - | POS | Cashier | - | Recall Parked Sale | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-016 | - | POS | Cashier | - | Browse Parked Sales List | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-017 | - | POS | Cashier | - | Cash Payment | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-018 | - | POS | Cashier | - | Card Payment | - | - | Y | BLOCKED | 25 | - | - | - | - | - |
| POS-UJ-019 | - | POS | Cashier | - | QR Payment | - | - | Y | BLOCKED | 20 | - | - | - | - | - |
| POS-UJ-020 | - | POS | Cashier | - | Split Payment | - | - | Y | PARTIAL | 25 | - | - | - | - | - |
| POS-UJ-021 | - | POS | Cashier | - | Payment Success / Receipt Preview | - | - | Y | PARTIAL | 55 | - | - | - | - | - |
| POS-UJ-022 | - | POS | Cashier | - | Print Receipt | - | - | Y | PARTIAL | 40 | - | - | - | - | - |
| POS-UJ-023 | - | POS | Cashier | - | Search Original Sale (Return) | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-024 | - | POS | Cashier | - | Validate Return Eligibility | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-025 | - | POS | Cashier | - | Return Items | - | - | Y | COMPLETE | 80 | - | - | - | - | - |
| POS-UJ-026 | - | POS | Cashier | - | Cash Refund | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-027 | - | POS | Cashier | - | Card Refund | - | - | Y | PARTIAL | 60 | - | - | - | - | - |
| POS-UJ-028 | - | POS | Cashier | - | Process Exchange | - | - | Y | PARTIAL | 45 | - | - | - | - | - |
| POS-UJ-029 | - | POS | Cashier | - | View Cash Drawer | - | - | Y | PARTIAL | 35 | - | - | - | - | - |
| POS-UJ-030 | - | POS | Cashier | - | Cash In | - | - | Y | PARTIAL | 35 | - | - | - | - | - |
| POS-UJ-031 | - | POS | Cashier | - | Cash Drop/Out | - | - | Y | PARTIAL | 35 | - | - | - | - | - |
| POS-UJ-032 | - | POS | Cashier | - | Close Till / Reconciliation | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| POS-UJ-033 | - | POS | Cashier | - | Hardware Testing | - | - | Y | NOT_STARTED | 5 | - | - | - | - | - |
| POS-UJ-034 | - | POS | Cashier | - | Offline Cash Sale Capture | - | - | Y | NOT_STARTED | 5 | - | - | - | - | - |
| POS-UJ-035 | - | POS | Cashier | - | Sync Offline Transactions | - | - | Y | NOT_STARTED | 5 | - | - | - | - | - |
| POS-UJ-036 | - | POS | Cashier | Click & Collect | Online Order Fulfilment / Collection | Online order queue | Pickup collected; sales order completed | Y | CANONICALIZED / IMPLEMENTATION PENDING | 10 | [[Cashier/POS-UJ-036_Online_Order_Fulfilment_Collection]] | commerce.online_order.orders.access | Fulfilment/Pickup | Outlet HARD | 15-screen specification complete; application/runtime pending |
| EC-UJ-001 | - | EC | E-commerce Customer | - | Browse Home Catalog | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| EC-UJ-002 | - | EC | E-commerce Customer | - | Browse Category | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| EC-UJ-003 | - | EC | E-commerce Customer | - | Search Products | - | - | Y | PARTIAL | 70 | - | - | - | - | - |
| EC-UJ-004 | - | EC | E-commerce Customer | - | View Product Detail | - | - | Y | PARTIAL | 70 | - | - | - | - | - |
| EC-UJ-005 | - | EC | E-commerce Customer | - | Manage Cart | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| EC-UJ-006 | - | EC | E-commerce Customer | - | Register Account | - | - | Y | PARTIAL | 35 | - | - | - | - | - |
| EC-UJ-007 | - | EC | E-commerce Customer | - | Verify Email | - | - | Y | PARTIAL | 35 | - | - | - | - | - |
| EC-UJ-008 | - | EC | E-commerce Customer | - | Customer Login | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| EC-UJ-009 | - | EC | E-commerce Customer | - | Customer Logout | - | - | Y | COMPLETE | 90 | - | - | - | - | - |
| EC-UJ-010 | - | EC | E-commerce Customer | - | Forgot/Reset Password | - | - | Y | PARTIAL | 35 | - | - | - | - | - |
| EC-UJ-011 | - | EC | E-commerce Customer | - | Enter Checkout Details | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| EC-UJ-012 | - | EC | E-commerce Customer | - | Select Collection Point & Time | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| EC-UJ-013 | - | EC | E-commerce Customer | - | Place C&C Order | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| EC-UJ-014 | - | EC | E-commerce Customer | - | View Order History | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| EC-UJ-015 | - | EC | E-commerce Customer | - | Track Order / View Detail | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| EC-UJ-016 | - | EC | E-commerce Customer | - | Cancel Order | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| EC-UJ-017 | - | EC | E-commerce Customer | - | Edit Profile | - | - | Y | COMPLETE | 85 | - | - | - | - | - |
| EC-UJ-018 | - | EC | E-commerce Customer | - | Manage Addresses | - | - | Y | NOT_STARTED | 20 | - | - | - | - | - |
| SA-UJ-048 | SA-ST-UJ-001 | SA | Platform Admin | Selected-Tenant Mode Shell | Enter Selected-Tenant Context | Click Configure Tenant on Tenant Detail | Setup Hub loads with context banner and module cards | Y | COMPLETE | 100 | [[Platform_Admin/Selected_Tenant_Atomic_Journey_Register#SA-ST-UJ-001]] | platform.tenants.view, platform.tenants.bootstrap.access | None | Tenant exists | Runtime E2E closed 2026-08-13; backend 0245053; Angular 8587e04 |
| SA-UJ-049 | SA-ST-UJ-002 | SA | Platform Admin | Selected-Tenant Mode Shell | Switch Selected Tenant | Tenant picker or Configure Tenant on another tenant | New tenant context active; no stale prior-tenant data | Y | COMPLETE | 100 | [[Platform_Admin/Selected_Tenant_Atomic_Journey_Register#SA-ST-UJ-002]] | platform.tenants.bootstrap.access | None | SA-UJ-048 or equivalent entry | Runtime E2E closed 2026-08-13; backend 0245053; Angular 8587e04 |
| SA-UJ-050 | SA-ST-UJ-003 | SA | Platform Admin | Selected-Tenant Mode Shell | Exit Selected-Tenant Context | Click Exit Tenant Context | Platform Mode restored; tenant-scoped routes blocked | Y | COMPLETE | 100 | [[Platform_Admin/Selected_Tenant_Atomic_Journey_Register#SA-ST-UJ-003]] | platform.tenants.view | None | Active selected-tenant context | Runtime E2E closed 2026-08-13; backend 0245053; Angular 8587e04 |
| SA-UJ-051 | SA-ST-UJ-005 | SA | Platform Admin | Outlet / Collection Point Initial Setup | Create Outlet for Selected Tenant | Setup Hub Outlet Setup Configure | Outlet record created for selected tenant | Y | COMPLETE | 100 | [[Platform_Admin/Selected_Tenant_Atomic_Journey_Register#SA-ST-UJ-005]] | platform.tenants.bootstrap.outlets.manage | Outlet module | Selected-tenant context | Runtime E2E closed 2026-08-13; backend 0245053; Angular 8587e04 |
| SA-UJ-052 | SA-ST-UJ-006 | SA | Platform Admin | Till Initial Setup | Create Till for Selected Tenant Outlet | Setup Hub Till Setup Configure | Till created pending device binding | Y | COMPLETE | 100 | [[Platform_Admin/Selected_Tenant_Atomic_Journey_Register#SA-ST-UJ-006]] | platform.tenants.bootstrap.tills.manage | Till/POS module | Active outlet HARD | Runtime E2E closed 2026-08-13; backend 0245053; Angular 8587e04 |
| SA-UJ-053 | SA-ST-UJ-007 | SA | Platform Admin | Tenant Role / Permission Initial Setup | Create Tenant Role | Setup Hub Roles and Permissions Configure | Role available for user assignment | Y | COMPLETE | 100 | [[Platform_Admin/Selected_Tenant_Atomic_Journey_Register#SA-ST-UJ-007]] | platform.tenants.bootstrap.roles.manage | Permission catalog | Selected-tenant context | Runtime E2E closed 2026-08-13; backend 0245053; Angular 8587e04 |
| SA-UJ-054 | SA-ST-UJ-008 | SA | Platform Admin | Additional Tenant User Initial Setup | Add Additional Tenant User | Setup Hub Additional Users Add User | Additional tenant user created or invite queued | Y | COMPLETE | 100 | [[Platform_Admin/Selected_Tenant_Atomic_Journey_Register#SA-ST-UJ-008]] | platform.tenants.bootstrap.users.manage | User limit | Role exists | Runtime E2E closed 2026-08-13; backend 0245053; Angular 8587e04 |
| SA-UJ-055 | SA-ST-UJ-009 | SA | Platform Admin | Product Initial Onboarding | Manually Onboard Initial Products | Setup Hub Product Onboarding Add Products | Products available for POS/inventory | Y | COMPLETE | 100 | [[Platform_Admin/Selected_Tenant_Atomic_Journey_Register#SA-ST-UJ-009]] | platform.tenants.bootstrap.products.manage | Catalog module | Product entitlement | Runtime E2E closed 2026-08-13; backend 0245053; Angular 8587e04 |
| SA-UJ-056 | SA-ST-UJ-010 | SA | Platform Admin | Product Initial Onboarding | Import Initial Products via CSV | Setup Hub Import CSV | Valid rows imported | Y | COMPLETE | 100 | [[Platform_Admin/Selected_Tenant_Atomic_Journey_Register#SA-ST-UJ-010]] | platform.tenants.bootstrap.products.import | Catalog module | Product entitlement | Runtime E2E closed 2026-08-13; backend 0245053; Angular 8587e04 |
| SA-UJ-057 | SA-ST-UJ-011 | SA | Platform Admin | Product / Channel Initial Onboarding | Configure Initial Online Store | Setup Hub Online Store Configure | Online Store bootstrap settings persisted; hub CONFIGURED | Y | COMPLETE | 100 | [[Platform_Admin/Selected_Tenant_Atomic_Journey_Register#SA-ST-UJ-011]] | platform.tenants.bootstrap.online_store.manage | online_store | Selected-tenant context; entitled | Runtime E2E closed 2026-08-13; backend 0245053; Angular 8587e04 |

## Surface indexes

- Super Admin (57): [[Platform_Admin/CANONICAL_USER_JOURNEY_INDEX]]
- Tenant Admin (62): [[Tenant_Admin/CANONICAL_USER_JOURNEY_INDEX]]
- Cashier POS (36): [[Cashier/CANONICAL_USER_JOURNEY_INDEX]]
- E-commerce (18): [[Ecommerce/CANONICAL_USER_JOURNEY_INDEX]]

## Selected-Tenant contract pack

- [[Platform_Admin/Selected_Tenant_Mode_Contract]]
- [[Platform_Admin/Selected_Tenant_Atomic_Journey_Register]]
- [[Platform_Admin/Selected_Tenant_Journey_Readiness_Matrix]]
- [[Platform_Admin/Selected_Tenant_Online_Store_Bootstrap_Contract]]

## Register history

| Version | Date | Change |
|---|---|---|
| 163 (provisional) | 2026-08-12 | Final validation pass - audit output only |
| 172 (canonical) | 2026-08-12 | +9 Selected-Tenant SA journeys (SA-UJ-048 through SA-UJ-056); ST-UX-001 excluded |
| **173 (canonical)** | 2026-08-12 | +1 SA-UJ-057 Configure Initial Online Store (optional bootstrap); GAP 5 SUPERSEDED; status PARTIAL after backend |
| 173 (status only) | 2026-08-12 | Selected-Tenant Angular production merge (`a2330d4`): SA-UJ-048…057 **PARTIAL** (~85–88%); SA-UJ-049/050 NOT_STARTED→PARTIAL; ST-UX-001 PASS (not counted); runtime E2E ENVIRONMENT_BLOCKED; SA 45C/11P/1NS; Grand 104C/36P/31NS/2B |
| 173 (status only) | 2026-08-13 | Selected-Tenant final runtime E2E: SA-UJ-048…057 **PARTIAL→COMPLETE**; ST-UX-001 PASS (not counted); SA 55C/1P/1NS; Grand **114C/26P/31NS/2B**; BE `0245053` / FE `8587e04` |

