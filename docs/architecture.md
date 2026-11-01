# Architecture

## Overview

The framework separates HTTP communication, test data generation, contract validation, and test
execution. Tests consume typed clients and utilities through Playwright fixtures.

## Layers

- **Configuration**: `src/config/environment.ts` loads `.env`, validates the base URL, timeout, and
  credential pairing, and keeps credentials optional for unauthenticated scenarios.
- **Global setup**: `src/config/global-setup.ts` validates that `API_USERNAME` and `API_PASSWORD`
  are available together once before the test run and reports one clear configuration error.
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
  responses, annotates `tracked=N deleted=M`, and aggregates authentication or unexpected DELETE
  failures without logging tokens or full error objects. `createdBooking` creates one tracked
  booking.

## Request flow

1. A test receives `bookingClient`, `authClient`, or `apiClient` from the fixture.
2. The specialized client builds the documented endpoint path and payload.
3. `ApiClient` adds common headers, timeout, base URL, and an optional `Cookie: token=...` header.
4. Playwright returns the original `APIResponse`; the test or response utility performs assertions.
5. Contract checks pass the decoded response body to the cached Ajv validator.

## Authentication

Credentials are read only from environment variables. Authentication responses are checked for a
non-empty token before a token is returned. Invalid authentication responses are represented by
their documented `reason` field when available; the client does not log tokens or credentials.
The framework uses the Restful Booker cookie token mechanism. Traces are disabled because request
headers may contain authentication tokens.

`ApiClient` owns base URL and request timeout configuration, while Playwright configuration owns
test timeout, assertion timeout, worker count, and reporters. Request headers are normalized
case-insensitively so a caller override replaces rather than duplicates `Content-Type`.
