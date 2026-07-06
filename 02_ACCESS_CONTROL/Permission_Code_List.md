<!-- title: Permission Code List -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-03 -->


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

| Code | Meaning |
|---|---|
| platform.tenants.view | View tenants |
| platform.tenants.create | Create tenant |
| platform.tenants.update | Update tenant |
| platform.subscriptions.manage | Manage plans and subscriptions |
| platform.features.manage | Manage modules/features/entitlements |
| platform.users.manage | Manage platform users |
| platform.audit.view | View platform audit |
| platform.return_policy_templates.view | View platform return policy templates |
| platform.return_policy_templates.create | Create platform return policy templates |
| platform.return_policy_templates.update | Update platform return policy templates |
| platform.return_policy_templates.delete | Delete platform return policy templates |
| platform.return_policy_templates.manage | Manage all platform return policy template actions |

## Tenant Admin Permissions

| Code | Meaning |
|---|---|
| tenant.dashboard.view | View tenant dashboard |
| tenant.settings.manage | Manage tenant settings |
| tenant.outlets.view | View outlets |
| tenant.outlets.manage | Manage outlets |
| tenant.tills.view | View tills |
| tenant.tills.create | Create tills |
| tenant.tills.update | Update tills |
| tenant.tills.delete | Delete tills |
| tenant.tills.manage | Manage all till actions |
| tenant.devices.manage | Manage POS devices |
| tenant.hardware.manage | Manage hardware profiles/devices |
| tenant.users.manage | Manage tenant users |
| tenant.roles.manage | Manage roles and permissions |

## Product And Inventory Permissions

| Code | Meaning |
|---|---|
| catalog.departments.view | View departments |
| catalog.departments.create | Create departments |
| catalog.departments.update | Update departments |
| catalog.departments.delete | Delete/deactivate departments |
| catalog.departments.manage | Manage all department actions |
| catalog.categories.view | View categories |
| catalog.categories.create | Create categories |
| catalog.categories.update | Update categories |
| catalog.categories.delete | Delete/deactivate categories |
| catalog.categories.manage | Manage all category actions |
| catalog.brands.view | View brands |
| catalog.brands.create | Create brands |
| catalog.brands.update | Update brands |
| catalog.brands.delete | Delete/deactivate brands |
| catalog.brands.manage | Manage all brand actions |
| catalog.collections.view | View collections |
| catalog.collections.create | Create collections |
| catalog.collections.update | Update collections |
| catalog.collections.delete | Delete/deactivate collections |
| catalog.collections.manage | Manage all collection actions |
| catalog.return_policies.view | View tenant return policies |
| catalog.return_policies.create | Create tenant return policies |
| catalog.return_policies.update | Update tenant return policies |
| catalog.return_policies.delete | Delete/deactivate tenant return policies |
| catalog.return_policies.manage | Manage all tenant return policy actions |
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
