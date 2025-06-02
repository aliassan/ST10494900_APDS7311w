// test/security/headers.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import server from '../../config/server.config'; // ESM imports work natively

describe('Security Headers', () => {
  it('should include Helmet headers', async () => {
    const response = await request(server.getApp())
      .post('/api/auth/login') // Use your actual endpoint
      // .expect(200);

    // 1. Test for REQUIRED headers only
    expect(response.headers).toMatchObject({
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'x-dns-prefetch-control': 'off',
			'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
			// 'x-xss-protection': '1; mode=block',
    });
  });
});