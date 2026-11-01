export interface BookingDates {
  readonly checkin: string;
  readonly checkout: string;
}

export interface BookingRequest {
  readonly firstname: string;
  readonly lastname: string;
  readonly totalprice: number;
  readonly depositpaid: boolean;
  readonly bookingdates: BookingDates;
  readonly additionalneeds?: string;
}

export type Booking = BookingRequest;

export interface BookingResponse {
  readonly bookingid: number;
  readonly booking: Booking;
}

export interface BookingId {
  readonly bookingid: number;
}

export type InvalidBookingPayload = Record<string, unknown>;
