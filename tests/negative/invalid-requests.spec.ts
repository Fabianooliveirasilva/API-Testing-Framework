import { test, expect } from '../../src/fixtures/api.fixture.js';

for (const [title, body, expectedStatus, expectedText] of [
  ['empty body', '', 400, 'Bad Request'],
  ['malformed JSON', '{"firstname":', 400, 'Bad Request']
] as const) {
  test(`should reject a ${title}`, async ({ apiClient }) => {
    const response = await apiClient.post('/booking', body, {
      headers: { 'Content-Type': 'application/json' }
    });

    expect(response.status()).toBe(expectedStatus);
    expect(await response.text()).toBe(expectedText);
  });
}

test('[observed] should return an internal error for text plain booking content', async ({
  apiClient
}) => {
  const response = await apiClient.post('/booking', JSON.stringify({}), {
    headers: { 'Content-Type': 'text/plain' }
  });

  test.info().annotations.push({
    type: 'known-deviation',
    description: 'The API returned HTTP 500 for a JSON body sent as text/plain.'
  });
  expect(response.status()).toBe(500);
  expect(await response.text()).toBe('Internal Server Error');
});

for (const id of ['abc', '999999999999999999999999', '/']) {
  test(`should return not found for invalid booking ID ${id}`, async ({ bookingClient }) => {
    const response = await bookingClient.getBookingById(id);

    expect(response.status()).toBe(404);
    expect(await response.text()).toBe('Not Found');
  });
}

for (const [path, body] of [
  ['/booking', 'GET, HEAD, POST'],
  ['/booking/1', 'DELETE, GET, HEAD, PATCH, PUT']
] as const) {
  test(`[observed] should describe supported methods for OPTIONS ${path}`, async ({
    apiClient
  }) => {
    const response = await apiClient.request('OPTIONS', path);

    expect(response.status()).toBe(200);
    expect(await response.text()).toBe(body);
  });
}

for (const [method, path, expectedStatus] of [
  ['PUT', '/booking', 404],
  ['DELETE', '/booking', 404],
  ['POST', '/booking/1', 404],
  ['HEAD', '/booking', 200],
  ['HEAD', '/booking/999999999', 404]
] as const) {
  test(`[observed] should return the observed status for ${method} ${path}`, async ({
    apiClient
  }) => {
    const response = await apiClient.request(method, path);

    expect(response.status()).toBe(expectedStatus);
  });
}
