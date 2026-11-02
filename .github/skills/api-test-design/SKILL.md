# API Test Design

## Purpose

Design independent Playwright API tests for the Restful Booker service using evidence from the
official apidoc and real safe requests.

## Project rules

- Use Arrange, Act, Assert and one primary behavior per test.
- Treat documented behavior as the expected contract. Mark undocumented service behavior with an
  `[observed]` title and a `known-deviation` annotation.
- Every booking POST, including invalid payloads that may return 2xx, must use
  `bookingTracker.create()` before assertions.
- Never mutate or delete a booking that the test did not create. Use `createdBooking` or a tracker
  ID; fixed IDs are allowed only for read-only or observed non-existing ID checks.
- Do not assert counts or contents of shared public lists. Use unique factory names and assert the
  relevant created ID/filter result.
- Preserve authentication through fixtures and cookie token options; never print tokens or headers.

## Validation

Assert status, content type, and body when relevant. Record known deviations without presenting a
5xx response or permissive input acceptance as the desired contract.
