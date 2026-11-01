import type { JSONSchemaType } from 'ajv';

import type { AuthenticationError, AuthenticationResponse } from '../types/auth.types.js';

export const authenticationResponseSchema: JSONSchemaType<AuthenticationResponse> = {
  type: 'object',
  required: ['token'],
  additionalProperties: false,
  properties: {
    token: { type: 'string', minLength: 1 }
  }
};

export const authenticationErrorSchema: JSONSchemaType<AuthenticationError> = {
  type: 'object',
  required: ['reason'],
  additionalProperties: false,
  properties: {
    reason: { type: 'string', minLength: 1 }
  }
};
