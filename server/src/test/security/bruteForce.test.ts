// test/security/bruteForce.test.ts
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import server from '../../config/server.config';

describe('Brute Force Protection', () => {
  const TEST_ENDPOINT = '/api/auth/login';
  const TEST_CREDENTIALS = (i: number) => ({
    email: `user${i}@example.com`,
    password: 'wrongpassword'
  });

  it('should block after exceeding rate limit', async () => {
    // Make max allowed requests (adjust 5 to match your config)
    for (let i = 0; i < 5; i++) {
      await request(server.getApp())
        .post(TEST_ENDPOINT)
        .send(TEST_CREDENTIALS(i));
    }

    // Next request should be blocked
    const blockedResponse = await request(server.getApp())
      .post(TEST_ENDPOINT)
      .send(TEST_CREDENTIALS(6));

    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.text).toContain('Too many login attempts');
  });

  it('should include rate limit headers', async () => {
    const response = await request(server.getApp())
      .post(TEST_ENDPOINT)
      .send(TEST_CREDENTIALS(0));

    expect(response.headers).toMatchObject({
      'x-ratelimit-limit': expect.any(String),
      'x-ratelimit-remaining': expect.any(String),
      'x-ratelimit-reset': expect.any(String)
    });
  });
});