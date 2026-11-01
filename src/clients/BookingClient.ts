import type { APIResponse } from '@playwright/test';

import { ApiClient } from './ApiClient.js';
import type {
  BookingId,
  BookingRequest,
  BookingResponse,
  InvalidBookingPayload
} from '../types/booking.types.js';
import type { ApiRequestOptions } from '../types/api.types.js';

export class BookingClient {
  public constructor(private readonly apiClient: ApiClient) {}

  public getAllBookingIds(options?: ApiRequestOptions): Promise<APIResponse<BookingId[]>> {
    return this.apiClient.get<BookingId[]>('/booking', options);
  }

  public getBookingById(
    bookingId: number | string,
    options?: ApiRequestOptions
  ): Promise<APIResponse<BookingRequest>> {
    return this.apiClient.get<BookingRequest>(
      `/booking/${encodeURIComponent(String(bookingId))}`,
      options
    );
  }

  public createBooking(
    payload: BookingRequest | InvalidBookingPayload,
    options?: ApiRequestOptions
  ): Promise<APIResponse<BookingResponse>> {
    return this.apiClient.post<BookingResponse>('/booking', payload, options);
  }

  public updateBooking(
    bookingId: number | string,
    payload: BookingRequest,
    tokenOrOptions?: string | ApiRequestOptions
  ): Promise<APIResponse<BookingRequest>> {
    return this.apiClient.put<BookingRequest>(
      `/booking/${encodeURIComponent(String(bookingId))}`,
      payload,
      toRequestOptions(tokenOrOptions)
    );
  }

  public partiallyUpdateBooking(
    bookingId: number | string,
    payload: Partial<BookingRequest>,
    tokenOrOptions?: string | ApiRequestOptions
  ): Promise<APIResponse<BookingRequest>> {
    return this.apiClient.patch<BookingRequest>(
      `/booking/${encodeURIComponent(String(bookingId))}`,
      payload,
      toRequestOptions(tokenOrOptions)
    );
  }

  public deleteBooking(
    bookingId: number | string,
    tokenOrOptions?: string | ApiRequestOptions
  ): Promise<APIResponse<unknown>> {
    return this.apiClient.delete<unknown>(`/booking/${encodeURIComponent(String(bookingId))}`, {
      ...toRequestOptions(tokenOrOptions)
    });
  }
}

function toRequestOptions(
  tokenOrOptions: string | ApiRequestOptions | undefined
): ApiRequestOptions {
  return typeof tokenOrOptions === 'string' ? { token: tokenOrOptions } : (tokenOrOptions ?? {});
}
