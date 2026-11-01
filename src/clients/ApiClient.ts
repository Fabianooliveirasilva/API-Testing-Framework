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

  public get<T = unknown>(path: string, options?: ApiRequestOptions): Promise<APIResponse<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  public post<T = unknown>(
    path: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<APIResponse<T>> {
    return this.request<T>('POST', path, data, options);
  }

  public put<T = unknown>(
    path: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<APIResponse<T>> {
    return this.request<T>('PUT', path, data, options);
  }

  public patch<T = unknown>(
    path: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<APIResponse<T>> {
    return this.request<T>('PATCH', path, data, options);
  }

  public delete<T = unknown>(path: string, options?: ApiRequestOptions): Promise<APIResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  public request<T>(
    method: string,
    path: string,
    data?: unknown,
    options?: ApiRequestOptions
  ): Promise<APIResponse<T>> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options?.headers
    };

    if (options?.token !== undefined) {
      headers.Cookie = `token=${options.token}`;
    }

    return this.requestContext.fetch<T>(this.buildUrl(path), {
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
}
