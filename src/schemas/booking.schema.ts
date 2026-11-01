import type { JSONSchemaType } from 'ajv';

import type { BookingRequest } from '../types/booking.types.js';

export const bookingSchema: JSONSchemaType<BookingRequest> = {
  type: 'object',
  required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
  additionalProperties: false,
  properties: {
    firstname: { type: 'string' },
    lastname: { type: 'string' },
    totalprice: { type: 'number' },
    depositpaid: { type: 'boolean' },
    bookingdates: {
      type: 'object',
      required: ['checkin', 'checkout'],
      additionalProperties: false,
      properties: {
        checkin: { type: 'string' },
        checkout: { type: 'string' }
      }
    },
    additionalneeds: { type: 'string', nullable: true }
  }
};
