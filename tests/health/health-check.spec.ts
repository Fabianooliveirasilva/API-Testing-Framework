import { test, expect } from '../../src/fixtures/api.fixture.js';

test('should report API health availability', async ({ apiClient }, testInfo) => {
  const startedAt = performance.now();
  const response = await apiClient.get('/ping');
  const elapsedMilliseconds = performance.now() - startedAt;

  testInfo.annotations.push({
    type: 'response-time',
    description: `${elapsedMilliseconds.toFixed(2)} ms`
  });

  // Restful Booker documents /ping as a health endpoint and the observed API returns 201.
  expect(response.status()).toBe(201);
  expect(await response.text()).toBe('Created');
});
