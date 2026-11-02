# API Contract Validation

## Purpose

Maintain Ajv contracts for the typed Restful Booker API.

## Project rules

- Keep schemas in `src/schemas` and contract assertions in `tests/contracts`.
- Reuse nested schemas rather than duplicating booking definitions.
- Use `validateJsonSchema` for response contracts and `assertValid<T>()` when narrowing unknown
  response data.
- Keep schema checks separate from business assertions.
- Contract tests may use `bookingTracker.create()` for POST responses, and the tracker must
  register the returned ID before any assertion.
- Document observed schema/API deviations with `[observed]` and `known-deviation`; never weaken a
  schema merely to make a test pass.
- Do not expose credentials, tokens, cookies, or response headers containing them.
