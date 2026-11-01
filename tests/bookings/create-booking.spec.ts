import { test, expect } from '../../src/fixtures/api.fixture.js';
import { createBooking } from '../../src/data/booking.factory.js';
import { bookingResponseSchema } from '../../src/schemas/booking-response.schema.js';
import { validateContentType, validateJsonSchema } from '../../src/utils/response-validator.js';

test('should create a valid booking and retrieve the same data', async ({
  bookingClient,
  bookingTracker
}) => {
  const payload = createBooking();
  const response = await bookingClient.createBooking(payload);
  const validation = await validateJsonSchema(response, bookingResponseSchema);
  const body = (await response.json()) as { bookingid?: number; booking?: typeof payload };

  expect(response.status()).toBe(200);
  validateContentType(response);
  expect(validation.valid, validation.errors.join('; ')).toBe(true);
  expect(Number.isInteger(body.bookingid)).toBe(true);
  expect(body.booking).toEqual(payload);

  if (typeof body.bookingid !== 'number') {
    return;
  }

  bookingTracker.track(body.bookingid);
  const retrieved = await bookingClient.getBookingById(body.bookingid);
  expect(retrieved.status()).toBe(200);
  expect(await retrieved.json()).toEqual(payload);
});

test('should create a booking with additional needs', async ({ bookingClient, bookingTracker }) => {
  const payload = createBooking({ additionalneeds: 'Breakfast' });
  const response = await bookingClient.createBooking(payload);
  const body = (await response.json()) as { bookingid?: number };

  expect(response.status()).toBe(200);
  expect(body.bookingid).toEqual(expect.any(Number));
  if (typeof body.bookingid === 'number') {
    bookingTracker.track(body.bookingid);
  }
});

for (const [title, totalprice] of [
  ['zero total price', 0],
  ['large integer total price', 2_147_483_647]
] as const) {
  test(`should create a booking with ${title}`, async ({ bookingClient, bookingTracker }) => {
    const response = await bookingClient.createBooking(createBooking({ totalprice }));
    const body = (await response.json()) as {
      bookingid?: number;
      booking?: { totalprice?: number };
    };

    expect(response.status()).toBe(200);
    expect(body.bookingid).toEqual(expect.any(Number));
    expect(body.booking?.totalprice).toBe(totalprice);
    if (typeof body.bookingid === 'number') {
      bookingTracker.track(body.bookingid);
    }
  });
}

test('should create a booking with observed date boundary values', async ({
  bookingClient,
  bookingTracker
}) => {
  const response = await bookingClient.createBooking(
    createBooking({ bookingdates: { checkin: '2025-01-01', checkout: '2025-01-02' } })
  );
  const body = (await response.json()) as { bookingid?: number };

  expect(response.status()).toBe(200);
  expect(body.bookingid).toEqual(expect.any(Number));
  if (typeof body.bookingid === 'number') {
    bookingTracker.track(body.bookingid);
  }
});
