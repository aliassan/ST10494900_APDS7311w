import { prisma, errorResponse, decryptWithAES, encryptWithAES } from "../utils";
import { Request, Response } from "express";
import crypto from "crypto";

export const getTransactions = async (req: Request, res: Response) => {
  //check if userAddress property is set
  const accountNumber = (req as any).accountNumber;
  const { role } = req.query

  // console.log("accountNumber: ", accountNumber);

  try {
    //retrieve notification
    const user = await prisma.user.findUnique({
      where: {
        accountNumber: /*crypto
          .createHash("sha256")
          .update(accountNumber)
          .digest("hex")*/ accountNumber
      }
    })

    if (!user) return errorResponse(404, "User not found", res);

    if (user.isEmployee) {
      // If the user is an employee, return all transactions
      // console.log("User is an employee, fetching all transactions");
      const transactions = await prisma.transaction.findMany({
        include: {
          user: {
            select: {
              accountNumber: true,
              fullName: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      // console.log("transactions - employee: ", transactions);
      res.status(200).json(
        transactions
      );
    } else {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: user.id
        }
      })
      // console.log("transactions - customer: ", transactions);
      res.status(200).json(transactions)
    }
  } catch (error) {
    return errorResponse(500, error, res);
  } finally {
    await prisma.$disconnect();
  }
};

export const addTransaction = async (req: Request, res: Response) => {
  const accountNumber = (req as any).accountNumber

  try {
    //retrieve notification
    const user = await prisma.user.findUnique({
      where: {
        accountNumber/*: crypto
          .createHash("sha256")
          .update(accountNumber)
          .digest("hex")*/
      }
    })

    if (!user) return errorResponse(404, "User not found", res);

    // Generate random reference (INV-8RANDOM_CHARS)
    const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase();
    const reference = `INV-${randomPart}`;

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        ...req.body,
        reference,
      }
    })

    res.status(200).json({ message: "success"})
  } catch(error) {
    console.error("Error adding transaction: ", error);
    return errorResponse(500, error, res)
  }
};
