import { Ajv, type AnySchema, type ErrorObject, type ValidateFunction } from 'ajv';

import type { ResponseValidationResult } from '../types/api.types.js';

export class SchemaValidator {
  private readonly ajv = new Ajv({ allErrors: true, strict: true });
  private readonly validators = new WeakMap<object, ValidateFunction<unknown>>();

  public validate(schema: AnySchema, data: unknown): ResponseValidationResult {
    const validator = this.getValidator(schema);
    const valid = validator(data);

    return {
      valid,
      errors: valid ? [] : formatErrors(validator.errors)
    };
  }

  private getValidator(schema: AnySchema): ValidateFunction<unknown> {
    if (typeof schema !== 'object' || schema === null) {
      throw new Error('JSON Schema must be an object.');
    }

    const cached = this.validators.get(schema);
    if (cached !== undefined) {
      return cached;
    }

    const validator = this.ajv.compile<unknown>(schema);
    this.validators.set(schema, validator);
    return validator;
  }
}

function formatErrors(errors: readonly ErrorObject[] | null | undefined): string[] {
  return (errors ?? []).map(
    (error) => `${error.instancePath || '/'} ${error.message ?? 'failed schema validation'}`
  );
}
