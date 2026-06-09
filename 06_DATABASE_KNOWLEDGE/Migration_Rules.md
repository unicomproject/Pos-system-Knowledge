<!-- title: Migration Rules -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Migration Rules

## Purpose

This file defines Release 1 database migration rules for SCS-TIX EPOS.

Migrations must preserve tenant isolation, append-only ledgers, and predictable
reference data.

## Migration Principle

A migration must be safe, repeatable, reviewable, and aligned with the updated
Release 1 database design.

Do not introduce Release 2 active behavior in Release 1 migrations.

## Migration Content

A Release 1 migration may include table creation, column creation, primary keys,
foreign keys, tenant-aware unique indexes, check constraints, seed reference
data, platform modules/features/permissions, and safe default values.

## Required Constraints

Use constraints for status values, payment method codes, discount type/scope
codes, movement direction, positive quantities, non-negative monetary totals,
tenant-aware uniqueness, and one open till session per tenant/till.

## Hash Storage Rule

Never store raw tokens/codes.

Migrations and seed data must support hash columns for setup tokens, invite
tokens, password reset tokens, refresh tokens, payment links, till activation
codes, and session token hashes.

## Append-Only Tables

| Table | Reason |
|---|---|
| `audit_logs` | Business audit trail |
| `stock_movements` | Inventory ledger |
| `loyalty_transactions` | Points ledger |
| `customer_credit_transactions` | Store-credit ledger |
| `tenant_subscription_history` | Subscription lifecycle history |

Do not add normal update/delete workflows for append-only rows.

## Seed Data Warning

Do not seed tenant-specific production data.

Do not seed real passwords, raw tokens, activation codes, provider secrets, card
data, or real AWS/payment credentials.

## Migration Review Checklist

- Tenant-owned table has `tenant_id`.
- Foreign keys are present.
- Tenant-aware unique indexes are present.
- Check constraints match database design.
- No Release 2 active module was added.
- Sensitive data is stored as hash/reference only.
- Table and column names match updated database design.

## Related Files

- [[Database_Overview]]
- [[Tenant_Id_Rules]]
- [[Table_Naming_Standards]]
- [[../05_BACKEND_ARCHITECTURE/Seed_Data_Standards]]
