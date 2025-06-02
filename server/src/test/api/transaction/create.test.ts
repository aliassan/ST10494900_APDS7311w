// src/test/api/transaction/create.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import { prisma } from '../../../utils/';
import server from '../../../config/server.config';
import jwt from 'jsonwebtoken';

describe('POST /api/transaction', () => {
  const TEST_ENDPOINT = '/api/transaction';
  let testUser: any;
  let validToken: string;

  // Test transaction data matching your controller expectations
  const TEST_TRANSACTION = {
    amount: 8000,
    sourceCurrency: 'ZAR',
    targetCurrency: 'USD',
    paymentMethod: 'SWIFT',
    recipientName: 'Recipient Name',
    recipientAccountNumber: '12345',
    recipientBankName: 'Test Bank',
    recipientSwiftCode: 'TESTSWIFTXXX',
    recipientCountry: 'Test Country',
    calculatedAmount: 258.92
  };

  beforeEach(async () => {
    // Create test user with unencrypted account number
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { reference: { contains: 'INV' }}
      }),
      prisma.user.deleteMany({ where: { accountNumber: 'TESTACC123' } })
    ])
		// await prisma.user.deleteMany({ where: { accountNumber: 'TESTACC123' } });
    testUser = await prisma.user.create({
      data: {
        fullName: 'Test User',
        accountNumber: 'TESTACC123', // Matches your current unencrypted storage
        idNumber: 'encrypted-id',
        passwordHash: 'hashed-password',
        isEmployee: false
      }
    });

    // Generate JWT with accountNumber claim
    validToken = jwt.sign(
      { accountNumber: testUser.accountNumber },
      process.env.SECRET_KEY!,
      { expiresIn: '1h' }
    );

		// await prisma.transaction.deleteMany({ /*where: { reference: { contains: 'INV' }}*/});
  });

  // beforeEach(async () => {
  //   // Clear transactions before each test
  //   await prisma.transaction.deleteMany({ where: { userId: testUser.id } });
  // });

  afterEach(async () => {
    // Cleanup
    await prisma.transaction.deleteMany({ /*where: { reference: { contains: 'INV' }}*/});
		await prisma.user.deleteMany({ where: { accountNumber: 'TESTACC123' }});
    // await prisma.user.deleteMany();
    // await prisma.$disconnect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  })

  it('should create transaction with valid reference format', async () => {
    const response = await request(server.getApp())
      .post(TEST_ENDPOINT)
      .set('Authorization', `Bearer ${validToken}`)
      .send(TEST_TRANSACTION);

    expect(response.status).toBe(200);
    
    const transaction = await prisma.transaction.findFirst();
    console.log("Generated reference:", transaction?.reference);
    // expect(transaction?.reference).toMatch(/^INV-[A-Z0-9]{8}$/); // INV-8RANDOM_CHARS
    expect(transaction?.reference).toContain('INV'); // INV-8RANDOM_CHARS
    // expect(transaction?.recipientSwiftCode).toBe(TEST_TRANSACTION.recipientSwiftCode); // INV-8RANDOM_CHARS
  });

  // it('should create transaction with valid reference format', async () => {
  //   // Freeze time for consistent testing
  //   const mockDate = new Date('2023-01-01T12:00:00Z');
  //   vi.useFakeTimers().setSystemTime(mockDate);

  //   const response = await request(server.getApp())
  //     .post(TEST_ENDPOINT)
  //     .set('Authorization', `Bearer ${validToken}`)
  //     .send(TEST_TRANSACTION);

  //   expect(response.status).toBe(200);
  //   expect(response.body).toEqual({ message: "success" });

  //   // Verify reference format (INV-YYYYMMDD-NNN)
  //   const transaction = await prisma.transaction.findFirst();
  //   expect(transaction?.reference).toMatch(/^INV-20230101-\d{3}$/);
    
  //   vi.useRealTimers();
  // });

  // it('should increment sequence numbers correctly', async () => {
  //   vi.useFakeTimers().setSystemTime(new Date('2023-01-01T12:00:00Z'));

  //   // Create 3 transactions
  //   for (let i = 0; i < 3; i++) {
  //     await request(server.getApp())
  //       .post(TEST_ENDPOINT)
  //       .set('Authorization', `Bearer ${validToken}`)
  //       .send(TEST_TRANSACTION);
  //   }

  //   const transactions = await prisma.transaction.findMany({
	// 		where: { userId: testUser.id },
  //     orderBy: { createdAt: 'asc' }
  //   });

  //   // Verify sequence numbers
  //   expect(transactions[0].reference).toBe('INV-20230101-001');
  //   expect(transactions[1].reference).toBe('INV-20230101-002');
  //   expect(transactions[2].reference).toBe('INV-20230101-003');
    
  //   vi.useRealTimers();
  // });

  // it('should reset counter at midnight', async () => {
  //   // Day 1 transaction
  //   vi.useFakeTimers().setSystemTime(new Date('2023-01-01T23:59:59Z'));
  //   await request(server.getApp())
  //     .post(TEST_ENDPOINT)
  //     .set('Authorization', `Bearer ${validToken}`)
  //     .send(TEST_TRANSACTION);

  //   // Day 2 transaction (1ms later)
  //   vi.setSystemTime(new Date('2023-01-02T00:00:00Z'));
  //   const response = await request(server.getApp())
  //     .post(TEST_ENDPOINT)
  //     .set('Authorization', `Bearer ${validToken}`)
  //     .send(TEST_TRANSACTION);

  //   const transactions = await prisma.transaction.findMany({
  //     orderBy: { createdAt: 'asc' }
  //   });

  //   expect(transactions[0]?.reference).toBe('INV-20230101-001');
  //   expect(transactions[1]?.reference).toBe('INV-20230102-001');
    
  //   vi.useRealTimers();
  // });

  it('should reject unauthorized requests', async () => {
    const response = await request(server.getApp())
      .post(TEST_ENDPOINT)
      .send(TEST_TRANSACTION);

    expect(response.status).toBe(401);
  });

  it('should return 404 for invalid account', async () => {
    const invalidToken = jwt.sign(
      { accountNumber: 'INVALID_ACCOUNT' },
      process.env.SECRET_KEY!,
      { expiresIn: '1h' }
    );

    const response = await request(server.getApp())
      .post(TEST_ENDPOINT)
      .set('Authorization', `Bearer ${invalidToken}`)
      .send(TEST_TRANSACTION);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});