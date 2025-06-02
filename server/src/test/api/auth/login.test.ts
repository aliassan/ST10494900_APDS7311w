// src/test/api/auth/login.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import server from '../../../config/server.config';
import { prisma } from '../../../utils/';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { encryptWithAES } from '../../../utils/';

describe('POST /api/auth - User Login', () => {
  const TEST_ENDPOINT = '/api/auth';
  const TEST_ACCOUNT = '1234567890';
  const TEST_PASSWORD = 'SecurePass123!';
  const TEST_ID_NUMBER = 'A12345678';
  let testUser: any;

  beforeEach(async () => {
		vi.mock('express-rate-limit', () => ({
      default: vi.fn(() => (req, res, next) => next())
    }));
		// await prisma.user.deleteMany({ where: { accountNumber: TEST_ACCOUNT } });
    // Create test user with encrypted data
    testUser = await prisma.user.create({
      data: {
        fullName: 'Test User',
        accountNumber: TEST_ACCOUNT, // Note: Your implementation stores this unencrypted
        idNumber: encryptWithAES(TEST_ID_NUMBER),
        passwordHash: await bcrypt.hash(TEST_PASSWORD, 12),
        isEmployee: false
      }
    });
  });

  afterEach(async () => {
		vi.restoreAllMocks();
    await prisma.user.deleteMany({ where: { accountNumber: TEST_ACCOUNT } });
    await prisma.$disconnect();
  });

	it('should login with valid credentials', async () => {
    const response = await request(server.getApp())
      .post(TEST_ENDPOINT)
      .send({
        accountNumber: TEST_ACCOUNT,
        password: TEST_PASSWORD
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: testUser.id,
      fullName: 'Test User',
      accountNumber: TEST_ACCOUNT,
      idNumber: TEST_ID_NUMBER, // Decrypted
      isEmployee: false,
      authToken: expect.any(String)
    });

    // Verify JWT
    const decoded = jwt.verify(response.body.authToken, process.env.SECRET_KEY!);
    expect(decoded).toMatchObject({
      accountNumber: TEST_ACCOUNT,
      userId: testUser.id
    });
  });

	it('should reject invalid password', async () => {
    const response = await request(server.getApp())
      .post(TEST_ENDPOINT)
      .send({
        accountNumber: TEST_ACCOUNT,
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid password');
  });

  it('should reject unknown account number', async () => {
    const response = await request(server.getApp())
      .post(TEST_ENDPOINT)
      .send({
        accountNumber: '0000000000',
        password: TEST_PASSWORD
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

	it('should return valid JWT structure', async () => {
    const response = await request(server.getApp())
      .post(TEST_ENDPOINT)
      .send({
        accountNumber: TEST_ACCOUNT,
        password: TEST_PASSWORD
      });

    const token = response.body.authToken;
    const decoded = jwt.verify(token, process.env.SECRET_KEY!);

    expect(decoded).toMatchObject({
      accountNumber: TEST_ACCOUNT,
      userId: testUser.id,
      exp: expect.any(Number),
      iat: expect.any(Number)
    });

    // Verify 15m expiry
    const expiry = (decoded as any).exp - (decoded as any).iat;
    expect(expiry).toBe(15 * 60);
  });

  it('should require both fields', async () => {
    const tests = [
      { accountNumber: '', password: TEST_PASSWORD },
      { accountNumber: TEST_ACCOUNT, password: '' },
      { accountNumber: '', password: '' }
    ];

    for (const test of tests) {
      const response = await request(server.getApp())
        .post(TEST_ENDPOINT)
        .send(test);

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/missing/i);
    }
  });
});