# Current changes and Start Fulfilment diagnosis — 2026-09-10

Scope: verified workspace provisioning work, existing Review & Pack documentation updates, and the read-only investigation of `ECOMM-SEED-PENDING-001`. This is not a claim that every workspace change or every historical task has been validated.

## Implemented: workspace permission provisioning

See [Workspace Permission Provisioning](../../../02_ACCESS_CONTROL/Workspace_Permission_Provisioning.md) for implementation files, migration, actual effective-permission checks, and test evidence.

- Migration `20260910120000_ProvisionWorkspacePermissions` was applied to the configured local Development database.
- Cashier effective permissions include `workspace.pos.access` and `pos.till.open`, without Tenant Admin workspace access; the checked Tenant Admin account has Admin workspace access without POS workspace access.
- Existing frontend routing is unchanged. POS-only selects POS, Admin-only selects Admin, both without a selection show the chooser, and neither shows no-access.
- Existing sessions require refresh/re-login. Live authenticated device acceptance was not verified. No password changes were made as part of this work.

## Already documented: Review & Pack structure

Existing local documentation changes list the screen composition, extracted Review & Pack widgets, and `review_pack_error_mapper.dart` in:

- [OO05 status](Online_Order_OO05_Canonicalization_Status_2026-09-08.md)
- [Online Order component inventory](../../../07_UI_UX_KNOWLEDGE/Cashier/Online_Order_Component_Inventory.md)
- [Prototype component map](../../../07_UI_UX_KNOWLEDGE/Cashier/Prototypes/06.oo05_review_pack_production_prototype_v1/README_COMPONENT_MAP.md)

These structure updates do not establish new runtime or test acceptance. Existing edits were preserved, not reimplemented during this documentation update.

## Open issue: Start Fulfilment blocked for ECOMM-SEED-PENDING-001

Status: **diagnosed 2026-09-10; resolved 2026-09-12**.

Historical evidence (retained): the Development DB join below returned a sales order with **NULL** fulfilment id/status/version, so Flutter blocked Start before POST:

```sql
SELECT s.order_number, s.order_status,
       f.id AS fulfillment_id, f.fulfillment_status, f.row_version
FROM sales_orders s
LEFT JOIN fulfillment_orders f
  ON f.sales_order_id = s.id AND f.tenant_id = s.tenant_id
WHERE s.order_number = 'ECOMM-SEED-PENDING-001';
```

### Resolution (2026-09-12)

- Seed repair: `DevelopmentClickCollectStartableNewOrderSeedData` + migration `20260912120000_RepairDevelopmentClickCollectStartableNewOrder` restores PENDING-001 FO/pickup/inventory graph and a future collection window.
- Backend Start now also projects sales `PREPARING` via `SalesOrder.ApplyPosStartPreparing`; list/detail share `NEW`/`PREPARING` DisplayStatus (Preparing outranks Delayed).
- Verified live: Start → FO `PICKING`, sales `PREPARING`, list/detail `PREPARING`, removed from NEW.
- Closure tracker: [Online_Order_New_To_Picking_Gate_Closure_2026-09-12](Online_Order_New_To_Picking_Gate_Closure_2026-09-12.md).

### Verified failure chain (historical)

1. Backend `src/E_POS.Infrastructure/Modules/ECommerce/CustomerOrders/Repositories/PosOnlineOrderDetailRepository.cs` assigns `FulfillmentVersion = fulfillment?.RowVersion` (line 320 at inspection).
2. Frontend `lib/features/fulfilment_pickup/presentation/providers/pos_online_orders_provider.dart`, `startFulfillment`, reads the selected order's version.
3. When the version is NULL or less than 1, it sets `The latest fulfilment version is unavailable. Refresh and try again.` and returns before calling Start Fulfilment (lines 235–243 at inspection).

The missing record explains the displayed version guard. This specific guard is not a workspace-permission rejection. Refresh alone cannot create the missing database record. The overdue collection time is visible but was not established as the cause of this message.

### Remaining investigation / required repair

- Trace why the seed/provisioning path did not create this order's fulfilment record; that originating defect has **not** been verified in this investigation.
- Repair through the existing fulfilment lifecycle, checking its required related records and invariants; do not insert an isolated row or manufacture a frontend version to bypass concurrency checks.
- After an authorized repair, verify the detail response has an authoritative version and exercise Start Fulfilment through the real API/device.

No application code, order data, or permissions were changed during this diagnosis or documentation update. No successful Start Fulfilment or end-to-end acceptance is claimed. Documentation changes remain local until separately committed/pushed.
