<!-- title: Git Branching Rules -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Git Branching Rules

## Purpose

This file defines Git branching rules for SCS-TIX EPOS Release 1 development.

It helps backend, frontend, QA, and documentation work without overwriting each
other.

## Main Rule

Do not commit directly to `main`.

Every task must use a branch.

## Branch Types

| Branch Type | Pattern | Example |
|---|---|---|
| Feature | `feature/<area>-<short-name>` | `feature/backend-sales-payment` |
| Bug fix | `fix/<area>-<short-name>` | `fix/angular-tenant-switch` |
| Refactor | `refactor/<area>-<short-name>` | `refactor/backend-module-folders` |
| Docs | `docs/<area>-<short-name>` | `docs/module-knowledge-auth` |
| Test | `test/<area>-<short-name>` | `test/permission-guards` |

## Area Names

Use clear area names:

- `backend`
- `angular`
- `flutter`
- `database`
- `docs`
- `qa`
- `devops`

## Branch Creation

```text
git checkout main
git pull origin main
git checkout -b feature/backend-auth-session
```

## Commit Rule

Commits must be small and meaningful.

Examples:

```text
feat(auth): add tenant user login service
fix(pos): block sale when till session missing
docs(db): add payment core table notes
test(access): add permission denied cases
```

## Pull Before Push

Before pushing:

```text
git pull origin main
dotnet build
npm test
flutter test
```

Run only relevant commands when a repo contains one app.

## Merge Rule

Merge only through pull request.

Do not merge unreviewed code into `main`.

Do not merge code that breaks Release 1 scope.

## Conflict Rule

Resolve conflicts carefully.

Do not delete another developer's module, migration, prompt, or documentation
without confirmation.

## Large File Rule

Do not commit:

- Build output.
- `.env` files with secrets.
- Real database dumps.
- API tokens.
- IDE cache.
- Node modules.
- Flutter build artifacts.
- Generated binaries unless explicitly required.

## Second Brain Rule

When a code change changes architecture, database, journey, or scope, update the
Second Brain in the same pull request or create a linked docs task.

## Branch Checklist

| Check | Required |
|---|---|
| Branch created from latest main | Yes |
| Branch name is meaningful | Yes |
| Commit messages are clear | Yes |
| Secrets not committed | Yes |
| Release 1 boundary respected | Yes |
| PR created for merge | Yes |

## Related Files

- [[Pull_Request_Rules]]
- [[Code_Review_Checklist]]
- [[Local_Setup]]
