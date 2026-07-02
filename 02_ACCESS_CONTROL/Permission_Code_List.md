<!-- title: Permission Code List -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->


# Permission Code List

## Purpose

This file defines permission code groups for TM-EPOS MVP.

Permission codes are action-level controls.
They must be stored/seeded through backend permission catalog and used by APIs
and UI guards.

## Naming Rule

Use stable dot-separated permission codes.

```text
module.resource.action
```

Do not hardcode roles in code.
Use permission codes and feature entitlements.

## Platform Permissions

Platform Admin uses **Option A** permission strategy (TM-EPOS MVP):

- Plural domain codes for tenant lifecycle, users, settings, billing, audit, dashboard.
- **Granular action codes** for subscription plans, platform roles, and permission catalog (already implemented in backend and Angular).
- Do **not** collapse implemented granular codes into umbrella codes such as `platform.subscriptions.manage`.
- Do **not** use legacy singular codes such as `platform.tenant.create`.

### Platform dashboard and tenants

| Code | Meaning |
|---|---|
| platform.dashboard.view | View platform dashboard |
| platform.tenants.view | View tenant list, summary, filters |
| platform.tenants.create | Create tenant |
| platform.tenants.update | Update tenant profile/setup |
| platform.tenants.activate | Activate tenant |
| platform.tenants.suspend | Suspend tenant |
| platform.tenants.entitlements.update | Assign or update tenant feature entitlements |

### Platform subscription plans (granular — implemented)

| Code | Meaning |
|---|---|
| platform.subscription_plans.view | View subscription plans |
| platform.subscription_plans.create | Create draft plan |
| platform.subscription_plans.edit | Edit/publish draft plan |
| platform.subscription_plans.duplicate | Duplicate plan |
| platform.subscription_plans.archive | Archive/retire plan |
| platform.subscription_plans.delete | Delete draft plan |

### Platform catalog (granular — implemented)

| Code | Meaning |
|---|---|
| platform.permissions.view | View permission catalog tree |
| platform.modules.view | View modules catalog |
| platform.features.view | View features catalog |

### Platform roles (granular — implemented)

| Code | Meaning |
|---|---|
| platform.roles.view | View platform roles |
| platform.roles.create | Create platform roles |
| platform.roles.update | Update platform role metadata |
| platform.roles.permissions.view | View role permission assignments |
| platform.roles.permissions.update | Replace role permission assignments |

### Platform users, settings, billing, audit, integrations

| Code | Meaning |
|---|---|
| platform.users.view | View platform users |
| platform.users.create | Create platform users |
| platform.users.update | Update platform users |
| platform.users.roles.assign | Assign platform roles to users |
| platform.settings.view | View platform settings |
| platform.settings.update | Update platform settings |
| platform.billing.view | View tenant billing |
| platform.billing.manage | Manage billing and payment links |
| platform.audit.view | View platform audit logs |
| platform.integrations.manage | Manage platform integrations |

### Deprecated platform codes (do not seed or use)

| Code | Replacement |
|---|---|
| platform.tenant.create | platform.tenants.create |
| platform.tenant.update | platform.tenants.update |
| platform.tenant.activate | platform.tenants.activate |
| platform.subscription.manage | platform.subscription_plans.* |
| platform.feature.entitle | platform.features.view / platform.tenants.entitlements.update |

### Super Administrator seed expectation

Development role `super_administrator` should receive all **31** active platform permission codes above when platform admin permission foundation is fully seeded.

## Tenant Admin Permissions

| Code | Meaning |
|---|---|
| tenant.dashboard.view | View tenant dashboard |
| tenant.settings.manage | Manage tenant settings |
| tenant.outlets.manage | Manage outlets |
| tenant.tills.manage | Manage tills |
| tenant.devices.manage | Manage POS devices |
| tenant.hardware.manage | Manage hardware profiles/devices |
| tenant.users.manage | Manage tenant users |
| tenant.roles.manage | Manage roles and permissions |

## Product And Inventory Permissions

| Code | Meaning |
|---|---|
| catalog.products.view | View products |
| catalog.products.create | Create products |
| catalog.products.update | Update products |
| catalog.products.delete | Delete/deactivate products |
| catalog.variants.manage | Manage product variants |
| catalog.barcodes.manage | Manage product barcodes |
| inventory.stock.view | View stock |
| inventory.stock.adjust | Adjust stock |
| inventory.movements.view | View movement history |
| inventory.alerts.view | View low/expiry stock alerts |

## POS Permissions

| Code | Meaning |
|---|---|
| pos.sale.create | Start and complete POS sale |
| pos.sale.hold | Park/hold sale |
| pos.sale.recall | Recall held sale |
| pos.discount.apply | Apply permitted discount |
| pos.customer.attach | Attach customer |
| pos.receipt.print | Print receipt |
| pos.receipt.reprint | Reprint receipt |
| pos.cash_movement.create | Cash in/out |
| pos.till.open | Open till session |
| pos.till.close | Close till session |

## Online Store And Checkout Permissions

| Code | Meaning |
|---|---|
| online_store.settings.manage | Manage storefront setup |
| online_store.catalog.publish | Publish products to online store |
| cart_checkout.sessions.manage | Manage checkout support actions |
| orders.view | View sales orders |
| orders.manage | Manage order status |
| orders.cancel | Cancel eligible order |

## Click Collect And Fulfilment Permissions

| Code | Meaning |
|---|---|
| fulfillment.orders.view | View fulfilment orders |
| fulfillment.orders.manage | Manage fulfilment workflow |
| pickup.orders.view | View pickup orders |
| pickup.orders.manage | Manage pickup workflow |
| pickup.slots.manage | Manage pickup slots/capacity |

## Payment, Refund, Return, Exchange Permissions

| Code | Meaning |
|---|---|
| payments.view | View payments |
| payments.process | Process permitted payments |
| refunds.view | View refunds |
| refunds.process | Process refund |
| returns.view | View returns |
| returns.create | Create return |
| exchanges.create | Create exchange |
| return_inspections.manage | Manage return inspection |

## Offline And Sync Permissions

| Code | Meaning |
|---|---|
| offline.clients.manage | Manage offline clients/devices |
| offline.sync.view | View sync state and queue |
| offline.sync.upload | Upload offline sync batch |
| offline.sync.resolve | Resolve sync conflicts |
| offline.cash_sale.create | Capture allowed offline cash sale |
| offline.number_blocks.manage | Manage offline number blocks |

## Reporting And Integration Permissions

| Code | Meaning |
|---|---|
| reports.sales.view | View sales reports |
| reports.orders.view | View order reports |
| notifications.manage | Manage notification setup/templates |
| integrations.manage | Manage integration configuration |

## Related Files

- [[Feature_Entitlement_Matrix]]
- [[API_Authorization_Rules]]
