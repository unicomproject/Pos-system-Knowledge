<!-- title: Status And Type Check Rules -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# Status And Type Check Rules

## Purpose

This file records status, type, method, source, category, priority, operation,
and other domain-value database rules.

## Core Rule

Use varchar/text columns with `CHECK(...)`.

Do not use database enum datatypes.

## CHECK Rules From Uploaded Design

| Module | Table | CHECK Rule |
|---:|---|---|
| 01 | `platform_users` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'LOCKED', 'DELETED'))` |
| 01 | `platform_roles` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 01 | `platform_permissions` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 01 | `platform_auth_sessions` | `CHECK(status IN ('ACTIVE', 'EXPIRED', 'REVOKED'))` |
| 01 | `platform_refresh_tokens` | `CHECK(status IN ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED'))` |
| 01 | `platform_password_reset_tokens` | `CHECK(status IN ('PENDING', 'USED', 'EXPIRED', 'REVOKED'))` |
| 01 | `platform_login_audits` | `CHECK(login_result IN ('SUCCESS', 'FAILED', 'LOCKED'))` |
| 02 | `currencies` | `CHECK(decimal_places >= 0)` |
| 02 | `business_types` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 02 | `tenant_addresses` | `CHECK(address_type IN ('BILLING', 'REGISTERED', 'CONTACT'))` |
| 02 | `tenant_domains` | `CHECK(domain_status IN ('PENDING', 'VERIFIED', 'FAILED', 'DISABLED'))` |
| 02 | `sales_channels` | `CHECK(channel_type IN ('E_POS', 'E_COMMERCE'))` |
| 02 | `sales_channels` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 02 | `setting_definitions` | `CHECK(value_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE'))` |
| 03_04 | `platform_modules` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 03_04 | `platform_features` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 03_04 | `feature_limit_definitions` | `CHECK(default_limit_value IS NULL OR default_limit_value >= 0)` |
| 03_04 | `subscription_plans` | `CHECK(billing_interval IN ('MONTHLY', 'YEARLY', 'ONE_TIME'))` |
| 03_04 | `subscription_plans` | `CHECK(price_amount >= 0)` |
| 03_04 | `subscription_addons` | `CHECK(price_amount >= 0)` |
| 03_04 | `subscription_addons` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 03_04 | `subscription_plan_feature_limits` | `CHECK(limit_value IS NULL OR limit_value >= 0)` |
| 03_04 | `subscription_addon_limits` | `CHECK(limit_value IS NULL OR limit_value >= 0)` |
| 03_04 | `tenant_feature_entitlements` | `CHECK(entitlement_status IN ('ENABLED', 'DISABLED', 'EXPIRED'))` |
| 03_04 | `feature_flags` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 05 | `tenant_subscriptions` | `CHECK(subscription_status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED'))` |
| 05 | `tenant_subscription_history` | `CHECK(sequence_number > 0)` |
| 05 | `subscription_invoices` | `CHECK(total_amount >= 0)` |
| 05 | `subscription_invoice_lines` | `CHECK(quantity > 0)` |
| 05 | `subscription_invoice_lines` | `CHECK(line_total_amount >= 0)` |
| 05 | `subscription_payment_links` | `CHECK(expires_at IS NULL OR expires_at > created_at)` |
| 05 | `subscription_payment_transactions` | `CHECK(amount >= 0)` |
| 05 | `subscription_credit_notes` | `CHECK(total_credit_amount >= 0)` |
| 05 | `subscription_credit_note_lines` | `CHECK(line_credit_amount >= 0)` |
| 05 | `tenant_usage_counters` | `CHECK(used_quantity >= 0)` |
| 06 | `tenant_users` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'INVITED', 'LOCKED', 'DELETED'))` |
| 06 | `role_templates` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 06 | `role_template_versions` | `CHECK(version_number > 0)` |
| 06 | `tenant_roles` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 06 | `permission_definitions` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 07 | `user_invites` | `CHECK(invite_status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'))` |
| 07 | `user_setup_tokens` | `CHECK(status IN ('PENDING', 'USED', 'EXPIRED', 'REVOKED'))` |
| 07 | `email_verification_tokens` | `CHECK(status IN ('PENDING', 'VERIFIED', 'EXPIRED', 'REVOKED'))` |
| 07 | `password_reset_tokens` | `CHECK(status IN ('PENDING', 'USED', 'EXPIRED', 'REVOKED'))` |
| 07 | `tenant_auth_sessions` | `CHECK(status IN ('ACTIVE', 'EXPIRED', 'REVOKED'))` |
| 07 | `tenant_refresh_tokens` | `CHECK(status IN ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED'))` |
| 07 | `tenant_login_audits` | `CHECK(login_result IN ('SUCCESS', 'FAILED', 'LOCKED'))` |
| 08 | `outlets` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 08 | `outlets` | `CHECK(outlet_type IN ('STORE', 'WAREHOUSE'))` |
| 08 | `outlet_addresses` | `CHECK(address_type IN ('PHYSICAL', 'BILLING', 'PICKUP'))` |
| 08 | `outlet_business_hours` | `CHECK(day_of_week BETWEEN 0 AND 6)` |
| 08 | `outlet_business_hours` | `CHECK(open_time < close_time)` |
| 08 | `tills` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 09 | `hardware_test_logs` | `CHECK(test_result IN ('SUCCESS', 'FAILED', 'WARNING'))` |
| 09 | `till_sessions` | `CHECK(closing_cash_amount IS NULL OR closing_cash_amount >= 0)` |
| 09 | `cash_movement_types` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 09 | `cash_movements` | `CHECK(amount > 0)` |
| 09 | `cash_reconciliations` | `CHECK(expected_cash_amount >= 0)` |
| 09 | `cash_reconciliations` | `CHECK(counted_cash_amount >= 0)` |
| 09 | `cash_count_denominations` | `CHECK(denomination_value > 0)` |
| 09 | `cash_count_denominations` | `CHECK(quantity >= 0)` |
| 10 | `departments` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 10 | `categories` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 10 | `brands` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 10 | `collections` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 10 | `unit_of_measures` | `CHECK(conversion_factor IS NULL OR conversion_factor > 0)` |
| 10 | `return_policies` | `CHECK(return_window_days IS NULL OR return_window_days >= 0)` |
| 10 | `products` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 11 | `product_images` | `CHECK(sort_order >= 0)` |
| 12 | `product_option_template_values` | `CHECK(sort_order >= 0)` |
| 12 | `product_options` | `CHECK(sort_order >= 0)` |
| 12 | `product_option_values` | `CHECK(sort_order >= 0)` |
| 13 | `combo_definitions` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 13 | `combo_components` | `CHECK(quantity > 0)` |
| 13 | `combo_groups` | `CHECK(min_select >= 0)` |
| 13 | `combo_groups` | `CHECK(max_select >= min_select)` |
| 13 | `combo_group_items` | `CHECK(sort_order >= 0)` |
| 13 | `choice_groups` | `CHECK(min_select >= 0)` |
| 13 | `choice_groups` | `CHECK(max_select >= min_select)` |
| 13 | `choice_options` | `CHECK(sort_order >= 0)` |
| 13 | `choice_option_inventory_impacts` | `CHECK(quantity_delta <> 0)` |
| 14 | `price_lists` | `CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))` |
| 14 | `price_list_items` | `CHECK(price_amount >= 0)` |
| 14 | `tax_rates` | `CHECK(rate_percent >= 0)` |
| 15 | `discount_policies` | `CHECK(discount_value >= 0)` |
| 15 | `discount_policy_conditions` | `CHECK(condition_sequence > 0)` |
| 15 | `expiry_discount_rule_tiers` | `CHECK(days_before_expiry >= 0)` |
| 15 | `expiry_discount_rule_tiers` | `CHECK(discount_value >= 0)` |
| 16 | `product_batches` | `CHECK(expiry_date IS NULL OR expiry_date >= manufactured_date)` |
| 16 | `inventory_balances` | `CHECK(on_hand_quantity >= 0)` |
| 16 | `inventory_balances` | `CHECK(reserved_quantity >= 0)` |
| 16 | `inventory_channel_allocations` | `CHECK(allocation_limit_quantity >= 0)` |
| 16 | `inventory_cost_layers` | `CHECK(quantity_remaining >= 0)` |
| 16 | `inventory_cost_layers` | `CHECK(unit_cost >= 0)` |
| 16 | `inventory_reorder_rules` | `CHECK(reorder_point_quantity >= 0)` |
| 17 | `inventory_reservations` | `CHECK(reservation_status IN ('PENDING', 'CONFIRMED', 'RELEASED', 'EXPIRED', 'CANCELLED'))` |
| 17 | `inventory_reservation_lines` | `CHECK(requested_quantity > 0)` |
| 17 | `inventory_reservation_allocations` | `CHECK(allocated_quantity > 0)` |
| 17 | `stock_movements` | `CHECK(movement_quantity <> 0)` |
| 17 | `stock_movement_cost_allocations` | `CHECK(allocated_quantity > 0)` |
| 17 | `stock_movement_cost_allocations` | `CHECK(allocated_cost_amount >= 0)` |
| 18 | `stock_adjustments` | `CHECK(adjustment_status IN ('DRAFT', 'APPROVED', 'POSTED', 'CANCELLED'))` |
| 18 | `stock_adjustment_lines` | `CHECK(adjustment_quantity <> 0)` |
| 18 | `stock_transfers` | `CHECK(source_inventory_location_id <> destination_inventory_location_id)` |
| 18 | `stock_transfer_lines` | `CHECK(requested_quantity > 0)` |
| 18 | `stock_transfer_status_history` | `CHECK(sequence_number > 0)` |
| 19 | `customer_auth_accounts` | `CHECK(failed_login_count >= 0)` |
| 19 | `customer_verification_otps` | `CHECK(attempt_count >= 0)` |
| 19 | `customer_verification_otps` | `CHECK(max_attempts > 0)` |
| 20 | `document_number_sequences` | `CHECK(padding_length > 0)` |
| 20 | `document_number_sequences` | `CHECK(current_value >= 0)` |
| 20 | `sales_orders` | `CHECK(total_amount >= 0)` |
| 20 | `sales_orders` | `CHECK(paid_amount >= 0)` |
| 20 | `sales_order_lines` | `CHECK(quantity > 0)` |
| 20 | `sales_order_lines` | `CHECK(line_total_amount >= 0)` |
| 20 | `sales_order_line_options` | `CHECK(quantity > 0)` |
| 20 | `sales_order_line_options` | `CHECK(sort_order >= 0)` |
| 20 | `sales_order_line_components` | `CHECK(quantity > 0)` |
| 20 | `sales_order_line_components` | `CHECK(sort_order >= 0)` |
| 20 | `sales_order_discounts` | `CHECK(discount_amount >= 0)` |
| 20 | `sales_order_discounts` | `CHECK(application_sequence > 0)` |
| 20 | `sales_order_taxes` | `CHECK(tax_rate_percent >= 0)` |
| 20 | `sales_order_taxes` | `CHECK(tax_amount >= 0)` |
| 20 | `sales_order_charges` | `CHECK(charge_amount >= 0)` |
| 20 | `sales_order_status_history` | `CHECK(sequence_number > 0)` |
| 20 | `sales_order_line_status_history` | `CHECK(sequence_number > 0)` |
| 21 | `receipts` | `CHECK(total_amount >= 0)` |
| 21 | `receipt_print_logs` | `CHECK(attempt_number > 0)` |
| 21 | `receipt_template_versions` | `CHECK(version_number > 0)` |
| 21 | `receipt_template_assignments` | `CHECK((assignment_scope = 'OUTLET' AND outlet_id IS NOT NULL) OR (assignment_scope = 'TILL' AND till_id IS NOT NULL) OR (assignment_scope = 'POS_DEVICE' AND pos_device_id IS NOT NULL))` |
| 21 | `till_session_summaries` | `CHECK(order_count >= 0)` |
| 21 | `till_session_summaries` | `CHECK(refund_count >= 0)` |
| 21 | `till_session_events` | `CHECK(amount IS NULL OR amount >= 0)` |
| 21 | `till_cash_movements` | `CHECK(amount > 0)` |
| 22 | `shopping_carts` | `CHECK(cart_status IN ('ACTIVE', 'CHECKED_OUT', 'ABANDONED', 'EXPIRED', 'CANCELLED'))` |
| 22 | `shopping_cart_items` | `CHECK(quantity > 0)` |
| 22 | `shopping_cart_item_options` | `CHECK(quantity > 0)` |
| 22 | `shopping_cart_item_components` | `CHECK(quantity > 0)` |
| 22 | `checkout_sessions` | `CHECK(total_amount >= 0)` |
| 22 | `checkout_session_lines` | `CHECK(quantity > 0)` |
| 22 | `checkout_session_line_options` | `CHECK(quantity > 0)` |
| 22 | `checkout_session_line_components` | `CHECK(quantity > 0)` |
| 22 | `checkout_events` | `CHECK(sequence_number > 0)` |
| 23 | `fulfillment_methods` | `CHECK(method_type IN ('IMMEDIATE', 'PICKUP'))` |
| 23 | `pickup_slots` | `CHECK(capacity >= 0)` |
| 23 | `pickup_slots` | `CHECK(reserved_count >= 0)` |
| 23 | `pickup_slots` | `CHECK(reserved_count <= capacity)` |
| 23 | `pickup_slot_reservations` | `CHECK(reserved_capacity > 0)` |
| 23 | `pickup_slot_reservations` | `CHECK(checkout_session_id IS NOT NULL OR sales_order_id IS NOT NULL)` |
| 23 | `fulfillment_order_lines` | `CHECK(requested_quantity > 0)` |
| 23 | `fulfillment_order_events` | `CHECK(sequence_number > 0)` |
| 23 | `pickup_order_events` | `CHECK(sequence_number > 0)` |
| 24 | `payment_methods` | `CHECK(method_type IN ('CASH', 'CARD', 'QR', 'BANK_TRANSFER', 'MANUAL', 'OTHER'))` |
| 24 | `sales_payments` | `CHECK(requested_amount >= 0)` |
| 24 | `sales_payments` | `CHECK(paid_amount >= 0)` |
| 24 | `sales_payment_transactions` | `CHECK(amount >= 0)` |
| 24 | `sales_payment_events` | `CHECK(sequence_number > 0)` |
| 24 | `sales_refunds` | `CHECK(requested_amount >= 0)` |
| 24 | `sales_refunds` | `CHECK(refunded_amount >= 0)` |
| 24 | `sales_refund_payment_allocations` | `CHECK(allocated_amount > 0)` |
| 24 | `sales_refund_lines` | `CHECK(amount >= 0)` |
| 25 | `return_reasons` | `CHECK(applies_to IN ('RETURN', 'EXCHANGE', 'BOTH'))` |
| 25 | `sales_returns` | `CHECK(total_return_amount >= 0)` |
| 25 | `sales_returns` | `CHECK(total_refund_amount >= 0)` |
| 25 | `sales_return_lines` | `CHECK(requested_quantity > 0)` |
| 25 | `return_inspections` | `CHECK(inspected_quantity >= 0)` |
| 25 | `sales_return_events` | `CHECK(sequence_number > 0)` |
| 25 | `sales_exchanges` | `CHECK(additional_amount >= 0)` |
| 25 | `sales_exchanges` | `CHECK(refund_amount >= 0)` |
| 25 | `sales_exchange_lines` | `CHECK(returned_quantity > 0)` |
| 25 | `sales_exchange_lines` | `CHECK(replacement_quantity >= 0)` |
| 25 | `sales_exchange_events` | `CHECK(sequence_number > 0)` |
| 26 | `notification_channels` | `CHECK(channel_type IN ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP'))` |
| 26 | `notification_event_types` | `CHECK(default_priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT'))` |
| 26 | `notification_preferences` | `CHECK((recipient_type = 'PLATFORM_USER' AND platform_user_id IS NOT NULL AND tenant_user_id IS NULL AND customer_id IS NULL) OR (recipient_type = 'TENANT_USER' AND tenant_user_id IS NOT NULL AND platform_user_id IS NULL AND customer_id IS NULL) OR (recipient_type = 'CUSTOMER' AND customer_id IS NOT NULL AND platform_user_id IS NULL AND tenant_user_id IS NULL))` |
| 26 | `notification_template_versions` | `CHECK(version_number > 0)` |
| 26 | `notification_messages` | `CHECK((recipient_type = 'PLATFORM_USER' AND platform_user_id IS NOT NULL) OR (recipient_type = 'TENANT_USER' AND tenant_user_id IS NOT NULL) OR (recipient_type = 'CUSTOMER' AND customer_id IS NOT NULL))` |
| 26 | `notification_delivery_attempts` | `CHECK(attempt_number > 0)` |
| 26 | `notification_inbox_items` | `CHECK(inbox_status IN ('UNREAD', 'READ', 'ARCHIVED', 'DELETED'))` |
| 26 | `notification_read_receipts` | `CHECK(read_source IN ('WEB', 'MOBILE', 'POS', 'ADMIN', 'API'))` |
| 27 | `integration_providers` | `CHECK(provider_category IN ('PAYMENT', 'SMS', 'EMAIL', 'WHATSAPP', 'ACCOUNTING', 'DELIVERY', 'ANALYTICS', 'OTHER'))` |
| 27 | `platform_integration_credentials` | `CHECK(revoked_at IS NULL OR revoked_at >= created_at)` |
| 27 | `platform_integration_request_logs` | `CHECK(duration_ms IS NULL OR duration_ms >= 0)` |
| 27 | `platform_integration_request_logs` | `CHECK(response_status_code IS NULL OR response_status_code >= 100)` |
| 28 | `offline_clients` | `CHECK(max_offline_duration_minutes IS NULL OR max_offline_duration_minutes > 0)` |
| 28 | `device_sync_states` | `CHECK(last_server_version IS NULL OR last_server_version >= 0)` |
| 28 | `device_sync_states` | `CHECK(last_client_version IS NULL OR last_client_version >= 0)` |
| 28 | `offline_number_blocks` | `CHECK(range_start > 0)` |
| 28 | `offline_number_blocks` | `CHECK(range_end >= range_start)` |
| 28 | `offline_number_blocks` | `CHECK(next_value >= range_start)` |
| 28 | `offline_number_blocks` | `CHECK(next_value <= range_end + 1)` |
| 28 | `offline_number_blocks` | `CHECK(padding_length_snapshot > 0)` |
| 28 | `sync_batches` | `CHECK(uploaded_item_count >= 0)` |
| 28 | `sync_batches` | `CHECK(downloaded_item_count >= 0)` |
| 28 | `sync_batches` | `CHECK(conflict_count >= 0)` |
| 28 | `sync_conflicts` | `CHECK(resolution_status IN ('OPEN', 'RESOLVED', 'IGNORED', 'FAILED'))` |

## Implementation Rule

Every new status or type value must update:

- Database CHECK constraint.
- Backend domain constants.
- DTO validation.
- Seed data where applicable.
- Tests.
- Markdown documentation.

## Related Files

- [[Migration_Rules]]
- [[Database_Overview]]
