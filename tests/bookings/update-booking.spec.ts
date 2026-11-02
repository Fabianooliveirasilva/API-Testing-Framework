import { test, expect } from '../../src/fixtures/api.fixture.js';
import { createBooking } from '../../src/data/booking.factory.js';
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
  expect(response.headers()['content-type']).toContain('application/json');
  expect(await response.json()).toEqual(payload);
  expect(persisted.status()).toBe(200);
  expect(await persisted.json()).toEqual(payload);
});

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
      'Basic Auth was accepted although the official Update Booking apidoc section describes cookie token authentication: https://restful-booker.herokuapp.com/apidoc/index.html#api-Booking-UpdateBooking'
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

test('[observed] should return bad request for PUT with a malformed body', async ({
  apiClient,
  bookingClient,
  createdBooking,
  authToken
}) => {
  const response = await apiClient.put(`/booking/${createdBooking.id}`, '{"firstname":', {
    token: authToken,
    headers: { 'Content-Type': 'application/json' }
  });
  const persisted = await bookingClient.getBookingById(createdBooking.id);

  test.info().annotations.push({
    type: 'known-deviation',
    description: 'Malformed PUT bodies are characterized from the observed API response.'
  });
  expect(response.status()).toBe(400);
  expect(persisted.status()).toBe(200);
  expect(await persisted.json()).toEqual(createdBooking.booking);
});

test('[observed] should return bad request for PUT with a missing booking field', async ({
  apiClient,
  bookingClient,
  createdBooking,
  authToken
}) => {
  const payload = createdBooking.booking;
  const missingFirstname = Object.fromEntries(
    Object.entries(payload).filter(([key]) => key !== 'firstname')
  );
  const response = await apiClient.put(`/booking/${createdBooking.id}`, missingFirstname, {
    token: authToken
  });
  const persisted = await bookingClient.getBookingById(createdBooking.id);

  test.info().annotations.push({
    type: 'known-deviation',
    description:
      'PUT with a missing required field is characterized from the observed API response.'
  });
  expect(response.status()).toBe(400);
  expect(persisted.status()).toBe(200);
  expect(await persisted.json()).toEqual(createdBooking.booking);
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
    const body: unknown = await persisted.json();

    expect(response.status()).toBe(200);
    expect(persisted.status()).toBe(200);
    expect(body).toEqual({ ...createdBooking.booking, [field]: value });
  });
}

test('[observed] should persist an invalid PATCH value', async ({
  apiClient,
  bookingClient,
  createdBooking,
  authToken
}) => {
  const response = await apiClient.patch(
    `/booking/${createdBooking.id}`,
    { firstname: 123 },
    { token: authToken }
  );
  const persisted = await bookingClient.getBookingById(createdBooking.id);

  test.info().annotations.push({
    type: 'known-deviation',
    description: 'The API accepts and persists a numeric firstname value with HTTP 200.'
  });
  expect(response.status()).toBe(200);
  expect(persisted.status()).toBe(200);
  expect(await persisted.json()).toEqual({ ...createdBooking.booking, firstname: 123 });
});

test('[observed] should return method not allowed for PATCH on a non-existing booking', async ({
  bookingClient,
  authToken
}) => {
  const response = await bookingClient.partiallyUpdateBooking(
    999999999,
    { firstname: 'Missing' },
    authToken
  );

  test.info().annotations.push({
    type: 'known-deviation',
    description: 'The API returned 405 for authenticated PATCH on a non-existing booking.'
  });
  expect(response.status()).toBe(405);
});
