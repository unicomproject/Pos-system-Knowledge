<!-- title: Markdown Writing Rules -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Markdown Writing Rules

## Purpose

This file defines how TM-EPOS Second Brain Markdown files must be written.
The goal is to make every file readable by developers, reviewers, and AI
assistants.
Do not use generic SaaS, generic POS, or unsupported commerce documentation when
project-specific rules exist.

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
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
```

## Allowed Status Values

| Status | Meaning |
|---|---|
| Active | Current source for MVP work |
| Draft | Needs review before implementation |
| Deferred | Valid knowledge but not active MVP implementation |
| Deprecated | Old decision or replaced content |
| Archived | Historical reference only |
| Superseded | Replaced by newer scope or database design |

## Content Source Rules

Use only uploaded TM-EPOS/SCS-TIX documents, scope images, journeys, UI files,
backend architecture, frontend architecture, database design, and confirmed
project decisions.

Do not invent modules, APIs, tables, integrations, permissions, roles, screens,
or flows.

If a source conflict exists, mention the conflict and link to
[[../13_DECISIONS_AND_CHANGES/Open_Questions]] or
[[../13_DECISIONS_AND_CHANGES/Scope_Change_Log]].

## Updated MVP Scope Rules

MVP content may include:

- Mobile POS.
- Desktop EPOS.
- Product and variant management.
- Inventory management.
- Online Store.
- Click & Collect.
- Offline Operation.
- Order management.
- Reporting and analytics.
- Users and permissions.
- Device and peripheral integration.
- Platform and tenant administration.
- Payments, refunds, returns, exchange, receipt, till, and cash control.

Do not keep old statements saying online store, click and collect, or offline
sync are excluded unless the file is intentionally documenting old history.

## Offline Documentation Rule

When documenting offline behavior, separate:

| Area | Meaning |
|---|---|
| Cache | Used for speed and read/reference access |
| Offline Operation | Limited work during internet outage |
| Pending Sync | Local operations waiting for backend sync |
| Backend Final Validation | Final backend authority for sensitive business rules |

Never describe offline support as unlimited.

## Structure Rules

Use one `#` heading for the file title and `##` for major sections.
Use tables for scope, module lists, field meanings, and decision matrices.
Use Mermaid, code, or JSON only when it improves implementation understanding.
Use wikilinks to connect related files.

```md
[[Release_1_Scope]]
[[Access_Control_Overview]]
[[Offline_Operation_Sync]]
```

Never write real passwords, tokens, API keys, card data, payment credentials, or
production secrets into Markdown. Mask sensitive sample values.

## Update Rule

When updating an existing file, preserve useful project-specific knowledge and
replace only the conflicting scope or architecture statements.

Do not rewrite unrelated content just because a scope update exists.

## Related Files

- [[README]]
- [[Current_Source_Of_Truth]]
- [[Developer_Reading_Guide]]
- [[Project_Glossary]]
