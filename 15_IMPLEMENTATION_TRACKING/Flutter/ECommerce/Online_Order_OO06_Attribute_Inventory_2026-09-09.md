<!-- title: OO-06 Attribute Inventory -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# OO-06 Attribute Inventory

Parent: [[Online_Order_OO06_Canonicalization_Status_2026-09-09]]. Source inspection, not a live database audit. EF configurations and Domain entities under ECommerce/FulfilmentPickup are authority; Shared/Notification configurations supply notification rows. CLR scalar PostgreSQL mappings are shown when SQL type is implicit. Nullable means storage/projection, not permission to violate entry invariants.

## Table-wise attributes (97)

| Table / projection | Property / column | Type | Nullable | Constraint / rule | Authority | Storage |
|---|---|---|---|---|---|---|
| fulfillment_orders | Id / id | Guid; uuid | No | PK | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | CreatedAt / created_at | DateTimeOffset; timestamp with time zone | No | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | UpdatedAt / updated_at | DateTimeOffset?; timestamp with time zone | No | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | TenantId / tenant_id | Guid; uuid | No | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | DocumentNumberSequenceId / document_number_sequence_id | Guid?; uuid | Yes | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | SalesOrderId / sales_order_id | Guid; uuid | No | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | FulfillmentNumber / fulfillment_number | string; varchar(80) | No | max 80 | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | FulfillmentMethodOutletId / fulfillment_method_outlet_id | Guid; uuid | No | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | SourceInventoryLocationId / source_inventory_location_id | Guid?; uuid | Yes | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | FulfillmentStatus / fulfillment_status | string; text | No | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | RequestedFulfillmentDate / requested_fulfillment_date | DateOnly?; date | Yes | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | ScheduledAt / scheduled_at | DateTimeOffset?; timestamp with time zone | Yes | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | PickedAt / picked_at | DateTimeOffset?; timestamp with time zone | Yes | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | PackedAt / packed_at | DateTimeOffset?; timestamp with time zone | Yes | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | ReadyAt / ready_at | DateTimeOffset?; timestamp with time zone | Yes | Required at OO06 entry | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | FulfilledAt / fulfilled_at | DateTimeOffset?; timestamp with time zone | Yes | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | CancelledAt / cancelled_at | DateTimeOffset?; timestamp with time zone | Yes | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | CancellationReason / cancellation_reason | string?; text | Yes | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | AssignedToTenantUserId / assigned_to_tenant_user_id | Guid?; uuid | Yes | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | FulfillmentNote / fulfillment_note | string?; text | Yes | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | RowVersion / row_version | long; bigint | No | Concurrency token; default 1; >=1 | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | CreatedByTenantUserId / created_by_tenant_user_id | Guid?; uuid | Yes | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_orders | UpdatedByTenantUserId / updated_by_tenant_user_id | Guid?; uuid | Yes | EF requiredness / owner validation | Backend FulfillmentOrder | Persisted |
| fulfillment_order_events | Id / id | Guid; uuid | No | PK | Backend FulfillmentOrderEvent | Persisted |
| fulfillment_order_events | CreatedAt / created_at | DateTimeOffset; timestamp with time zone | No | EF requiredness / owner validation | Backend FulfillmentOrderEvent | Persisted |
| fulfillment_order_events | TenantId / tenant_id | Guid; uuid | No | EF requiredness / owner validation | Backend FulfillmentOrderEvent | Persisted |
| fulfillment_order_events | FulfillmentOrderId / fulfillment_order_id | Guid; uuid | No | EF requiredness / owner validation | Backend FulfillmentOrderEvent | Persisted |
| fulfillment_order_events | SequenceNumber / sequence_number | int; integer | No | >0 | Backend FulfillmentOrderEvent | Persisted |
| fulfillment_order_events | EventType / event_type | string; text | No | EF requiredness / owner validation | Backend FulfillmentOrderEvent | Persisted |
| fulfillment_order_events | OldStatus / old_status | string?; text | Yes | EF requiredness / owner validation | Backend FulfillmentOrderEvent | Persisted |
| fulfillment_order_events | NewStatus / new_status | string?; text | Yes | EF requiredness / owner validation | Backend FulfillmentOrderEvent | Persisted |
| fulfillment_order_events | EventNote / event_note | string?; text | Yes | EF requiredness / owner validation | Backend FulfillmentOrderEvent | Persisted |
| fulfillment_order_events | EventPayloadJson / event_payload_json | string?; jsonb | Yes | EF requiredness / owner validation | Backend FulfillmentOrderEvent | Persisted |
| fulfillment_order_events | EventAt / event_at | DateTimeOffset; timestamp with time zone | No | EF requiredness / owner validation | Backend FulfillmentOrderEvent | Persisted |
| fulfillment_order_events | EventByTenantUserId / event_by_tenant_user_id | Guid?; uuid | Yes | EF requiredness / owner validation | Backend FulfillmentOrderEvent | Persisted |
| fulfillment_order_lines | Id / id | Guid; uuid | No | PK | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | CreatedAt / created_at | DateTimeOffset; timestamp with time zone | No | EF requiredness / owner validation | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | UpdatedAt / updated_at | DateTimeOffset?; timestamp with time zone | No | EF requiredness / owner validation | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | TenantId / tenant_id | Guid; uuid | No | EF requiredness / owner validation | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | FulfillmentOrderId / fulfillment_order_id | Guid; uuid | No | EF requiredness / owner validation | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | SalesOrderLineId / sales_order_line_id | Guid; uuid | No | EF requiredness / owner validation | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | SalesOrderLineComponentId / sales_order_line_component_id | Guid?; uuid | Yes | EF requiredness / owner validation | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | RequestedQuantity / requested_quantity | decimal; numeric(18,4) | No | >=0 | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | PickedQuantity / picked_quantity | decimal; numeric(18,4) | No | >=0 | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | PackedQuantity / packed_quantity | decimal; numeric(18,4) | No | >=0 | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | FulfilledQuantity / fulfilled_quantity | decimal; numeric(18,4) | No | >=0 | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | CancelledQuantity / cancelled_quantity | decimal; numeric(18,4) | No | >=0 | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | LineStatus / line_status | string; text | No | EF requiredness / owner validation | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | PickedByTenantUserId / picked_by_tenant_user_id | Guid?; uuid | Yes | EF requiredness / owner validation | Backend FulfillmentOrderLine | Persisted |
| fulfillment_order_lines | PackedByTenantUserId / packed_by_tenant_user_id | Guid?; uuid | Yes | EF requiredness / owner validation | Backend FulfillmentOrderLine | Persisted |
| pickup_orders | Id / id | Guid; uuid | No | PK | Backend PickupOrder | Persisted |
| pickup_orders | CreatedAt / created_at | DateTimeOffset; timestamp with time zone | No | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | UpdatedAt / updated_at | DateTimeOffset?; timestamp with time zone | Yes | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | TenantId / tenant_id | Guid; uuid | No | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | DocumentNumberSequenceId / document_number_sequence_id | Guid?; uuid | Yes | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | FulfillmentOrderId / fulfillment_order_id | Guid; uuid | No | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | PickupSlotReservationId / pickup_slot_reservation_id | Guid?; uuid | Yes | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | PickupNumber / pickup_number | string; varchar(80) | No | max 80 | Backend PickupOrder | Persisted |
| pickup_orders | PickupContactName / pickup_contact_name | string; varchar(150) | No | max 150 | Backend PickupOrder | Persisted |
| pickup_orders | PickupContactPhone / pickup_contact_phone | string?; varchar(50) | Yes | max 50 | Backend PickupOrder | Persisted |
| pickup_orders | PickupContactEmail / pickup_contact_email | string?; varchar(150) | Yes | max 150 | Backend PickupOrder | Persisted |
| pickup_orders | PickupContactChannel / pickup_contact_channel | string?; text | Yes | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | PickupStatus / pickup_status | string; text | No | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | PickupNote / pickup_note | string?; text | Yes | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | PickupQrTokenHash / pickup_qr_token_hash | string?; varchar(255) | Yes | max 255 | Backend PickupOrder | Persisted |
| pickup_orders | PickupQrVersion / pickup_qr_version | int?; integer | Yes | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | PickupQrExpiresAt / pickup_qr_expires_at | DateTimeOffset?; timestamp with time zone | Yes | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | VerificationMethod / verification_method | string?; text | Yes | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | VerifiedByTenantUserId / verified_by_tenant_user_id | Guid?; uuid | Yes | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | VerifiedAt / verified_at | DateTimeOffset?; timestamp with time zone | Yes | EF requiredness / owner validation | Backend PickupOrder | Persisted |
| pickup_orders | CollectedAt / collected_at | DateTimeOffset?; timestamp with time zone | Yes | NULL at OO06 entry | Backend PickupOrder | Persisted |
| pickup_order_events | Id / id | Guid; uuid | No | PK | Backend PickupOrderEvent | Persisted |
| pickup_order_events | CreatedAt / created_at | DateTimeOffset; timestamp with time zone | No | EF requiredness / owner validation | Backend PickupOrderEvent | Persisted |
| pickup_order_events | TenantId / tenant_id | Guid; uuid | No | EF requiredness / owner validation | Backend PickupOrderEvent | Persisted |
| pickup_order_events | PickupOrderId / pickup_order_id | Guid; uuid | No | EF requiredness / owner validation | Backend PickupOrderEvent | Persisted |
| pickup_order_events | SequenceNumber / sequence_number | int; integer | No | >0 | Backend PickupOrderEvent | Persisted |
| pickup_order_events | EventType / event_type | string; text | No | EF requiredness / owner validation | Backend PickupOrderEvent | Persisted |
| pickup_order_events | OldStatus / old_status | string?; text | Yes | EF requiredness / owner validation | Backend PickupOrderEvent | Persisted |
| pickup_order_events | NewStatus / new_status | string?; text | Yes | EF requiredness / owner validation | Backend PickupOrderEvent | Persisted |
| pickup_order_events | EventNote / event_note | string?; text | Yes | EF requiredness / owner validation | Backend PickupOrderEvent | Persisted |
| pickup_order_events | EventPayloadJson / event_payload_json | string?; jsonb | Yes | EF requiredness / owner validation | Backend PickupOrderEvent | Persisted |
| pickup_order_events | EventAt / event_at | DateTimeOffset; timestamp with time zone | No | EF requiredness / owner validation | Backend PickupOrderEvent | Persisted |
| pickup_order_events | EventByTenantUserId / event_by_tenant_user_id | Guid?; uuid | Yes | EF requiredness / owner validation | Backend PickupOrderEvent | Persisted |
| sales_orders | Id / id | Guid; uuid | No | PK | SalesOrder | Persisted |
| sales_orders | OrderNumber / order_number | string | No | Existing order numbering | SalesOrder | Persisted |
| projection | OrderId, FulfillmentOrderId | Guid | No | Existing IDs; not new columns | Picking repository | Projected |
| projection | OutletId / OutletName | Guid / string | No / display fallback | Activated outlet scope via fulfillment method outlet | Picking repository | Joined |
| projection | CollectionAt / ServerTime | DateTimeOffset? / DateTimeOffset | Yes / No | CollectionAt = SalesOrder.RequestedCollectionAt (requested_collection_at); ServerTime = backend clock | Picking repository | Projected |
| notification_events | EventNumber / event_number | varchar(80) | No | Unique tenant + event number | NotificationService | Persisted |
| notification_events | EventCode / event_code | varchar(120) | No | ecommerce.order_ready_for_collection | Notification factory | Persisted |
| notification_events | TenantId / tenant_id | Guid; uuid | No | Tenant FK | Server context | Persisted |
| notification_events | SourceReferenceId / source_reference_id | Guid?; uuid | Yes | Authoritative order reference | Notification factory | Persisted |
| notification_messages | CustomerId / customer_id | Guid?; uuid | Yes | Required logically for CUSTOMER IN_APP recipient; customer FK | Server order recipient | Persisted |
| notification_messages | MessageStatus / message_status | string; text | No | IN_APP DELIVERED is not external delivery proof | Channel handler | Persisted |
| notification_messages | DeliveredAt / delivered_at | DateTimeOffset?; timestamptz | Yes | Backend timestamp | Channel handler | Persisted |
| notification_inbox_items | NotificationMessageId / notification_message_id | Guid; uuid | No | Unique message FK | IN_APP handler | Persisted |
| notification_inbox_items | InboxStatus / inbox_status | string; text | No | UNREAD initially | IN_APP handler | Persisted |

## Important boundaries

PickupOrder has no ReadyAt or RowVersion property in inspected source. ReadyAt belongs to FulfillmentOrder; its bigint RowVersion is the existing concurrency token. FulfillmentId is the projection's FulfillmentOrderId, not a proposed column. CollectionAt must reuse the repository's existing scheduling projection; PickupWindow is not a new OO06 field. No new table, column or migration is justified for this contract.

RemainingMinutes, IsOverdue, ProgressPercentage, AllItemsPicked display, ReadyHeroState, StepNumber and NotificationButtonLabel are derived, not persisted. Time uses collection deadline minus backend serverTime with monotonic elapsed time between refreshes. Null deadline displays unavailable, not invented time. Effective units subtract cancellation; item/line count is distinct from quantity.

Existing tables also include notification_channels, notification_event_types, notification_preferences, notification_templates, notification_template_versions, notification_delivery_attempts and notification_read_receipts. Their existence does not prove OO06 uses preferences, template versions, external delivery attempts or an outbox. integration_outbox_messages exists for other workflows; OO06 dispatch wiring is a GAP.
