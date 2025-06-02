// test/security/cors.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import server from '../../config/server.config';

describe('CORS Configuration', () => {
  it('should reject requests from unauthorized origins', async () => {
    const response = await request(server.getApp())
      .get('/api/user/')
      .set('Origin', 'http://malicious-site.com');
    
    expect(response.headers['access-control-allow-origin']).not.toEqual('*');
    expect(response.status).not.toEqual(200);
  });

  it('should allow requests from the configured FRONTEND_URL', async () => {
    const validOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
    const response = await request(server.getApp())
      .get('/api/user/')
      .set('Origin', validOrigin);
    
    expect(response.headers['access-control-allow-origin']).toEqual(validOrigin);
  });
});