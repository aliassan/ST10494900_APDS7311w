import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import * as utils from "../utils";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

export const getUser = async (req: Request, res: Response) => {
  const { accountNumber } = req.params;
  const password = req.body.password;
  try {
    if (!accountNumber)
      return utils.errorResponse(401, "Get user error: Missing user address", res);

    console.log(`Getting user "${accountNumber}"...`);

    const user = await prisma.user.findUnique({
      where: {
        accountNumber: /*crypto
          .createHash("sha256")
          .update(accountNumber)
          .digest("hex")*/ utils.encryptWithAES(accountNumber),
      },
    });

    if (!user) return utils.errorResponse(404, "User not found", res);

    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return utils.errorResponse(401, "Invalid password", res);
    }

    const decryptedUser = {
      id: user.id,
      fullName: user.fullName,
      accountNumber: accountNumber,
      idNumber: utils.decryptWithAES( user.idNumber ),
      isEmployee: user.isEmployee,
    }

    console.log("User found: ", decryptedUser);

    res.status(200).json(decryptedUser);
  } catch (error) {
    return utils.errorResponse(500, error, res);
  } finally {
    await prisma.$disconnect();
  }
};

export const addUser = async (req: Request, res: Response) => {
  // const { address } = req.params;
  const data = req.body;
  // const callerAddress = (req as any).address;

  try {
    // Step 9: Server Validation
    if (!data.fullName || !data.accountNumber || !data.idNumber || !data.password) {
      return utils.errorResponse(400, "All fields are required", res);
    }

    // Validate input formats
    if (!validator.isLength(data.fullName, { min: 2, max: 100 })) {
      return utils.errorResponse(400, "Full name must be between 2 and 100 characters", res);
    }

    if (!utils.validateAccountNumber(data.accountNumber)) {
      return utils.errorResponse(400, "Invalid account number format", res);
    }

    if (!utils.validateIdNumber(data.idNumber)) {
      return utils.errorResponse(400, "Invalid ID number format", res);
    }

    if (!utils.validatePasswordStrength(data.password)) {
      return utils.errorResponse(400, "Password does not meet complexity requirements", res);
    }

    // Check for duplicate accountNumber or idNumber
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { accountNumber: data.accountNumber },
          { idNumber: data.idNumber }
        ]
      }
    });

    if (existingUser) {
      return utils.errorResponse(409, "Account number or ID number already exists", res);
    }

    // Step 10: Server Sanitization
    const sanitizedData = {
      fullName: validator.escape(data.fullName.trim()),
      accountNumber: validator.escape(data.accountNumber.trim()),
      idNumber: validator.escape(data.idNumber.trim()),
      password: data.password // Will be hashed, no need to escape
    };

    // Step 11: Hash Password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(sanitizedData.password, saltRounds);

    // Step 12: Encrypt PII
    const encryptedIdNumber = utils.encryptWithAES(sanitizedData.idNumber);
    // const encryptedAccountNumber = crypto
    //   .createHash("sha256")
    //   .update(sanitizedData.accountNumber)
    //   .digest("hex");
    const encryptedAccountNumber = sanitizedData.accountNumber;

    const encryptedData = {
      fullName: sanitizedData.fullName,
      accountNumber: encryptedAccountNumber,
      idNumber: encryptedIdNumber,
      passwordHash: passwordHash
    }

    // console.log("Sanitized & Encrypted Data: ", { ...encryptedData });

    // Step 13: Store Data
    const newUser = await prisma.user.create({
      data: {
        fullName: sanitizedData.fullName,
        accountNumber: encryptedAccountNumber,
        idNumber: encryptedIdNumber,
        passwordHash: passwordHash,
        isEmployee: false
      }
    });

    // Don't return sensitive data in response
    // const responseUser = {
    //   id: newUser.id,
    //   fullName: newUser.fullName,
    //   isEmployee: newUser.isEmployee,
    //   createdAt: newUser.createdAt
    // };
    // console.log("User created: ", newUser);

    res.status(200).json({
      message: "User added successfully"
    });
  } catch (error) {
    console.error("Error adding user:", error);
    return utils.errorResponse(500, error, res);
  } finally {
    await prisma.$disconnect();
  }
};