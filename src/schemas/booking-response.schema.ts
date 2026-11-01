import type { JSONSchemaType } from 'ajv';

import type { BookingId, BookingResponse } from '../types/booking.types.js';

export const bookingResponseSchema: JSONSchemaType<BookingResponse> = {
  type: 'object',
  required: ['bookingid', 'booking'],
  additionalProperties: false,
  properties: {
    bookingid: { type: 'integer' },
    booking: {
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
    }
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
