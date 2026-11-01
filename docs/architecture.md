# Architecture

## Overview

The framework separates HTTP communication, test data generation, contract validation, and test
execution. Tests consume typed clients and utilities through Playwright fixtures.

## Layers

- **Configuration**: `src/config/environment.ts` loads `.env`, validates the base URL, timeout, and
  credential pairing, and keeps credentials optional for unauthenticated scenarios.
- **Types**: `src/types/` defines request, response, JSON, and authentication contracts.
- **API clients**: `src/clients/ApiClient.ts` centralizes Playwright request execution. `AuthClient`
  handles token creation and response handling; `BookingClient` maps booking endpoints to typed
  operations. Clients return original `APIResponse` objects and do not contain test assertions.
- **Data**: `src/data/` creates fresh booking payloads and exposes safe reusable test data. The
  factory supports explicit invalid scenarios without mutating shared objects.
- **Schemas**: `src/schemas/` contains Ajv-compatible JSON Schemas for booking and authentication
  contracts, including nested booking dates.
- **Utilities**: `src/utils/` caches compiled Ajv validators and provides response status, content
  type, JSON parsing, and schema validation helpers.
- **Fixtures**: `src/fixtures/api.fixture.ts` creates per-test API clients from Playwright's
  request fixture. No token or mutable booking state is shared between tests.

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
