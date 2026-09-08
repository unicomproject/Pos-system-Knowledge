<!-- title: Tenant Admin Tax Management Decision Register -->
<!-- status: Active / LOCKED -->
<!-- date: 2026-09-03 -->
<!-- system: OneVerz POS MVP -->

# Tenant Admin Tax Management — Decision Register

**Canonical contract:** [[../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]]

| ID | Decision | Status | Notes |
|---|---|---|---|
| DEC-TAX-001 | Used For / Applies To / Goods / Services / Both removed from Tax Setup | **LOCKED** | Any active Tax Setup may be assigned to an eligible product |
| DEC-TAX-002 | Tax Setup owns identity, treatment, effective-dated rates, status | **LOCKED** | Domain Tax Setup; persistence may remain `tax_classes` |
| DEC-TAX-003 | Product owns Inclusive/Exclusive TaxPriceMode | **LOCKED** | Via `taxExclusive` / `is_tax_exclusive`; ADR 2026-08-27 KEPT |
| DEC-TAX-004 | Tax rates are effective-dated | **LOCKED** | Backend resolves current rate |
| DEC-TAX-005 | Historical rates are preserved; never overwrite by creating new | **LOCKED** | HISTORICAL / CURRENT / SCHEDULED |
| DEC-TAX-006 | ZERO_RATED and EXEMPT remain distinct | **LOCKED** | Both may yield TaxAmount=0 |
| DEC-TAX-007 | Default taxes are tenant-owned and configuration-driven | **LOCKED** | Empty seed set is valid |
| DEC-TAX-008 | Historical sale tax is snapshot-based | **LOCKED** | `sales_order_taxes` + treatment snapshot TARGET |
| DEC-TAX-009 | Refund uses original sale tax snapshot | **LOCKED** | Never today's live rate |
| DEC-TAX-010 | Inactive tax cannot be newly assigned | **LOCKED** | |
| DEC-TAX-011 | Tax Treatment immutable after product assignment OR transactional use | **LOCKED** | Safer than effective-dated treatment changes in R1 |
| DEC-TAX-012 | Deactivation Option B — existing assignments continue; new assignments blocked | **LOCKED** | Show product impact; never silent tax-free |
| DEC-TAX-013 | Seeded Tax Setups are fully editable by tenant | **LOCKED** | IsSeeded informational |
| DEC-TAX-014 | Tenant Admin Tax APIs extend existing `/api/v1/tax` aggregate | **LOCKED** | Prefer extend over duplicate |
| DEC-TAX-015 | Permissions use `pricing.tax_*` TARGET namespace (not `catalog.tax.*`) | **LOCKED** | Map from runtime `tax.classes.*` / `tax.rates.*` |
| DEC-TAX-016 | Effective-from uses tenant default timezone at 00:00:00 | **LOCKED** | `tenants.default_timezone` IANA |
| DEC-TAX-017 | Fixed-amount (non-percentage) Tax Setup out of R1 TA canonical contract | **LOCKED** | Supersedes Flutter PERCENTAGE/amount Tax Type UX |
| DEC-TAX-018 | Journey IDs TA-UJ-063…069 allocated for Tax Management | **LOCKED** | No prior Tax TA-UJ IDs existed |

## Related KEPT decisions

- [[TENANT_ADMIN_PRODUCT_TAX_INCLUSIVE_EXCLUSIVE_DECISION_2026-08-27]] — Product TaxPriceMode formulas
