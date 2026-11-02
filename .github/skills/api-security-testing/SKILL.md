# API Security Testing

## Purpose

Safely test authentication, authorization, malformed input, and token handling for Restful Booker.

## Project rules

- Use environment credentials only for valid-auth scenarios; use fixed fake values for negative
  authentication cases.
- Use the framework's cookie token option and never log tokens, credentials, cookies, or full
  sensitive request/response objects.
- Verify unauthorized PUT/PATCH/DELETE responses and resource preservation using a booking created
  by the same test.
- Never mutate or delete a resource the test did not create. Non-existing IDs are permitted only
  for observed 404/405 checks that cannot mutate a resource.
- Mark undocumented or surprising security behavior with `[observed]` and `known-deviation`, and
  cite the official apidoc when authentication behavior differs.
- Use non-destructive, bounded requests only; do not claim a vulnerability without evidence.
