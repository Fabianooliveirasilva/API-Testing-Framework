# API Contract Validation

## Purpose

Validate response shape and data types using reusable JSON Schemas.

## When to use

Use this skill when creating or reviewing schemas and contract tests.

## Instructions

- Use Ajv for JSON Schema validation.
- Define required properties, data types, and nested structures explicitly.
- Reuse schemas where response contracts overlap.
- Report validation errors with enough context to diagnose the response.
- Keep schema validation separate from business-rule assertions.

## Best practices

- Version schemas with the code.
- Prefer strict, documented schemas for stable contracts.
- Validate authentication, booking, creation, and list responses.

## Anti-patterns

- Using schemas as a substitute for business assertions.
- Omitting required properties to make a test pass.
- Silently accepting invalid schema input.

## Review checklist

- Does the schema match the documented response?
- Are required fields and types covered?
- Are nested objects validated?
- Are Ajv failures actionable?
