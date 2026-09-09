<!-- title: Cashier POS Canonical Permission Registry — Chunk 5 -->
<!-- status: Active — Effective Permission Resolver + Session Loading; UI Deferred -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-04 -->

# Cashier POS Canonical Permission Registry — Chunk 5

## Scope

Chunk 5 implements the **authoritative effective-permission resolver** and wires
it into authenticated POS permission loading (login / refresh / tenant-admin
context).

This chunk does **not** implement Flutter widget hide/show, route guards, new POS
business endpoint authorization, sensitive DTO filtering, or Tenant Admin UI.

See vault file for full formula, session contract, Flutter loading, fail-closed
rules, and deferred Chunk 6+ scope.
