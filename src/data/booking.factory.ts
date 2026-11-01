import type {
  BookingDates,
  BookingRequest,
  InvalidBookingPayload
} from '../types/booking.types.js';

export interface BookingOverrides {
  readonly firstname?: string;
  readonly lastname?: string;
  readonly totalprice?: number;
  readonly depositpaid?: boolean;
  readonly bookingdates?: Partial<BookingDates>;
  readonly additionalneeds?: string;
}

export type InvalidBookingScenario =
  'missing-firstname' | 'invalid-totalprice' | 'invalid-bookingdates' | 'empty-payload';

let sequence = 0;

export function createBooking(overrides: BookingOverrides = {}): BookingRequest {
  sequence += 1;
  const uniqueSuffix = `${Date.now()}-${sequence}`;
  const bookingdates: BookingDates = {
    checkin: overrides.bookingdates?.checkin ?? '2025-01-01',
    checkout: overrides.bookingdates?.checkout ?? '2025-01-10'
  };

  return {
    firstname: overrides.firstname ?? `Test-${uniqueSuffix}`,
    lastname: overrides.lastname ?? 'Booking',
    totalprice: overrides.totalprice ?? 120,
    depositpaid: overrides.depositpaid ?? true,
    bookingdates,
    ...(overrides.additionalneeds === undefined
      ? {}
      : { additionalneeds: overrides.additionalneeds })
  };
}

export function createInvalidBooking(scenario: InvalidBookingScenario): InvalidBookingPayload {
  switch (scenario) {
    case 'missing-firstname':
      return omit(createBooking(), 'firstname');
    case 'invalid-totalprice':
      return { ...createBooking(), totalprice: 'not-a-number' };
    case 'invalid-bookingdates':
      return { ...createBooking(), bookingdates: { checkin: 'invalid-date' } };
    case 'empty-payload':
      return {};
  }
}

function omit(payload: BookingRequest, key: keyof BookingRequest): InvalidBookingPayload {
  const result = { ...payload };
  delete result[key];
  return result;
}
