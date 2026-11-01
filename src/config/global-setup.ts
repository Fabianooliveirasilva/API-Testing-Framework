import { getConfiguredCredentials } from './environment.js';

export default function globalSetup(): void {
  try {
    getConfiguredCredentials();
  } catch {
    throw new Error(
      'API_USERNAME and API_PASSWORD must be configured together before running the API tests.'
    );
  }
}
