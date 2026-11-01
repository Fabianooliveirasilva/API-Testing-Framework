import type { APIResponse } from '@playwright/test';
import type { AnySchema } from 'ajv';

import type { ResponseValidationResult } from '../types/api.types.js';
import { SchemaValidator } from './schema-validator.js';

const schemaValidator = new SchemaValidator();

export function validateStatus(response: APIResponse, expectedStatus: number): void {
  if (response.status() !== expectedStatus) {
    throw new Error(
      `Expected HTTP ${expectedStatus}, received HTTP ${response.status()} for ${response.url()}.`
    );
  }
}

export function validateContentType(
  response: APIResponse,
  expectedType = 'application/json'
): void {
  const contentType = response.headers()['content-type'] ?? '';
  if (!contentType.toLowerCase().includes(expectedType.toLowerCase())) {
    throw new Error(
      `Expected content type ${expectedType}, received ${contentType || 'missing content type'}.`
    );
  }
}

export async function readJson(response: APIResponse): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Response from ${response.url()} was not valid JSON.`, { cause: error });
  }
}

export async function validateJsonSchema(
  response: APIResponse,
  schema: AnySchema
): Promise<ResponseValidationResult> {
  const body = await readJson(response);
  return schemaValidator.validate(schema, body);
}
