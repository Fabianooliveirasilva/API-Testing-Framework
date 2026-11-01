import { test as base } from '@playwright/test';

import { ApiClient } from '../clients/ApiClient.js';
import { AuthClient } from '../clients/AuthClient.js';
import { BookingClient } from '../clients/BookingClient.js';
import { environment } from '../config/environment.js';
import { getValidCredentials } from '../data/users.js';
import { createBooking } from '../data/booking.factory.js';
import type { BookingRequest } from '../types/booking.types.js';

export interface CreatedBooking {
  readonly id: number;
  readonly booking: BookingRequest;
}

export interface BookingTracker {
  readonly track: (id: number) => void;
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
    const tracker: BookingTracker = {
      track: (id) => ids.add(id)
    };

    await use(tracker);

    try {
      const token = await authClient.getToken(getValidCredentials());
      for (const id of ids) {
        try {
          const response = await bookingClient.deleteBooking(id, token);
          if (![201, 404, 405].includes(response.status())) {
            cleanupErrors.push(
              `DELETE booking ${id} returned unexpected HTTP ${response.status()}`
            );
          } else {
            deleted += 1;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'unknown cleanup failure';
          cleanupErrors.push(`DELETE booking ${id} failed: ${message}`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown authentication failure';
      cleanupErrors.push(`cleanup authentication failed: ${message}`);
    } finally {
      testInfo.annotations.push({
        type: 'cleanup',
        description: `tracked=${ids.size} deleted=${deleted}`
      });
    }

    if (cleanupErrors.length > 0) {
      for (const message of cleanupErrors) {
        console.warn(message);
      }
      throw new Error(`Booking cleanup failed: ${cleanupErrors.join('; ')}`);
    }
  },
  createdBooking: async ({ bookingClient, bookingTracker }, use) => {
    const payload = createBooking();
    const response = await bookingClient.createBooking(payload);
    const body = (await response.json()) as { bookingid?: number; booking?: BookingRequest };

    if (typeof body.bookingid !== 'number' || body.booking === undefined) {
      throw new Error('Created booking response did not contain a valid booking ID and booking.');
    }

    bookingTracker.track(body.bookingid);
    await use({ id: body.bookingid, booking: body.booking });
  }
});

export { expect } from '@playwright/test';
