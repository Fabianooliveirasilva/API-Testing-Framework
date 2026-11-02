# Test Code Review

## Purpose

Review this project's API clients, fixtures, schemas, tests, and documentation before merging.

## Checklist

- Confirm every mutating test targets a booking created by that test through `bookingTracker.create`
  or `createdBooking`; fixed IDs are only for read-only/observed missing-resource checks.
- Confirm cleanup annotations report `tracked`, `deleted`, `alreadyGone`, and `failed`, with
  `failed=0`.
- Check observed-vs-expected wording, `[observed]` titles, and `known-deviation` annotations.
- Reject assertions that depend on shared-list counts/content, ordering, sleeps, or hidden retries.
- Check type safety, Arrange/Act/Assert structure, unique factory data, and complete assertions.
- Check that credentials and token-bearing headers are never logged or committed.
- Run typecheck, lint, format check, normal tests, and the required repeated suite; report real
  output only.
