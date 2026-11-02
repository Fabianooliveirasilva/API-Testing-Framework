import type { APIRequestContext, APIResponse } from '@playwright/test';

import type { EnvironmentConfig } from '../config/environment.js';
import type { ApiRequestOptions } from '../types/api.types.js';

export class ApiClient {
  private readonly defaultHeaders: Readonly<Record<string, string>> = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  public constructor(
    private readonly requestContext: APIRequestContext,
    private readonly config: EnvironmentConfig
  ) {}

  public get(path: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.request('GET', path, undefined, options);
  }

  public post(path: string, data?: unknown, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.request('POST', path, data, options);
  }

  public put(path: string, data?: unknown, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.request('PUT', path, data, options);
  }

  public patch(path: string, data?: unknown, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.request('PATCH', path, data, options);
  }

  public delete(path: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.request('DELETE', path, undefined, options);
  }

  public request(
    method: string,
    path: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<APIResponse> {
    const headers = this.mergeHeaders(options?.headers);

    if (options?.token !== undefined) {
      headers.Cookie = `token=${options.token}`;
    }

    return this.requestContext.fetch(this.buildUrl(path), {
      method,
      headers,
      timeout: this.config.apiTimeout,
      failOnStatusCode: false,
      ...(data === undefined
        ? {}
        : { data: typeof data === 'string' ? data : JSON.stringify(data) }),
      ...(options?.params === undefined ? {} : { params: { ...options.params } })
    });
  }

  private buildUrl(path: string): string {
    return new URL(path, `${this.config.baseUrl}/`).toString();
  }

  private mergeHeaders(overrides: Readonly<Record<string, string>> | undefined) {
    const headers = new Map<string, { name: string; value: string }>();

    for (const [name, value] of Object.entries(this.defaultHeaders)) {
      headers.set(name.toLowerCase(), { name, value });
    }

    for (const [name, value] of Object.entries(overrides ?? {})) {
      headers.set(name.toLowerCase(), { name, value });
    }

    return Object.fromEntries([...headers.values()].map(({ name, value }) => [name, value]));
  }
}
