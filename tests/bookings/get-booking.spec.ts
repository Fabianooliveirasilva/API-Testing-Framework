import { test, expect } from '../../src/fixtures/api.fixture.js';
import { createBooking } from '../../src/data/booking.factory.js';
import { randomUUID } from 'node:crypto';

test('should return booking IDs as an array', async ({ bookingClient }) => {
  const response = await bookingClient.getAllBookingIds();
  const body: unknown = await response.json();

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  expect(Array.isArray(body)).toBe(true);
});

test('should retrieve an existing booking by ID', async ({ bookingClient, createdBooking }) => {
  const response = await bookingClient.getBookingById(createdBooking.id);
  const body: unknown = await response.json();

  expect(response.status()).toBe(200);
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
  const { response: created, id } = await bookingTracker.create(payload);

  expect(created.status()).toBe(200);
  expect(id).toEqual(expect.any(Number));
  for (const [field, value] of [
    ['firstname', payload.firstname],
    ['lastname', payload.lastname]
  ] as const) {
    const response = await bookingClient.getAllBookingIds({ params: { [field]: value } });
    const ids = (await response.json()) as Array<{ bookingid: number }>;

    expect(response.status()).toBe(200);
    expect(ids.every((item) => Number.isInteger(item.bookingid))).toBe(true);
    if (field === 'firstname') {
      expect(ids).toEqual([{ bookingid: id }]);
    } else {
      expect(ids).toContainEqual({ bookingid: id });
    }
  }
});

for (const [field, value] of [
  ['checkin', '2025-01-01'],
  ['checkout', '2025-01-10']
] as const) {
  test(`should filter bookings by ${field}`, async ({ bookingClient, bookingTracker }) => {
    const { id } = await bookingTracker.create(
      createBooking({ bookingdates: { checkin: '2025-01-01', checkout: '2025-01-10' } })
    );
    const response = await bookingClient.getAllBookingIds({ params: { [field]: value } });
    const ids = (await response.json()) as Array<{ bookingid: number }>;

    expect(response.status()).toBe(200);
    expect(ids.every((item) => Number.isInteger(item.bookingid))).toBe(true);
    if (field === 'checkin') {
      test.info().annotations.push({
        type: 'known-deviation',
        description:
          'The observed checkin filter returns a valid ID list but does not include the booking created in this test.'
      });
      expect(ids).not.toContainEqual({ bookingid: id });
    } else {
      expect(ids).toContainEqual({ bookingid: id });
    }
  });
}

test('[observed] should return an internal error for an invalid date filter', async ({
  bookingClient
}) => {
  const response = await bookingClient.getAllBookingIds({ params: { checkin: 'not-a-date' } });

  test.info().annotations.push({
    type: 'known-deviation',
    description: 'The API behavior for an invalid checkin filter value is observed, not documented.'
  });
  expect(response.status()).toBe(500);
  expect(await response.text()).toBe('Internal Server Error');
});

test('should return an empty array for a filter with no matches', async ({ bookingClient }) => {
  const response = await bookingClient.getAllBookingIds({
    params: { firstname: `no-match-${randomUUID()}` }
  });

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual([]);
});
