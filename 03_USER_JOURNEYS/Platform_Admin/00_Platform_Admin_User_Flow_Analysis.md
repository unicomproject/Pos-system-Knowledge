<!-- title: Platform Admin User Flow Analysis -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->

# Platform Admin User Flow Analysis

## Source

Analyzed `SYSTEM_USER_JOURNEY.pptx`, slides 1 to 9.

## Deck Finding

The deck labels the actor as `Super Admin`, but the Second Brain should use `Platform Admin` for OneVerz POS MVP. The updated Markdown files use `Platform Admin` consistently.

## Platform Admin Flows Created

1. Platform Admin Login Flow.
2. Platform Dashboard Flow.
3. Tenant Management Flow.
4. Create Tenant Wizard Flow.
5. Outlet And Collection Point Setup Flow.
6. Till Setup And Till Count Flow.
7. Tenant Role And Permission Setup Flow.
8. Tenant User Management Flow.
9. Product Onboarding Flow.
10. Billing Flow.
11. Tenant Activation Flow.
12. Subscription And Billing Management Flow.
13. Platform User Management Flow.
14. Audit Logs Flow.
15. System Settings Flow.
16. Return Policy Template Management Flow — [[SA-P1-04_Return_Policy_Template_UI_Implementation]].
17. Platform User Password Reset Flow — [[17_Platform_User_Password_Reset_Flow]] · [[SA-P1-06_Platform_Admin_User_Password_Reset_Implementation]].
18. Tenant Onboarding Email Flows — [[18_Tenant_Onboarding_Email_Flows]] · [[../../12_INTEGRATIONS/Email_Event_And_Template_Catalog]].
19. Authentication Email Flows — [[19_Authentication_Email_Flows]].

## Selected-Tenant Mode (Added 2026-08-12)

Canonical contract: [[Selected_Tenant_Mode_Contract]]

Global register: [[../00_Global_User_Journey_Register]] — **173 journeys** (Super Admin = 57).

| # | Flow / artifact | Mode | Discovery IDs | Canonical IDs |
|---|---|---|---|---|
| ST-0 | Selected-Tenant Mode Shell | Selected-Tenant | SA-ST-UJ-001, 002, 003 | SA-UJ-048, 049, 050 |
| ST-1 | Outlet / Collection Point Initial Setup | Selected-Tenant | SA-ST-UJ-005 | SA-UJ-051 |
| ST-2 | Till Initial Setup | Selected-Tenant | SA-ST-UJ-006 | SA-UJ-052 |
| ST-3 | Tenant Role / Permission Initial Setup | Selected-Tenant | SA-ST-UJ-007 | SA-UJ-053 |
| ST-4 | Additional Tenant User Initial Setup | Selected-Tenant | SA-ST-UJ-008 | SA-UJ-054 |
| ST-5 | Product Initial Onboarding | Selected-Tenant | SA-ST-UJ-009, 010 | SA-UJ-055, 056 |
| ST-6 | Configure Initial Online Store | Selected-Tenant | SA-ST-UJ-011 | SA-UJ-057 |

> L52 historical: E-commerce bootstrap **OUT OF SCOPE** Phase 1 — **SUPERSEDED 2026-08-12** by [[Selected_Tenant_Online_Store_Bootstrap_Contract]] (optional SA bootstrap; Click & Collect remains Tenant Admin).

Entry path: Tenant Detail → Configure Tenant → Setup Hub (`/admin/tenants/:tenantId/configure`).

UX requirement **ST-UX-001**: persistent selected-tenant context banner on all Selected-Tenant screens.

Prototype pack: [[../../07_UI_UX_KNOWLEDGE/Platform_Admin/prototypes/selected-tenant/]]

## Scope Alignment

- Online store/e-commerce status from the deck is treated as active OneVerz POS MVP online store scope.
- Collection point setup is aligned to Click & Collect.
- Platform user management is kept separate from tenant user management.
- Tenant user login/invitation is kept separate from customer login.
- Billing, subscription, activation, feature entitlement, and audit flows are platform-admin owned.

## Update Recommendation

Replace or add these files under:

```text
03_USER_JOURNEYS/Platform_Admin/
```

The older Platform Admin journey files can be retained only if they do not conflict with these updated OneVerz POS MVP flows.
