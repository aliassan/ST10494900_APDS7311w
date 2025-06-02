// server/src/test/security/rateLimiting.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import server from '../../config/server.config';

describe('Rate Limiting', () => {
  const TEST_ENDPOINT = '/api/transactions/'; // An endpoint with stricter limits

  it('should allow requests under 100', async () => {
    // First 100 requests should succeed (auth routes have max:5)
    for (let i = 0; i < 100; i++) {
      const response = await request(server.getApp())
        .post(TEST_ENDPOINT)
        .send({ email: `test${i}@example.com`, password: 'password' });
      expect(response.status).not.toEqual(429);
    }
  });

  it('should block requests over 100', async () => {
    // Exceed the rate limit (100th request)
    for (let i = 0; i < 100; i++) {
      await request(server.getApp())
        .post(TEST_ENDPOINT)
        .send({ email: `test${i}@example.com`, password: 'password' });
    }

    const response = await request(server.getApp())
      .post(TEST_ENDPOINT)
      .send({ email: 'blocked@example.com', password: 'password' });

    expect(response.status).toEqual(429);
    expect(response.text).toContain('Too many requests from this IP');
  });
});