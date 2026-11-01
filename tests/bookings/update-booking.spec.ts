import { test, expect } from '../../src/fixtures/api.fixture.js';
import { createBooking } from '../../src/data/booking.factory.js';
import { validateContentType } from '../../src/utils/response-validator.js';
import { getValidCredentials } from '../../src/data/users.js';

test('should update all booking fields with a valid token', async ({
  bookingClient,
  createdBooking,
  authToken
}) => {
  const payload = createBooking({ additionalneeds: 'Dinner' });
  const response = await bookingClient.updateBooking(createdBooking.id, payload, authToken);
  const persisted = await bookingClient.getBookingById(createdBooking.id);

  expect(response.status()).toBe(200);
  validateContentType(response);
  expect(await response.json()).toEqual(payload);
  expect(persisted.status()).toBe(200);
  expect(await persisted.json()).toEqual(payload);
});

for (const [title, token] of [
  ['without a token', undefined],
  ['with an invalid token', 'invalid-token']
] as const) {
  test(`should reject a PUT ${title}`, async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.updateBooking(createdBooking.id, createBooking(), token);

    expect(response.status()).toBe(403);
    expect(await response.text()).toBe('Forbidden');
  });
}

test('[observed] should accept PUT with Authorization Basic', async ({
  apiClient,
  bookingClient,
  createdBooking
}) => {
  const payload = createBooking({ firstname: 'Basic-Updated' });
  const response = await apiClient.put(`/booking/${createdBooking.id}`, payload, {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${getValidCredentials().username}:${getValidCredentials().password}`
      ).toString('base64')}`
    }
  });

  test.info().annotations.push({
    type: 'known-deviation',
    description:
      'Basic Auth was accepted although the API documentation describes cookie token authentication.'
  });
  expect(response.status()).toBe(200);
  expect(await bookingClient.getBookingById(createdBooking.id).then((item) => item.json())).toEqual(
    payload
  );
});

test('[observed] should return method not allowed for PUT on a non-existing booking', async ({
  bookingClient,
  authToken
}) => {
  const response = await bookingClient.updateBooking(999999999, createBooking(), authToken);

  test.info().annotations.push({
    type: 'known-deviation',
    description: 'The API returned 405 for an authenticated PUT to a non-existing booking.'
  });
  expect(response.status()).toBe(405);
  expect(await response.text()).toBe('Method Not Allowed');
});

for (const [field, value] of [
  ['firstname', 'Patched firstname'],
  ['lastname', 'Patched lastname']
] as const) {
  test(`should patch ${field} only and preserve other fields`, async ({
    bookingClient,
    createdBooking,
    authToken
  }) => {
    const response = await bookingClient.partiallyUpdateBooking(
      createdBooking.id,
      { [field]: value },
      authToken
    );
    const persisted = await bookingClient.getBookingById(createdBooking.id);
    const body = (await persisted.json()) as typeof createdBooking.booking;

    expect(response.status()).toBe(200);
    expect(persisted.status()).toBe(200);
    expect(body[field]).toBe(value);
    expect(body.totalprice).toBe(createdBooking.booking.totalprice);
    expect(body.depositpaid).toBe(createdBooking.booking.depositpaid);
    expect(body.bookingdates).toEqual(createdBooking.booking.bookingdates);
  });
}
