import { test, expect } from '../../src/fixtures/api.fixture.js';
import { getValidCredentials, invalidCredentials } from '../../src/data/users.js';
import {
  authenticationResponseSchema,
  authenticationErrorSchema
} from '../../src/schemas/auth.schema.js';
import { validateJsonSchema } from '../../src/utils/response-validator.js';

test('should create an authentication token with valid credentials', async ({ authClient }) => {
  const response = await authClient.createToken(getValidCredentials());
  const validation = await validateJsonSchema(response, authenticationResponseSchema);
  const body = (await response.json()) as { token?: unknown };

  expect(response.status()).toBe(200);
  expect(validation.valid, validation.errors.join('; ')).toBe(true);
  expect(typeof body.token).toBe('string');
  expect(String(body.token).length).toBeGreaterThan(0);
});

test.describe('invalid authentication credentials', () => {
  const cases = [
    'invalid username',
    'invalid password',
    'missing username',
    'missing password',
    'empty body'
  ];

  for (const title of cases) {
    test(`should reject ${title} with the observed error response`, async ({ apiClient }) => {
      const body =
        title === 'invalid username'
          ? invalidCredentials
          : title === 'invalid password'
            ? { username: 'fake-valid-username', password: invalidCredentials.password }
            : title === 'missing username'
              ? { password: 'fake-valid-password' }
              : title === 'missing password'
                ? { username: 'fake-valid-username' }
                : {};
      const response = await apiClient.post('/auth', body);
      const validation = await validateJsonSchema(response, authenticationErrorSchema);
      const responseBody = (await response.json()) as Record<string, unknown>;

      expect(response.status()).toBe(200);
      expect(validation.valid, validation.errors.join('; ')).toBe(true);
      expect(responseBody).toEqual({ reason: 'Bad credentials' });
      expect(responseBody).not.toHaveProperty('token');
    });
  }
});
