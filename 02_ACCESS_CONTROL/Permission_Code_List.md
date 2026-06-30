<!-- title: Permission Code List -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


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
