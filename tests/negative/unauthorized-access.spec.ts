import { test, expect } from '../../src/fixtures/api.fixture.js';
import { createBooking } from '../../src/data/booking.factory.js';
import type { ApiClient } from '../../src/clients/ApiClient.js';

const tokenCases = [
  ['without a token', undefined],
  ['with an empty token', ''],
  ['with a malformed token', 'malformed-token']
] as const;
const operations = {
  PUT: (apiClient: ApiClient, id: number, token: string | undefined) =>
    apiClient.put(`/booking/${id}`, createBooking(), token === undefined ? undefined : { token }),
  PATCH: (apiClient: ApiClient, id: number, token: string | undefined) =>
    apiClient.patch(
      `/booking/${id}`,
      { firstname: 'Unauthorized' },
      token === undefined ? undefined : { token }
    ),
  DELETE: (apiClient: ApiClient, id: number, token: string | undefined) =>
    apiClient.delete(`/booking/${id}`, token === undefined ? undefined : { token })
} as const;

for (const tokenCase of tokenCases) {
  for (const operation of Object.keys(operations) as Array<keyof typeof operations>) {
    test(`should reject ${operation} ${tokenCase[0]} and preserve the booking`, async ({
      apiClient,
      bookingClient,
      createdBooking
    }) => {
      const response = await operations[operation](apiClient, createdBooking.id, tokenCase[1]);
      const retrieved = await bookingClient.getBookingById(createdBooking.id);

      expect(response.status()).toBe(403);
      expect(await response.text()).toBe('Forbidden');
      expect(retrieved.status()).toBe(200);
      expect(await retrieved.json()).toEqual(createdBooking.booking);
    });
  }
}
