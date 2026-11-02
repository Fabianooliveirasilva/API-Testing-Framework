# Architecture

## Overview

The framework separates HTTP communication, test data generation, contract validation, and test
execution. Tests consume typed clients and utilities through Playwright fixtures.

## Layers

- **Configuration**: `src/config/environment.ts` loads `.env`, validates the base URL, timeout, and
  credential pairing, and keeps credentials optional for unauthenticated scenarios.
- **Global setup**: `src/config/global-setup.ts` loads the strict environment validation without
  blocking public unauthenticated tests. Authenticated fixtures report a clear missing-credentials
  error when `API_USERNAME` and `API_PASSWORD` are unavailable.
- **Types**: `src/types/` defines request, response, JSON, and authentication contracts.
- **API clients**: `src/clients/ApiClient.ts` centralizes Playwright request execution. `AuthClient`
  handles token creation and response handling; `BookingClient` maps booking endpoints to typed
  operations. Clients return original `APIResponse` objects and do not contain test assertions.
- **Data**: `src/data/` creates fresh booking payloads with `crypto.randomUUID()` and exposes no
  shared mutable booking object. The factory supports explicit invalid scenarios without mutation.
- **Schemas**: `src/schemas/` contains Ajv-compatible JSON Schemas for booking and authentication
  contracts, including nested booking dates. The booking response schema reuses the booking schema.
- **Utilities**: `src/utils/` caches compiled Ajv validators and provides response status, content
  type, JSON parsing, and schema validation helpers.
- **Fixtures**: `src/fixtures/api.fixture.ts` creates per-test API clients from Playwright's
  request fixture. `authToken` is created lazily only when requested. `bookingTracker` tracks
  resources created by a test and removes them during teardown; cleanup tolerates 404 and 405
  responses, annotates `tracked=N deleted=D alreadyGone=A failed=F`, and aggregates authentication
  or unexpected DELETE failures without logging tokens or full error objects. `create()` tracks
  returned IDs before assertions, and `createdBooking` creates one tracked
  booking.

## Request flow

1. A test receives `bookingClient`, `authClient`, or `apiClient` from the fixture.
2. The specialized client builds the documented endpoint path and payload.
3. `ApiClient` adds common headers, timeout, base URL, and an optional `Cookie: token=...` header.
4. Playwright returns the original `APIResponse`; the test or response utility performs assertions.
5. Contract checks pass the decoded response body to the cached Ajv validator.

## Postman exploratory collection

The Postman collection in [`postman/api-testing-collection.json`](../postman/api-testing-collection.json)
provides manual and exploratory API coverage that complements the automated Playwright suite. It
chains authentication and booking creation, uses only the booking created in that run for mutations,
and deletes that booking in the final lifecycle step. Requests named `[observed]` document behavior
captured from the public service rather than prescribing a desired contract.

To use it, import both the collection and
[`postman/environments/local-environment.json`](../postman/environments/local-environment.json)
into Postman, select the environment, and fill in `username` and `password` locally. Run the
collection with the Collection Runner in its displayed order so the token and booking ID variables
are chained before protected requests and cleanup. The environment is safe to push because it
contains no credentials or tokens. Newman can optionally run the same collection without adding a
project dependency:

```bash
npx newman run postman/api-testing-collection.json -e postman/environments/local-environment.json
```

## Authentication

Credentials are read only from environment variables. Public tests can start without credentials;
`authToken` requests them lazily and reports a clear configuration error when they are missing.
Authentication responses are checked for a non-empty token, and invalid responses are asserted in
authentication tests without logging credentials or tokens. Protected booking operations use the
Restful Booker cookie token mechanism; `Authorization: Basic` remains an explicitly annotated
observed deviation because it is not described by the official Update Booking apidoc. Traces are
disabled because request headers may contain authentication tokens.

`ApiClient` owns base URL and request timeout configuration, while Playwright configuration owns
test timeout, assertion timeout, worker count, and reporters. Request headers are normalized
case-insensitively so a caller override replaces rather than duplicates `Content-Type`.
