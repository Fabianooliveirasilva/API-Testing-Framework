import { test, expect } from '../../src/fixtures/api.fixture.js';
import {
  createBooking,
  createInvalidBooking,
  type InvalidBookingScenario
} from '../../src/data/booking.factory.js';

const missingFields: InvalidBookingScenario[] = [
  'missing-firstname',
  'missing-lastname',
  'missing-totalprice',
  'missing-depositpaid',
  'missing-bookingdates'
];

for (const scenario of missingFields) {
  test(`[observed] should characterize ${scenario}`, async ({ bookingClient }) => {
    const response = await bookingClient.createBooking(createInvalidBooking(scenario));

    test.info().annotations.push({
      type: 'known-deviation',
      description: 'The API returned HTTP 500 for a missing required booking property.'
    });
    expect(response.status()).toBe(500);
    expect(await response.text()).toBe('Internal Server Error');
  });
}

for (const scenario of ['invalid-firstname', 'invalid-lastname', 'invalid-bookingdates'] as const) {
  test(`[observed] should characterize ${scenario}`, async ({ bookingClient }) => {
    const response = await bookingClient.createBooking(createInvalidBooking(scenario));

    test.info().annotations.push({
      type: 'known-deviation',
      description: 'The API returned HTTP 500 for this invalid booking type.'
    });
    expect(response.status()).toBe(500);
    expect(await response.text()).toBe('Internal Server Error');
  });
}

test('[observed] should accept invalid date values and track the created booking', async ({
  bookingClient,
  bookingTracker
}) => {
  const response = await bookingClient.createBooking(createInvalidBooking('invalid-date'));
  const body = (await response.json()) as { bookingid?: number };

  test.info().annotations.push({
    type: 'known-deviation',
    description: 'The API accepted invalid date strings and created a booking.'
  });
  expect(response.status()).toBe(200);
  expect(body.bookingid).toEqual(expect.any(Number));
  if (typeof body.bookingid === 'number') {
    bookingTracker.track(body.bookingid);
  }
});

for (const scenario of ['invalid-totalprice', 'invalid-depositpaid'] as const) {
  test(`[observed] should track a booking created from ${scenario}`, async ({
    bookingClient,
    bookingTracker
  }) => {
    const response = await bookingClient.createBooking(createInvalidBooking(scenario));
    const body = (await response.json()) as { bookingid?: number };

    test.info().annotations.push({
      type: 'known-deviation',
      description: 'The API accepted an invalid type and created a normalized booking.'
    });
    expect(response.status()).toBe(200);
    expect(body.bookingid).toEqual(expect.any(Number));
    if (typeof body.bookingid === 'number') {
      bookingTracker.track(body.bookingid);
    }
  });
}

test('[observed] should return an internal error for an empty booking object', async ({
  bookingClient
}) => {
  const response = await bookingClient.createBooking(createInvalidBooking('empty-payload'));

  test.info().annotations.push({
    type: 'known-deviation',
    description: 'The API returned HTTP 500 instead of a client-validation response.'
  });
  expect(response.status()).toBe(500);
  expect(await response.text()).toBe('Internal Server Error');
});

test('should create a valid booking as a control for invalid-data tests', async ({
  bookingClient,
  bookingTracker
}) => {
  const response = await bookingClient.createBooking(createBooking());
  const body = (await response.json()) as { bookingid?: number };

  expect(response.status()).toBe(200);
  if (typeof body.bookingid === 'number') {
    bookingTracker.track(body.bookingid);
  }
});
