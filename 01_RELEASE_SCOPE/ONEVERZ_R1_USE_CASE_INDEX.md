<!-- title: ONEVERZ R1 USE CASE INDEX -->
<!-- status: CANONICAL -->
<!-- system: OneVerz EPOS Release 1 -->
<!-- last_updated: 2026-09-02 -->

# ONEVERZ EPOS — RELEASE 1 USE CASE TRACEABILITY INDEX

## 1. SUMMARY

| Status Category | Count | Description |
| --- | ---: | --- |
| **IMPLEMENTED** | 282 | Production code, backend API path, and frontend UI fully operational |
| **PARTIAL** | 3 | Feature partially implemented (BM-18 Offline Sync only; excluded from ONEVERZ_R1_STD) |
| **MISSING** | 6 | Required capability pending implementation (BM-18 Offline Sync only; excluded from ONEVERZ_R1_STD) |
| **DEFERRED / EXCLUDED** | 0 | (Excluded features such as Discounts/Loyalty not counted in R1 use cases) |
| **TOTAL RELEASE 1 USE CASES** | **291** | **100% Accounted for in Master Register (Reconciled; historical 263 omitted BM-01/02)** |

---

## 2. USE CASE MAPPING BY BUSINESS MODULE

| BM ID | Business Module | Total Use Cases | Implemented | Partial | Missing | Key Journey Mapping |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| **BM-01** | Authentication & Workspace | 12 | 12 | 0 | 0 | `TA-UJ-001..003`, `POS-UJ-001`, `SA-UJ-001..003` (Closed) |
| **BM-02** | Outlet & Till Management | 16 | 16 | 0 | 0 | `TA-UJ-007..016`, `SA-UJ-051..052` (Closed) |
| **BM-03** | Users, Roles & Permissions | 18 | 18 | 0 | 0 | `TA-UJ-017..026`, `SA-UJ-053..054` (Closed) |
| **BM-04** | Devices & Hardware | 14 | 14 | 0 | 0 | `POS-UJ-030..036`, `TA-UJ-040..044` (Closed) |
| **BM-05** | Till Session & Operations | 15 | 15 | 0 | 0 | `POS-UJ-002..006` (Closed) |
| **BM-06** | POS Home / Dashboard | 8 | 8 | 0 | 0 | `POS-UJ-001..002` (Closed) |
| **BM-07** | Product Catalogue Management | 32 | 32 | 0 | 0 | `TA-UJ-027..039`, `SA-UJ-055..056` (Closed) |
| **BM-08** | Inventory & Stock Management | 24 | 24 | 0 | 0 | `TA-UJ-045..052` (Closed) |
| **BM-09** | Sales / New Sale & Cart | 22 | 22 | 0 | 0 | `POS-UJ-007..015` (Closed) |
| **BM-10** | Customer Management | 12 | 12 | 0 | 0 | `POS-UJ-016..018`, `TA-UJ-053..056` (Closed) |
| **BM-11** | Park & Recall Sales | 8 | 8 | 0 | 0 | `POS-UJ-019..021` (Closed) |
| **BM-12** | Payments | 14 | 14 | 0 | 0 | `POS-UJ-022..025`, `EC-UJ-010..014` (Closed) |
| **BM-13** | Receipts | 8 | 8 | 0 | 0 | `POS-UJ-026..027` (Closed) |
| **BM-14** | Returns, Refunds & Exchanges | 18 | 18 | 0 | 0 | `POS-UJ-028..029`, `TA-UJ-057..059` (Closed) |
| **BM-15** | Cash Management & Reconciliation | 10 | 10 | 0 | 0 | `POS-UJ-003..005` (Closed) |
| **BM-16** | Online Orders & Click & Collect | 22 | 22 | 0 | 0 | `EC-UJ-001..018`, `TA-UJ-060..062` (Closed) |
| **BM-17** | Reporting & Analytics | 16 | 16 | 0 | 0 | `TA-UJ-041..044` (Closed) |
| **BM-18** | Offline & Synchronization | 12 | 3 | 3 | 6 | `POS-UJ-034..036` (Commercial: Excluded) |
| **BM-19** | Business / POS Settings | 10 | 10 | 0 | 0 | `TA-UJ-004..006`, `POS-UJ-030` (Closed) |
| **TOTAL** | | **291** | **282** | **3** | **6** | |
