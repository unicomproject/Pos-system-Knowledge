<!-- title: 16. Inventory Foundation, Product Tracking & Stock Availability -->
<!-- source: 16_Inventory Foundation, Product Tracking & Stock.png -->
<!-- status: ERD image aligned -->

# 16. Inventory Foundation, Product Tracking & Stock Availability

Source of truth: `16_Inventory Foundation, Product Tracking & Stock.png`.

## Purpose

This module defines inventory locations, product tracking settings, batch/serial tracking, stock balances, channel allocations, cost layers and reorder rules.

## Entity Tables

| Table | Purpose |
|---|---|
| `inventory_locations` | Outlet inventory storage/stock locations with parent-child hierarchy. |
| `product_inventory_settings` | Product or variant inventory tracking setup. |
| `product_batches` | Product or variant batch identity and expiry metadata. |
| `inventory_balances` | Current on-hand/reserved/damaged/quarantine quantities. |
| `inventory_channel_allocations` | Optional sales-channel stock allocation rules. |
| `serial_numbers` | Serialized item identity and current balance tracking. |
| `inventory_cost_layers` | Cost layer records for costing and allocation. |
| `inventory_reorder_rules` | Reorder point/quantity and supplier reorder setup. |

## External Reference Entities

`tenants`, `tenant_users`, `outlets`, `products`, `product_variants`, `unit_of_measures`, `sales_channels`, `supplier_products`, `stock_movements`
