<!-- title: Markdown Writing Rules -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Markdown Writing Rules

## Purpose

This file defines how SCS-TIX Second Brain Markdown files must be written.
The goal is to make every file readable by developers, reviewers, and AI assistants.
Do not use generic SaaS or generic POS documentation when project-specific rules exist.

## File Length Rules

| File Type | Target Length |
|---|---|
| Default Markdown file | 80 to 120 lines |
| Complex architecture or module file | Maximum 140 lines |
| Simple reference file | Minimum 50 lines |
| Template file | Short but complete |
| Archive note | Short allowed when preserving history |

## Required Metadata

Every Markdown file must start with hidden HTML metadata.
The metadata must be the first content in the file.
Do not place a heading before metadata.

```html
<!-- title: File Title -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: Cuurent Date -->
```

## Allowed Status Values

| Status | Meaning |
|---|---|
| Active | Current source for Release 1 work |
| Draft | Needs review before implementation |
| Deferred | Valid knowledge but not Release 1 implementation |
| Deprecated | Old decision or replaced content |
| Archived | Historical reference only |

## Heading Rules

Use one `#` heading for the file title.
Use `##` for major sections.
Use `###` only when needed.
Do not create deep heading nesting unless the file is a complex architecture reference.
Keep section names direct and implementation-friendly.

## Content Source Rules

Use only uploaded SCS-TIX documents, images, journeys, UI files, backend architecture, database design, and confirmed project decisions.
Do not invent modules, APIs, tables, integrations, permissions, or flows.
Do not convert deferred or future content into Release 1 scope.
If a source conflict exists, mention the conflict and link to [[Open_Questions]].

## Release 1 Scope Rules

Release 1 content may include POS, Platform Admin, Tenant Admin, Portable POS, products, inventory basics, expiry, discounts, loyalty, reports, payments, hardware-ready checkout, roles, permissions, and feature entitlement.
Release 1 content must not include e-commerce, offline sync, suppliers, stock transfer, delivery, kiosk, coupon engine, AI onboarding, AI analytics, or AI accounting unless clearly marked deferred.
When documenting a deferred item, label it clearly as Deferred or Future Reserved.

## Wikilink Rules

Use wikilinks to connect related Second Brain files.
Use this format:

```md
[[Release_1_Scope]]
[[Access_Control_Overview]]
[[Sales]]
```


## Table Rules

Use tables when comparing scope, roles, APIs, database tables, or decisions.
Keep tables simple.

## Bullet Rules

Use bullets for rules, constraints, checklist items, and included/excluded lists.

## Mermaid Diagram Rules

Use Mermaid only when it improves understanding.
Good use cases include access decision flow, backend dependency direction, tenant setup lifecycle, or user journey sequence.

## Code And JSON Rules

Use code blocks only for useful implementation contracts.

## Permission Documentation Rules

Do not create one large rigid permission enum.
Document permission codes as database-backed string codes.
Mention module-wise constants only as code-safe references.

## Database Documentation Rules

Use actual table names from the database design.
Use `sale_lines`, not `sale_items`.
Mention tenant_id rules for tenant-owned tables.

## API Documentation Rules

Use REST-style endpoint groups only when supported by backend architecture.
Every protected POS API must mention authorization context where relevant.
For POS operations, JWT alone is never enough.
Mention tenant, feature, permission, outlet, trusted device, assigned till, and open till session checks where applicable.

## UI Documentation Rules

UI files must follow feature-based and permission-based rendering.
Do not hardcode permanent screen access by role name alone.
Document hidden, disabled, empty, denied, and error states where relevant.

## Review Checklist

- Metadata exists at the top.
- File stays within line-length rules.
- Release 1 scope is not expanded.
- Deferred features are clearly marked.
- Table names match the database design.
- Access-control rules are not simplified incorrectly.
- Related files are linked with wikilinks.

## Related Files

- [[README]]
- [[Current_Source_Of_Truth]]
- [[Developer_Reading_Guide]]
- [[Release_1_Scope]]
- [[Excluded_Features]]
- [[Open_Questions]]
