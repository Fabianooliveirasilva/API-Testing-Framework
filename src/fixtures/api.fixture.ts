import { test as base } from '@playwright/test';

import { ApiClient } from '../clients/ApiClient.js';
import { AuthClient } from '../clients/AuthClient.js';
import { BookingClient } from '../clients/BookingClient.js';
import { environment } from '../config/environment.js';

export interface ApiFixtures {
  readonly apiClient: ApiClient;
  readonly authClient: AuthClient;
  readonly bookingClient: BookingClient;
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
  }
});

export { expect } from '@playwright/test';
