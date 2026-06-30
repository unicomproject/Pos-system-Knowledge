<!-- title: Platform Admin User Flow Analysis -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Platform Admin User Flow Analysis

## Source

Analyzed `SYSTEM_USER_JOURNEY.pptx`, slides 1 to 9.

## Deck Finding

The deck labels the actor as `Super Admin`, but the Second Brain should use `Platform Admin` for TM-EPOS MVP. The updated Markdown files use `Platform Admin` consistently.

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

## Scope Alignment

- Online store/e-commerce status from the deck is treated as active TM-EPOS MVP online store scope.
- Collection point setup is aligned to Click & Collect.
- Platform user management is kept separate from tenant user management.
- Tenant user login/invitation is kept separate from customer login.
- Billing, subscription, activation, feature entitlement, and audit flows are platform-admin owned.

## Update Recommendation

Replace or add these files under:

```text
03_USER_JOURNEYS/Platform_Admin/
```

The older Platform Admin journey files can be retained only if they do not conflict with these updated TM-EPOS MVP flows.
