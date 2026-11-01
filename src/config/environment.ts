import 'dotenv/config';

const DEFAULT_BASE_URL = 'https://restful-booker.herokuapp.com';
const DEFAULT_API_TIMEOUT = 15_000;

export interface EnvironmentConfig {
  readonly baseUrl: string;
  readonly username: string | undefined;
  readonly password: string | undefined;
  readonly apiTimeout: number;
}

function parseBaseUrl(value: string | undefined): string {
  const baseUrl = value ?? DEFAULT_BASE_URL;

  try {
    new URL(baseUrl);
  } catch {
    throw new Error('BASE_URL must be a valid absolute URL.');
  }

  return baseUrl.replace(/\/+$/, '');
}

function parseTimeout(value: string | undefined): number {
  if (value === undefined) {
    return DEFAULT_API_TIMEOUT;
  }

  const timeout = Number(value);
  if (!Number.isInteger(timeout) || timeout <= 0) {
    throw new Error('API_TIMEOUT must be a positive integer in milliseconds.');
  }

  return timeout;
}

const username = process.env.API_USERNAME;
const password = process.env.API_PASSWORD;

if ((username === undefined) !== (password === undefined)) {
  throw new Error('API_USERNAME and API_PASSWORD must be provided together.');
}

export const environment: EnvironmentConfig = {
  baseUrl: parseBaseUrl(process.env.BASE_URL),
  username,
  password,
  apiTimeout: parseTimeout(process.env.API_TIMEOUT)
};

export function getConfiguredCredentials(): { username: string; password: string } {
  if (environment.username === undefined || environment.password === undefined) {
    throw new Error('API_USERNAME and API_PASSWORD are required for authenticated scenarios.');
  }

  return {
    username: environment.username,
    password: environment.password
  };
}
