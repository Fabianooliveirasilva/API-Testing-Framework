# API Testing Architecture

## Purpose

Keep the framework modular, reusable, type-safe, and aligned with its documented architecture.

## When to use

Use this skill when creating or changing clients, fixtures, configuration, data factories, schemas, utilities, or test structure.

## Instructions

- Keep API communication in client classes and assertions in tests.
- Keep fixtures responsible for lifecycle and dependency composition.
- Keep test data, schemas, and shared utilities in their respective layers.
- Prefer small, reusable components over speculative abstractions.
- Preserve strict TypeScript configuration and existing public interfaces when practical.

## Best practices

- Use explicit types and meaningful names.
- Keep tests independent and avoid global mutable state.
- Reuse common request configuration.
- Document structural changes.

## Anti-patterns

- Duplicating request logic across tests.
- Placing assertions in API clients.
- Sharing mutable resources between tests.
- Introducing abstractions without a concrete use case.

## Review checklist

- Are responsibilities separated?
- Is the implementation type-safe?
- Are tests independent?
- Are errors explicit and actionable?
- Does the change preserve existing behavior?
