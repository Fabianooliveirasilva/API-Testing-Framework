import type { APIResponse } from '@playwright/test';

import { ApiClient } from './ApiClient.js';
import type { AuthenticationRequest, AuthenticationResponse } from '../types/auth.types.js';

export class AuthClient {
  public constructor(private readonly apiClient: ApiClient) {}

  public createToken(credentials: AuthenticationRequest): Promise<APIResponse<unknown>> {
    return this.apiClient.post<unknown>('/auth', credentials);
  }

  public async getToken(credentials: AuthenticationRequest): Promise<string> {
    const response = await this.createToken(credentials);

    if (!response.ok()) {
      throw new Error(`Authentication failed with HTTP status ${response.status()}.`);
    }

    const body: unknown = await response.json();

    if (!isAuthenticationResponse(body)) {
      throw new Error(
        `Authentication response with HTTP status ${response.status()} did not contain a valid token.`
      );
    }

    return body.token;
  }
}

function isAuthenticationResponse(body: unknown): body is AuthenticationResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'token' in body &&
    typeof body.token === 'string' &&
    body.token.length > 0
  );
}
