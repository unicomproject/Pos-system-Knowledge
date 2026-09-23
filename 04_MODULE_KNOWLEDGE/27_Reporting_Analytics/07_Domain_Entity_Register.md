# 07 Domain Entity Register

| Entity | Source File | Namespace | PK | Tenant Ownership | Attributes | Relationships | Reports |
|---|---|---|---|---|---|---|---|
| SalesOrder | src/E_POS.Domain/Modules/Tenant/Orders/Entities/SalesOrder.cs | E_POS.Domain.Modules.Tenant.Orders.Entities | Id | TenantId | Status, OrderNumber, PaidAmount, TotalAmount, BusinessDate | SalesChannelId, TillId, TillSessionId | RPT-01 |
| SalesOrderLine | src/E_POS.Domain/Modules/Tenant/Orders/Entities/SalesOrderLine.cs | E_POS.Domain.Modules.Tenant.Orders.Entities | Id (Assumed via AuditableEntity) | TenantId | Quantity, ReturnedQuantity, LineSubtotalAmount | SalesOrderId, ProductId | RPT-06 |
| SalesPayment | NOT VERIFIED — SOURCE NOT YET INSPECTED | NOT VERIFIED — SOURCE NOT YET INSPECTED | Id | TenantId | RequestedAmount, TenderedAmount, PaidAmount | SalesOrderId, PaymentMethodId | RPT-02 |
| SalesPayment | src/E_POS.Domain/Modules/Tenant/Payment/Entities/SalesPayment.cs | E_POS.Domain.Modules.Tenant.Payment.Entities | Id | TenantId | PaymentStatus, PaidAmount, RefundedAmount, IdempotencyKey | SalesOrderId, PaymentMethodId, TillId | RPT-02 |
| SalesReturn | src/E_POS.Domain/Modules/Shared/ReturnExchange/Entities/SalesReturn.cs | E_POS.Domain.Modules.Shared.ReturnExchange.Entities | Id | TenantId | ReturnStatus, TotalRefundAmount, IdempotencyKey | SalesOrderId, OutletId | RPT-02, RPT-06 |
| TillSession | src/E_POS.Domain/Modules/Tenant/HardwareCash/Entities/TillSession.cs | E_POS.Domain.Modules.Tenant.HardwareCash.Entities | Id | TenantId | SessionNumber, OpeningFloatAmount, Status, OpenedAt, ClosedAt | OutletId, TillId, OpenedByTenantUserId | RPT-03 |
| CashReconciliation | src/E_POS.Domain/Modules/Tenant/HardwareCash/Entities/CashReconciliation.cs | E_POS.Domain.Modules.Tenant.HardwareCash.Entities | Id | TenantId | ExpectedCashAmount, CountedCashAmount, DifferenceAmount, DifferenceReason, CalculationDetailsJson | TillSessionId | RPT-03 |

| E-08 | FulfillmentOrder | src/E_POS.Domain/Modules/ECommerce/FulfilmentPickup/Entities/FulfillmentOrder.cs | IMPLEMENTED | Tracks picking and packing status of an online order |
| E-09 | PickupOrder | src/E_POS.Domain/Modules/ECommerce/FulfilmentPickup/Entities/PickupOrder.cs | IMPLEMENTED | Tracks collection QR, pickup status, and TTL for click & collect |
