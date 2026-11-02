import { test, expect } from '../../src/fixtures/api.fixture.js';
import { createBooking } from '../../src/data/booking.factory.js';

test('should create a valid booking and retrieve the same data', async ({
  bookingClient,
  bookingTracker
}) => {
  const payload = createBooking();
  const { response, id } = await bookingTracker.create(payload);
  const body = JSON.parse(await response.text()) as unknown;

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  expect(Number.isInteger(id)).toBe(true);
  expect(body).toMatchObject({ booking: payload });

  if (id === undefined) {
    return;
  }

  const retrieved = await bookingClient.getBookingById(id);
  expect(retrieved.status()).toBe(200);
  expect(await retrieved.json()).toEqual(payload);
});

test('should create a booking with additional needs', async ({ bookingTracker }) => {
  const payload = createBooking({ additionalneeds: 'Breakfast' });
  const { response, id } = await bookingTracker.create(payload);

  expect(response.status()).toBe(200);
  expect(id).toEqual(expect.any(Number));
});

for (const [title, totalprice] of [
  ['zero total price', 0],
  ['large integer total price', 2_147_483_647]
] as const) {
  test(`should create a booking with ${title}`, async ({ bookingTracker }) => {
    const { response, id } = await bookingTracker.create(createBooking({ totalprice }));
    const body = JSON.parse(await response.text()) as unknown;

    expect(response.status()).toBe(200);
    expect(id).toEqual(expect.any(Number));
    expect(body).toMatchObject({ booking: { totalprice } });
  });
}

test('should create a booking with observed date boundary values', async ({ bookingTracker }) => {
  const { response, id } = await bookingTracker.create(
    createBooking({ bookingdates: { checkin: '2025-01-01', checkout: '2025-01-02' } })
  );

  expect(response.status()).toBe(200);
  expect(id).toEqual(expect.any(Number));
});
