# API Security Testing

## Purpose

Validate authentication, authorization, and input handling safely.

## When to use

Use this skill when testing authentication, access control, invalid credentials, tokens, or malformed input.

## Instructions

- Test valid, missing, and invalid credentials or tokens.
- Keep credentials in environment variables and never expose them in logs.
- Validate that protected operations reject unauthorized access.
- Use non-destructive requests against the public practice API.
- Record security observations without claiming a vulnerability without evidence.

## Best practices

- Use dedicated negative scenarios.
- Redact secrets from diagnostics.
- Follow the API documentation and safe testing boundaries.

## Anti-patterns

- Testing intrusive payloads or unauthorized targets.
- Committing secrets.
- Treating authentication and authorization as identical.
- Logging request headers containing tokens.

## Review checklist

- Are secrets protected?
- Are access restrictions verified?
- Are negative cases safe and deterministic?
- Are findings supported by observed behavior?
