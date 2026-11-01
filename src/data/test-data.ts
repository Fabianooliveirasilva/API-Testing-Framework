import { createBooking } from './booking.factory.js';
import { randomUUID } from 'node:crypto';

export function createIndependentBooking() {
  return createBooking({
    firstname: `Test-${randomUUID()}`,
    lastname: `Booking-${randomUUID()}`
  });
}
