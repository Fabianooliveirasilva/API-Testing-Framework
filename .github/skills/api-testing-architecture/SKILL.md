# API Testing Architecture

## Purpose

Preserve the framework's strict, reusable separation of clients, fixtures, data, schemas,
utilities, tests, and documentation.

## Project rules

- Clients perform HTTP communication only; tests own assertions.
- Fixtures own lifecycle, authentication composition, and cleanup. Booking creation in tests goes
  through `bookingTracker.create()` so IDs are tracked before assertions.
- Factories return fresh unique data. Never share mutable bookings or target resources created by
  another test.
- Schemas and `assertValid<T>()` provide type/contract validation; functional tests should not
  duplicate contract coverage unnecessarily.
- Handle observed-vs-expected behavior explicitly with `[observed]` and `known-deviation`.
- Do not assert shared-list counts/content, leak token-bearing headers, or add speculative
  abstractions.
- Preserve strict TypeScript and run the project's typecheck, lint, format check, and Playwright
  suites after changes.
