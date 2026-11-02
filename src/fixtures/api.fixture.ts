import { test as base } from '@playwright/test';
import type { APIResponse } from '@playwright/test';

import { ApiClient } from '../clients/ApiClient.js';
import { AuthClient } from '../clients/AuthClient.js';
import { BookingClient } from '../clients/BookingClient.js';
import { environment } from '../config/environment.js';
import { getValidCredentials } from '../data/users.js';
import { createBooking } from '../data/booking.factory.js';
import type { BookingRequest } from '../types/booking.types.js';
import { bookingSchema } from '../schemas/booking.schema.js';
import { assertValid } from '../utils/schema-validator.js';

export interface CreatedBooking {
  readonly id: number;
  readonly booking: BookingRequest;
}

export interface BookingTracker {
  readonly track: (id: number) => void;
  readonly create: (
    payload: BookingRequest | Record<string, unknown>,
    options?: Parameters<BookingClient['createBooking']>[1]
  ) => Promise<{ response: APIResponse; id: number | undefined }>;
}

export interface ApiFixtures {
  readonly apiClient: ApiClient;
  readonly authClient: AuthClient;
  readonly bookingClient: BookingClient;
  readonly authToken: string;
  readonly bookingTracker: BookingTracker;
  readonly createdBooking: CreatedBooking;
}

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request, environment));
  },
  authClient: async ({ apiClient }, use) => {
    await use(new AuthClient(apiClient));
  },
  bookingClient: async ({ apiClient }, use) => {
    await use(new BookingClient(apiClient));
  },
  authToken: async ({ authClient }, use) => {
    await use(await authClient.getToken(getValidCredentials()));
  },
  bookingTracker: async ({ bookingClient, authClient }, use, testInfo) => {
    const ids = new Set<number>();
    const cleanupErrors: string[] = [];
    let deleted = 0;
    let alreadyGone = 0;
    let failed = 0;
    const tracker: BookingTracker = {
      track: (id) => ids.add(id),
      create: async (payload, options) => {
        const response = await bookingClient.createBooking(payload, options);
        const body = await readResponseJson(response);
        const id = extractBookingId(body);
        if (id !== undefined) {
          ids.add(id);
        }
        return { response, id };
      }
    };

    await use(tracker);

    if (ids.size === 0) {
      testInfo.annotations.push({
        type: 'cleanup',
        description: 'tracked=0 deleted=0 alreadyGone=0 failed=0'
      });
      return;
    }

    try {
      const token = await authClient.getToken(getValidCredentials());
      for (const id of ids) {
        try {
          const response = await bookingClient.deleteBooking(id, token);
          if (response.status() === 201) {
            deleted += 1;
          } else if ([404, 405].includes(response.status())) {
            alreadyGone += 1;
          } else {
            failed += 1;
            cleanupErrors.push(
              `DELETE booking ${id} returned unexpected HTTP ${response.status()}`
            );
          }
        } catch (error) {
          failed += 1;
          const message = error instanceof Error ? error.message : 'unknown cleanup failure';
          cleanupErrors.push(`DELETE booking ${id} failed: ${message}`);
        }
      }
    } catch (error) {
      failed += ids.size;
      const message = error instanceof Error ? error.message : 'unknown authentication failure';
      cleanupErrors.push(`cleanup authentication failed: ${message}`);
    } finally {
      testInfo.annotations.push({
        type: 'cleanup',
        description: `tracked=${ids.size} deleted=${deleted} alreadyGone=${alreadyGone} failed=${failed}`
      });
    }

    if (cleanupErrors.length > 0) {
      for (const message of cleanupErrors) {
        console.warn(message);
      }
      throw new Error(`Booking cleanup failed: ${cleanupErrors.join('; ')}`);
    }
  },
  createdBooking: async ({ bookingTracker }, use) => {
    const payload = createBooking();
    const { response, id } = await bookingTracker.create(payload);
    const body = await readResponseJson(response);

    if (
      response.status() !== 200 ||
      id === undefined ||
      typeof body !== 'object' ||
      body === null
    ) {
      throw new Error(
        'Created booking response did not contain status 200, bookingid, and payload.'
      );
    }
    if (!('booking' in body) || body.booking === undefined) {
      throw new Error('Created booking response did not contain the booking payload.');
    }
    assertValid<BookingRequest>(body.booking, bookingSchema);
    await use({ id, booking: body.booking });
  }
});

async function readResponseJson(response: APIResponse): Promise<unknown> {
  try {
    return JSON.parse(await response.text()) as unknown;
  } catch {
    return undefined;
  }
}

function extractBookingId(value: unknown): number | undefined {
  if (
    typeof value === 'object' &&
    value !== null &&
    'bookingid' in value &&
    typeof value.bookingid === 'number'
  ) {
    return value.bookingid;
  }
  return undefined;
}

export { expect } from '@playwright/test';
