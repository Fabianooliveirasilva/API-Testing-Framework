import { test, expect } from '../../src/fixtures/api.fixture.js';

test('should delete an existing booking and return not found afterwards', async ({
  bookingClient,
  createdBooking,
  authToken
}) => {
  const deleted = await bookingClient.deleteBooking(createdBooking.id, authToken);
  const retrieved = await bookingClient.getBookingById(createdBooking.id);

  expect(deleted.status()).toBe(201);
  expect(await deleted.text()).toBe('Created');
  expect(retrieved.status()).toBe(404);
  expect(await retrieved.text()).toBe('Not Found');
});

test('[observed] should return method not allowed when deleting a non-existing booking', async ({
  bookingClient,
  authToken
}) => {
  const response = await bookingClient.deleteBooking(999999999, authToken);

  test.info().annotations.push({
    type: 'known-deviation',
    description: 'The API returned 405 for an authenticated DELETE to a non-existing booking.'
  });
  expect(response.status()).toBe(405);
  expect(await response.text()).toBe('Method Not Allowed');
});
