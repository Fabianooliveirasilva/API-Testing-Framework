import { test, expect } from '../../src/fixtures/api.fixture.js';
import { getValidCredentials, invalidCredentials } from '../../src/data/users.js';
import {
  authenticationResponseSchema,
  authenticationErrorSchema
} from '../../src/schemas/auth.schema.js';
import { validateJsonSchema } from '../../src/utils/response-validator.js';
import { assertValid } from '../../src/utils/schema-validator.js';
import type { AuthenticationResponse } from '../../src/types/auth.types.js';

test('should create an authentication token with valid credentials', async ({ authClient }) => {
  const response = await authClient.createToken(getValidCredentials());
  const validation = await validateJsonSchema(response, authenticationResponseSchema);
  const body: unknown = await response.json();
  assertValid<AuthenticationResponse>(body, authenticationResponseSchema);

  expect(response.status()).toBe(200);
  expect(validation.valid, validation.errors.join('; ')).toBe(true);
  expect(body.token).toEqual(expect.any(String));
  expect(body.token.length).toBeGreaterThan(0);
});

test.describe('invalid authentication credentials', () => {
  const cases = [
    { title: 'invalid username', body: invalidCredentials },
    {
      title: 'invalid password',
      body: { username: 'fake-valid-username', password: invalidCredentials.password }
    },
    { title: 'missing username', body: { password: 'fake-valid-password' } },
    { title: 'missing password', body: { username: 'fake-valid-username' } },
    { title: 'empty body', body: {} }
  ];

  for (const { title, body } of cases) {
    test(`should reject ${title} with the observed error response`, async ({ apiClient }) => {
      const response = await apiClient.post('/auth', body);
      const validation = await validateJsonSchema(response, authenticationErrorSchema);
      const responseBody: unknown = await response.json();

      expect(response.status()).toBe(200);
      expect(validation.valid, validation.errors.join('; ')).toBe(true);
      expect(responseBody).toEqual({ reason: 'Bad credentials' });
      expect(responseBody).not.toHaveProperty('token');
    });
  }
});
