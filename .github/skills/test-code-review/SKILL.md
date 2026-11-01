# Test Code Review

## Purpose

Review API tests and framework code for correctness, maintainability, and reliability.

## When to use

Use this skill before merging changes to clients, fixtures, tests, schemas, or CI.

## Instructions

- Review correctness, assertion quality, type safety, and API contract alignment.
- Check independence, cleanup, flakiness risks, and duplicated code.
- Check security handling and CI compatibility.
- Verify documentation matches implemented coverage.

## Best practices

- Prefer focused tests with actionable failure messages.
- Reuse established helpers and patterns.
- Run typecheck, lint, formatting, and relevant tests.

## Anti-patterns

- Ignoring failed validation.
- Relying on execution order or arbitrary waits.
- Adding broad catches or success-shaped fallbacks.
- Claiming coverage that was not executed.

## Review checklist

- Is the behavior tested accurately?
- Are failures explicit?
- Are tests deterministic and independent?
- Are credentials and tokens protected?
- Does CI execute the same quality gates?
