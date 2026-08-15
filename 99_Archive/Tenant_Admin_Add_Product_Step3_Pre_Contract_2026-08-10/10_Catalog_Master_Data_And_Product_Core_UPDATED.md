<!-- title: Catalog Master Data & Product Core -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-05 -->
<!-- source: Updated from uploaded ERD image: 10_Catalog Master Data & Product Core(3).png -->

# 10. Catalog Master Data & Product Core

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for the Catalog Master Data & Product Core module.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Entity tables, column names, data types, PK/FK markers, NULL/NOT NULL rules, and notes were updated to match the ERD. Enum/domain datatypes from the ERD are written as `varchar(40)` with CHECK constraints where applicable.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `business_types` | Stores system/product business type classifications. |
| `departments` | Stores tenant departments used to group categories. |
| `categories` | Stores tenant categories with department and parent category hierarchy. |
| `brands` | Stores tenant brand master records. |
| `collections` | Stores tenant product collections and effective date windows. |
| `unit_of_measures` | Stores global and tenant-specific unit of measure records. |
| `return_policies` | Stores tenant product return policy records. |
| `products` | Stores tenant product master records. |
| `product_variants` | Stores sellable product variants. |
| `product_reviews` | Stores 1-5 star customer ratings and text reviews for products. |
| `product_rating_summaries` | Stores the aggregated rating summary for fast loading on product pages. |
