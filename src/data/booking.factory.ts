import type {
  BookingDates,
  BookingRequest,
  InvalidBookingPayload
} from '../types/booking.types.js';
import { randomUUID } from 'node:crypto';

export interface BookingOverrides {
  readonly firstname?: string;
  readonly lastname?: string;
  readonly totalprice?: number;
  readonly depositpaid?: boolean;
  readonly bookingdates?: Partial<BookingDates>;
  readonly additionalneeds?: string;
}

export type InvalidBookingScenario =
  | 'missing-firstname'
  | 'missing-lastname'
  | 'missing-totalprice'
  | 'missing-depositpaid'
  | 'missing-bookingdates'
  | 'invalid-firstname'
  | 'invalid-lastname'
  | 'invalid-totalprice'
  | 'invalid-depositpaid'
  | 'invalid-bookingdates'
  | 'invalid-date'
  | 'empty-payload';

export function createBooking(overrides: BookingOverrides = {}): BookingRequest {
  const uniqueSuffix = randomUUID();
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
    case 'missing-lastname':
      return omit(createBooking(), 'lastname');
    case 'missing-totalprice':
      return omit(createBooking(), 'totalprice');
    case 'missing-depositpaid':
      return omit(createBooking(), 'depositpaid');
    case 'missing-bookingdates':
      return omit(createBooking(), 'bookingdates');
    case 'invalid-firstname':
      return { ...createBooking(), firstname: 123 };
    case 'invalid-lastname':
      return { ...createBooking(), lastname: 123 };
    case 'invalid-totalprice':
      return { ...createBooking(), totalprice: 'not-a-number' };
    case 'invalid-depositpaid':
      return { ...createBooking(), depositpaid: 'not-a-boolean' };
    case 'invalid-bookingdates':
      return { ...createBooking(), bookingdates: { checkin: 'invalid-date' } };
    case 'invalid-date':
      return {
        ...createBooking(),
        bookingdates: { checkin: 'not-a-date', checkout: 'not-a-date' }
      };
    case 'empty-payload':
      return {};
  }
}

function omit(payload: BookingRequest, key: keyof BookingRequest): InvalidBookingPayload {
  const result = { ...payload };
  delete result[key];
  return result;
}
