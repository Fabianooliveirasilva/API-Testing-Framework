# API Test Design

## Purpose

Design reliable tests that validate real API behavior rather than assumptions.

## When to use

Use this skill when adding or reviewing API scenarios.

## Instructions

- Organize tests using Arrange, Act, Assert.
- Cover positive, negative, boundary, and equivalence-partition scenarios where applicable.
- Validate both HTTP behavior and response content.
- Create resources dynamically and clean them up when appropriate.
- Keep one primary behavior per test.

## Best practices

- Use descriptive test names.
- Prefer data-driven cases for equivalent scenarios.
- Verify expected behavior against official documentation and safe live responses.
- Avoid sleeps, ordering dependencies, and arbitrary thresholds.

## Anti-patterns

- Asserting undocumented status codes.
- Using shared booking IDs between tests.
- Treating a passing status-only assertion as complete validation.
- Hiding transient failures with broad retries.

## Review checklist

- Is the scenario meaningful and independent?
- Are expected results evidence-based?
- Are status, headers, and body validated appropriately?
- Are cleanup and transient API behavior considered?
