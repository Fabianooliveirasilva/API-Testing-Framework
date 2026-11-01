import { test, expect } from '../../src/fixtures/api.fixture.js';
import { createBooking } from '../../src/data/booking.factory.js';

for (const tokenCase of [
  ['without a token', undefined],
  ['with an empty token', ''],
  ['with a malformed token', 'malformed-token']
] as const) {
  for (const operation of ['PUT', 'PATCH', 'DELETE'] as const) {
    test(`should reject ${operation} ${tokenCase[0]} and preserve the booking`, async ({
      apiClient,
      bookingClient,
      createdBooking
    }) => {
      const options = tokenCase[1] === undefined ? undefined : { token: tokenCase[1] };
      const response =
        operation === 'PUT'
          ? await apiClient.put(`/booking/${createdBooking.id}`, createBooking(), options)
          : operation === 'PATCH'
            ? await apiClient.patch(
                `/booking/${createdBooking.id}`,
                { firstname: 'Unauthorized' },
                options
              )
            : await apiClient.delete(`/booking/${createdBooking.id}`, options);
      const retrieved = await bookingClient.getBookingById(createdBooking.id);

      expect(response.status()).toBe(403);
      expect(await response.text()).toBe('Forbidden');
      expect(retrieved.status()).toBe(200);
      expect(await retrieved.json()).toEqual(createdBooking.booking);
    });
  }
}
