import { createBooking } from './booking.factory.js';

export function createDefaultBooking() {
  return createBooking({
    firstname: 'Default',
    lastname: 'Booking'
  });
}

export function createDefaultBookingFilters() {
  const booking = createDefaultBooking();
  return {
    firstname: booking.firstname,
    lastname: booking.lastname
  } as const;
}
