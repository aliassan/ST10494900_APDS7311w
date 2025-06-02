import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import crypto from "crypto";
import * as utils from '../src/utils/security.util';

const prisma = new PrismaClient();

// --- SECURITY CHECKS --- //
function validatePassword(password: string): void {
  const complexityRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!complexityRegex.test(password)) {
    throw new Error(
      `Password must contain:\n` +
      `- 8+ characters\n` +
      `- 1 uppercase letter\n` +
      `- 1 lowercase letter\n` +
      `- 1 number\n` +
      `- 1 special character`
    );
  }
}

function whitelistInput(input: string, pattern: RegExp): string {
  if (!pattern.test(input)) {
    throw new Error(`Invalid input: Only ${pattern} allowed`);
  }
  return input;
}

// --- SEED LOGIC --- //
async function seedEmployee(
  name: string,
  account: string,
  id: string,
  password: string
) {
  // Whitelist alphanumeric + basic punctuation for names
  const sanitizedName = whitelistInput(name, /^[a-zA-Z\s\-\.]+$/);
  
  // Validate account format (EMPXXX)
  const sanitizedAccount = whitelistInput(account, /^EMP\d{3}$/);
  
  // Validate ID format (IDXXX)
  const sanitizedId = whitelistInput(id, /^ID\d{3}$/);
  
  // Password checks
  validatePassword(password);

	const hashedAccount = /*crypto
		.createHash("sha256")
		.update(sanitizedAccount)
		.digest("hex")*/ sanitizedAccount;

	const encryptedId = utils.encryptWithAES(sanitizedId);

  return prisma.user.upsert({
    where: { accountNumber: hashedAccount },
    update: {
			fullName: sanitizedName,
			accountNumber: hashedAccount,
			idNumber: encryptedId,
			passwordHash: await bcrypt.hash(password, 10),
			isEmployee: true
		},
    create: {
      fullName: sanitizedName,
      accountNumber: hashedAccount,
      idNumber: encryptedId,
      passwordHash: await bcrypt.hash(password, 10),
      isEmployee: true
    }
  });
}

async function main() {
  try {
    await seedEmployee(
      process.env.EMPLOYEE1_NAME!,
      process.env.EMPLOYEE1_ACCOUNT!,
      process.env.EMPLOYEE1_ID!,
      process.env.EMPLOYEE1_PASSWORD!
    );

    await seedEmployee(
      process.env.EMPLOYEE2_NAME!,
      process.env.EMPLOYEE2_ACCOUNT!,
      process.env.EMPLOYEE2_ID!,
      process.env.EMPLOYEE2_PASSWORD!
    );

    console.log('✅ Employees seeded securely');
  } catch (error) {
    console.error('❌ Seed failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main().finally(() => prisma.$disconnect());