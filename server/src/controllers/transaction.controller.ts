import { prisma, errorResponse, decryptWithAES } from "../utils";
import { Request, Response } from "express";
import crypto from "crypto";

export const getTransactions = async (req: Request, res: Response) => {
  //check if userAddress property is set
  const accountNumber = (req as any).address;
  const { role } = req.query

  try {
    //retrieve notification
    const user = await prisma.user.findUnique({
      where: {
        accountNumber: crypto
          .createHash("sha256")
          .update(accountNumber)
          .digest("hex")
      }
    })

    if (!user) return errorResponse(404, "User not found", res);

    if (user.isEmployee) {
      res.status(200).json([])
    } else {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: user.id
        }
      })

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
        accountNumber: crypto
          .createHash("sha256")
          .update(accountNumber)
          .digest("hex")
      }
    })

    if (!user) return errorResponse(404, "User not found", res);

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        ...req.body
      }
    })

    res.status(200).json(transaction)
  } catch(error) {
    return errorResponse(500, error, res)
  }
};
