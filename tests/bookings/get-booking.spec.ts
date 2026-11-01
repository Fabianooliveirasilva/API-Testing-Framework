import { test, expect } from '../../src/fixtures/api.fixture.js';
import { bookingIdListSchema } from '../../src/schemas/booking-response.schema.js';
import { bookingSchema } from '../../src/schemas/booking.schema.js';
import { validateJsonSchema } from '../../src/utils/response-validator.js';
import { createBooking } from '../../src/data/booking.factory.js';
import { randomUUID } from 'node:crypto';

test('should return booking IDs as an array', async ({ bookingClient }) => {
  const response = await bookingClient.getAllBookingIds();
  const validation = await validateJsonSchema(response, bookingIdListSchema);

  expect(response.status()).toBe(200);
  expect(validation.valid, validation.errors.join('; ')).toBe(true);
});

test('should retrieve an existing booking by ID', async ({ bookingClient, createdBooking }) => {
  const response = await bookingClient.getBookingById(createdBooking.id);
  const validation = await validateJsonSchema(response, bookingSchema);
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(validation.valid, validation.errors.join('; ')).toBe(true);
  expect(body).toEqual(createdBooking.booking);
});

test('should return not found for a non-existing booking ID', async ({ bookingClient }) => {
  const response = await bookingClient.getBookingById(999999999);

  expect(response.status()).toBe(404);
  expect(await response.text()).toBe('Not Found');
});

test('should filter bookings by unique firstname and lastname', async ({
  bookingClient,
  bookingTracker
}) => {
  const payload = createBooking();
  const created = await bookingClient.createBooking(payload);
  const body = (await created.json()) as { bookingid?: number };

  expect(created.status()).toBe(200);
  expect(typeof body.bookingid).toBe('number');

  if (typeof body.bookingid !== 'number') {
    return;
  }

  bookingTracker.track(body.bookingid);
  for (const [field, value] of [
    ['firstname', payload.firstname],
    ['lastname', payload.lastname]
  ] as const) {
    const response = await bookingClient.getAllBookingIds({ params: { [field]: value } });
    const ids = (await response.json()) as Array<{ bookingid: number }>;

    expect(response.status()).toBe(200);
    expect(ids.some((item) => item.bookingid === body.bookingid)).toBe(true);
  }
});

test('should return an empty array for a filter with no matches', async ({ bookingClient }) => {
  const response = await bookingClient.getAllBookingIds({
    params: { firstname: `no-match-${randomUUID()}` }
  });

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual([]);
});
