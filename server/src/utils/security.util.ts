// import crypto from 'node:crypto';
import crypto from 'crypto';
import validator from 'validator';

// Configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ITERATIONS = 10000;
const KEY_LENGTH = 32;

// Get encryption key from environment variable
const ENCRYPTION_KEY = process.env.SECRET_KEY;

export function encryptWithAES(plaintext: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    throw new Error('ENCRYPTION_KEY environment variable must be at least 32 characters long');
  }
  if (!plaintext) return plaintext;

  // const iv = crypto.randomBytes(IV_LENGTH);
  // const key = Buffer.from(ENCRYPTION_KEY, 'hex');

  // const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  // const encrypted = Buffer.concat([
  //   cipher.update(plaintext, 'utf8'),
  //   cipher.final()
  // ]);
  // const tag = cipher.getAuthTag();

  // console.log('iv.length: ', iv.length);
  // console.log('tag.length: ', tag.length);
  // console.log('ecrypted.length: ', encrypted.length);

  // // Combine iv + tag + encrypted
  // return Buffer.concat([iv, tag, encrypted]).toString('base64');
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, ITERATIONS, KEY_LENGTH, 'sha512');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  // Combine all components into a single string
  return Buffer.concat([
    salt,
    iv,
    tag,
    Buffer.from(encrypted, 'hex')
  ]).toString('base64');
}

export function decryptWithAES(ciphertext: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    throw new Error('ENCRYPTION_KEY environment variable must be at least 32 characters long');
  }
  if (!ciphertext) return ciphertext;

  try {
    // console.log('ciphertext: ', ciphertext);
    // const data = Buffer.from(ciphertext, 'base64');

    // const iv = data.subarray(0, IV_LENGTH);
    // const tag = data.subarray(IV_LENGTH, IV_LENGTH + 16);
    // const encrypted = data.subarray(IV_LENGTH + 16);

    // console.log('iv.length[decrypt]: ', iv.length);
    // console.log('tag.length[decrypt]: ', tag.length);
    // console.log('ecrypted.length[decrypt]: ', encrypted.length);
  
    // const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  
    // const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    // decipher.setAuthTag(tag);
  
    // const decrypted = Buffer.concat([
    //   decipher.update(encrypted),
    //   decipher.final()
    // ]);
  
    // return decrypted.toString('utf8');
    const buffer = Buffer.from(ciphertext, 'base64');
  
    // Extract components from the buffer
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encryptedText = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, ITERATIONS, KEY_LENGTH, 'sha512');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedText, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Custom validation for ID number (adjust according to your country's ID format)
export function validateIdNumber(idNumber: string): boolean {
  if (!idNumber || typeof idNumber !== 'string') return false;
  
  // Basic length check (adjust based on your requirements)
  if (idNumber.length < 6 || idNumber.length > 20) return false;
  
  // Should contain only numbers (for most countries)
  if (!/^[A-Za-z0-9]{8,20}$/.test(idNumber)) return false;
  
  // Add country-specific validation logic here
  // For example, South Africa ID number validation:
  // return validateSAIDNumber(idNumber);
  
  return true;
}

// Custom validation for account number
export function validateAccountNumber(accountNumber: string): boolean {
  if (!accountNumber || typeof accountNumber !== 'string') return false;
  
  // Typical account number format (adjust based on your bank's requirements)
  if (accountNumber.length < 8 || accountNumber.length > 20) return false;
  
  // Should contain only alphanumeric characters
  if (!/^[a-zA-Z0-9]+$/.test(accountNumber)) return false;
  
  return true;
}

// Additional validation functions
export function validatePasswordStrength(password: string): boolean {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
}

// Example country-specific validation (South Africa)
function validateSAIDNumber(idNumber: string): boolean {
  if (idNumber.length !== 13) return false;
  
  // Check that the first 6 digits are a valid date
  const year = parseInt(idNumber.substring(0, 2));
  const month = parseInt(idNumber.substring(2, 4));
  const day = parseInt(idNumber.substring(4, 6));
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Validate checksum using Luhn algorithm
  return validateLuhnChecksum(idNumber);
}

function validateLuhnChecksum(value: string): boolean {
  let sum = 0;
  
  for (let i = 0; i < value.length - 1; i++) {
    let digit = parseInt(value[i]);
    
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
  }
  
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === parseInt(value[value.length - 1]);
}