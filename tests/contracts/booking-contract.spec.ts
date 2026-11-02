import { test, expect } from '../../src/fixtures/api.fixture.js';
import { getValidCredentials } from '../../src/data/users.js';
import { authenticationResponseSchema } from '../../src/schemas/auth.schema.js';
import {
  bookingIdListSchema,
  bookingResponseSchema
} from '../../src/schemas/booking-response.schema.js';
import { bookingSchema } from '../../src/schemas/booking.schema.js';
import { validateJsonSchema } from '../../src/utils/response-validator.js';
import { SchemaValidator } from '../../src/utils/schema-validator.js';

test('should validate the authentication response contract', async ({ authClient }) => {
  const response = await authClient.createToken(getValidCredentials());
  const validation = await validateJsonSchema(response, authenticationResponseSchema);

  expect(response.status()).toBe(200);
  expect(validation.valid, validation.errors.join('; ')).toBe(true);
});

test('should validate the booking creation response contract', async ({ bookingTracker }) => {
  const { response, id } = await bookingTracker.create({
    firstname: 'Contract',
    lastname: 'Booking',
    totalprice: 100,
    depositpaid: true,
    bookingdates: { checkin: '2025-01-01', checkout: '2025-01-10' }
  });
  const validation = await validateJsonSchema(response, bookingResponseSchema);

  expect(id).toBeGreaterThan(0);
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

test('should reject a malformed booking object', () => {
  const validation = new SchemaValidator().validate(bookingSchema, {
    firstname: 'Only first name'
  });

  expect(validation.valid).toBe(false);
  expect(validation.errors.length).toBeGreaterThan(0);
});
