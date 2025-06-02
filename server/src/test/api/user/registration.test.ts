// src/test/api/user/registration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import server from '../../../config/server.config';
import { prisma } from '../../../utils/';
import bcrypt from 'bcrypt';

describe('POST /api/user - User Registration', () => {
  const TEST_ENDPOINT = '/api/user';
  const SAMPLE_USER = {
    fullName: 'John Doe',
    accountNumber: '0123456789',
    idNumber: 'A12345678',
    password: 'SecurePass123!'
  };

  beforeAll(async () => {
    // Ensure clean state
    await prisma.user.deleteMany({ where: { accountNumber: SAMPLE_USER.accountNumber } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { accountNumber: SAMPLE_USER.accountNumber } });
    await prisma.$disconnect();
  });

  it('should successfully register a new user', async () => {
    const response = await request(server.getApp())
      .post(TEST_ENDPOINT)
      .send(SAMPLE_USER);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'User added successfully'
    });

    // Verify database record
    const dbUser = await prisma.user.findFirst({
      where: { accountNumber: SAMPLE_USER.accountNumber }
    });
    
    expect(dbUser).toBeTruthy();
    expect(dbUser?.fullName).toBe(SAMPLE_USER.fullName);
    expect(await bcrypt.compare(SAMPLE_USER.password, dbUser?.passwordHash || '')).toBe(true);
  });

  it('should reject missing required fields', async () => {
    const tests = [
      { field: 'fullName', value: '' },
      { field: 'accountNumber', value: '' },
      { field: 'idNumber', value: '' },
      { field: 'password', value: '' }
    ];

    for (const test of tests) {
      const userData = { ...SAMPLE_USER, [test.field]: test.value };
      const response = await request(server.getApp())
        .post(TEST_ENDPOINT)
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('All fields are required');
    }
  });

  it('should validate input formats', async () => {
    const testCases = [
      { field: 'fullName', value: 'A', message: 'Full name must be between 2 and 100 characters' },
      { field: 'accountNumber', value: '123', message: 'Invalid account number format' },
      { field: 'idNumber', value: '123', message: 'Invalid ID number format' },
      { field: 'password', value: 'weak', message: 'Password does not meet complexity requirements' }
    ];

    for (const test of testCases) {
      const userData = { ...SAMPLE_USER, [test.field]: test.value };
      const response = await request(server.getApp())
        .post(TEST_ENDPOINT)
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(test.message);
    }
  });

  it('should prevent duplicate accountNumber or idNumber', async () => {
    // Create existing user first
    await request(server.getApp())
      .post(TEST_ENDPOINT)
      .send(SAMPLE_USER);

    // Test duplicate account
    const duplicateAccount = { 
      ...SAMPLE_USER, 
      idNumber: 'B98765432' 
    };
    const res1 = await request(server.getApp())
      .post(TEST_ENDPOINT)
      .send(duplicateAccount);
    expect(res1.status).toBe(409);
    expect(res1.body.message).toBe('Account number or ID number already exists');

    // Test duplicate ID
    // const duplicateId = { 
    //   ...SAMPLE_USER, 
    //   accountNumber: '9876543210' 
    // };
    // const res2 = await request(server.getApp())
    //   .post(TEST_ENDPOINT)
    //   .send(duplicateId);
    // expect(res2.status).toBe(409);
  });
});