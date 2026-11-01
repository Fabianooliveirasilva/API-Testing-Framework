import type { JSONSchemaType } from 'ajv';

import type { Booking, BookingId, BookingResponse } from '../types/booking.types.js';
import { bookingSchema } from './booking.schema.js';

export const bookingResponseSchema: JSONSchemaType<BookingResponse> = {
  type: 'object',
  required: ['bookingid', 'booking'],
  additionalProperties: false,
  properties: {
    bookingid: { type: 'integer' },
    booking: bookingSchema as JSONSchemaType<Booking>
  }
};

export const bookingIdListSchema: JSONSchemaType<BookingId[]> = {
  type: 'array',
  items: {
    type: 'object',
    required: ['bookingid'],
    additionalProperties: false,
    properties: {
      bookingid: { type: 'integer' }
    }
  }
};
