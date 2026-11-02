import type { APIResponse } from '@playwright/test';

import { ApiClient } from './ApiClient.js';
import type { BookingRequest, InvalidBookingPayload } from '../types/booking.types.js';
import type { ApiRequestOptions } from '../types/api.types.js';

export class BookingClient {
  public constructor(private readonly apiClient: ApiClient) {}

  public getAllBookingIds(options?: ApiRequestOptions): Promise<APIResponse> {
    return this.apiClient.get('/booking', options);
  }

  public getBookingById(
    bookingId: number | string,
    options?: ApiRequestOptions
  ): Promise<APIResponse> {
    return this.apiClient.get(`/booking/${encodeURIComponent(String(bookingId))}`, options);
  }

  public createBooking(
    payload: BookingRequest | InvalidBookingPayload,
    options?: ApiRequestOptions
  ): Promise<APIResponse> {
    return this.apiClient.post('/booking', payload, options);
  }

  public updateBooking(
    bookingId: number | string,
    payload: BookingRequest,
    tokenOrOptions?: string | ApiRequestOptions
  ): Promise<APIResponse> {
    return this.apiClient.put(
      `/booking/${encodeURIComponent(String(bookingId))}`,
      payload,
      toRequestOptions(tokenOrOptions)
    );
  }

  public partiallyUpdateBooking(
    bookingId: number | string,
    payload: Partial<BookingRequest>,
    tokenOrOptions?: string | ApiRequestOptions
  ): Promise<APIResponse> {
    return this.apiClient.patch(
      `/booking/${encodeURIComponent(String(bookingId))}`,
      payload,
      toRequestOptions(tokenOrOptions)
    );
  }

  public deleteBooking(
    bookingId: number | string,
    tokenOrOptions?: string | ApiRequestOptions
  ): Promise<APIResponse> {
    return this.apiClient.delete(`/booking/${encodeURIComponent(String(bookingId))}`, {
      ...toRequestOptions(tokenOrOptions)
    });
  }
}

function toRequestOptions(
  tokenOrOptions: string | ApiRequestOptions | undefined
): ApiRequestOptions {
  return typeof tokenOrOptions === 'string' ? { token: tokenOrOptions } : (tokenOrOptions ?? {});
}
