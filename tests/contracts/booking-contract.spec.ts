import { test, expect } from '../../src/fixtures/api.fixture.js';
import { getValidCredentials } from '../../src/data/users.js';
import { authenticationResponseSchema } from '../../src/schemas/auth.schema.js';
import {
  bookingIdListSchema,
  bookingResponseSchema
} from '../../src/schemas/booking-response.schema.js';
import { bookingSchema } from '../../src/schemas/booking.schema.js';
import { validateJsonSchema } from '../../src/utils/response-validator.js';

test('should validate the authentication response contract', async ({ authClient }) => {
  const response = await authClient.createToken(getValidCredentials());
  const validation = await validateJsonSchema(response, authenticationResponseSchema);

  expect(response.status()).toBe(200);
  expect(validation.valid, validation.errors.join('; ')).toBe(true);
});

test('should validate the booking creation response contract', async ({
  bookingClient,
  createdBooking,
  bookingTracker
}) => {
  const response = await bookingClient.createBooking(createdBooking.booking);
  const validation = await validateJsonSchema(response, bookingResponseSchema);
  const body = (await response.json()) as { bookingid?: number };

  if (typeof body.bookingid === 'number') {
    bookingTracker.track(body.bookingid);
    expect(body.bookingid).toBeGreaterThan(0);
  }
  expect(response.status()).toBe(200);
  expect(validation.valid, validation.errors.join('; ')).toBe(true);
});

test('should validate the booking by ID response contract', async ({
  bookingClient,
  createdBooking
}) => {
  const response = await bookingClient.getBookingById(createdBooking.id);
  const validation = await validateJsonSchema(response, bookingSchema);

  expect(response.status()).toBe(200);
  expect(validation.valid, validation.errors.join('; ')).toBe(true);
});

test('should validate the booking ID list contract', async ({ bookingClient }) => {
  const response = await bookingClient.getAllBookingIds();
  const validation = await validateJsonSchema(response, bookingIdListSchema);

  expect(response.status()).toBe(200);
  expect(validation.valid, validation.errors.join('; ')).toBe(true);
});

test('should reject a malformed booking object', async () => {
  const validation = await import('../../src/utils/schema-validator.js').then(
    ({ SchemaValidator }) =>
      new SchemaValidator().validate(bookingSchema, { firstname: 'Only first name' })
  );

  expect(validation.valid).toBe(false);
  expect(validation.errors.length).toBeGreaterThan(0);
});
