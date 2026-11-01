import { getConfiguredCredentials } from '../config/environment.js';
import type { AuthenticationRequest } from '../types/auth.types.js';

export const invalidCredentials: AuthenticationRequest = {
  username: 'invalid-user',
  password: 'invalid-password'
};

export function getValidCredentials(): AuthenticationRequest {
  return getConfiguredCredentials();
}
