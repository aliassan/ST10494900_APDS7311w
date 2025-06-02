// src/test/api/transaction/get.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import { prisma } from '../../../utils';
import server from '../../../config/server.config';
import jwt from 'jsonwebtoken';

describe('GET /api/transaction', () => {
  const TEST_ENDPOINT = '/api/transaction';
  let regularUser: any;
  let employeeUser: any;
  let regularToken: string;
  let employeeToken: string;

  beforeEach(async () => {
    // Create test users
    regularUser = await prisma.user.create({
      data: {
        fullName: 'Test Customer',
        accountNumber: 'REGULAR123',
        idNumber: 'encrypted-reg',
        passwordHash: 'hash',
        isEmployee: false
      }
    });

    employeeUser = await prisma.user.create({
      data: {
        fullName: 'Test Employee',
        accountNumber: 'EMPLOYEE123',
        idNumber: 'encrypted-emp',
        passwordHash: 'hash',
        isEmployee: true
      }
    });

    // Generate tokens
    regularToken = jwt.sign(
      { accountNumber: regularUser.accountNumber },
      process.env.SECRET_KEY!,
      { expiresIn: '1h' }
    );

    employeeToken = jwt.sign(
      { accountNumber: employeeUser.accountNumber },
      process.env.SECRET_KEY!,
      { expiresIn: '1h' }
    );

    // Create test transactions
    await prisma.transaction.createMany({
			data: [
				{
					userId: regularUser.id,
					amount: 8000,
					sourceCurrency: 'ZAR',
					targetCurrency: 'USD',
					paymentMethod: 'SWIFT',
					recipientName: 'Recipient One',
					recipientAccountNumber: 'ACC123456',
					recipientBankName: 'International Bank',
					recipientSwiftCode: 'INTLGB2L',
					recipientCountry: 'United Kingdom',
					calculatedAmount: 432.10,
					reference: 'INV-20221231-001'
				},
				{
					userId: regularUser.id,
					amount: 5000,
					sourceCurrency: 'EUR',
					targetCurrency: 'ZAR',
					paymentMethod: 'SEPA',
					recipientName: 'Recipient Two',
					recipientAccountNumber: 'ACC789012',
					recipientBankName: 'Euro Bank',
					recipientSwiftCode: 'EUROPDEFF',
					recipientCountry: 'Germany',
					calculatedAmount: 98000.50,
					reference: 'INV-20221231-002'
				},
				{
					userId: employeeUser.id,
					amount: 10000,
					sourceCurrency: 'USD',
					targetCurrency: 'GBP',
					paymentMethod: 'SWIFT',
					recipientName: 'Recipient Three',
					recipientAccountNumber: 'ACC345678',
					recipientBankName: 'Global Bank',
					recipientSwiftCode: 'GLOBUS33',
					recipientCountry: 'United States',
					calculatedAmount: 8250.75,
					reference: 'INV-20221231-003'
				}
			]
    });
  });

  afterEach(async () => {
    await prisma.$transaction([
      prisma.transaction.deleteMany({ /*where: { reference: { contains: 'INV' } }*/ }),
      prisma.user.deleteMany({ where: { fullName: { contains: 'Test' } } })
    ])

    // await prisma.transaction.deleteMany({ where: { reference: { contains: 'INV' } } });
    // await prisma.user.deleteMany({ where: { fullName: { contains: 'Test' } } });
    await prisma.$disconnect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return only own transactions for regular users', async () => {
    const response = await request(server.getApp())
      .get(TEST_ENDPOINT)
      .set('Authorization', `Bearer ${regularToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    response.body.forEach((tx: any) => {
      expect(tx.userId).toBe(regularUser.id);
    });
  });

  it('should return all transactions for employees', async () => {
    const response = await request(server.getApp())
      .get(TEST_ENDPOINT)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
    expect(response.body[0]).toMatchObject({
      user: {
        accountNumber: expect.any(String),
        fullName: expect.any(String)
      }
    });
  });

  it('should return transactions in descending order', async () => {
    const response = await request(server.getApp())
      .get(TEST_ENDPOINT)
      .set('Authorization', `Bearer ${employeeToken}`);

    const transactions = response.body;
    for (let i = 0; i < transactions.length - 1; i++) {
      const currentDate = new Date(transactions[i].createdAt);
      const nextDate = new Date(transactions[i + 1].createdAt);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });

  it('should reject unauthorized requests', async () => {
    const response = await request(server.getApp())
      .get(TEST_ENDPOINT);

    expect(response.status).toBe(401);
  });

  it('should handle empty results', async () => {
    // Clear transactions for this test only
    await prisma.transaction.deleteMany({ where: { reference: { contains: 'INV' } } });

    const response = await request(server.getApp())
      .get(TEST_ENDPOINT)
      .set('Authorization', `Bearer ${regularToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);

    // // Recreate transactions for other tests
    // await prisma.transaction.createMany({
    //   data: [
    //     // ... (same test data as before)
    //   ]
    // });
  });
});